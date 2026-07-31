import Shipping from "../models/shippingModel.js";


const DIVISION_ALIASES = {
  // New spelling → DB value
  CHATTOGRAM: "CHITTAGONG",
  BARISHAL: "BARISAL",
  CUMILLA: "COMILLA",
  JASHORE: "JESSORE",
  FARIDPUR: "FARIDPUR",
  CHITTAGONG: "CHITTAGONG",
  BARISAL: "BARISAL",
  COMILLA: "COMILLA",
  JESSORE: "JESSORE",
  DHAKA: "DHAKA",
  KHULNA: "KHULNA",
  MYMENSINGH: "MYMENSINGH",
  RAJSHAHI: "RAJSHAHI",
  RANGPUR: "RANGPUR",
  SYLHET: "SYLHET",
};

// ============================================
//  HELPER: Advanced Dynamic Shipping Calculation
// ============================================
export const calculateDynamicShipping = async (
  userThana,
  userDistrict,
  userDivision,
  orderItems,
  subtotal,
) => {
  const normalizedThana = userThana.trim().toLowerCase();
  const normalizedDistrict = userDistrict.trim().toUpperCase();
  const rawDivision = userDivision.trim().toUpperCase();
  // ✅ FIX: Alias map দিয়ে division normalize করা
  const normalizedDivision = DIVISION_ALIASES[rawDivision] || rawDivision;

  const shippingRules = await Shipping.find({
    isActive: true,
    $or: [
      { divisions: normalizedDivision },
      { districts: normalizedDistrict },
      { thanas: normalizedThana },
    ],
  });

  if (shippingRules.length === 0) return 150;

  // ✅ Per-Order Shipping: qty নির্বিশেষে একবারই charge হবে
  // সব items-এর মধ্যে সবচেয়ে বেশি cost যে rule match করে সেটাই নেওয়া হবে

  // General rule = applicableCategories AND applicableProducts দুটোই empty
  const generalRule = shippingRules.find(
    (r) =>
      r.applicableCategories.length === 0 && r.applicableProducts.length === 0,
  );

  // Free shipping check (general rule-এর min order পূরণ হলে)
  if (
    generalRule &&
    generalRule.freeShippingMinOrder &&
    subtotal >= generalRule.freeShippingMinOrder
  )
    return 0;

  // সব items free shipping কিনা চেক করো
  const allItemsAreFreeShipping = orderItems.every(
    (item) => item.shippingDetails?.isFreeShipping === true,
  );
  if (allItemsAreFreeShipping) return 0;

  // Individual shipping items আলাদা করো (এগুলো per-item charge হয়, qty ছাড়া)
  let individualShippingCost = 0;
  const regularItems = [];

  for (const item of orderItems) {
    const details = item.shippingDetails || {};
    if (details.isFreeShipping) continue;
    if (details.isIndividualShipping) {
      // Individual shipping: qty নয়, শুধু একবার charge
      individualShippingCost += details.individualShippingCost || 0;
      continue;
    }
    regularItems.push(item);
  }

  if (regularItems.length === 0) {
    // শুধু individual shipping items আছে
    return individualShippingCost;
  }

  // ✅ Regular items-এর জন্য: সব items scan করে সবচেয়ে বেশি cost-এর rule নাও
  let highestShippingCost = 0;
  let anyItemMatched = false;

  for (const item of regularItems) {
    const weight = Number(item.weight) || 0;
    const details = item.shippingDetails || {};
    const productIdStr = item.product?.toString();
    const categoryIdStr = item.category?.toString();

    let matchedRule = null;

    for (const rule of shippingRules) {
      // Exclusion check
      const isProductExcluded =
        productIdStr &&
        rule.excludedProducts.map((id) => id.toString()).includes(productIdStr);
      const isCategoryExcluded =
        categoryIdStr &&
        rule.excludedCategories
          .map((id) => id.toString())
          .includes(categoryIdStr);
      if (isProductExcluded || isCategoryExcluded) continue;

      // Specific rule check
      const hasApplicableRestrictions =
        rule.applicableProducts.length > 0 ||
        rule.applicableCategories.length > 0;

      if (hasApplicableRestrictions) {
        const isProductApplicable =
          productIdStr &&
          rule.applicableProducts
            .map((id) => id.toString())
            .includes(productIdStr);
        const isCategoryApplicable =
          categoryIdStr &&
          rule.applicableCategories
            .map((id) => id.toString())
            .includes(categoryIdStr);
        if (isProductApplicable || isCategoryApplicable) {
          matchedRule = rule;
          break;
        }
        continue;
      }

      // General rule fallback
      if (!matchedRule) matchedRule = rule;
    }

    if (matchedRule) {
      anyItemMatched = true;
      let itemCost = matchedRule.baseCost;
      if (weight > matchedRule.baseWeightKg) {
        itemCost +=
          Math.ceil(weight - matchedRule.baseWeightKg) *
          matchedRule.extraWeightCostPerKg;
      }
      if (details.extraShippingCost > 0) {
        itemCost += details.extraShippingCost;
      }
      // ✅ qty multiply নেই — শুধু highest cost track করো
      if (itemCost > highestShippingCost) {
        highestShippingCost = itemCost;
      }
    } else {
      // কোনো rule match নেই → default 120 fallback
      if (120 > highestShippingCost) highestShippingCost = 120;
    }
  }

  // ✅ Final: Per-order একটাই charge + individual items-এর charge
  return highestShippingCost + individualShippingCost;
};

// ============================================
//  ADMIN: Create Zone
// ============================================
const createShippingZone = async (req, res) => {
  try {
    const {
      zoneName,
      divisions,
      districts,
      thanas,
      baseCost,
      baseWeightKg,
      extraWeightCostPerKg,
      freeShippingMinOrder,
      estimatedDays,
      isActive,
      applicableCategories,
      applicableProducts,
      excludedCategories,
      excludedProducts,
    } = req.body;

    const existingZone = await Shipping.findOne({ zoneName: zoneName.trim() });
    if (existingZone)
      return res.status(400).json({ error: "Zone name already exists" });

    // ✅ FIX: divisions uppercase করে save, districts uppercase, thanas lowercase
    const zone = new Shipping({
      zoneName: zoneName.trim(),
      divisions: (divisions || []).map((d) => d.trim().toUpperCase()),
      districts: (districts || []).map((d) => d.trim().toUpperCase()),
      thanas: (thanas || []).map((t) => t.trim().toLowerCase()),
      baseCost,
      baseWeightKg,
      extraWeightCostPerKg,
      freeShippingMinOrder: freeShippingMinOrder || null,
      estimatedDays,
      isActive,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedCategories: excludedCategories || [],
      excludedProducts: excludedProducts || [],
    });

    const createdZone = await zone.save();
    res.status(201).json(createdZone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Get All Zones
// ============================================
const getAllShippingZones = async (req, res) => {
  try {
    const zones = await Shipping.find({}).sort({ createdAt: -1 });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Update Zone
// ============================================
const updateShippingZone = async (req, res) => {
  try {
    const zone = await Shipping.findById(req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });

    const updatableFields = [
      "zoneName",
      "baseCost",
      "baseWeightKg",
      "extraWeightCostPerKg",
      "freeShippingMinOrder",
      "estimatedDays",
      "isActive",
      "applicableCategories",
      "applicableProducts",
      "excludedCategories",
      "excludedProducts",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) zone[field] = req.body[field];
    });

    // ✅ FIX: location arrays আলাদাভাবে normalize করে update
    if (req.body.divisions !== undefined) {
      zone.divisions = req.body.divisions.map((d) => d.trim().toUpperCase());
    }
    if (req.body.districts !== undefined) {
      zone.districts = req.body.districts.map((d) => d.trim().toUpperCase());
    }
    if (req.body.thanas !== undefined) {
      zone.thanas = req.body.thanas.map((t) => t.trim().toLowerCase());
    }

    const updatedZone = await zone.save();
    res.json(updatedZone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  ADMIN: Delete Zone
// ============================================
const deleteShippingZone = async (req, res) => {
  try {
    const zone = await Shipping.findById(req.params.id);
    if (!zone) return res.status(404).json({ error: "Zone not found" });

    await zone.deleteOne();
    res.json({ message: "Zone removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
//  USER: Calculate Shipping Cost (Frontend API)
// ============================================
const getShippingCost = async (req, res) => {
  try {
    const { thana, district, division, orderItems, subtotal } = req.body;

    if (!thana || !district || !division) {
      return res
        .status(400)
        .json({ error: "Thana, District and Division are required" });
    }

    const cost = await calculateDynamicShipping(
      thana,
      district,
      division,
      orderItems || [],
      subtotal || 0,
    );

    // ✅ FIX: Alias map দিয়ে zone lookup-ও normalize করো
    const rawDivision = division.trim().toUpperCase();
    const normalizedDivision = DIVISION_ALIASES[rawDivision] || rawDivision;

    let estimatedDays = "3-5 Days";
    let zoneName = "Standard Delivery";
    let isFreeShipping = false;

    const zone = await Shipping.findOne({
      isActive: true,
      $or: [
        { divisions: normalizedDivision },
        { districts: district.trim().toUpperCase() },
        { thanas: thana.trim().toLowerCase() },
      ],
    });

    if (zone) {
      estimatedDays = zone.estimatedDays;
      zoneName = zone.zoneName;
      if (
        zone.freeShippingMinOrder &&
        (subtotal || 0) >= zone.freeShippingMinOrder
      ) {
        isFreeShipping = true;
      }
    }

    res.json({
      shippingCost: cost,
      estimatedDays,
      zoneName,
      isFreeShipping,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createShippingZone,
  getAllShippingZones,
  updateShippingZone,
  deleteShippingZone,
  getShippingCost,
};

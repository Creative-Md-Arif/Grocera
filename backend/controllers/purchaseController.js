import asyncHandler from "../middlewares/asyncHandler.js";
import PurchaseOrder from "../models/purchaseOrderModel.js";
import Product from "../models/productModel.js";
import Supplier from "../models/supplierModel.js";

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { supplierId, orderItems, notes } = req.body;
  if (!orderItems || orderItems.length === 0)
    return res.status(400).json({ error: "No order items" });

  let totalCost = 0;
  const itemsForDB = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (!product)
      return res
        .status(404)
        .json({ error: `Product not found: ${item.productId}` });

    const unitCost = Number(item.unitCost) || 0;
    const qty = Number(item.qty) || 0;
    totalCost += unitCost * qty;

    itemsForDB.push({
      product: product._id,
      name: product.name,
      qty,
      unitCost,
      variantInfo: item.variantInfo || { hasVariants: false },
      receivedQty: 0,
    });
  }

  const purchaseOrder = await PurchaseOrder.create({
    supplier: supplierId,
    createdBy: req.user._id,
    orderItems: itemsForDB,
    totalCost,
    notes: notes || "",
  });

  res.status(201).json(purchaseOrder);
});

// ২. Get POs with Pagination, Search, Filter
const getPurchaseOrders = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { poId: { $regex: req.query.keyword, $options: "i" } },
          { invoiceNumber: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  const statusFilter =
    req.query.status && req.query.status !== "all"
      ? { status: req.query.status }
      : {};

  const count = await PurchaseOrder.countDocuments({
    ...keyword,
    ...statusFilter,
  });
  const orders = await PurchaseOrder.find({ ...keyword, ...statusFilter })
    .populate("supplier", "name companyName phone")
    .populate("createdBy", "username")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ orders, page, pages: Math.ceil(count / pageSize), count });
});

// ৩. Get Single PO
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const order = await PurchaseOrder.findById(req.params.id)
    .populate("supplier")
    .populate("createdBy", "username");
  if (!order)
    return res.status(404).json({ error: "Purchase order not found" });
  res.json(order);
});

// ৪. Update PO (Only if pending)
const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const { supplierId, orderItems, notes } = req.body;
  const po = await PurchaseOrder.findById(req.params.id);

  if (!po) return res.status(404).json({ error: "Purchase Order not found" });
  if (po.status !== "pending")
    return res
      .status(400)
      .json({ error: "Cannot edit PO that is already received" });

  let totalCost = 0;
  const itemsForDB = [];

  for (const item of orderItems) {
    const existingItem = po.orderItems.find(
      (oi) =>
        oi.product.toString() === item.productId &&
        oi.variantInfo?.colorName === item.variantInfo?.colorName &&
        oi.variantInfo?.sizeName === item.variantInfo?.sizeName,
    );
    totalCost += Number(item.unitCost) * Number(item.qty);
    itemsForDB.push({
      product: item.productId,
      name: item.name,
      qty: Number(item.qty),
      unitCost: Number(item.unitCost),
      variantInfo: item.variantInfo,
      receivedQty: existingItem ? existingItem.receivedQty : 0,
    });
  }

  po.supplier = supplierId || po.supplier;
  po.orderItems = itemsForDB;
  po.totalCost = totalCost;
  po.notes = notes || po.notes;

  const updatedPo = await po.save();
  res.json(updatedPo);
});

// ৫. Delete PO
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) return res.status(404).json({ error: "Purchase Order not found" });

  const hasReceivedItems = po.orderItems.some((item) => item.receivedQty > 0);
  if (hasReceivedItems)
    return res.status(400).json({
      error: "Cannot delete PO with received items. Cancel it instead.",
    });

  await po.deleteOne();
  res.json({ message: "Purchase Order deleted successfully" });
});

// ৬. Receive Items (Stock-in)
const receivePurchaseOrderItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { receivedItems } = req.body;
  const purchaseOrder = await PurchaseOrder.findById(id);
  if (!purchaseOrder)
    return res.status(404).json({ error: "Purchase Order not found" });

  for (const recItem of receivedItems) {
    const poItem = purchaseOrder.orderItems.find(
      (oi) =>
        oi.product.toString() === recItem.productId &&
        oi.variantInfo?.colorName === recItem.variantInfo?.colorName &&
        oi.variantInfo?.sizeName === recItem.variantInfo?.sizeName,
    );
    if (!poItem)
      return res.status(400).json({ error: "Item mismatch in Purchase Order" });

    const qtyToReceive = Number(recItem.qty);
    if (poItem.receivedQty + qtyToReceive > poItem.qty) {
      return res.status(400).json({
        error: `Cannot receive more than ordered qty for ${poItem.name}`,
      });
    }

    if (poItem.variantInfo?.hasVariants) {
      await Product.updateOne(
        {
          _id: poItem.product,
          "variants.color.name": poItem.variantInfo.colorName,
        },
        { $inc: { "variants.$[v].sizes.$[s].countInStock": qtyToReceive } },
        {
          arrayFilters: [
            { "v.color.name": poItem.variantInfo.colorName },
            { "s.size": poItem.variantInfo.sizeName },
          ],
        },
      );
    } else {
      await Product.updateOne(
        { _id: poItem.product },
        { $inc: { countInStock: qtyToReceive, quantity: qtyToReceive } },
      );
    }
    poItem.receivedQty += qtyToReceive;
  }

  const isFullyReceived = purchaseOrder.orderItems.every(
    (item) => item.receivedQty >= item.qty,
  );
  purchaseOrder.status = isFullyReceived ? "received" : "partially_received";
  await purchaseOrder.save();

  res.json({ message: "Items received and stock updated", purchaseOrder });
});

// ৭. Generate/Get Invoice Number
const generateInvoice = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);
  if (!po) return res.status(404).json({ error: "PO not found" });

  if (!po.invoiceNumber) {
    po.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    po.invoiceDate = new Date();
    await po.save();
  }
  res.json(po);
});

// ৮. Record Supplier Payment
const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, method, note } = req.body;

  const po = await PurchaseOrder.findById(id);
  if (!po) return res.status(404).json({ error: "PO not found" });

  po.payments.push({ amount: Number(amount), method, note, date: new Date() });
  po.paidAmount += Number(amount);

  if (po.paidAmount >= po.totalCost) po.paymentStatus = "paid";
  else if (po.paidAmount > 0) po.paymentStatus = "partial";
  else po.paymentStatus = "unpaid";

  await po.save();
  res.json(po);
});

export {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  receivePurchaseOrderItems,
  generateInvoice,
  recordPayment,
};

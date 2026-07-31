import { calculateDiscountedPrice } from "../models/campaign.js";

export const attachCampaignPricing = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (data) => {
    try {
      let products = null;
      let plainData = null; // ✅ সাধারণ JS অবজেক্ট রাখার জন্য ভ্যারিয়েবল

      // ✅ ধাপ ১: Mongoose Document থেকে Plain Object এ কনভার্ট
      if (Array.isArray(data)) {
        plainData = data.map((p) => (p.toObject ? p.toObject() : p));
        products = plainData;
      } else if (Array.isArray(data?.products)) {
        plainData = {
          ...data,
          products: data.products.map((p) => (p.toObject ? p.toObject() : p)),
        };
        products = plainData.products;
      } else if (data?._id) {
        plainData = data.toObject ? data.toObject() : data;
        products = [plainData];
      } else {
        plainData = data;
      }

      // ✅ ধাপ ২: প্লেইন অবজেক্টে ক্যাম্পেইন প্রাইস বসানো (এখন আটকাবে না)
      if (products && products.length > 0) {
        await Promise.all(
          products.map(async (p) => {
            const priceInfo = await calculateDiscountedPrice(p);
            p.campaignPrice = priceInfo.finalPrice;
            p.appliedCampaigns = priceInfo.appliedCampaigns;
          }),
        );
      }

      
      return originalJson(plainData);
    } catch (err) {
      console.error("Campaign Pricing Attach Error:", err.message);
      return originalJson(data); 
    }
  };

  next();
};

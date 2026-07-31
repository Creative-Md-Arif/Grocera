import asyncHandler from "../middlewares/asyncHandler.js";
import Integration from "../models/integrationModel.js";

// Create
const createIntegration = asyncHandler(async (req, res) => {
  const { platform, accountName, linkOrNumber } = req.body;
  if (!platform || !accountName || !linkOrNumber) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const integration = await Integration.create({
    platform,
    accountName,
    linkOrNumber,
  });
  res.status(201).json(integration);
});

// Get All
const getIntegrations = asyncHandler(async (req, res) => {
  // শুধু active গুলো আনবে
  const integrations = await Integration.find({ isActive: true });
  res.json(integrations);
});

// ✅ Update (নতুন যুক্ত করা হয়েছে)
const updateIntegration = asyncHandler(async (req, res) => {
  const { platform, accountName, linkOrNumber, isActive } = req.body;

  const integration = await Integration.findById(req.params.id);

  if (!integration) {
    return res.status(404).json({ error: "Integration not found" });
  }

  // যেসব ফিল্ড পাঠানো হয়েছে, শুধু সেগুলোই আপডেট হবে
  integration.platform = platform || integration.platform;
  integration.accountName = accountName || integration.accountName;
  integration.linkOrNumber = linkOrNumber || integration.linkOrNumber;

  // isActive বুলিয়ান ভ্যালু আপডেটের জন্য (true/false চেক করা হচ্ছে)
  if (isActive !== undefined) {
    integration.isActive = isActive;
  }

  const updatedIntegration = await integration.save();
  res.json(updatedIntegration);
});

// Delete
const deleteIntegration = asyncHandler(async (req, res) => {
  const integration = await Integration.findById(req.params.id);
  if (integration) {
    await integration.deleteOne();
    res.json({ message: "Removed" });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

export {
  createIntegration,
  getIntegrations,
  updateIntegration,
  deleteIntegration,
};

import SEOSetting from "../models/seoModel.js";


export const getSeoSettings = async (req, res) => {
  try {
    const settings = await SEOSetting.getSingleton();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export const updateSeoSettings = async (req, res) => {
  try {
    const settings = await SEOSetting.getSingleton();

    const fieldsToUpdate = [
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "ogTitle",
      "ogDescription",
      "ogImage",
      "twitterCard",
      "googleAnalyticsId",
      "googleSearchConsole",
      "facebookPixelId",
      "robotsTxt",
      "structuredData",
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updatedSettings = await settings.save();
    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update SEO settings",
        error: error.message,
      });
  }
};

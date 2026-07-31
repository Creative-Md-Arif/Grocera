import SiteSetting from "../models/siteSettingModel.js";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

export const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = await SiteSetting.create({});
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch site settings",
      error: error.message,
    });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const {
      contact,
      socialLinks,
      copyrightText,
      logo,
      logoType,
      textLogo,
      authSettings,
    } = req.body;

    let settings = await SiteSetting.findOne();

    if (!settings) {
      settings = new SiteSetting({});
    }

    if (logoType) {
      settings.logoType = logoType;
    }

    if (
      logo &&
      logo.public_id &&
      settings.logo?.public_id &&
      settings.logo.public_id !== logo.public_id
    ) {
      try {
        await cloudinary.uploader.destroy(settings.logo.public_id);
      } catch (err) {
        console.error(
          "Failed to delete old logo from cloudinary:",
          err.message,
        );
      }
    }

    if (logo) {
      settings.logo = { url: logo.url || "", public_id: logo.public_id || "" };
    }

    if (textLogo) {
      settings.textLogo = {
        fontSize: textLogo.fontSize || settings.textLogo.fontSize,
        fontWeight: textLogo.fontWeight || settings.textLogo.fontWeight,
        parts: textLogo.parts || settings.textLogo.parts,
      };
    }

    if (authSettings) {
      settings.authSettings = {
        requireEmailVerification:
          authSettings.requireEmailVerification ??
          settings.authSettings.requireEmailVerification,
        allowGuestCheckout:
          authSettings.allowGuestCheckout ??
          settings.authSettings.allowGuestCheckout,
        requireLoginForCheckout:
          authSettings.requireLoginForCheckout ??
          settings.authSettings.requireLoginForCheckout,
      };
    }

    if (contact) {
      settings.contact = { ...settings.contact.toObject(), ...contact };
    }

    if (socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks.toObject(),
        ...socialLinks,
      };
    }

    if (copyrightText !== undefined) {
      settings.copyrightText = copyrightText;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Site settings updated successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update site settings",
      error: error.message,
    });
  }
};

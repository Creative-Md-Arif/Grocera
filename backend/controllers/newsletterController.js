import Newsletter from "../models/newsletterModel.js";

// @desc    Subscribe an email to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Newsletter.findOne({ email: normalizedEmail });

    if (existing) {
      // আগে subscribe করে পরে unsubscribe করেছিল এমন কাউকে reactivate করা
      if (!existing.isActive) {
        existing.isActive = true;
        existing.subscribedAt = Date.now();
        await existing.save();

        return res.status(200).json({
          success: true,
          message: "Welcome back! You have been re-subscribed.",
        });
      }

      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    const subscriber = await Newsletter.create({ email: normalizedEmail });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
      data: subscriber,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to subscribe",
      error: error.message,
    });
  }
};

// @desc    Unsubscribe an email from the newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Newsletter.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found in subscriber list",
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe",
      error: error.message,
    });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /api/newsletter
// @access  Private/Admin
export const getAllSubscribers = async (req, res) => {
  try {
    const { active } = req.query;

    const filter = {};
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const subscribers = await Newsletter.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
      error: error.message,
    });
  }
};

// @desc    Delete a subscriber permanently
// @route   DELETE /api/newsletter/:id
// @access  Private/Admin
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Newsletter.findByIdAndDelete(id);

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete subscriber",
      error: error.message,
    });
  }
};

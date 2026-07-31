import mongoose from "mongoose";
import User from "../models/userModel.js";
import SiteSetting from "../models/siteSettingModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// Create user

// Create user
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  // ✅ ভেরিয়েবলগুলো ঠিকমতো ডিক্লেয়ার করা হলো
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  // ✅ ইমেইল অথবা ইউজারনেম আগে থেকেই আছে কি না চেক করা হচ্ছে
  const userExists = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
  });

  if (userExists) {
    res.status(400);
    // ইউজার-ফ্রেন্ডলি এরর মেসেজ
    if (userExists.email === normalizedEmail) {
      throw new Error("This email is already registered. Please login.");
    } else {
      throw new Error("This username is already taken. Please choose another.");
    }
  }

  // ✅ সাইট সেটিংস চেক করা হচ্ছে (ইমেইল ভেরিফিকেশন চালু কি না)
  const settings = await SiteSetting.findOne();
  const requireVerification =
    settings?.authSettings?.requireEmailVerification ?? true;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // নতুন ইউজার অবজেক্ট তৈরি
  const newUser = new User({
    username: normalizedUsername, // ✅ ঠিক করা ভেরিয়েবল ব্যবহার করা হলো
    email: normalizedEmail,
    password: hashedPassword,
    otpAttempts: 0,
  });

  // ✅ যদি ভেরিফিকেশন বন্ধ থাকে, তবে সরাসরি ভেরিফায়েড করে দিবে
  if (!requireVerification) {
    newUser.isVerified = true;
  } else {
    // ভেরিফিকেশন চালু থাকলে OTP তৈরি করবে
    newUser.otp = crypto.randomInt(100000, 999999).toString();
    newUser.otpExpires = Date.now() + 2 * 60 * 1000;
  }

  try {
    await newUser.save();

    // ✅ ভেরিফিকেশন চালু থাকলে ইমেইল পাঠাবে এবং মেসেজ রিটার্ন করবে
    if (requireVerification) {
      const message = `Your verification code is: ${newUser.otp}`;
      await sendEmail({
        to: newUser.email,
        subject: "Verify Your Account",
        text: message,
        html: `<h1>Welcome ${normalizedUsername}!</h1><p>Your OTP code is: <strong>${newUser.otp}</strong>. It expires in 2 minutes.</p>`,
      });

      res.status(201).json({
        message:
          "Registration successful. Please check your email for the OTP.",
        email: newUser.email,
      });
    } else {
      // ✅ ভেরিফিকেশন বন্ধ থাকলে সরাসরি লগইন টোকেন দিয়ে দিবে
      const token = createToken(res, newUser._id);

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        isVerified: newUser.isVerified,
        token: token,
        message: "Registration successful!",
      });
    }
  } catch (error) {
    console.error("Error in Registration:", error.message);
    await User.deleteOne({ _id: newUser._id }); // রোলব্যাক
    res.status(500);
    throw new Error("Registration failed or Email could not be sent.");
  }
});


const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isVerified && !user.pendingEmail) {
    res.status(400);
    throw new Error("User is already verified");
  }

  if (user.otpAttempts >= 5) {
    res.status(429);
    throw new Error("Too many attempts. Please request a new OTP");
  }

  if (user.otp === otp && user.otpExpires > Date.now()) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (user.pendingEmail) {
        const emailTaken = await User.findOne({
          email: user.pendingEmail,
          _id: { $ne: user._id },
        }).session(session);

        if (emailTaken) {
          await session.abortTransaction();
          session.endSession();
          res.status(400);
          throw new Error(
            "This email was just taken by another user. Please try a different email.",
          );
        }

        user.email = user.pendingEmail;
        user.pendingEmail = undefined;
      }

      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      user.otpAttempts = 0;

      await user.save({ session });
      await session.commitTransaction();
      session.endSession();

      const token = createToken(res, user._id);

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        token: token,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });

    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
});

const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(200).json({
      message: "If your email is registered, you will receive an OTP shortly.",
    });
  }

  if (user.isVerified && !user.pendingEmail) {
    res.status(400);
    throw new Error("This account is already verified.");
  }

  if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60 * 1000) {
    const waitSeconds = Math.ceil(
      (60 * 1000 - (Date.now() - user.lastOtpRequest)) / 1000,
    );
    res.status(429);
    throw new Error(
      `Please wait ${waitSeconds} seconds before requesting another OTP`,
    );
  }

  // নতুন OTP তৈরি
  const newOtp = crypto.randomInt(100000, 999999).toString();
  const newOtpExpires = Date.now() + 2 * 60 * 1000;

  user.otp = newOtp;
  user.otpExpires = newOtpExpires;
  user.otpAttempts = 0;
  user.lastOtpRequest = Date.now();
  await user.save();

  try {
    await sendEmail({
      to: user.email,
      subject: "Resend OTP - Verify Your Account",
      text: `Your new verification code is: ${newOtp}`,
      html: `<h1>Your New OTP: <strong>${newOtp}</strong></h1><p>Expires in 2 minutes.</p>`,
    });

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to resend OTP. Try again.");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (!existingUser) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
    const remaining = Math.ceil(
      (existingUser.lockUntil - Date.now()) / 1000 / 60,
    );
    res.status(423);
    throw new Error(`Account locked. Try again in ${remaining} minutes`);
  }

  const settings = await SiteSetting.findOne();
  const requireVerification =
    settings?.authSettings?.requireEmailVerification ?? true;

  if (requireVerification && !existingUser.isVerified) {
    res.status(401);
    throw new Error("Your account is not verified. Please check your email.");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    const updatedUser = await User.findOneAndUpdate(
      { _id: existingUser._id },
      { $inc: { loginAttempts: 1 } },
      { new: true },
    );

    if (updatedUser.loginAttempts >= 5) {
      await User.updateOne(
        { _id: existingUser._id },
        {
          $set: { lockUntil: Date.now() + 30 * 60 * 1000 },
          $unset: { loginAttempts: 1 },
        },
      );
      res.status(423);
      throw new Error(
        "Too many failed attempts. Account locked for 30 minutes",
      );
    }

    res.status(401);
    throw new Error("Invalid email or password");
  }

  await User.updateOne(
    { _id: existingUser._id },
    {
      $unset: { loginAttempts: 1, lockUntil: 1 },
    },
  );

  const token = createToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    isAdmin: existingUser.isAdmin,
    isVerified: existingUser.isVerified,
    token: token,
  });
});

// @desc    Forgot Password - রিসেট টোকেন তৈরি ও ইমেইল পাঠানো
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // ২. ইউজার আছে কিন্তু ভেরিফাইড না - verifyResetOTP তে যেতে দিবো না
  if (!user.isVerified) {
    res.status(400);
    throw new Error(
      "Your account is not verified. Please verify your email first.",
    );
  }

  if (user.lastOtpRequest && Date.now() - user.lastOtpRequest < 60 * 1000) {
    const waitSeconds = Math.ceil(
      (60 * 1000 - (Date.now() - user.lastOtpRequest)) / 1000,
    );
    res.status(429);
    throw new Error(
      `Please wait ${waitSeconds} seconds before requesting another OTP`,
    );
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.resetPasswordOTP = hashedOtp;
  user.resetPasswordExpires = Date.now() + 2 * 60 * 1000;
  user.lastOtpRequest = Date.now();
  user.otpAttempts = 0;

  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `<h3>Your Password Reset OTP is: <strong>${otp}</strong></h3>
             <p>This code will expire in 2 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    user.lastOtpRequest = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.otpAttempts >= 5) {
    res.status(429);
    throw new Error("Too many failed attempts. Please request a new OTP.");
  }

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (
    !user.resetPasswordOTP ||
    user.resetPasswordOTP !== hashedOtp ||
    !user.resetPasswordExpires ||
    user.resetPasswordExpires < Date.now()
  ) {
    await User.updateOne({ _id: user._id }, { $inc: { otpAttempts: 1 } });

    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await User.updateOne(
    { _id: user._id },
    {
      $unset: {
        resetPasswordOTP: 1,
        resetPasswordExpires: 1,
        otpAttempts: 1,
      },
      $set: {
        tempResetToken: hashedResetToken,
        tempResetTokenExpires: Date.now() + 2 * 60 * 1000,
      },
    },
  );

  res.status(200).json({
    message: "OTP verified. Now you can reset your password.",
    resetToken: resetToken,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, password, resetToken } = req.body;

  if (!resetToken) {
    res.status(400);
    throw new Error("Reset token is required");
  }

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error("Password must be at least 8 characters");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    email: normalizedEmail,
    tempResetToken: hashedToken,
    tempResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  const isSamePassword = await bcrypt.compare(password, user.password);
  if (isSamePassword) {
    res.status(400);
    throw new Error("New password cannot be same as old password");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;
  user.tempResetToken = undefined;
  user.tempResetTokenExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password reset successful!" });
});

// Logout user

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logout successful" });
});

// Get all users

const getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(pageSize, 100);
  const skip = (page - 1) * limit;

  const count = await User.countDocuments({});
  const users = await User.find({})
    .select(
      "-password -otp -otpExpires -otpAttempts -resetPasswordOTP -resetPasswordExpires -tempResetToken -tempResetTokenExpires -lastOtpRequest -loginAttempts -lockUntil",
    )
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  res.json({
    users,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// Get current user profile
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update current user profile

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.username = req.body.username || user.username;

  if (req.body.email && req.body.email.toLowerCase().trim() !== user.email) {
    const normalizedNewEmail = req.body.email.toLowerCase().trim();
    const emailExists = await User.findOne({ email: normalizedNewEmail });

    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }

    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error("Current password required to change email");
    }

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password,
    );
    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    user.pendingEmail = normalizedNewEmail;
    user.otp = otp;
    user.otpExpires = Date.now() + 2 * 60 * 1000;
    user.otpAttempts = 0;

    await sendEmail({
      to: normalizedNewEmail,
      subject: "Verify Your New Email",
      text: `Your verification code is: ${otp}`,
      html: `<h1>Email Changed</h1><p>Your new email verification code: <strong>${otp}</strong></p>`,
    });
  }

  if (req.body.newPassword) {
    if (!req.body.currentPassword) {
      res.status(400);
      throw new Error("Current password is required");
    }

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password,
    );
    if (!isMatch) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    if (req.body.newPassword.length < 8) {
      res.status(400);
      throw new Error("New password must be at least 8 characters");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);
    user.password = hashedPassword;
  }

  const updatedUser = await user.save();

  res.json({
    message: user.pendingEmail
      ? "OTP sent to new email. Please verify."
      : "Profile updated successfully",
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    isVerified: updatedUser.isVerified,
  });
});

// Delete user by id

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // 🎯 আপডেট: req.user আছে কিনা তা নিশ্চিত হয়ে তারপর _id চেক করা হচ্ছে
  if (req.user && req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error("You cannot delete your own account");
  }

  if (user.isAdmin) {
    res.status(400);
    throw new Error("Cannot delete an admin user");
  }

  await User.deleteOne({ _id: user._id });
  res.json({ message: "User deleted successfully" });
});
// Get user by id

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -otp -otpExpires -otpAttempts -resetPasswordOTP -resetPasswordExpires -tempResetToken -tempResetTokenExpires -lastOtpRequest -loginAttempts -lockUntil",
  );

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update user by id

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.user._id.toString() === req.params.id && req.body.isAdmin === false) {
    res.status(400);
    throw new Error("You cannot remove your own admin privileges");
  }

  user.username = req.body.username || user.username;
  user.email = req.body.email || user.email;

  if (
    typeof req.body.isAdmin !== "undefined" &&
    req.user._id.toString() !== req.params.id
  ) {
    user.isAdmin = Boolean(req.body.isAdmin);
  }

  if (typeof req.body.isVerified !== "undefined") {
    user.isVerified = Boolean(req.body.isVerified);
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    isAdmin: updatedUser.isAdmin,
    isVerified: updatedUser.isVerified,
  });
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  verifyEmail,
  resendOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
};

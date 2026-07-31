import mongoose from "mongoose";

const integrationSchema = mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["whatsapp", "messenger", "telegram", "instagram"],
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    // এখানে WhatsApp নাম্বার বা Messenger/Telegram এর লিংক সেভ হবে
    linkOrNumber: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Integration = mongoose.model("Integration", integrationSchema);
export default Integration;

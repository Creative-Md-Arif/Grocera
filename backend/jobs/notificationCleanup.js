import cron from "node-cron";
import Notification from "../models/notificationModel.js";

/**
 * প্রতিদিন রাত ১২টায় (0 0 * * *) এই জবটি চলবে।
 * এটি expired নোটিফিকেশনগুলো মুছে ফেলবে।
 */
export const startNotificationCleanupJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🧹 Starting notification cleanup job...");

      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() },
      });

      console.log(
        `✅ Cleaned up ${result.deletedCount} expired notifications.`,
      );
    } catch (error) {
      console.error("❌ Notification cleanup job failed:", error);
    }
  });

  console.log("🚀 Notification cleanup job scheduled successfully.");
};

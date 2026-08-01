// packages
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"; 
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import orderTrackingRoutes from "./routes/orderTrackingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cupponRoutes from "./routes/cupponRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import siteSettingRoutes from "./routes/siteSettingRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";
import seoRoutes from "./routes/seoRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";

// utils
import connectDB from "./config/db.js";
import connectCloudunary from "./config/cloudinary.js";
import { startNotificationCleanupJob } from "./jobs/notificationCleanup.js";

// configuration
dotenv.config();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

// connect to database & jobs
connectDB();
connectCloudunary();
startNotificationCleanupJob();

// create express app
const app = express();

// ==========================================
// ⭐ CORS MUST BE FIRST - সবার আগে আসতে হবে
// ==========================================
const corsOptions = {
  origin: [
    "https://grocera-hazel.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["set-cookie"],
};

// Handle preflight requests for all routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ⭐ Preflight handler

// create http server
const httpServer = createServer(app);

// socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  socket.on("authenticate", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} is online.`);
  });

  // 🆕 চ্যাট রুমে জয়েন করার লজিক (রিয়েল-টাইম চ্যাটের জন্য অপরিহার্য)
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`👤 Socket joined chat room: ${chatId}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected.`);
        break;
      }
    }
  });
});

// ==========================================
// ⭐ Middleware Order - সঠিক ক্রম
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// App settings (after middleware)
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// Health check (before routes)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    frontend_url: process.env.FRONTEND_URL,
  });
});

// ==========================================
// ⭐ Routes Setup
// ==========================================
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/track", orderTrackingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/cuppons", cupponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/site-settings", siteSettingRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/brands", brandRoutes);

// static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// ⭐ Error Handler (Last)
// ==========================================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ==========================================
// ⭐ 404 Handler (Very Last)
// ==========================================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// listen
httpServer.listen(port, () => {
  console.log(`🚀 Server running on port: ${port}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export { io, onlineUsers };

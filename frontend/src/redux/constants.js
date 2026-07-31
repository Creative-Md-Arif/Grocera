const isDevelopment = import.meta.env.DEV;

// শেষের স্ল্যাশটি রিমুভ করার জন্য লজিক (trim trailing slash)
const rawBackendUrl =
  import.meta.env.VITE_API_URL || "https://arixco.onrender.com";
export const BACKEND_URL = rawBackendUrl.replace(/\/$/, ""); // শেষের / কেটে দেবে

export const BASE_URL = isDevelopment ? "" : BACKEND_URL;
export const API_URL = isDevelopment ? "" : BACKEND_URL;

export const USERS_URL = "/api/users";
export const CATEGORY_URL = "/api/category";
export const PRODUCT_URL = "/api/products";
export const UPLOAD_URL = "/api/upload";
export const DASHBOARD_URL = "/api/dashboard";
export const ORDERS_URL = "/api/orders";
export const CAMPAIGN_URL = "/api/campaigns";
export const NOTIFICATIONS_URL = "/api/notifications";
export const BANNER_URL = "/api/banners";
export const PAYMENTS_URL = "/api/payments";
export const CUPPON_URL = "/api/cuppons";
export const SHIPPING_URL = "/api/shipping";
export const TRACKING_URL = "/api/track";
export const RETURNS_URL = "/api/returns";
export const SITE_SETTING_URL = "/api/site-settings";
export const NEWSLETTER_URL = "/api/newsletter";
export const SEO_URL = "/api/seo";
export const BLOG_URL = "/api/blogs";
export const REVIEW_URL = "/api/reviews";
export const CHAT_URL = "/api/chat";
export const INTEGRATION_URL = "/api/integrations";
export const SUPPLIER_URL = "/api/suppliers";
export const PURCHASE_URL = "/api/purchases";
export const QUESTION_URL = "/api/questions";

export const ORDER_PAY_URL = (orderId) => `/api/orders/${orderId}/pay`;
export const SOCKET_URL = isDevelopment ? "http://localhost:8000" : BACKEND_URL;
export const UPLOADS_URL = isDevelopment
  ? "http://localhost:8000/uploads"
  : `${BACKEND_URL}/uploads`;

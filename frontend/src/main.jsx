/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  Route,
  RouterProvider,
  createRoutesFromElements,
  createBrowserRouter,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import React, { Suspense, lazy, useState, useEffect } from "react";
import Loader from "./components/Loader";
import AllNotifications from "./components/AllNotifications";
import { HelmetProvider } from "react-helmet-async";

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

/* ──────────────────────────────────────────────────────────
   ✅ DelayedSuspense — Fast chunk load হলে Loader flash করবে না
   ────────────────────────────────────────────────────────── */
const DelayedFallback = ({ delay }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return <div style={{ minHeight: "50vh" }} />;

  return <Loader />;
};

const DelayedSuspense = ({ children, delay = 200 }) => (
  <Suspense fallback={<DelayedFallback delay={delay} />}>{children}</Suspense>
);

/* ──────────────────────────────────────────────────────────
   ✅ ঘন ঘন visit হওয়া page গুলো EAGER import
   ────────────────────────────────────────────────────────── */
import Home from "./pages/Home";
import SiteSettingManage from "./pages/Admin/SiteSettingManage";
import NewsletterManage from "./pages/Admin/NewsletterManage";
import SeoSettings from "./pages/Admin/SeoSettings";
import BlogManage from "./pages/Admin/blog/BlogManage";
import BlogCreate from "./pages/Admin/blog/BlogCreate";
import BlogUpdate from "./pages/Admin/blog/BlogUpdate";
import PurchaseManager from "./pages/Admin/PurchaseManager";
import SupplierManager from "./pages/Admin/SupplierManager";
import ManualOrderEntry from "./pages/Admin/ManualOrderEntry";
import AuthSettingManage from "./pages/Admin/AuthSettingManage";
import QuestionManager from "./pages/Admin/QuestionManager";

const ChatManage = lazy(() => import("./pages/Admin/chat/ChatManage"));
const BlogListPage = lazy(() => import("./pages/Blog/BlogListPage"));
const BlogPage = lazy(() => import("./pages/Blog/BlogPage"));

/* ──────────────────────────────────────────────────────────
   ✅ LAZY imports (ভারী এবং কম ভিজিট হওয়া পেজগুলো)
   ────────────────────────────────────────────────────────── */
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetails = lazy(() => import("./pages/Products/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const Login = lazy(() => import("./pages/Auth/Login"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const PaymentSuccess = lazy(() => import("./pages/Orders/PaymentSuccess"));
const PaymentFail = lazy(() => import("./pages/Orders/PaymentFail"));
const Register = lazy(() => import("./pages/Auth/Register"));
const VerifyOtp = lazy(() => import("./components/VerifyOtp"));
const Profile = lazy(() => import("./pages/User/Profile"));

const PrivateRoute = lazy(() => import("./components/PrivateRoute"));
const AdminRoute = lazy(() => import("./pages/Admin/AdminRoute"));

const UserList = lazy(() => import("./pages/Admin/UserList"));
const CategoryList = lazy(() => import("./pages/Admin/CategoryList"));
const ProductList = lazy(() => import("./pages/Admin/ProductList"));
const ProductUpdate = lazy(() => import("./pages/Admin/ProductUpdate"));
const AllProducts = lazy(() => import("./pages/Admin/AllProducts"));

const Favorites = lazy(() => import("./pages/Products/Favorites"));
const CampaignDetails = lazy(() => import("./pages/Products/CampaignDetails"));
const Shipping = lazy(() => import("./pages/Orders/Shipping"));
const PlaceOrder = lazy(() => import("./pages/Orders/PlaceOrder"));

const OrderDetails = lazy(() => import("./pages/User/OrderDetails"));
const UserOrder = lazy(() => import("./pages/User/UserOrder"));
const OrderList = lazy(() => import("./pages/Admin/OrderList"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const VerifyResetOtp = lazy(() => import("./pages/Auth/VerifyResetOtp"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const PaymentInstruction = lazy(
  () => import("./pages/Orders/PaymentInstruction"),
);

const CupponManage = lazy(() => import("./pages/Admin/CupponManage"));
const ShippingManage = lazy(() => import("./pages/Admin/ShippingManage"));
const PaymentSettings = lazy(() => import("./pages/Admin/PaymentSettings"));
const UserReturns = lazy(() => import("./pages/User/UserReturns"));
const ReturnManagement = lazy(() => import("./pages/Admin/ReturnManagement"));

const BannerList = lazy(() => import("./pages/Admin/BannerList"));
const BannerCreate = lazy(() => import("./pages/Admin/BannerCreate"));
const BannerUpdate = lazy(() => import("./pages/Admin/BannerUpdate"));
const OrderDetail = lazy(() => import("./pages/Admin/OrderDetail"));
const ReviewManage = lazy(() => import("./pages/Admin/review/ReviewManage"));
const IntegrationManage = lazy(() => import("./pages/Admin/IntegrationManage"));

const CampaignManage = lazy(() => import("./pages/Admin/CampaignManage"));

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen px-4">
    <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 className="text-2xl font-semibold text-gray-600 mb-4">
      Page Not Found
    </h2>
    <p className="text-gray-500 mb-8 text-center max-w-md">
      The page you&rsquo;re looking for doesn&#39;t exist or has been moved.
    </p>
    <a
      href="/"
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      Return to Home
    </a>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route
        path="/login"
        element={
          <DelayedSuspense>
            <Login />
          </DelayedSuspense>
        }
      />
      <Route
        path="/register"
        element={
          <DelayedSuspense>
            <Register />
          </DelayedSuspense>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <DelayedSuspense>
            <VerifyOtp />
          </DelayedSuspense>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <DelayedSuspense>
            <ForgotPassword />
          </DelayedSuspense>
        }
      />
      <Route
        path="/verify-reset-otp"
        element={
          <DelayedSuspense>
            <VerifyResetOtp />
          </DelayedSuspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <DelayedSuspense>
            <ResetPassword />
          </DelayedSuspense>
        }
      />
      <Route
        path="/campaign/:id"
        element={
          <DelayedSuspense>
            <CampaignDetails />
          </DelayedSuspense>
        }
      />
      <Route
        path="/track-order"
        element={
          <DelayedSuspense>
            <TrackOrder />
          </DelayedSuspense>
        }
      />

      <Route
        path="/blog"
        element={
          <DelayedSuspense>
            <BlogListPage />
          </DelayedSuspense>
        }
      />

      <Route
        path="/blog/:slugOrId"
        element={
          <DelayedSuspense>
            <BlogPage />
          </DelayedSuspense>
        }
      />
      <Route
        path="/my-returns"
        element={
          <DelayedSuspense>
            <UserReturns />
          </DelayedSuspense>
        }
      />
      <Route
        path="/all-notifications"
        element={
          <DelayedSuspense>
            <AllNotifications />
          </DelayedSuspense>
        }
      />
      <Route index={true} path="/" element={<Home />} />
      <Route
        path="/favorite"
        element={
          <DelayedSuspense>
            <Favorites />
          </DelayedSuspense>
        }
      />
      <Route
        path="/product/:id"
        element={
          <DelayedSuspense>
            <ProductDetails />
          </DelayedSuspense>
        }
      />
      <Route
        path="/cart"
        element={
          <DelayedSuspense>
            <Cart />
          </DelayedSuspense>
        }
      />
      <Route
        path="/shop"
        element={
          <DelayedSuspense>
            <Shop />
          </DelayedSuspense>
        }
      />
      <Route
        path="/shop/:keyword"
        element={
          <DelayedSuspense>
            <Shop />
          </DelayedSuspense>
        }
      />

      <Route
        path="/about"
        element={
          <DelayedSuspense>
            <About />
          </DelayedSuspense>
        }
      />
      <Route
        path="/contact"
        element={
          <DelayedSuspense>
            <Contact />
          </DelayedSuspense>
        }
      />
      <Route
        path="/payment/success"
        element={
          <DelayedSuspense>
            <PaymentSuccess />
          </DelayedSuspense>
        }
      />
      <Route
        path="/payment/fail"
        element={
          <DelayedSuspense>
            <PaymentFail />
          </DelayedSuspense>
        }
      />
      <Route
        path="/payment/cancel"
        element={
          <DelayedSuspense>
            <PaymentFail />
          </DelayedSuspense>
        }
      />
      <Route
        path="/shipping"
        element={
          <DelayedSuspense>
            <Shipping />
          </DelayedSuspense>
        }
      />
      <Route
        path="/order/:id"
        element={
          <DelayedSuspense>
            <OrderDetails />
          </DelayedSuspense>
        }
      />
      <Route
        path="/payment/checkout"
        element={
          <DelayedSuspense>
            <PaymentInstruction />
          </DelayedSuspense>
        }
      />
      <Route
        path="/placeorder"
        element={
          <DelayedSuspense>
            <PlaceOrder />
          </DelayedSuspense>
        }
      />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <DelayedSuspense>
            <PrivateRoute />
          </DelayedSuspense>
        }
      >
        <Route
          path="/profile"
          element={
            <DelayedSuspense>
              <Profile />
            </DelayedSuspense>
          }
        />
        <Route
          path="/user-orders"
          element={
            <DelayedSuspense>
              <UserOrder />
            </DelayedSuspense>
          }
        />
      </Route>
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <DelayedSuspense>
            <AdminRoute />
          </DelayedSuspense>
        }
      >
        <Route
          path="userlist"
          element={
            <DelayedSuspense>
              <UserList />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/auth-settings"
          element={
            <DelayedSuspense>
              <AuthSettingManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/question-manage"
          element={
            <DelayedSuspense>
              <QuestionManager />
            </DelayedSuspense>
          }
        />
        <Route
          path="categorylist"
          element={
            <DelayedSuspense>
              <CategoryList />
            </DelayedSuspense>
          }
        />
        <Route
          path="orderlist/:id"
          element={
            <DelayedSuspense>
              <OrderDetail />
            </DelayedSuspense>
          }
        />
        <Route
          path="productlist"
          element={
            <DelayedSuspense>
              <ProductList />
            </DelayedSuspense>
          }
        />
        <Route
          path="allproductslist"
          element={
            <DelayedSuspense>
              <AllProducts />
            </DelayedSuspense>
          }
        />
        <Route
          path="orderlist"
          element={
            <DelayedSuspense>
              <OrderList />
            </DelayedSuspense>
          }
        />
        <Route
          path="return-management"
          element={
            <DelayedSuspense>
              <ReturnManagement />
            </DelayedSuspense>
          }
        />
        <Route
          path="product/update/:_id"
          element={
            <DelayedSuspense>
              <ProductUpdate />
            </DelayedSuspense>
          }
        />
        <Route
          path="dashboard"
          element={
            <DelayedSuspense>
              <AdminDashboard />
            </DelayedSuspense>
          }
        />
        <Route
          path="cuppon-manage"
          element={
            <DelayedSuspense>
              <CupponManage />
            </DelayedSuspense>
          }
        />

        <Route
          path="suppliers"
          element={
            <DelayedSuspense>
              <SupplierManager />
            </DelayedSuspense>
          }
        />
        <Route
          path="purchase-manager"
          element={
            <DelayedSuspense>
              <PurchaseManager />
            </DelayedSuspense>
          }
        />

        <Route
          path="/admin/review-manage"
          element={
            <DelayedSuspense>
              <ReviewManage />
            </DelayedSuspense>
          }
        />

        <Route
          path="/admin/manual-order"
          element={
            <DelayedSuspense>
              <ManualOrderEntry />
            </DelayedSuspense>
          }
        />

        <Route
          path="shipping-manage"
          element={
            <DelayedSuspense>
              <ShippingManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="payment-settings"
          element={
            <DelayedSuspense>
              <PaymentSettings />
            </DelayedSuspense>
          }
        />
        {/* 🆕 BANNER ROUTES */}
        <Route
          path="bannerlist"
          element={
            <DelayedSuspense>
              <BannerList />
            </DelayedSuspense>
          }
        />
        <Route
          path="banner/create"
          element={
            <DelayedSuspense>
              <BannerCreate />
            </DelayedSuspense>
          }
        />
        <Route
          path="banner/create/:bannerType"
          element={
            <DelayedSuspense>
              <BannerCreate />
            </DelayedSuspense>
          }
        />
        <Route
          path="banner/update/:id"
          element={
            <DelayedSuspense>
              <BannerUpdate />
            </DelayedSuspense>
          }
        />
        {/* 🆕 CAMPAIGN ROUTES */}
        <Route
          path="campaign-manage"
          element={
            <DelayedSuspense>
              <CampaignManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/site-settings"
          element={
            <DelayedSuspense>
              <SiteSettingManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/newsletter"
          element={
            <DelayedSuspense>
              <NewsletterManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/seo-settings"
          element={
            <DelayedSuspense>
              <SeoSettings />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/chat-manage"
          element={
            <DelayedSuspense>
              <ChatManage />
            </DelayedSuspense>
          }
        />

        <Route
          path="integration-manage"
          element={
            <DelayedSuspense>
              <IntegrationManage />
            </DelayedSuspense>
          }
        />

        {/* 🆕 BLOG ROUTES */}
        <Route
          path="/admin/blog-manage"
          element={
            <DelayedSuspense>
              <BlogManage />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/blog/create"
          element={
            <DelayedSuspense>
              <BlogCreate />
            </DelayedSuspense>
          }
        />
        <Route
          path="/admin/blog/edit/:id"
          element={
            <DelayedSuspense>
              <BlogUpdate />
            </DelayedSuspense>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
  {
    /* Future Flags: কনসোলের সব Router ওয়ার্নিং বন্ধ করবে */
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
);

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </HelmetProvider>,
);

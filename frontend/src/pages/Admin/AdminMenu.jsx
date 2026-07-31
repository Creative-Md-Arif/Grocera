import { useState, useEffect, useRef, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { LuUsers } from "react-icons/lu";
import { CiShoppingCart } from "react-icons/ci";
import {
  AiOutlineProduct,
  AiOutlinePlusSquare,
  AiOutlineStar,
} from "react-icons/ai";
import { TbCategory2 } from "react-icons/tb";
import { MdEmail, MdOutlineDashboard } from "react-icons/md";
import { RiImageLine } from "react-icons/ri";
import {
  FaCreditCard,
  FaArrowLeft,
  FaCog,
  FaSearchengin,
  FaBlog,
  FaComments,
  FaPlug,
  FaChevronDown,
  FaTruckMoving,
  FaClipboardList,
  FaCartPlus,
  FaShieldAlt,
  FaQuestionCircle,
} from "react-icons/fa";

// ✅ Menu items grouped into logical sections
const menuGroups = [
  {
    section: "Overview",
    items: [
      { to: "/admin/dashboard", icon: <MdOutlineDashboard />, label: "Dashboard" },
    ],
  },
  {
    section: "Catalog",
    items: [
      { to: "/admin/categorylist", icon: <TbCategory2 />, label: "Categories" },
      { to: "/admin/allproductslist", icon: <AiOutlineProduct />, label: "All Products" },
      { to: "/admin/productlist", icon: <AiOutlinePlusSquare />, label: "Create Product" },
    ],
  },
  {
    section: "Procurement",
    items: [
      { to: "/admin/suppliers", icon: <FaTruckMoving />, label: "Suppliers" },
      { to: "/admin/purchase-manager", icon: <FaClipboardList />, label: "Purchase Orders" },
    ],
  },
  {
    section: "Sales",
    items: [
      { to: "/admin/orderlist", icon: <CiShoppingCart />, label: "Orders" },
      { to: "/admin/manual-order", icon: <FaCartPlus />, label: "Manual Order" },
      { to: "/admin/return-management", icon: <CiShoppingCart />, label: "Returns" },
      { to: "/admin/review-manage", icon: <AiOutlineStar />, label: "Reviews" },
      { to: "/admin/question-manage", icon: <FaQuestionCircle />, label: "Questions" }, 

    ],
  },
  {
    section: "Marketing",
    items: [
      { to: "/admin/campaign-manage", icon: <AiOutlinePlusSquare />, label: "Campaigns" },
      { to: "/admin/cuppon-manage", icon: <AiOutlinePlusSquare />, label: "Cuppons" },
      { to: "/admin/newsletter", icon: <MdEmail />, label: "Newsletter" },
      { to: "/admin/blog-manage", icon: <FaBlog />, label: "Blogs" },
      { to: "/admin/seo-settings", icon: <FaSearchengin />, label: "SEO Settings" },
    ],
  },
  {
    // ✅ নতুন ব্যানার সেকশন যুক্ত করা হলো
    section: "Banners",
    items: [
      { to: "/admin/bannerlist", icon: <RiImageLine />, label: "All Banners" },
      { to: "/admin/banner/create/hero", icon: <AiOutlinePlusSquare />, label: "Hero Banner" },
      { to: "/admin/banner/create/category", icon: <AiOutlinePlusSquare />, label: "Category Promo Banner" },
      { to: "/admin/banner/create/promotional", icon: <AiOutlinePlusSquare />, label: "Promotional" },
      { to: "/admin/banner/create/sidebar", icon: <AiOutlinePlusSquare />, label: "Sidebar Banner" },
      { to: "/admin/banner/create/popup", icon: <AiOutlinePlusSquare />, label: "Popup Banner" },
      { to: "/admin/banner/create/top-bar", icon: <AiOutlinePlusSquare />, label: "Top Bar Banner" },
      { to: "/admin/banner/create/middle", icon: <AiOutlinePlusSquare />, label: "Middle Banner" },
      { to: "/admin/banner/create/footer", icon: <AiOutlinePlusSquare />, label: "Wide Banner" },
    ],
  },
  {
    section: "Operations",
    items: [
      { to: "/admin/userlist", icon: <LuUsers />, label: "Users" },
      { to: "/admin/chat-manage", icon: <FaComments />, label: "Chats" },
      { to: "/admin/integration-manage", icon: <FaPlug />, label: "Integrations" },
      { to: "/admin/shipping-manage", icon: <AiOutlinePlusSquare />, label: "Shipping" },
      { to: "/admin/payment-settings", icon: <FaCreditCard />, label: "Payments" },
      { to: "/admin/auth-settings", icon: <FaShieldAlt />, label: "Auth Settings" }, // ✅ নতুন যুক্ত করা হলো
      { to: "/admin/site-settings", icon: <FaCog />, label: "Site Settings" },
    ],
  },
];

// Flattened list — used for finding the active page title
const flatItems = menuGroups.flatMap((group) => group.items);

// Find which section contains a given pathname
const findSectionForPath = (pathname) => {
  const group = menuGroups.find((g) =>
    // যেহেতু রাউট এখন /admin/banner/create/hero এরকম, তাই startsWith চেক করা হচ্ছে
    g.items.some((item) => pathname.startsWith(item.to)),
  );
  return group ? group.section : menuGroups[0].section;
};

const AdminMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // ✅ Accordion state — only ONE section stays open at a time.
  const [openSection, setOpenSection] = useState(() =>
    findSectionForPath(location.pathname),
  );

  const contentRefs = useRef({});

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  useEffect(() => {
    setOpenSection(findSectionForPath(location.pathname));
  }, [location.pathname]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    document.documentElement.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Dynamic Page Title based on current route
  const currentItem = flatItems.find((item) =>
    location.pathname.startsWith(item.to),
  );
  const pageTitle = currentItem ? currentItem.label : "Dashboard";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-4 lg:pl-[260px] shadow-sm font-['Trebuchet_MS']">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="lg:hidden p-2 mr-2 text-black hover:bg-gray-100 rounded-sm transition-colors"
        >
          {isSidebarOpen ? <IoIosClose size={28} /> : <IoIosMenu size={28} />}
        </button>
        <div className="border-l-4 border-black pl-4 py-1">
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-black tracking-tight uppercase font-['Playfair_Display']">
            {pageTitle} <span className="text-red-600">Panel</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-1 hidden sm:block">
            System Analytics & Management
          </p>
        </div>
      </header>

      <aside
        className={`bg-white fixed top-20 left-0 h-[calc(100vh-5rem)] border-r border-gray-100 flex flex-col items-start py-8 w-[240px] z-40 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } font-['Trebuchet_MS']`}
      >
        <div className="px-6 mb-10 w-full overflow-hidden">
          <p className="text-sm font-black text-red-600 tracking-[0.4em] uppercase opacity-60">
            Admin Panel
          </p>
        </div>

        <nav className="flex flex-col w-full px-3 overflow-y-auto flex-1 pb-10">
          {menuGroups.map((group) => {
            const isOpen = openSection === group.section;
            const hasActiveItem = group.items.some((item) =>
              location.pathname.startsWith(item.to),
            );

            return (
              <div key={group.section} className="mb-2 last:mb-0">
                <button
                  type="button"
                  onClick={() => toggleSection(group.section)}
                  aria-expanded={isOpen}
                  className={`flex items-center justify-between w-full px-4 py-2.5 transition-colors duration-200 ${
                    hasActiveItem ? "text-red-600" : "text-gray-700 hover:text-black"
                  }`}
                >
                  <span className="text-[12px] font-trebuchet font-black tracking-tighter uppercase select-none">
                    {group.section}
                  </span>
                  <FaChevronDown
                    size={10}
                    className={`transition-transform duration-300 ease-in-out ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                  style={{
                    maxHeight: isOpen
                      ? `${contentRefs.current[group.section]?.scrollHeight ?? 1000}px`
                      : "0px",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <ul
                    ref={(el) => (contentRefs.current[group.section] = el)}
                    className="flex flex-col w-full space-y-1 pb-2"
                  >
                    {group.items.map((item) => (
                      <li key={item.to} className="w-full">
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center space-x-4 py-3.5 px-4 w-full transition-all duration-300 ease-in-out group relative ${
                              isActive
                                ? "text-black bg-gray-50 border-r-4 border-red-600"
                                : "text-gray-500 hover:text-black hover:bg-gray-50"
                            }`
                          }
                        >
                          <span className="text-xl transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                            {item.icon}
                          </span>
                          <span className="text-sm font-bold tracking-wider uppercase">
                            {item.label}
                          </span>
                          <div className="absolute inset-0 bg-red-600/5 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -z-10" />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-6 py-8 w-full border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors rounded-sm mb-6"
          >
            <FaArrowLeft size={12} /> Back to Home
          </Link>
         
        </div>
      </aside>
    </>
  );
};

export default memo(AdminMenu);
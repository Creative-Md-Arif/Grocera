/* eslint-disable react/prop-types */
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolder,
  FaFolderOpen,
  FaShoppingCart,
  FaUser,
  FaBox,
  FaStore,
  FaTag,
  FaCog,
  FaHeart,
  FaClipboardList,
} from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

/**
 * ══════════════════════════════════════════════
 * Universal Breadcrumb — Playfair Premium Minimal
 * ══════════════════════════════════════════════
 */

// ─── Page icon map ─────────────────────────────────────────────────────────────
const PAGE_ICONS = {
  shop: <FaStore className="text-[14px]" />,
  cart: <FaShoppingCart className="text-[14px]" />,
  profile: <FaUser className="text-[14px]" />,
  account: <FaUser className="text-[14px]" />,
  orders: <FaClipboardList className="text-[14px]" />,
  order: <FaBox className="text-[14px]" />,
  products: <FaTag className="text-[14px]" />,
  product: <FaTag className="text-[14px]" />,
  wishlist: <FaHeart className="text-[14px]" />,
  settings: <FaCog className="text-[14px]" />,
  admin: <FaCog className="text-[14px]" />,
};

// ─── Auto-generate crumbs from current URL ─────────────────────────────────────
const useAutoItems = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = decodeURIComponent(seg)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label,
      href: isLast ? undefined : href,
      _icon: PAGE_ICONS[seg.toLowerCase()] ?? null,
    };
  });
};

// ─── Single crumb renderer ─────────────────────────────────────────────────────
const Crumb = ({ crumb }) => {
  const isCategory = crumb.type === "category";
  const isLeaf = crumb.isLeaf;
  const isActive = !crumb.href;

  // Current active page 
  if (isActive) {
    return (
      <span className="text-black font-medium truncate max-w-[200px] text-[14px]">
        {crumb.label}
      </span>
    );
  }

  // Category links
  if (isCategory) {
    return (
      <Link
        to={crumb.href}
        className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
      >
        {isLeaf ? (
          <FaFolder className="text-[14px] flex-shrink-0" />
        ) : (
          <FaFolderOpen className="text-[14px] flex-shrink-0" />
        )}
        <span className="truncate max-w-[110px]">{crumb.label}</span>
      </Link>
    );
  }

  // Regular page link
  return (
    <Link
      to={crumb.href}
      className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
    >
      {crumb._icon}
      <span>{crumb.label}</span>
    </Link>
  );
};

// ─── Breadcrumb wrapper ────────────────────────────────────────────────────────
const Breadcrumb = ({ items, className = "" }) => {
  const autoItems = useAutoItems();
  const crumbs = items ?? autoItems;

  if (!crumbs.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex max-w-screen-2xl mx-auto items-center gap-1.5 text-[14px] font-playfair font-medium flex-wrap py-4 px-4 bg-white ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-1.5 text-black hover:underline text-[14px] font-medium"
      >
        <FaHome className="text-[14px]" />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={index} className="contents">
          <HiChevronRight className="text-[14px] text-black flex-shrink-0" />
          <Crumb crumb={crumb} />
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
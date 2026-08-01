import {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
  Fragment,
} from "react";
import PropTypes from "prop-types";
import { SlHome } from "react-icons/sl";
import {
  HiOutlineHome,
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { MdOutlineDashboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LiaClipboardListSolid, LiaShippingFastSolid } from "react-icons/lia";
import { IoIosLogOut } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "@redux/api/usersApiSlice";
import { logout } from "@redux/features/auth/authSlice";
import { CiShop, CiUser } from "react-icons/ci";
import Logo from "../../components/Logo";
import CartIcon from "../../components/CartIcon";
import FavoriteIcon from "../../components/FavoriteIcon";
import SearchOverlay from "../Auth/SearchOverlay";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { IoChevronDownOutline, IoChevronForward } from "react-icons/io5";
import { toggleCartSidebar } from "@redux/features/cart/cartSlice";

const STATIC_NAV_LINKS = [{ to: "/shop", label: "Shop" }];

const MOBILE_MENU_SECTIONS = [
  { to: "/", icon: <SlHome size={18} />, label: "Home" },
  { to: "/shop", icon: <CiShop size={18} />, label: "Shop" },
];

function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

const DesktopSearchForm = memo(function DesktopSearchForm({
  onDebouncedQueryChange,
  onSearchOpen,
  onSearchSubmit,
  isSearchOpen,
  mobileSearchActive,
}) {
  const [localQuery, setLocalQuery] = useState("");
  const debouncedQuery = useDebounce(localQuery, 400);

  useEffect(() => {
    onDebouncedQueryChange(debouncedQuery);
  }, [debouncedQuery, onDebouncedQueryChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit(localQuery);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="search-trigger hidden md:flex flex-1 max-w-2xl mx-auto"
    >
      <div
        className={`w-full flex items-center bg-gray-100 rounded-md overflow-hidden border transition-colors duration-200 ${
          isSearchOpen && !mobileSearchActive
            ? "border-[#D4A843] bg-white"
            : "border-transparent"
        }`}
      >
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={onSearchOpen}
          placeholder="Search in....."
          className="flex-1 min-w-0 py-2.5 sm:py-3 pl-4 text-[13px] sm:text-sm font-trebuchet text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 text-gray-500 hover:text-[#D4A843] transition-colors duration-200"
          aria-label="Submit search"
        >
          <IoSearchOutline size={18} />
        </button>
      </div>
    </form>
  );
});

DesktopSearchForm.displayName = "DesktopSearchForm";

DesktopSearchForm.propTypes = {
  onDebouncedQueryChange: PropTypes.func.isRequired,
  onSearchOpen: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  isSearchOpen: PropTypes.bool.isRequired,
  mobileSearchActive: PropTypes.bool.isRequired,
};

const IconLabelLink = memo(function IconLabelLink({
  to,
  icon,
  label,
  onClick,
  badge,
  className = "",
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#D4A843] transition-colors duration-200 ${className}`}
    >
      <span className="relative flex items-center justify-center">
        {icon}
        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#D4A843] text-[10px] font-bold text-[#1A1A1A]">
            {badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-trebuchet font-semibold uppercase tracking-px whitespace-nowrap">
        {label}
      </span>
    </Link>
  );
});

IconLabelLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  badge: PropTypes.number,
  className: PropTypes.string,
};

const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(
    (state) => state.cart?.cartItems?.length ?? 0,
  );
  const isCartOpen = useSelector((state) => state.cart?.isCartOpen ?? false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tabOpen, setTabOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpenCatId, setMobileOpenCatId] = useState(null);
  const [logoutApiCall] = useLogoutMutation();
  const sidebarRef = useRef(null);

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const mobileSearchInputRef = useRef(null);

  const [hoveredCatId, setHoveredCatId] = useState(null);
  const [hoveredSubCatId, setHoveredSubCatId] = useState(null);

  const { data: categories, isLoading: categoriesLoading } =
    useFetchCategoriesQuery();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = useCallback(
    (path) => {
      if (path === "/") return location.pathname === "/";

      if (path.includes("?")) {
        const [pathname, query] = path.split("?");
        if (location.pathname !== pathname) return false;
        const params = new URLSearchParams(query);
        for (const [key, value] of params) {
          if (searchParams.get(key) !== value) return false;
        }
        return true;
      }

      return location.pathname.startsWith(path);
    },
    [location.pathname, searchParams],
  );

  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setTabOpen(false);
    setMobileOpenCatId(null);
  }, [setIsMenuOpen]);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setMobileSearchActive(false);
  }, []);

  const handleNavClick = useCallback(() => {
    closeAll();
    closeSearch();
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  }, [closeAll, closeSearch]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((p) => !p);
    setTabOpen(false);
    closeSearch();
  }, [setIsMenuOpen, closeSearch]);

  const toggleTab = useCallback((e) => {
    e.stopPropagation();
    setTabOpen((p) => !p);
  }, []);

  const logoutHandler = useCallback(async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
      closeAll();
    } catch (err) {
      console.error(err);
    }
  }, [logoutApiCall, dispatch, navigate, closeAll]);

  useEffect(() => {
    setTabOpen(false);
    setMobileOpenCatId(null);
    closeSearch();
    setHoveredCatId(null);
    setHoveredSubCatId(null);
  }, [location.pathname, closeSearch]);

  useEffect(() => {
    if (!tabOpen) return;
    const handle = (e) => {
      const d = document.querySelector(".dropdown-menu");
      const t = document.querySelector(".profile-btn");
      if (d && t && !d.contains(e.target) && !t.contains(e.target))
        setTabOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [tabOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handle = (e) => {
      const dropdown = document.querySelector(".search-dropdown");
      const trigger = document.querySelector(".search-trigger");
      if (
        dropdown &&
        !dropdown.contains(e.target) &&
        (!trigger || !trigger.contains(e.target))
      ) {
        closeSearch();
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSearchOpen, closeSearch]);

  const handleDebouncedQueryChange = useCallback((query) => {
    setDebouncedSearchQuery(query);
  }, []);

  const openDesktopSearch = () => {
    setIsSearchOpen(true);
    setMobileSearchActive(false);
  };

  const handleDesktopSearchSubmit = useCallback(
    (query) => {
      if (query.trim().length >= 2) {
        navigate(`/shop?keyword=${encodeURIComponent(query.trim())}`);
        closeSearch();
      }
    },
    [navigate, closeSearch],
  );

  const openMobileSearch = () => {
    setMobileSearchActive(true);
    setIsSearchOpen(true);
    setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
  };

  useBodyScrollLock(isMenuOpen || isCartOpen);

  return (
    <div>
      <header
        id="main-header-nav"
        className={`fixed top-0 left-0 w-full z-[1000] bg-white transition-all duration-300 ${
          scrolled ? "shadow-md shadow-black/5" : ""
        }`}
      >
        <div className="border-b border-gray-200">
          <div className="relative max-w-screen-2xl mx-auto h-14 sm:h-16 lg:h-20 flex items-center gap-3 lg:gap-6 px-4">
            <div className="flex md:hidden items-center gap-4">
              <button
                className="relative flex flex-col items-center justify-center gap-[6px] w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-colors duration-300 hover:bg-gray-100 group"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
                aria-expanded={isMenuOpen}
              >
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "translate-y-[7.5px] rotate-45 !bg-[#D4A843]"
                      : ""
                  }`}
                ></span>
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                    isMenuOpen ? "opacity-0 translate-x-2" : ""
                  }`}
                ></span>
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "-translate-y-[7.5px] -rotate-45 !bg-[#D4A843]"
                      : ""
                  }`}
                ></span>
              </button>

              <button
                onClick={openMobileSearch}
                className="relative group block"
                aria-label="Open Search"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 hover:bg-gray-100">
                  <IoSearchOutline
                    className="text-[#1A1A1A] group-hover:text-[#D4A843] transition-colors duration-200"
                    size={18}
                  />
                </div>
              </button>
            </div>

            <button
              className="hidden md:flex lg:hidden relative flex-col items-center justify-center gap-[6px] w-9 h-9 rounded-full transition-colors duration-300 hover:bg-gray-100 group"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
              aria-expanded={isMenuOpen}
            >
              <span
                className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                  isMenuOpen
                    ? "translate-y-[7.5px] rotate-45 !bg-[#D4A843]"
                    : ""
                }`}
              ></span>
              <span
                className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                  isMenuOpen ? "opacity-0 translate-x-2" : ""
                }`}
              ></span>
              <span
                className={`block h-[1.5px] w-5 rounded-full bg-[#1A1A1A] transition-all duration-300 ease-in-out ${
                  isMenuOpen
                    ? "-translate-y-[7.5px] -rotate-45 !bg-[#D4A843]"
                    : ""
                }`}
              ></span>
            </button>

            <Link
              to="/"
              onClick={handleNavClick}
              className="flex-shrink-0 scale-90 origin-center lg:scale-100
                 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
                 lg:static lg:left-auto lg:translate-x-0 lg:top-auto lg:translate-y-0"
            >
              <Logo />
            </Link>

            <DesktopSearchForm
              onDebouncedQueryChange={handleDebouncedQueryChange}
              onSearchOpen={openDesktopSearch}
              onSearchSubmit={handleDesktopSearchSubmit}
              isSearchOpen={isSearchOpen}
              mobileSearchActive={mobileSearchActive}
            />

            <div className="flex items-center gap-4 sm:gap-6 lg:gap-7 ml-auto lg:ml-0">
              <IconLabelLink
                to="/track-order"
                onClick={handleNavClick}
                icon={<LiaShippingFastSolid size={20} />}
                label="Track Order"
                className="hidden md:flex"
              />

              {userInfo ? (
                <div className="hidden lg:block relative lg:z-50">
                  <button
                    className="profile-btn flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#D4A843] transition-colors duration-200"
                    onClick={toggleTab}
                    aria-expanded={tabOpen}
                    aria-label="User menu"
                  >
                    <CiUser size={20} />
                    <span className="text-[10px] font-trebuchet font-semibold uppercase tracking-px max-w-[90px] truncate">
                      {userInfo.username}
                    </span>
                  </button>

                  <div
                    className={`dropdown-menu absolute top-full right-0 mt-3 w-44 sm:w-52 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden transition-all duration-200 ease-in-out ${
                      tabOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <span className="block font-poppins text-sm font-medium tracking-px text-[#1A1A1A]">
                        {userInfo.username}
                      </span>
                      <span className="block font-poppins text-xs font-medium tracking-px text-gray-500 truncate">
                        {userInfo.email}
                      </span>
                    </div>
                    <div className="p-1.5">
                      {userInfo.isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={handleNavClick}
                          className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-[#1A1A1A] hover:bg-gray-100 hover:text-[#D4A843] transition-colors duration-200"
                        >
                          <MdOutlineDashboard size={16} />{" "}
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-[#1A1A1A] hover:bg-gray-100 hover:text-[#D4A843] transition-colors duration-200"
                      >
                        <CgProfile size={16} /> <span>Profile</span>
                      </Link>
                      <Link
                        to="/user-orders"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-[#1A1A1A] hover:bg-gray-100 hover:text-[#D4A843] transition-colors duration-200"
                      >
                        <LiaClipboardListSolid size={16} />{" "}
                        <span>My Orders</span>
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-gray-200">
                      <button
                        onClick={logoutHandler}
                        className="flex items-center gap-2 w-full p-2 rounded-md font-poppins text-sm font-medium tracking-px text-red-500 hover:bg-red-50 transition-colors duration-200"
                      >
                        <IoIosLogOut size={16} /> <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <IconLabelLink
                  to="/login"
                  onClick={handleNavClick}
                  icon={<CiUser size={20} />}
                  label="Sign In"
                  className="hidden lg:flex"
                />
              )}

              <div className="hidden md:flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#D4A843] transition-colors duration-200 cursor-pointer">
                <FavoriteIcon onClick={handleNavClick} />
                <span className="text-[10px] font-trebuchet font-semibold uppercase tracking-px">
                  Wishlist
                </span>
              </div>

              <div
                onClick={() => dispatch(toggleCartSidebar(true))}
                className="flex flex-col items-center justify-center gap-0.5 text-gray-600 hover:text-[#D4A843] transition-colors duration-200 cursor-pointer"
                aria-label="Open Cart"
              >
                <CartIcon cartCount={cartItemsCount} />
                <span className="hidden md:block text-[10px] font-trebuchet font-semibold uppercase tracking-px">
                  Cart
                </span>
              </div>

              <Link
                to={userInfo ? "/profile" : "/login"}
                onClick={handleNavClick}
                className="lg:hidden relative group block"
                aria-label="User Profile"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300 group-hover:bg-gray-100">
                  <CiUser
                    className="text-[#1A1A1A] group-hover:text-[#D4A843] transition-colors duration-200"
                    size={18}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div
          className="hidden lg:block bg-[#141414] relative z-40"
          onMouseLeave={() => {
            setHoveredCatId(null);
            setHoveredSubCatId(null);
          }}
        >
          <div className="max-w-screen-2xl mx-auto px-4">
            <ul className="flex items-center gap-1">
              {STATIC_NAV_LINKS.map((link) => (
                <li key={link.to} className="flex items-center">
                  <Link
                    to={link.to}
                    onClick={handleNavClick}
                    className={`relative px-1 py-2.5 text-[12.50px] font-playfair font-bold uppercase tracking-normal transition-colors duration-200 whitespace-nowrap ${
                      isActive(link.to)
                        ? "text-[#D4A843]"
                        : "text-white hover:text-[#D4A843]"
                    }`}
                  >
                    {link.label}
                    {isActive(link.to) && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4A843] rounded-full"></span>
                    )}
                  </Link>
                </li>
              ))}

              {categoriesLoading ? (
                <>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <li key={`skel-top-${i}`} className="flex items-center">
                      <div className="relative px-1 py-2.5 flex items-center gap-1 whitespace-nowrap">
                        <div className="w-16 h-3 bg-white/20 animate-pulse rounded-sm"></div>
                        <div className="w-2 h-2 bg-white/20 animate-pulse rounded-full"></div>
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                categories?.map((cat) => (
                  <li
                    key={cat._id}
                    className="flex items-center relative"
                    onMouseEnter={() => {
                      setHoveredCatId(cat._id);
                      setHoveredSubCatId(null);
                    }}
                  >
                    <Link
                      to={`/shop?category=${cat._id}`}
                      onClick={handleNavClick}
                      className={`relative px-1 py-2.5 text-[12.50px] font-playfair font-bold uppercase tracking transition-colors duration-200 flex items-center gap-0.5 whitespace-nowrap ${
                        isActive(`/shop?category=${cat._id}`)
                          ? "text-[#D4A843]"
                          : "text-white hover:text-[#D4A843]"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.children?.length > 0 && (
                        <IoChevronDownOutline
                          size={10}
                          className={`transition-transform duration-200 ${
                            hoveredCatId === cat._id ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </Link>
                    {isActive(`/shop?category=${cat._id}`) && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4A843] rounded-full"></span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          {hoveredCatId && categories && (
            <div
              className={`absolute inset-x-0 mx-auto max-w-screen-2xl bg-white border border-gray-200 shadow-lg rounded-b-md z-50 transition-all duration-200 ease-in-out ${
                hoveredCatId ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
              style={{ top: '100%' }}
              onMouseEnter={() => setHoveredCatId(hoveredCatId)}
              onMouseLeave={() => {
                setHoveredCatId(null);
                setHoveredSubCatId(null);
              }}
            >
              <div className="flex">
                {(() => {
                  const activeCategory = categories.find(
                    (cat) => cat._id === hoveredCatId,
                  );
                  if (!activeCategory || !activeCategory.children?.length)
                    return null;

                  const subCatCount = activeCategory.children.length;
                  const SPLIT_THRESHOLD = 8;
                  const shouldSplitColumns = subCatCount > SPLIT_THRESHOLD;
                  const half = shouldSplitColumns
                    ? Math.ceil(subCatCount / 2)
                    : subCatCount;
                  const firstColItems = activeCategory.children.slice(0, half);
                  const secondColItems = shouldSplitColumns
                    ? activeCategory.children.slice(half)
                    : [];

                  const activeSubCategory = activeCategory.children.find(
                    (subCat) => subCat._id === hoveredSubCatId,
                  );

                  return (
                    <>
                      {firstColItems.length > 0 && (
                        <ul className="w-56 py-2 border-r border-gray-100">
                          {firstColItems.map((subCat) => (
                            <li
                              key={subCat._id}
                              onMouseEnter={() =>
                                setHoveredSubCatId(subCat._id)
                              }
                            >
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                onClick={handleNavClick}
                                className={`flex items-center justify-between gap-2 px-4 py-2 text-[13px] font-trebuchet tracking-px transition-colors duration-200 ${
                                  hoveredSubCatId === subCat._id
                                    ? "bg-[#D4A843] text-white font-semibold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <span className="truncate">
                                  {subCat.name}
                                </span>
                                {subCat.children?.length > 0 && (
                                  <IoChevronForward size={12} />
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {secondColItems.length > 0 && (
                        <ul className="w-56 py-2 border-r border-gray-100">
                          {secondColItems.map((subCat) => (
                            <li
                              key={subCat._id}
                              onMouseEnter={() =>
                                setHoveredSubCatId(subCat._id)
                              }
                            >
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                onClick={handleNavClick}
                                className={`flex items-center justify-between gap-2 px-4 py-2 text-[13px] font-trebuchet tracking-px transition-colors duration-200 ${
                                  hoveredSubCatId === subCat._id
                                    ? "bg-[#D4A843] text-white font-semibold"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <span className="truncate">
                                  {subCat.name}
                                </span>
                                {subCat.children?.length > 0 && (
                                  <IoChevronForward size={12} />
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}

                      {activeSubCategory?.children?.length > 0 && (
                        <ul className="w-56 py-2 max-h-[70vh] overflow-y-auto">
                          {activeSubCategory.children.map((subSubCat) => (
                            <li key={subSubCat._id}>
                              <Link
                                to={`/shop?category=${subSubCat._id}`}
                                onClick={handleNavClick}
                                className="block px-4 py-2 text-[13px] font-trebuchet tracking-px text-gray-700 hover:bg-gray-50 hover:text-[#D4A843] transition-colors duration-200 truncate"
                              >
                                {subSubCat.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="h-14 sm:h-16 lg:h-[120px]"></div>

      <SearchOverlay
        open={isSearchOpen}
        onClose={closeSearch}
        externalQuery={debouncedSearchQuery}
        showInput={mobileSearchActive}
        inputRef={mobileSearchInputRef}
      />

      <div
        className={`fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeAll}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 left-0 bottom-0 z-[1200] w-[85vw] sm:w-[320px] max-w-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto font-trebuchet ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <Link to="/" onClick={handleNavClick} aria-label="Home">
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto custom-scrollbar">
          <ul>
            {MOBILE_MENU_SECTIONS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 p-2 rounded-lg text-[14px] font-normal font-trebuchet tracking-px uppercase transition-colors duration-200 min-h-[40px] sm:min-h-[44px] ${
                    isActive(item.to)
                      ? "bg-gray-100 text-[#D4A843] border-l-2 border-[#D4A843]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#1A1A1A]"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            <li className="mt-4 border-t border-gray-100 pt-4">
              <p className="px-3 text-[12px] font-bold font-trebuchet uppercase text-gray-500 mb-2">
                Categories
              </p>
            </li>

            {categoriesLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <li key={`skel-mob-${i}`} className="p-2.5">
                    <div className="flex justify-between items-center">
                      <div className="w-28 h-3.5 bg-gray-200 animate-pulse rounded"></div>
                      <div className="w-3.5 h-3.5 bg-gray-100 animate-pulse rounded-full"></div>
                    </div>
                  </li>
                ))}
              </>
            ) : (
              categories?.map((cat) => (
                <li key={cat._id}>
                  <div
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg font-trebuchet text-[14px] font-semibold tracking-px uppercase transition-colors duration-200 min-h-[40px] sm:min-h-[44px] cursor-pointer ${
                      mobileOpenCatId === cat._id
                        ? "bg-gray-100 text-[#D4A843]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#1A1A1A]"
                    }`}
                    onClick={() =>
                      setMobileOpenCatId(
                        mobileOpenCatId === cat._id ? null : cat._id,
                      )
                    }
                  >
                    <span>{cat.name}</span>
                    {cat.children?.length > 0 && (
                      <IoChevronDownOutline
                        size={14}
                        className={`transition-transform duration-200 ${
                          mobileOpenCatId === cat._id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>

                  {cat.children?.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        mobileOpenCatId === cat._id
                          ? "max-h-[1000px]"
                          : "max-h-0"
                      }`}
                    >
                      <ul className="pl-6 py-1 space-y-1">
                        {cat.children.map((subCat) => (
                          <Fragment key={subCat._id}>
                            <li>
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                onClick={handleNavClick}
                                className="block p-2 sm:p-2.5 rounded-md text-[14px] font-trebuchet font-medium tracking-px text-gray-700 hover:bg-gray-50 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                              >
                                {subCat.name}
                              </Link>
                            </li>
                            {subCat.children?.map((subSubCat) => (
                              <li key={subSubCat._id}>
                                <Link
                                  to={`/shop?category=${subSubCat._id}`}
                                  onClick={handleNavClick}
                                  className="block pl-4 p-2 rounded-md text-[14px] font-normal font-trebuchet tracking-px text-gray-500 hover:bg-gray-50 hover:text-[#D4A843] min-h-[32px] sm:min-h-[36px] transition-colors duration-200"
                                >
                                  {subSubCat.name}
                                </Link>
                              </li>
                            ))}
                          </Fragment>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </nav>

        <div className="p-3 border-t border-gray-200 font-trebuchet bg-gray-50">
          {userInfo ? (
            <div>
              <button
                className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 bg-white border border-gray-200 rounded-lg min-h-[40px] sm:min-h-[44px] text-[#1A1A1A] hover:bg-gray-100 transition-colors duration-200 z-50"
                onClick={toggleTab}
                aria-expanded={tabOpen}
              >
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#B88E2F] to-[#D4A843] flex items-center justify-center text-white flex-shrink-0">
                  <CiUser size={16} />
                </span>

                <span className="flex-1 text-left text-[14px] font-semibold text-gray-700 tracking-px truncate">
                  {userInfo.username}
                </span>
                <IoChevronDownOutline
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 ${
                    tabOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  tabOpen ? "max-h-[300px] mt-2" : "max-h-0"
                }`}
              >
                <ul className="pl-4 space-y-1">
                  {userInfo.isAdmin && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-700 tracking-px hover:bg-gray-50 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                      >
                        <MdOutlineDashboard size={16} /> <span>Dashboard</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-700 tracking-px hover:bg-gray-50 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                    >
                      <CgProfile size={16} /> <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/user-orders"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-700 tracking-px hover:bg-gray-50 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                    >
                      <LiaClipboardListSolid size={16} /> <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/track-order"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-700 tracking-px hover:bg-gray-50 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                    >
                      <LiaShippingFastSolid size={16} />{" "}
                      <span>Track Order</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 w-full p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-red-500 tracking-px hover:bg-red-50 min-h-[36px] sm:min-h-[40px] transition-colors duration-200"
                    >
                      <IoIosLogOut size={16} /> <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/track-order"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 text-center p-2.5 sm:p-3 text-gray-600 border border-gray-200 rounded-lg text-[14px] font-semibold uppercase tracking-px hover:bg-gray-100 hover:text-[#1A1A1A] transition-all duration-200"
              >
                <LiaShippingFastSolid size={18} /> Track Order
              </Link>
              <Link
                to="/login"
                onClick={handleNavClick}
                className="block text-center p-2.5 sm:p-3 border border-[#D4A843] text-[#D4A843] rounded-lg text-[14px] font-semibold uppercase tracking-px hover:bg-[#D4A843] hover:text-white transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="block text-center p-2.5 sm:p-3 bg-gradient-to-r from-[#B88E2F] to-[#D4A843] text-white rounded-lg text-[14px] font-semibold uppercase tracking-px hover:opacity-90 transition-all duration-200 shadow-md shadow-black/10"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] bg-[#D4A843] font-trebuchet shadow-lg border-t border-gold-300">
        <div className="grid grid-cols-5">
          <Link
            to="/"
            onClick={handleNavClick}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-200 ${
              isActive("/")
                ? "text-[#1A1A1A]"
                : "text-white/85 hover:text-[#1A1A1A]"
            }`}
          >
            <HiOutlineHome size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-px">
              Home
            </span>
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-white/85 hover:text-[#1A1A1A] transition-colors duration-200"
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            <HiOutlineSquares2X2 size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-px">
              Menu
            </span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(toggleCartSidebar(true))}
            className="relative flex flex-col items-center justify-center gap-1 py-2.5 text-white/85 hover:text-[#1A1A1A] transition-colors duration-200"
            aria-label="Open Cart"
          >
            <span className="relative flex items-center justify-center">
              <HiOutlineShoppingBag size={22} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-[10px] font-bold text-[#1A1A1A]">
                  {cartItemsCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-px">
              Cart
            </span>
          </button>

          <button
            type="button"
            onClick={openMobileSearch}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-white/85 hover:text-[#1A1A1A] transition-colors duration-200"
            aria-label="Open Search"
          >
            <IoSearchOutline size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-px">
              Search
            </span>
          </button>

          <Link
            to={userInfo ? "/profile" : "/login"}
            onClick={handleNavClick}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors duration-200 ${
              isActive("/profile")
                ? "text-[#1A1A1A]"
                : "text-white/85 hover:text-[#1A1A1A]"
            }`}
          >
            <CiUser size={22} />
            <span className="text-[10px] font-semibold uppercase tracking-px">
              Account
            </span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

Navigation.propTypes = {
  isMenuOpen: PropTypes.bool.isRequired,
  setIsMenuOpen: PropTypes.func.isRequired,
};

Navigation.displayName = "Navigation";

export default memo(Navigation);

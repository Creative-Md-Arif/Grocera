/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import HeartIcon from "../../pages/Products/HeartIcon";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import { memo, useMemo } from "react";

// Skeleton Loader for Main Product Card
const ProductSkeleton = () => (
  <div className="group bg-white shadow-lg border overflow-hidden flex flex-col h-full font-figtree animate-pulse">
    <div className="relative aspect-square bg-gray-200 shrink-0"></div>
    <div className="px-3 pb-3 sm:px-3.5 flex flex-col grow border-t pt-4 border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="grow"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 mt-2"></div>
    </div>
  </div>
);

const Product = ({ product }) => {
  const dispatch = useDispatch();

  /* ── Logic Optimization using useMemo ──────────────────── */
  // NOTE: useMemo must run BEFORE any conditional return so hooks
  // are always called in the same order on every render.
  const {
    originalPrice,
    displayDiscountPercent,
    mainImage,
    productPath,
    hasCampaign,
    isRangePrice,
    priceToShow,
    priceToShowMax,
    crossedPrice,
    crossedPriceMax,
    campaignBadgeText,
    inStock
  } = useMemo(() => {
    // Guard: when product is missing, return safe defaults so the
    // skeleton render path doesn't crash the hook computation.
    if (!product) {
      return {
        originalPrice: 0,
        displayDiscountPercent: 0,
        mainImage: "/placeholder.jpg",
        productPath: "#",
        hasCampaign: false,
        isRangePrice: false,
        priceToShow: 0,
        priceToShowMax: null,
        crossedPrice: null,
        crossedPriceMax: null,
        campaignBadgeText: null,
        inStock: false
      };
    }

    const getVariantPrice = (prod) => {
      if (!prod.hasVariants || !prod.variants) return prod?.price || 0;
      const colorIndex = prod.defaultColorIndex || 0;
      const sizeIndex = prod.defaultSizeIndex || 0;
      const variant = prod.variants[colorIndex];
      if (!variant?.sizes?.[sizeIndex]) return prod?.price || 0;
      return variant.sizes[sizeIndex].price;
    };

    const calculateEffectivePrice = (prod, bPrice) => {
      const discountPercent = prod?.discountPercentage || 0;
      if (discountPercent > 0)
        return bPrice - (bPrice * discountPercent) / 100;
      return bPrice;
    };

    const getMainImage = (prod) => {
      if (!prod.hasVariants || !prod.variants?.length) {
        return Array.isArray(prod?.images) && prod.images.length > 0
          ? prod.images[0]
          : prod?.image || "/placeholder.jpg";
      }
      const colorIndex = prod.defaultColorIndex || 0;
      const variant = prod.variants[colorIndex];
      return variant?.color?.image || prod.images?.[0] || "/placeholder.jpg";
    };

    const getVariantPriceRange = (prod) => {
      if (!prod.hasVariants || !prod.variants?.length) {
        const p = prod?.price || 0;
        return { min: p, max: p };
      }
      const allPrices = prod.variants
        .filter((v) => v.isActive !== false)
        .flatMap((v) => (v.sizes || []).map((s) => s.price));

      if (!allPrices.length) {
        const p = prod?.price || 0;
        return { min: p, max: p };
      }
      return { min: Math.min(...allPrices), max: Math.max(...allPrices) };
    };

    const applyCampaignDiscount = (bPrice, campaign) => {
      if (!campaign) return bPrice;
      let discounted = bPrice;
      if (campaign.discountType === "percentage") {
        discounted = bPrice - (bPrice * (campaign.discountValue || 0)) / 100;
      } else {
        discounted = bPrice - (campaign.discountValue || 0);
      }
      if (campaign.maxDiscountAmount) {
        const maxAllowedDiscount = campaign.maxDiscountAmount;
        const minPriceAfterCap = bPrice - maxAllowedDiscount;
        discounted = Math.max(discounted, minPriceAfterCap);
      }
      return Math.max(Math.round(discounted), 0);
    };

    const bPrice = getVariantPrice(product);
    const fPrice = calculateEffectivePrice(product, bPrice);
    const oPrice = bPrice;
    const dDiscount = product.discountPercentage || 0;
    const mImage = getMainImage(product);
    const pPath = `/product/${product.slug || product._id}`;

    const hCampaign = product?.appliedCampaigns && product.appliedCampaigns.length > 0;
    const c = hCampaign ? product.appliedCampaigns[0] : null;

    const { min: rMin, max: rMax } = getVariantPriceRange(product);
    const isRange = product.hasVariants && rMin !== rMax;

    let pToShow = fPrice;
    let pToShowMax = null;
    let cPrice = null;
    let cPriceMax = null;
    let cBadgeText = null;

    if (hCampaign) {
      if (isRange) {
        pToShow = applyCampaignDiscount(rMin, c);
        pToShowMax = applyCampaignDiscount(rMax, c);
        cPrice = rMin;
        cPriceMax = rMax;
      } else {
        pToShow = applyCampaignDiscount(rMin, c);
        cPrice = rMin;
      }

      const typeName = (c.type || "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const discountText =
        c.discountType === "percentage" ? `-${c.discountValue}%` : `-৳${c.discountValue}`;
      cBadgeText = `${typeName} ${discountText}`;
    } else if (isRange) {
      pToShow = rMin;
      pToShowMax = rMax;
      if (dDiscount > 0) {
        cPrice = rMin;
        cPriceMax = rMax;
      }
    } else if (dDiscount > 0) {
      cPrice = oPrice;
    }

    return {
      originalPrice: oPrice,
      displayDiscountPercent: dDiscount,
      mainImage: mImage,
      productPath: pPath,
      hasCampaign: hCampaign,
      isRangePrice: isRange,
      priceToShow: pToShow,
      priceToShowMax: pToShowMax,
      crossedPrice: cPrice,
      crossedPriceMax: cPriceMax,
      campaignBadgeText: cBadgeText,
      inStock: product.countInStock > 0
    };
  }, [product]);

  // Skeleton Loading State — MUST come after all hooks
  if (!product) return <ProductSkeleton />;

  /* ── End Logic Optimization ──────────────────── */

  const formatPrice = (val) => Math.round(val).toLocaleString("en-BD");

  const addToCartHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.hasVariants) {
      window.location.href = productPath;
      return;
    }

    const productToAdd = {
      ...product,
      _id: product._id,
      name: product.name,
      price: originalPrice,
      finalPrice: priceToShow,
      _effectivePrice: priceToShow,
      effectivePrice: priceToShow,
      campaignPrice: hasCampaign ? priceToShow : undefined,
      appliedCampaigns: product?.appliedCampaigns || [],
      basePrice: originalPrice,
      _savings: crossedPrice ? crossedPrice - priceToShow : 0,
      savings: crossedPrice ? crossedPrice - priceToShow : 0,
      discountPercentage: product.discountPercentage,
      variantInfo: {
        hasVariants: false,
        colorIndex: null,
        sizeIndex: null,
        colorName: "",
        sizeName: "",
        variantPrice: null,
        sku: "",
      },
      weight: product.weight || 0.5,
      image: mainImage,
      qty: 1,
    };
    dispatch(addToCart(productToAdd));
    toast.success("Added to cart");
  };

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="group bg-white shadow-lg border transition-all duration-200 overflow-hidden flex flex-col h-full font-figtree"
    >
      <meta itemProp="brand" content={product?.brand || "Veloura"} />
      <meta itemProp="name" content={product.name} />
      <meta itemProp="description" content={product?.description || product.name} />

      {/* ── Image ── */}
      <div className="relative aspect-square bg-[#FDF6EC] overflow-hidden shrink-0">
        <Link
          to={productPath}
          title={`View details of ${product.name}`}
          aria-label={`View ${product.name}`}
          className="block w-full h-full"
        >
          <img
            itemProp="image"
            src={mainImage}
            alt={`Buy ${product.name} online — Veloura`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </Link>

        {hasCampaign ? (
          <div
            aria-label="Campaign discount"
            className="absolute top-2 bg-red-600 text-white text-[12px] font-bold font-trebuchet px-2 py-0.5"
          >
            {campaignBadgeText}
          </div>
        ) : displayDiscountPercent > 0 ? (
          <div
            aria-label={`${displayDiscountPercent}% discount`}
            className="absolute top-2 bg-[#6E2594] text-white text-[12px] font-normal font-trebuchet px-2 py-0.5"
          >
            -{displayDiscountPercent}%
          </div>
        ) : null}

        {product.hasVariants && product.variants?.length > 1 && (
          <div className="absolute bottom-2 left-2 flex gap-1 z-10">
            {product.variants.slice(0, 4).map((v, i) => (
              <span
                key={v._id || i}
                title={v.color?.name}
                className="w-3.5 h-3.5 rounded-full border border-white shadow"
                style={{ backgroundColor: v.color?.hexCode || "#ccc" }}
              />
            ))}
          </div>
        )}

        {!inStock && (
          <div
            aria-label="Out of stock"
            className="absolute inset-0 bg-white/60 flex items-end justify-center pb-3"
          >
            <span className="text-[10px] font-bold uppercase font-trebuchet tracking-px text-rose-800 bg-white border border-[#EDE4D4] px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 z-10">
          <HeartIcon product={product} />
        </div>

        {inStock && (
          <button
            onClick={addToCartHandler}
            aria-label={
              product.hasVariants
                ? `Select options for ${product.name}`
                : `Add ${product.name} to cart`
            }
            className="absolute bottom-0 left-0 w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 text-[14px] font-medium capitalize tracking-px font-trebuchet text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E2F]"
            style={{ background: "#6E2594" }}
          >
            <FaShoppingCart
              className="w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] shrink-0"
              aria-hidden="true"
            />
            {product.hasVariants ? "Select Options" : "Add to Cart"}
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-3 pb-3 sm:px-3.5 flex flex-col grow border-t pt-4 border-gray-200">
        <Link to={productPath} title={product.name} className="block mb-2">
          <h3
            itemProp="name"
            className="text-[15px] font-normal text-black tracking-px leading-snug line-clamp-2 hover:text-[#EF4A23] hover:underline transition-colors duration-150"
          >
            {product.name}
          </h3>
        </Link>

        <div className="grow" />

        <div
          itemProp="offers"
          itemScope
          itemType="https://schema.org/Offer"
          className="flex items-baseline gap-2 mt-1 pt-2 flex-wrap"
        >
          <meta itemProp="priceCurrency" content="BDT" />
          <meta itemProp="price" content={priceToShow} />
          <meta
            itemProp="availability"
            content={inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"}
          />

          <span
            className="text-[17px] font-semibold text-[#D51E0B] tracking-[.5px] font-trebuchet"
            aria-label={`Price: ৳${formatPrice(priceToShow)}`}
          >
            {isRangePrice
              ? `${formatPrice(priceToShow)}৳ – ${formatPrice(priceToShowMax)}৳`
              : `${formatPrice(priceToShow)}৳`}
          </span>

          {crossedPrice && (
            <span
              className="text-[13px] font-normal font-trebuchet text-gray-700 line-through"
              aria-label={`Original price: ৳${formatPrice(crossedPrice)}`}
            >
              {isRangePrice
                ? `${formatPrice(crossedPrice)}৳ – ${formatPrice(crossedPriceMax)}৳`
                : `${formatPrice(crossedPrice)}৳`}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default memo(Product);
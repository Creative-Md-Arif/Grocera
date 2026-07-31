import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async"; // Existing package imported for SEO
import {
  useGetProductDetailsQuery,
  useGetRelatedProductsQuery,
} from "@redux/api/productApiSlice";

import {
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
} from "@redux/api/reviewApiSlice";
import Message from "../../components/Message";
import ProductTabs from "./ProductTabs";
import ProductCard from "./ProductCard";

import AddToCartButton from "../../components/AddToCartButton";
import { motion } from "framer-motion";
import Breadcrumb from "../../components/breadcrumb/Breadcrumb";

// ── Skeleton Loader Component ──
const ProductDetailsSkeleton = () => (
  <div className="bg-white min-h-screen animate-pulse">
    <div className="max-w-screen-2xl mx-auto mt-2 px-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    </div>
    <div className="max-w-screen-2xl mx-auto py-6 px-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="lg:w-[45%]">
          <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-5">
            <div className="flex lg:flex-col gap-2 flex-shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-14 h-14 sm:w-[70px] sm:h-[70px] bg-gray-200 rounded-lg"
                ></div>
              ))}
            </div>
            <div className="flex-1 bg-gray-200 rounded-2xl aspect-square"></div>
          </div>
        </div>
        <div className="lg:w-[55%] space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
          <div className="flex gap-1 mt-2">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-40 mt-4"></div>
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductDetails = () => {
  const { id: productId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [qty, setQty] = useState(1);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { data: productReviews, refetch: refetchReviews } =
    useGetProductReviewsQuery(product?._id, {
      skip: !product?._id,
    });

  const {
    data: relatedProducts,
    isLoading: relatedLoading,
    error: relatedError,
  } = useGetRelatedProductsQuery(
    { productId: product?._id, limit: 5 },
    { skip: !product?._id },
  );

  const { userInfo } = useSelector((state) => state.auth);

  const [addProductReview, { isLoading: loadingProductReview }] =
    useAddProductReviewMutation();

  useEffect(() => {
    if (product) {
      if (product.defaultColorIndex !== undefined)
        setSelectedColorIndex(product.defaultColorIndex);
      if (product.defaultSizeIndex !== undefined)
        setSelectedSizeIndex(product.defaultSizeIndex);
      if (!activeImage) {
        if (product.images?.length > 0) setActiveImage(product.images[0]);
        else if (product.image) setActiveImage(product.image);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const getDisplayImages = useCallback(() => {
    if (!product) return [];

    const commonImages =
      product.images?.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

    if (!product.hasVariants) return commonImages;

    const variant = product.variants?.[selectedColorIndex];
    const variantImages =
      variant?.color?.images?.length > 0
        ? variant.color.images
        : variant?.color?.image
          ? [variant.color.image]
          : [];

    return [...variantImages, ...commonImages];
  }, [product, selectedColorIndex]);

  const getCurrentPrice = useCallback(() => {
    if (!product) return 0;
    let basePrice = product.price || 0;
    if (product.hasVariants && product.variants?.[selectedColorIndex]) {
      const variant = product.variants[selectedColorIndex];
      if (variant.sizes?.[selectedSizeIndex])
        basePrice = variant.sizes[selectedSizeIndex].price;
    }
    const discountPercent = product.discountPercentage || 0;
    if (discountPercent > 0)
      return basePrice - (basePrice * discountPercent) / 100;
    return basePrice;
  }, [product, selectedColorIndex, selectedSizeIndex]);

  const getCurrentStock = useCallback(() => {
    if (!product) return 0;
    if (product.hasVariants && product.variants?.[selectedColorIndex]) {
      const variant = product.variants[selectedColorIndex];
      if (variant.sizes?.[selectedSizeIndex])
        return variant.sizes[selectedSizeIndex].countInStock;
    }
    return product.countInStock || 0;
  }, [product, selectedColorIndex, selectedSizeIndex]);

  const getVariantInfo = useCallback(() => {
    if (!product || !product.hasVariants)
      return {
        hasVariants: false,
        colorIndex: null,
        colorName: "",
        colorHex: "",
        sizeIndex: null,
        sizeName: "",
        variantPrice: null,
        sku: "",
        countInStock: 0,
      };
    const variant = product.variants[selectedColorIndex];
    const size = variant?.sizes?.[selectedSizeIndex];
    return {
      hasVariants: true,
      colorIndex: selectedColorIndex,
      colorName: variant?.color?.name || "",
      colorHex: variant?.color?.hexCode || "",
      sizeIndex: selectedSizeIndex,
      sizeName: size?.size || "",
      variantPrice: size?.price || product.price,
      sku: size?.sku || "",
      countInStock: size?.countInStock || 0,
    };
  }, [product, selectedColorIndex, selectedSizeIndex]);

  const basePrice = useMemo(() => {
    return product?.hasVariants
      ? product.variants?.[selectedColorIndex]?.sizes?.[selectedSizeIndex]
          ?.price || product.price
      : product?.price || 0;
  }, [product, selectedColorIndex, selectedSizeIndex]);

  const finalPrice = useMemo(() => getCurrentPrice(), [getCurrentPrice]);
  const currentStock = useMemo(() => getCurrentStock(), [getCurrentStock]);
  const displayImages = useMemo(() => getDisplayImages(), [getDisplayImages]);
  const displayDiscountPercent = product?.discountPercentage || 0;

  const hasCampaign = useMemo(
    () => product?.appliedCampaigns && product.appliedCampaigns.length > 0,
    [product],
  );

  const getDynamicCampaignPrice = useCallback(
    (currentBasePrice) => {
      if (!hasCampaign) return null;
      let calculatedPrice = currentBasePrice;
      for (const camp of product.appliedCampaigns) {
        let discountAmt =
          camp.discountType === "percentage"
            ? (calculatedPrice * camp.discountValue) / 100
            : camp.discountValue;
        if (camp.maxDiscountAmount) {
          discountAmt = Math.min(discountAmt, camp.maxDiscountAmount);
        }
        calculatedPrice -= discountAmt;
      }
      return Math.max(Math.round(calculatedPrice * 100) / 100, 0);
    },
    [hasCampaign, product],
  );

  const getCampaignBadgeText = useCallback(() => {
    if (!hasCampaign) return null;
    const camp = product.appliedCampaigns[0];
    const typeName = (camp.type || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const discountText =
      camp.discountType === "percentage"
        ? `-${camp.discountValue}%`
        : `-৳${camp.discountValue}`;
    return `${typeName} ${discountText}`;
  }, [hasCampaign, product]);

  const dynamicCampaignPrice = useMemo(
    () => getDynamicCampaignPrice(basePrice),
    [getDynamicCampaignPrice, basePrice],
  );
  const priceToShow = hasCampaign ? dynamicCampaignPrice : finalPrice;
  const crossedPrice = basePrice;
  const campaignBadgeText = useMemo(
    () => getCampaignBadgeText(),
    [getCampaignBadgeText],
  );

  const handleColorChange = useCallback(
    (index) => {
      setSelectedColorIndex(index);
      if (product.variants[index]?.sizes?.length > 0) setSelectedSizeIndex(0);
      const variant = product.variants[index];
      if (variant?.color?.images?.length > 0)
        setActiveImage(variant.color.images[0]);
      else if (variant?.color?.image) setActiveImage(variant.color.image);
    },
    [product],
  );

  const getProductForCart = useMemo(() => {
    if (!product) return null;
    return {
      _id: product._id,
      name: product.name,
      price: basePrice,
      basePrice,
      finalPrice,
      campaignPrice: priceToShow,
      appliedCampaigns: product?.appliedCampaigns || [],
      variantInfo: getVariantInfo(),
      image: displayImages[0] || product.images?.[0],
      images: displayImages,
      _effectivePrice: priceToShow,
      effectivePrice: priceToShow,
      discountPercentage: product.discountPercentage,
      qty,
      countInStock: currentStock,
    };
  }, [
    product,
    basePrice,
    finalPrice,
    priceToShow,
    getVariantInfo,
    displayImages,
    qty,
    currentStock,
  ]);

  const submitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await addProductReview({
          productId: product._id,
          rating,
          comment,
        }).unwrap();
        refetch();
        refetchReviews();
        toast.success("Review submitted");
        setComment("");
        setRating(0);
      } catch (error) {
        toast.error(error?.data?.message || "Error");
      }
    },
    [addProductReview, product, rating, comment, refetch, refetchReviews],
  );

  const categoryHierarchy = useMemo(() => {
    const hierarchy = [];
    let current = product?.category;
    while (current) {
      hierarchy.unshift(current);
      current = current.parent;
    }
    return hierarchy;
  }, [product]);

  // ── Proper Skeleton Loading ──
  if (isLoading) return <ProductDetailsSkeleton />;
  if (error) return <Message variant="danger">{error?.data?.message}</Message>;
  if (!product) return null;

  return (
    <div className="bg-white min-h-screen">
      {/* ── SEO Optimization using Helmet ── */}
      <Helmet>
        <title>{`${product.name} - Buy Online at Best Price | Veloura`}</title>
        <meta
          name="description"
          content={
            product.description?.substring(0, 150) ||
            `Buy ${product.name} online at Veloura. Best deals, fast delivery, and secure payment.`
          }
        />
        <meta property="og:title" content={`${product.name} | Veloura`} />
        <meta
          property="og:description"
          content={product.description?.substring(0, 150)}
        />
        <meta property="og:image" content={displayImages[0]} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="bg-white shadow-sm mt-2">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            ...categoryHierarchy.map((cat, i, arr) => ({
              label: cat.name,
              href: `/shop?category=${cat._id}`,
              type: "category",
              isLeaf: i === arr.length - 1,
            })),
            { label: product.name },
          ]}
        />
      </div>

      <div className="max-w-screen-2xl mx-auto py-6 px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* ── Image Gallery ── */}
          <div className="lg:w-[45%]">
            <div className="sticky top-20 sm:top-24 flex flex-col-reverse lg:flex-row gap-3 sm:gap-5">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar py-1 lg:max-h-[520px] flex-shrink-0">
                {displayImages.map((img, index) => (
                  <div
                    key={index}
                    className="relative flex-shrink-0 group/thumb"
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 sm:w-[70px] sm:h-[70px] object-contain bg-white p-0.5 rounded-lg cursor-pointer transition-all duration-300 ${
                        activeImage === img
                          ? "ring-2 ring-neutral-950 scale-105"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              <div className="relative flex-1 bg-white rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-2 group">
                {hasCampaign ? (
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-red-600 border border-neutral-100 px-3 py-1.5 rounded-r-xl flex items-center gap-1.5">
                      <span className="text-[12px] sm:text-[14px] font-trebuchet font-bold uppercase tracking-px text-white">
                        {campaignBadgeText}
                      </span>
                    </div>
                  </div>
                ) : displayDiscountPercent > 0 ? (
                  <div className="absolute top-4 left-0 z-10">
                    <div className="bg-[#6E2594] border border-neutral-100 px-3 py-1 min-w-[120px] rounded-r-xl flex items-center gap-1.5">
                      <span className="text-[14px] font-trebuchet font-bold uppercase tracking-px text-white">
                        Save
                      </span>
                      <span className="text-sm font-medium font-trebuchet text-white tracking-px">
                        -{Math.round(displayDiscountPercent)}%
                      </span>
                    </div>
                  </div>
                ) : null}

                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="lg:w-[55%] space-y-4">
            <h1 className="text-[20px] md:text-[22px] font-normal font-trebuchet text-[#3749BB] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Price:
                </span>
                <span className="text-[16px] font-trebuchet font-bold text-[#000000]">
                  {Math.round(priceToShow * qty).toLocaleString()}৳
                </span>
                {(hasCampaign || displayDiscountPercent > 0) && (
                  <span className="text-[12px] text-gray-600 font-trebuchet font-semibold line-through ml-1">
                    {Math.round(crossedPrice * qty).toLocaleString()}৳
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Status:
                </span>
                {(() => {
                  const status = product.hasVariants
                    ? product.variants[selectedColorIndex]?.sizes[
                        selectedSizeIndex
                      ]?.stockStatus
                    : product.stockStatus;

                  if (status === "out_of_stock")
                    return (
                      <span className="text-[14px] font-trebuchet font-bold text-red-500">
                        Out of Stock
                      </span>
                    );
                  if (status === "low_stock")
                    return (
                      <span className="text-[14px] font-trebuchet font-bold text-orange-500">
                        Only {currentStock} left
                      </span>
                    );
                  return (
                    <span className="text-[14px] font-trebuchet font-bold text-[#000000]">
                      In Stock
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-[14px] font-trebuchet text-gray-600 font-normal">
                  Brand:
                </span>
                <span className="text-[14px] font-trebuchet font-bold text-[#000000]">
                  {product.brand || "Veloura"}
                </span>
              </div>
            </div>

            {product.hasVariants && (
              <div className="flex items-center gap-1.5 font-playfair">
                <span className="text-[12px] font-bold text-black">Color:</span>
                <span className="text-[12px] font-black text-black">
                  {product.variants[selectedColorIndex]?.color?.name}
                </span>
                {product.variants[selectedColorIndex]?.sizes[selectedSizeIndex]
                  ?.size && (
                  <span className="text-[12px] text-gray-400 font-medium ml-1">
                    (
                    {
                      product.variants[selectedColorIndex]?.sizes[
                        selectedSizeIndex
                      ]?.size
                    }
                    )
                  </span>
                )}
              </div>
            )}

            {product.hasVariants && product.variants?.length > 0 && (
              <div className="pt-1 font-playfair">
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((variant, index) => {
                    const outOfStock = variant.colorHasStock === false;
                    return (
                      <button
                        key={index}
                        onClick={() => !outOfStock && handleColorChange(index)}
                        disabled={outOfStock}
                        className={`px-3 py-1 text-[13px] transition-all duration-150 border uppercase tracking-wider ${
                          selectedColorIndex === index
                            ? "border-[#E04F23] bg-[#E04F23] text-white font-medium"
                            : outOfStock
                              ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                              : "border-blue-700 bg-white text-black hover:bg-gray-50 font-normal"
                        }`}
                      >
                        {variant.color.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.hasVariants &&
              product.variants[selectedColorIndex]?.sizes?.length > 0 && (
                <div className="pt-3 font-playfair">
                  <div className="flex flex-wrap gap-1">
                    {product.variants[selectedColorIndex].sizes.map(
                      (size, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSizeIndex(index)}
                          disabled={size.countInStock === 0}
                          className={`relative px-3 py-1 text-[13px] transition-all duration-150 border min-w-[40px] ${
                            selectedSizeIndex === index
                              ? "border-[#E04F23] bg-[#E04F23] text-white font-medium"
                              : size.stockStatus === "out_of_stock"
                                ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                                : "border-blue-700 bg-white text-black hover:bg-gray-50 font-normal"
                          }`}
                        >
                          {size.size}
                          {size.stockStatus === "low_stock" && (
                            <span className="absolute -top-2 -right-1 text-[9px] bg-red-500 text-white px-1 rounded-full leading-tight">
                              {size.countInStock}
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

            {product.keyFeatures?.length > 0 && (
              <div className="pt-2">
                <h4 className="text-[18px] font-normal font-trebuchet tracking-wide text-[#1A1A1A] mb-2">
                  Key Features
                </h4>
                <ul className="space-y-1.5 list-disc list-inside">
                  {product.keyFeatures.map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-[15px] font-normal font-trebuchet text-[#000000]"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
                {product.specifications?.length > 0 && (
                  <button
                    onClick={() =>
                      document
                        .getElementById("product-tabs-section")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="mt-3 text-red-500 font-trebuchet text-[15px] font-medium underline decoration-[#B88E2F]/40 underline-offset-4 hover:decoration-[#B88E2F] hover:text-red-600 transition-all duration-200"
                  >
                    View More Info →
                  </button>
                )}
              </div>
            )}
            <div className="pt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <div className="flex items-center border border-gray-200 bg-white h-8 w-24 font-playfair select-none rounded-[4px] overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-full flex items-center justify-center bg-gray-50 text-black text-[14px] font-medium border-r border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    —
                  </button>
                  <span className="flex-1 h-full flex items-center justify-center text-[13px] font-medium text-black bg-white">
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty(Math.min(currentStock || 10, qty + 1))
                    }
                    disabled={qty >= currentStock}
                    className="w-8 h-full flex items-center justify-center bg-white text-black text-[14px] font-medium border-l border-gray-100 hover:bg-gray-50 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 sm:w-[110px] sm:flex-initial h-8">
                  <AddToCartButton
                    product={getProductForCart}
                    qty={qty}
                    buttonText="Add"
                    addedText="Added"
                    variant="add"
                    customStyles="h-8 !rounded-[4px]"
                  />
                </div>
              </div>

              <div className="flex-1 sm:w-[110px] sm:flex-initial h-8">
                <AddToCartButton
                  product={getProductForCart}
                  qty={qty}
                  isOrderNow={true}
                  variant="order"
                  customStyles="h-8 !rounded-[4px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F9F9] py-6">
        <div
          id="product-tabs-section"
          className="max-w-screen-2xl mx-auto px-4 mt-12"
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 w-full">
              <ProductTabs
                {...{
                  loadingProductReview,
                  userInfo,
                  submitHandler,
                  rating,
                  setRating,
                  comment,
                  setComment,
                  product,
                  // 🆕 নতুন রিভিউ সিস্টেম থেকে আসা ডাটা product.reviews এর সাথে মার্জ করে পাঠানো হলো
                  // যাতে ProductTabs এ কোনো বড় পরিবর্তন করতে না হয়
                  reviews: productReviews || product.reviews,
                }}
              />
            </div>

            <div className="w-full lg:w-[300px] flex-shrink-0">
              <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden">
                <div className="px-4 py-3.5 border-b border-neutral-200 bg-white">
                  <h2
                    className="text-[16px] font-bold text-[#2031B8] text-center"
                    style={{ fontFamily: '"Trebuchet MS", sans-serif' }}
                  >
                    Similar Product
                  </h2>
                </div>

                {relatedLoading ? (
                  <div className="p-4 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-[76px] bg-gray-100 rounded-[4px] animate-pulse"
                      />
                    ))}
                  </div>
                ) : relatedError ? (
                  <div className="p-4">
                    <Message variant="danger">
                      Failed to load related products
                    </Message>
                  </div>
                ) : relatedProducts?.length > 0 ? (
                  <div className="px-4 divide-y divide-neutral-100">
                    {relatedProducts
                      .slice(0, 5)
                      .map((relatedProduct, index) => (
                        <motion.div
                          key={relatedProduct._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.06 }}
                        >
                          <ProductCard p={relatedProduct} viewMode="similar" />
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <p className="text-gray-600 font-medium text-sm">
                      No related products found
                    </p>
                    <Link
                      to="/shop"
                      className="text-[#B88E2F] font-semibold mt-2 inline-block hover:underline text-xs sm:text-sm"
                    >
                      Browse all products
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

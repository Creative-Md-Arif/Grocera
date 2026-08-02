import { useParams, Link } from "react-router-dom";
import { useGetBrandByIdQuery } from "../../redux/api/brandApiSlice";
import { Helmet } from "react-helmet-async";
import { FaArrowLeft } from "react-icons/fa";
import Product from "../../pages/Products/Product"; // আপনার দেওয়া Product কম্পোনেন্ট

const BrandDetailsPage = () => {
  const { idOrSlug } = useParams();
  const { data: brand, isLoading, isError } = useGetBrandByIdQuery(idOrSlug);

  return (
    <>
      <Helmet>
        <title>{isLoading ? "Loading Brand..." : `${brand?.name || "Brand"} - TechVora`}</title>
        <meta name="description" content={brand?.description || `Buy ${brand?.name} products online at TechVora.`} />
      </Helmet>

      <div className="bg-[#FFFFFF] min-h-screen font-sans">
        <div className="max-w-screen-2xl mx-auto px-4 py-12 sm:py-16">
          
          {/* Back Button */}
          <Link 
            to="/brands" 
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.18em] text-gray-500 hover:text-[#B88E2F] mb-10 transition-colors"
          >
            <FaArrowLeft size={12} /> All Brands
          </Link>

          {/* Brand Header - BestSellers এর ডিজাইন ফলো করে */}
          <header className="flex flex-col items-center mb-12 sm:mb-16 text-center gap-3">
            {isLoading ? (
              <div className="w-24 h-24 bg-gray-100 rounded-sm animate-pulse mb-2"></div>
            ) : brand?.image ? (
              <img 
                src={brand.image} 
                alt={brand.name} 
                className="h-20 w-auto md:h-24 object-contain mb-2 grayscale-0" 
              />
            ) : null}
            
            <h1 className="font-trebuchet text-[24px] md:text-[32px] font-bold tracking-px text-gray-900 uppercase">
              {isLoading ? "Loading..." : brand?.name}
            </h1>
            
            {!isLoading && brand?.country && (
              <p className="text-[12px] md:text-[14px] font-trebuchet font-normal tracking-px text-gray-500 uppercase">
                Origin: {brand.country}
              </p>
            )}

            {!isLoading && brand?.description && (
              <p className="text-[13px] md:text-[15px] font-trebuchet font-normal tracking-px text-gray-600 max-w-2xl">
                {brand.description}
              </p>
            )}
            
            <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full mt-2" />
          </header>

          {/* Products Grid Section */}
          {isLoading ? (
            // লোডিং অবস্থায় Product কম্পোনেন্টের স্কেলেটন দেখাবে
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Product key={i} product={null} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 font-medium">
              Failed to load brand details.
            </div>
          ) : !brand ? (
            <div className="text-center py-20 text-gray-500 font-medium">
              Brand not found.
            </div>
          ) : (
            <>
              <h2 className="font-trebuchet text-[18px] font-bold tracking-px text-gray-900 uppercase mb-6 hidden md:block">
                Products ({brand.products?.length || 0})
              </h2>

              {brand.products?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {brand.products.map((product) => (
                    <Product key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-sm">
                  <p className="text-gray-500 uppercase tracking-widest font-bold text-sm">
                    No products found for this brand.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandDetailsPage;
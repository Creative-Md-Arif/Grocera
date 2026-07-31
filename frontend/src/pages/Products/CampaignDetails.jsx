import { useParams } from "react-router-dom";
import {
  useGetCampaignByIdQuery,
  useGetCampaignProductsQuery,
} from "@redux/api/campaignApiSlice";
import { Link } from "react-router-dom";
import { FaTag, FaClock } from "react-icons/fa6";
import Loader from "../../components/Loader";

const CampaignDetails = () => {
  const { id } = useParams();

  const { data: campaign, isLoading: loadingCamp } = useGetCampaignByIdQuery(id);
  const { data: products, isLoading: loadingProds } = useGetCampaignProductsQuery(id);

  if (loadingCamp || loadingProds) return <Loader />;
  if (!campaign) return <div className="p-10 text-center">Campaign not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        <img
          src={campaign.bannerImage}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-3xl md:text-5xl font-bold uppercase mb-4">
            {campaign.title}
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl">
            {campaign.description}
          </p>
          
          {/* Discount Badge */}
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
            <span className="flex items-center gap-2 font-bold text-yellow-400">
              <FaTag /> {campaign.discountType === "percentage" ? `${campaign.discountValue}% OFF` : `৳${campaign.discountValue} FLAT OFF`}
            </span>
            {campaign.maxDiscountAmount > 0 && (
              <span className="text-sm text-gray-300">
                (Max: ৳{campaign.maxDiscountAmount})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Info Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center border-b border-gray-200 bg-white">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <FaClock className="text-red-500" />
          Ends on: {new Date(campaign.endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {campaign.minPurchaseAmount > 0 && (
          <p className="text-sm text-red-600 font-medium">
            Minimum purchase: ৳{campaign.minPurchaseAmount}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-black mb-6 uppercase">
          Deals for you ({products?.length || 0} items)
        </h2>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 group overflow-hidden hover:shadow-lg transition-all">
                <Link to={`/product/${product._id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Discount Badge on Image */}
                    {product.appliedCampaigns?.[0] && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1">
                        -{product.appliedCampaigns[0].discountAmount}৳
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-800 truncate mb-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-600">
                        ৳{product.finalPrice}
                      </span>
                      {product.originalPrice > product.finalPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ৳{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 border border-gray-200 bg-white">
            No products are currently mapped to this campaign.
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
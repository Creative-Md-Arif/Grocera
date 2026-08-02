import { useParams, Link } from "react-router-dom";
import { useGetBrandByIdQuery } from "@redux/api/brandApiSlice";
import { Helmet } from "react-helmet-async";
import { FaArrowLeft } from "react-icons/fa";
import Loader from "../../components/Loader";

const BrandDetailsPage = () => {
  const { idOrSlug } = useParams();
  const { data: brand, isLoading } = useGetBrandByIdQuery(idOrSlug);

  if (isLoading) return <Loader />;

  if (!brand) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Brand not found</h1>
        <Link to="/brands" className="text-red-600 hover:underline">Back to All Brands</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{brand.name} - GROCERA</title>
        <meta name="description" content={brand.description || `Buy ${brand.name} products online at GROCERA.`} />
      </Helmet>

      <div className="bg-[#FFFFFF] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          
          {/* Back Button */}
          <Link to="/brands" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 uppercase tracking-widest">
            <FaArrowLeft size={12} /> All Brands
          </Link>

          {/* Brand Header */}
          <header className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 pb-8 border-b border-gray-100">
            {brand.image && (
              <img 
                src={brand.image} 
                alt={brand.name} 
                className="w-24 h-24 object-contain border border-gray-100 p-2 rounded-sm bg-white" 
              />
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-black tracking-tight">
                {brand.name}
              </h1>
              {brand.country && <p className="text-sm text-gray-500 mt-1 font-bold uppercase tracking-widest">Country: {brand.country}</p>}
              {brand.description && <p className="text-gray-600 mt-3 max-w-2xl">{brand.description}</p>}
            </div>
          </header>

          {/* Products Grid */}
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wider text-gray-700">
            Products ({brand.products?.length || 0})
          </h2>

          {brand.products?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {brand.products.map((product) => (
                <Link 
                  to={`/product/${product._id}`} 
                  key={product._id}
                  className="group border border-gray-200 rounded-sm overflow-hidden hover:border-black transition-all"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img 
                      src={product.images?.[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-black">
                      {product.name}
                    </h3>
                    <p className="text-red-600 font-black text-lg mt-2">৳ {product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 border border-dashed border-gray-200 rounded-sm">
              <p className="text-gray-500 uppercase tracking-widest font-bold">No products found for this brand.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrandDetailsPage;
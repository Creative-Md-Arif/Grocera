import { useGetBrandsQuery } from "@redux/api/brandApiSlice";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaTags } from "react-icons/fa";
import Loader from "../../components/Loader";

const AllBrandsPage = () => {
  const { data, isLoading } = useGetBrandsQuery({ isActive: "true" });
  const brands = data?.brands || [];

  if (isLoading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>All Brands - GROCERA</title>
        <meta name="description" content="Browse all your favorite grocery and food brands at GROCERA." />
      </Helmet>

      <div className="bg-[#FFFFFF] min-h-screen">
        <div className="max-w-[1500px] mx-auto px-4 py-12">
          
          <header className="mb-12 border-l-4 border-black pl-6 py-2">
            <h1 className="text-3xl md:text-4xl font-['Playfair_Display'] font-black text-black tracking-tight flex items-center gap-3">
              <FaTags /> All <span className="text-red-600">Brands</span>
            </h1>
            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
              Find products from your favorite brands
            </p>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {brands.map((brand) => (
              <Link 
                to={`/brand/${brand.slug || brand._id}`} 
                key={brand._id}
                className="group bg-white border border-gray-200 p-6 rounded-sm flex flex-col items-center justify-center hover:border-black hover:shadow-md transition-all aspect-square"
              >
                {brand.image ? (
                  <img 
                    src={brand.image} 
                    alt={brand.name} 
                    className="h-16 w-auto object-contain mb-3 grayscale group-hover:grayscale-0 transition-all" 
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 text-2xl">
                    <FaTags />
                  </div>
                )}
                <span className="text-sm font-bold text-gray-700 group-hover:text-black uppercase tracking-wider text-center">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default AllBrandsPage;
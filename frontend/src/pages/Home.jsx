import { memo, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NewArrivals from "../components/bannerSection/NewArrivals";
import BestSellers from "../components/bannerSection/BestSellers";
import Category from "../components/Category";
import HeroBanner from "../components/HeroBanner";
import FeaturedReviews from "../pages/User/FeaturedReviews";
import CategoryPromoBanner from "../components/promotional/CategoryPromoBanner";
import FooterWideBanner from "../components/promotional/FooterWideBanner";

const Home = () => {
  const [searchParams] = useSearchParams();

  const keyword = useMemo(() => searchParams.get("keyword"), [searchParams]);
  const showHomeSections = !keyword;

  return (
    <>
      {/* SEO */}
      <Helmet>
        <title>GROCERA – Online Grocery & Food Shop in Bangladesh</title>

        <meta
          name="description"
          content="Shop fresh groceries, fruits, vegetables, beverages, snacks, cooking essentials, and daily household products at GROCERA with fast delivery across Bangladesh."
        />

        <meta
          name="keywords"
          content="grocera, grocera bd, online grocery bangladesh, grocery shop bd, fresh vegetables, fresh fruits, daily essentials, food products, beverages, snacks, cooking essentials, online supermarket"
        />

        <meta
          property="og:title"
          content="GROCERA – Online Grocery & Food Shop in Bangladesh"
        />

        <meta
          property="og:description"
          content="Shop fresh groceries, fruits, vegetables, beverages, snacks, cooking essentials, and daily household products at GROCERA with fast delivery across Bangladesh."
        />

        <meta
          property="og:url"
          content="https://grocera.com/"
        />

        <meta
          property="og:image"
          content="https://grocera.com/og-image.jpg"
        />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GROCERA" />
        <meta property="og:locale" content="en_BD" />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="GROCERA – Online Grocery & Food Shop in Bangladesh"
        />

        <meta
          name="twitter:description"
          content="Buy fresh groceries, fruits, vegetables, beverages, snacks, and daily essentials online from GROCERA with fast delivery across Bangladesh."
        />

        <meta
          name="twitter:image"
          content="https://grocera.com/og-image.jpg"
        />

        <link
          rel="canonical"
          href="https://grocera.com/"
        />
      </Helmet>

      <div
        className="bg-[#FFFFFF] min-h-screen"
        role="main"
        aria-label="Homepage content"
      >
        <HeroBanner />

        {showHomeSections && <Category />}
        {showHomeSections && <NewArrivals />}
        {showHomeSections && <CategoryPromoBanner />}
        {showHomeSections && <BestSellers />}
        {showHomeSections && <FeaturedReviews />}
        {showHomeSections && <FooterWideBanner />}
      </div>
    </>
  );
};

export default memo(Home);

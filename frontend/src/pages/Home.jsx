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
      {/* ── SEO Optimization using Helmet ── */}
      <Helmet>
        <title>
          Veloura – Premium Beauty & Personal Care Online Shop in Bangladesh
        </title>

        <meta
          name="description"
          content="Veloura offers premium beauty and personal care products, including skincare, cosmetics, hair care, and everyday essentials, crafted to bring out your natural beauty."
        />

        <meta
          name="keywords"
          content="veloura bd, beauty products bangladesh, skincare bangladesh, cosmetics bangladesh, makeup bd, personal care bd, online beauty shop, premium cosmetics, skincare products, beauty essentials bd"
        />

        <meta
          property="og:title"
          content="Veloura – Premium Beauty & Personal Care Online Shop in Bangladesh"
        />

        <meta
          property="og:description"
          content="Veloura offers premium beauty and personal care products, including skincare, cosmetics, hair care, and everyday essentials, crafted to bring out your natural beauty."
        />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Veloura" />
        <meta property="og:locale" content="en_BD" />
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

import { motion } from "framer-motion";
import { useGetFooterBannersQuery } from "@redux/api/bannerApiSlice";
import {
  FaShippingFast,
  FaUndo,
  FaShieldAlt,
  FaHeadset,
  FaCreditCard,
  FaAward,
  FaCheckCircle,
} from "react-icons/fa";

/*
  SECTION IDENTITY: Footer Banners / Features
  BG: Pure White #FFFFFF
  PATTERN: Ultra-subtle geometric grid — premium, clean, brand authority
  Feel: Premium brand promise section optimized for white background
*/
const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Crect x='2' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3Crect x='2' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 60px",
};

const ICON_MAP = {
  truck: FaShippingFast,
  "refresh-cw": FaUndo,
  "shield-check": FaShieldAlt,
  headphones: FaHeadset,
  "credit-card": FaCreditCard,
  award: FaAward,
};

const DEFAULT_FEATURES = [
  {
    icon: "truck",
    title: "Free Shipping",
    description: "On orders over ৳2000",
  },
  {
    icon: "shield-check",
    title: "Secure Payment",
    description: "100% protected checkout",
  },
  {
    icon: "refresh-cw",
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: "headphones",
    title: "24/7 Support",
    description: "Dedicated help center",
  },
];

const TRUST_BADGES = [
  { Icon: FaShieldAlt, text: "SSL Secure Payment" },
  { Icon: FaCheckCircle, text: "Verified Products" },
  { Icon: FaAward, text: "Quality Guaranteed" },
];

const FooterBanners = () => {
  const { data: banners } = useGetFooterBannersQuery();
  const features = banners?.[0]?.metaData?.features || DEFAULT_FEATURES;
  const accentColor = banners?.[0]?.buttonColor || "#B88E2F";

  return (
    <section
      aria-label="Store features"
      className="py-10 sm:py-12 border-t border-b border-gray-200 font-figtree"
      style={BG}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {features.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || FaShieldAlt;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                className="group flex flex-col items-center text-center px-4 py-5 sm:p-6 border border-gray-200 rounded-lg bg-white hover:border-[#B88E2F]/40 hover:shadow-md hover:shadow-[#B88E2F]/5 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full mb-3 sm:mb-4 bg-gray-50 group-hover:bg-[#B88E2F]/5 transition-colors duration-300"
                  style={{ color: accentColor }}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                </div>
                <h3 className="text-[11px] sm:text-xs font-black text-gray-900 uppercase tracking-[0.12em] mb-1">
                  {feature.title}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-600 leading-relaxed tracking-wide">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mt-6 sm:mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 sm:gap-x-8"
        >
          {TRUST_BADGES.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Icon
                className="w-[11px] h-[11px] sm:w-[12px] sm:h-[12px] shrink-0"
                style={{ color: accentColor }}
                aria-hidden="true"
              />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">
                {text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FooterBanners;
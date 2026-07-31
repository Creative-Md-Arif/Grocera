import { useGetIntegrationsQuery } from "@redux/api/integrationApiSlice";
import {
  FaWhatsapp,
  FaFacebookMessenger,
  FaTelegram,
  FaInstagram,
} from "react-icons/fa";

const platformIcons = {
  whatsapp: <FaWhatsapp size={20} className="text-green-500" />,
  messenger: <FaFacebookMessenger size={20} className="text-blue-600" />,
  telegram: <FaTelegram size={20} className="text-sky-500" />,
  instagram: <FaInstagram size={20} className="text-pink-500" />,
};

const getPlatformLink = (platform, value) => {
  switch (platform) {
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^0-9]/g, "")}?text=Hello%20Velo%20ura`;
    case "messenger":
      return value.startsWith("http") ? value : `https://${value}`;
    case "telegram":
      return value.startsWith("http") ? value : `https://${value}`;
    case "instagram":
      return value.startsWith("http") ? value : `https://instagram.com/${value}`;
    default:
      return "#";
  }
};

const QuickConnect = () => {
  const { data: integrations, isLoading, isError } = useGetIntegrationsQuery();

  if (isLoading || isError) return null;
  if (!integrations || integrations.length === 0) return null;

  const activeIntegrations = integrations.filter((i) => i.isActive);
  if (activeIntegrations.length === 0) return null;

  return (
    <>
      {activeIntegrations.map((acc) => (
        <div key={acc._id} className="group relative">
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 whitespace-nowrap bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none shadow-lg">
            {acc.accountName}
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
          </span>
          <a
            href={getPlatformLink(acc.platform, acc.linkOrNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {platformIcons[acc.platform] || acc.accountName}
          </a>
        </div>
      ))}
    </>
  );
};

export default QuickConnect;
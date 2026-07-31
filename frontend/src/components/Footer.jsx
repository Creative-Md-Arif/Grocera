/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useGetSiteSettingsQuery } from "@redux/api/siteSettingApiSlice";
import { useSubscribeNewsletterMutation } from "@redux/api/newsletterApiSlice";
import Logo from "./Logo";
import FooterBottom from "./FooterBottom";


/* ─── static data (link lists rarely change, kept as-is) ───── */
const LINKS = {
  support: [
    { name: "Help Center", path: "#" },
    { name: "Track Order", path: "/track-order" },
    { name: "Returns & Refunds", path: "/my-returns" },
    { name: "Shipping Info", path: "#" },
    { name: "FAQ", path: "#" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Blog", path: "/blog" },
    { name: "Careers", path: "#" },
    { name: "Press", path: "#" },
    { name: "Terms of Service", path: "#" },
    { name: "Privacy Policy", path: "#" },
  ],
};

const SOCIAL_ICONS = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
};

const TRUST = [
  {
    label: "Secure Payment",
    bg: "bg-neutral-900",
    color: "text-[#B88E2F]",
    path: "M5 13l4 4L19 7",
  },
  {
    label: "24/7 Support",
    bg: "bg-neutral-900",
    color: "text-[#B88E2F]",
    path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Quality Guarantee",
    bg: "bg-neutral-900",
    color: "text-[#B88E2F]",
    path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
];

/* ─── Section heading ────────────────────────────────────── */
const Heading = ({ children }) => (
  <h3 className="text-[14px] font-black text-white uppercase tracking-[0.2em] mb-4 border-l-2 border-[#B88E2F] pl-2.5">
    {children}
  </h3>
);

/* ─── Footer ─────────────────────────────────────────────── */
const Footer = () => {
  const { data: settingsData } = useGetSiteSettingsQuery();
  const [subscribeNewsletter, { isLoading: isSubscribing }] =
    useSubscribeNewsletterMutation();

  const [email, setEmail] = useState("");

  const settings = settingsData?.data;

  // fallback রাখা হয়েছে যাতে API লোড হওয়ার আগে বা ফেইল করলেও footer ভাঙে না
  const contact = {
    email: settings?.contact?.email || "support@arixgear.com",
    phone: settings?.contact?.phone || "+880 17100000000",
    address: settings?.contact?.address || "Dhaka, Bangladesh",
  };

  const CONTACT = [
    {
      Icon: MdOutlineEmail,
      text: contact.email,
      href: `mailto:${contact.email}`,
    },
    {
      Icon: IoCallOutline,
      text: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
    },
    { Icon: MdLocationOn, text: contact.address, href: "#" },
  ];

  // socialLinks অবজেক্ট থেকে শুধু যেগুলোর URL সেট করা আছে সেগুলোই দেখানো হবে
  const socialLinks = settings?.socialLinks || {};
  const SOCIAL = Object.entries(SOCIAL_ICONS)
    .filter(([key]) => socialLinks[key])
    .map(([key, Icon]) => ({
      Icon,
      href: socialLinks[key],
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));

  const copyrightText =
    settings?.copyrightText || "ARIX CO — All rights reserved.";

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await subscribeNewsletter(email).unwrap();
      toast.success("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to subscribe");
    }
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 font-figtree text-neutral-400">
      <div className="max-w-screen-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* ── Brand + Newsletter ── */}
          <div className="col-span-1 md:col-span-2 lg:col-span-5 space-y-5">
            <Logo invert />
            <p className="text-[14px] text-neutral-400 leading-relaxed max-w-sm">
              Your trusted destination for premium quality products. We deliver
              excellence with every order, ensuring customer satisfaction
              through innovation and reliability.
            </p>

            {/* Newsletter */}
            <div className="border border-neutral-900 rounded-md p-5 bg-neutral-900/40 max-w-sm">
              <h4 className="text-[14px] font-black text-white uppercase tracking-[0.18em] mb-1">
                Newsletter
              </h4>
              <p className="text-[14px] text-neutral-500 mb-3">
                Get exclusive deals and updates
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  required
                  className="
                    flex-1 min-w-0 px-3 py-2
                    text-[14px] text-white
                    border border-neutral-800 rounded-sm
                    focus:outline-none focus:border-[#B88E2F]
                    transition-colors placeholder:text-neutral-600 bg-neutral-950
                  "
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="
                    px-4 py-2 shrink-0
                    bg-[#B88E2F] text-white
                    text-[14px] font-black uppercase tracking-widest
                    rounded-sm hover:bg-[#9E7A26]
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {isSubscribing ? "..." : "Join"}
                </button>
              </form>
            </div>
          </div>

          {/* ── Support ── */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <Heading>Support</Heading>
            <ul className="space-y-3">
              {LINKS.support.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-[14px] text-neutral-400 hover:text-red-500 hover:underline transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Company ── */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <Heading>Company</Heading>
            <ul className="space-y-3">
              {LINKS.company.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-[14px] text-neutral-400 hover:text-red-500 hover:underline transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact + Social ── */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-5">
            <div>
              <Heading>Contact</Heading>
              <ul className="space-y-3">
                {CONTACT.map(({ Icon, text, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="flex items-start gap-2.5 text-neutral-400 hover:text-red-500 hover:underline transition-colors duration-150"
                    >
                      <Icon
                        className="w-[16px] h-[16px] shrink-0 mt-[3px]"
                        aria-hidden="true"
                      ></Icon>
                      <span className="text-[14px] leading-snug">{text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social — শুধু URL সেট করা আছে এমন প্ল্যাটফর্মই দেখাবে */}
            {SOCIAL.length > 0 && (
              <div>
                <p className="text-[14px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-2.5">
                  Follow Us
                </p>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL.map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="
                        w-9 h-9
                        flex items-center justify-center
                        border border-neutral-900 rounded-sm
                        text-neutral-400 hover:text-red-500 hover:border-red-500
                        transition-colors duration-200 bg-neutral-900/20
                      "
                    >
                      <Icon
                        className="w-[14px] h-[14px] shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar — trust + payment ── */}
        <div className="mt-12 pt-6 border-t border-neutral-900">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {TRUST.map(({ label, bg, color, path }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-sm ${bg} border border-neutral-800 flex items-center justify-center shrink-0`}
                  >
                    <svg
                      className={`w-3 h-3 ${color}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={path}
                      />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div
              className="flex items-center gap-2"
              aria-label="Accepted payment methods"
            >
              {["VISA", "MC", "AMEX", "bKash"].map((method) => (
                <div
                  key={method}
                  className="w-12 h-7 bg-neutral-900 border border-neutral-800 rounded-sm flex items-center justify-center"
                >
                  <span className="text-[11px] font-black text-neutral-500 tracking-tight">
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <FooterBottom copyrightText={copyrightText} />
    </footer>
  );
};

export default Footer;

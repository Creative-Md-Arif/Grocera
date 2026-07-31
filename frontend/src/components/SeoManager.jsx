import { useEffect } from "react";
import { useGetSeoSettingsQuery } from "../redux/api/seoApiSlice";

const SeoManager = () => {
  const { data: seoResponse } = useGetSeoSettingsQuery();
  const seo = seoResponse?.data;

  useEffect(() => {
    if (!seo) return;

    // ১. Meta Title আপডেট করা
    if (seo.metaTitle) {
      document.title = seo.metaTitle;
    }

    // ২. Meta Tags আপডেট বা তৈরি করার হেল্পার ফাংশন
    const upsertMetaTag = (selector, attribute, name, content) => {
      if (!content) return;
      let tag = document.head.querySelector(`meta[${selector}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // General Meta Tags
    upsertMetaTag("name", "name", "description", seo.metaDescription);
    upsertMetaTag("name", "name", "keywords", seo.metaKeywords);

    // Open Graph / Social Media Tags
    upsertMetaTag("property", "property", "og:title", seo.ogTitle || seo.metaTitle);
    upsertMetaTag("property", "property", "og:description", seo.ogDescription || seo.metaDescription);
    upsertMetaTag("property", "property", "og:image", seo.ogImage);
    upsertMetaTag("name", "name", "twitter:card", seo.twitterCard);

    // ৩. Google Analytics (GA4) স্ক্রিপ্ট ইনজেকশন
    if (seo.googleAnalyticsId && !document.getElementById("ga-script")) {
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${seo.googleAnalyticsId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement("script");
      script2.id = "ga-script";
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seo.googleAnalyticsId}');
      `;
      document.head.appendChild(script2);
    }

    // ৪. Google Search Console Verification
    if (seo.googleSearchConsole) {
      upsertMetaTag("name", "name", "google-site-verification", seo.googleSearchConsole);
    }

    // ৫. Facebook Pixel স্ক্রিপ্ট ইনজেকশন
    if (seo.facebookPixelId && !document.getElementById("fb-pixel-script")) {
      const script = document.createElement("script");
      script.id = "fb-pixel-script";
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${seo.facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

  }, [seo]);

  return null; // এটি স্ক্রিনে কিছু রেন্ডার করবে না, শুধু head আপডেট করবে
};

export default SeoManager;
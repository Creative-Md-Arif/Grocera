# 🚀 SEO Optimized E-Commerce Frontend

This repository contains the frontend implementation of our modern e-commerce platform, built with React, Redux Toolkit, Tailwind CSS, and Framer Motion. A major focus of this project is **Search Engine Optimization (SEO)**, **Web Accessibility (A11y)**, and **High Performance**.

---

## 🎯 Key Features & SEO Improvements

We have successfully implemented deep SEO and Accessibility optimizations across the core product sections and main application files.

### 1. Product Sections (SEO Complete)
All major product showcase components have been rewritten using Semantic HTML, ARIA labels, and optimized animations.

* 🔥 **FlashSale Component:**
    * Replaced generic wrappers with semantic `<section>`, `<header>`, and `<article>` tags.
    * Added `aria-labelledby` and `aria-busy` for screen reader support during loading states.
    * Optimized Framer Motion animations using `whileInView` and `viewport={{ once: true }}` to improve Core Web Vitals (prevents lag on initial load).
    * Added descriptive `title` and `aria-label` attributes to "View All" links for better bot crawling.
    * Used strong keyword-rich headings (e.g., `<h2>Best Flash Sale Deals of the Day</h2>`).

* ✨ **NewArrivals Component:**
    * Implemented structured headings and keyword-rich `<p>` tags for search engine context.
    * Optimized the real-time clock rendering to prevent unnecessary re-renders.
    * Added `aria-hidden="true"` to decorative icons (react-icons) to keep screen readers focused on content.
    * Lazy-loaded animations triggered only when the user scrolls to the section.

* 🏆 **BestSellers Component:**
    * *Note: Follows the exact same SEO architecture as Flash Sale and New Arrivals.*
    * Semantic structure to highlight top-rated products.
    * Optimized image rendering paths (assuming implemented in the `Product` card).

---

## ⚙️ Core Files Configuration (Complete Note)

The foundational files of the React application have been structured to support global SEO and state management.

### `index.html`
The entry point of the application is fully optimized for web crawlers:
* Added `<html lang="en">` for language detection.
* Included responsive viewport meta tags (`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`).
* Configured primary Meta Title, Description, and theme colors.
* *(Recommended)* Open Graph (OG) tags for social media sharing.

### `main.jsx`
The root rendering file is clean and strictly handles providers:
* Wrapped the app in `<React.StrictMode>` to catch potential issues early.
* Configured Redux `<Provider>` for global state management (API slices).
* Configured routing context (if using `RouterProvider` or `BrowserRouter`).

### `App.jsx`
The main layout wrapper component:
* Organized with standard `<main>` tags for the core content area.
* Handles global UI components like `Navbar`, `Footer`, and `Toast/Notifications`.
* *(Best Practice)* Ready for `react-helmet-async` integration to change `<title>` and `<meta>` dynamically as users navigate between pages (e.g., from Home to Shop to Product Details).

---

## 🛠️ Tech Stack
* **Frontend Framework:** React (Vite)
* **Routing:** React Router DOM
* **State Management:** Redux Toolkit (RTK Query for data fetching)
* **Styling:** Tailwind CSS
* **Animation:** Framer Motion
* **Icons:** React Icons

---

## 💡 Running the Project Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>




   /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        organic: {
          bg: '#FAF7F2',       // ৬০% - মেইন ব্যাকগ্রাউন্ড (ক্রিম / অফ-হোয়াইট)
          card: '#FFFFFF',     // প্রোডাক্ট কার্ড ব্যাকগ্রাউন্ড (পিওর হোয়াইট)
          primary: '#4A3525',  // ৩০% - প্রধান ব্র্যান্ড কালার (ডার্ক চকোলেট)
          text: '#2B1E16',     // রেগুলার বডি টেক্সট (চোখে আরামদায়ক অফ-ব্ল্যাক)
          accent: '#D4AF37',   // ১০% - অ্যাকশন কালার (গোল্ডেন / ঘি ও মধুর কালার)
          'accent-hover': '#C29E30', 
          success: '#1E4620',  
        },
      },
      borderColor: {
        'organic-light': 'rgba(74, 53, 37, 0.1)', 
      },
      fontFamily: {
        organicHeading: ['"Cormorant Garamond"', '"Galada"', 'serif'], 
        organicBody: ['"Lora"', '"Hind Siliguri"', 'serif'], 
      },
      // 📌 ১০০% নির্ভুল Tailwind v3 syntax (সাইজ, লাইন-হাইট ও ওয়েট একসাথে ব্লাউন্ডিং)
      fontSize: {
        'hero-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'hero-desktop': ['56px', { lineHeight: '1.2', fontWeight: '700' }],
        
        'section-mobile': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'section-desktop': ['36px', { lineHeight: '1.3', fontWeight: '600' }],
        
        'product-mobile': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'product-desktop': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        
        'price-mobile': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'price-desktop': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        
        'body-mobile': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-desktop': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        
        'meta-badge': ['12px', { lineHeight: '1', fontWeight: '500' }],
        'button-text': ['14px', { lineHeight: '1', fontWeight: '500' }],
      },
      borderRadius: {
        'btn': '8px',          
        'card': '16px',        
        'card-inner': '12px',  
      },
      boxShadow: {
        'organic-soft': '0 8px 30px rgba(74, 53, 37, 0.04)',  
        'organic-hover': '0 12px 35px rgba(74, 53, 37, 0.08)', 
      },
      transitionDuration: {
        'organic': '300ms',
      },
      transitionTimingFunction: {
        'organic-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [],
}



<link rel="preconnect" href="https://googleapis.com">
<link rel="preconnect" href="https://gstatic.com" crossorigin>
<link href="https://googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Galada&family=Hind+Siliguri:wght@400;500;600&family=Lora:wght@400;500;600&display=swap" rel="stylesheet">

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { usePageTracking } from "@/hooks/usePageTracking";
import { AnimatePresence } from "framer-motion";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Layout from "./components/Layout";
import PageTransition from "./components/PageTransition";
import Home from "./pages/Home";

// Lazy-loaded pages for performance
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Services = lazy(() => import("./pages/Services"));
const Packages = lazy(() => import("./pages/Packages"));
const Calculator = lazy(() => import("./pages/Calculator"));
const About = lazy(() => import("./pages/About"));
const Booking = lazy(() => import("./pages/Booking"));
const Contact = lazy(() => import("./pages/Contact"));
const InstagramPage = lazy(() => import("./pages/Instagram"));
const Admin = lazy(() => import("./pages/Admin"));
const Showroom = lazy(() => import("./pages/Showroom"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const Stylist = lazy(() => import("./pages/Stylist"));
const OutfitGenerator = lazy(() => import("./pages/OutfitGenerator"));
const FindSimilar = lazy(() => import("./pages/FindSimilar"));
const VirtualTryOn = lazy(() => import("./pages/VirtualTryOn"));
const ShowroomBooking = lazy(() => import("./pages/ShowroomBooking"));
const ShoppableGalleryPage = lazy(() => import("./pages/ShoppableGalleryPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  usePageTracking();

  // Admin route renders WITHOUT public Layout
  if (location.pathname === "/admin") {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/decor" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/showroom" element={<PageTransition><Showroom /></PageTransition>} />
          <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
          <Route path="/packages" element={<PageTransition><Packages /></PageTransition>} />
          <Route path="/calculator" element={<PageTransition><Calculator /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/booking" element={<PageTransition><Booking /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/instagram" element={<PageTransition><InstagramPage /></PageTransition>} />
          <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
          <Route path="/shop/:id" element={<PageTransition><ProductPage /></PageTransition>} />
          <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
          <Route path="/stylist" element={<PageTransition><Stylist /></PageTransition>} />
          <Route path="/outfits" element={<PageTransition><OutfitGenerator /></PageTransition>} />
          <Route path="/find-similar" element={<PageTransition><FindSimilar /></PageTransition>} />
          <Route path="/try-on" element={<PageTransition><VirtualTryOn /></PageTransition>} />
          <Route path="/showroom-booking" element={<PageTransition><ShowroomBooking /></PageTransition>} />
          <Route path="/shop-the-look" element={<PageTransition><ShoppableGalleryPage /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

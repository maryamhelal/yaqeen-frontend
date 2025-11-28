import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ContactMessagePage from "./pages/ContactMessagePage";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import CategoryPage from "./pages/ProductPages/CategoryPage";
import CollectionPage from "./pages/ProductPages/CollectionPage";
import CartPage from "./pages/OrderPages/CartPage";
import CheckoutPage from "./pages/OrderPages/CheckoutPage";
import LoginPage from "./pages/UserPages/LoginPage";
import RegisterPage from "./pages/UserPages/RegisterPage";
import ProfilePage from "./pages/UserPages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ProductDetailsPage from "./pages/ProductPages/ProductDetailsPage";
import ThankYouPage from "./pages/OrderPages/ThankYouPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import { Helmet } from "react-helmet";

function App() {
  return (
    <>
      <Helmet>
        {/* Primary SEO Tags */}
        <title>Yaqeen Clothing | Modest Fashion, Abayas & Dresses</title>
        <meta
          name="description"
          content="Discover Yaqeen Clothing's collection of modern, modest dresses and abayas for women. Shop stylish and comfortable outfits with fast delivery across Egypt."
        />

        {/* Optional (Google ignores keywords, but safe to keep) */}
        <meta
          name="keywords"
          content="modest fashion, modest clothing, long dress, dresses, abaya, abayas, hijab, clothing, women, yaqeen, yaqeen modest, online shop, Egypt, modern, winter collection, عبايات, عباية, فساتين طويلة, فساتين محجبات, ملابس محتشمة, حجاب, ازياء محجبات, تسوق اونلاين"
        />

        <meta name="author" content="Yaqeen Clothing" />

        {/* Open Graph (for Facebook, Instagram, WhatsApp) */}
        <meta
          property="og:title"
          content="Yaqeen Clothing | Modest Fashion, Abayas & Dresses"
        />
        <meta
          property="og:description"
          content="Shop modern, modest dresses and abayas with fast delivery across Egypt."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yaqeenclothing.com" />
        <meta
          property="og:image"
          content="https://protoinfrastack.ivondy.com/media/XjM642wlbGinVtEapwWpTAKGJyfQq6p27KnN"
        />

        {/* Twitter Cards (Important for X / Twitter sharing) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Yaqeen Clothing | Modest Fashion & Abayas"
        />
        <meta
          name="twitter:description"
          content="Shop modern, modest dresses and abayas with fast delivery across Egypt."
        />
        <meta
          name="twitter:image"
          content="https://yaqeenclothing.com/images/og-image.jpg"
        />

        {/* Basic SEO essentials */}
        <link rel="canonical" href="https://yaqeenclothing.com" />
      </Helmet>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryPage />}
              />
              <Route
                path="/collection/:collectionName"
                element={<CollectionPage />}
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard/*" element={<DashboardPage />} />
              <Route
                path="/product/:productName"
                element={<ProductDetailsPage />}
              />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/unsubscribe" element={<UnsubscribePage />} />
              <Route path="/contact-message" element={<ContactMessagePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </>
  );
}

export default App;

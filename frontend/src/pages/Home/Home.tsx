import "./home.css";
import PromoBar from "./PromoBar";
import ProductSection from "./product";
import HomeProductsGrid from "./HomeProductsGrid";
import OffersTrustSection from "./OffersTrustSection";
import Footer from "./footersection";
import Hero1 from './hero1';
import VideoSection from "./VideoSection";
import CategorySection from "./CategorySection";

const Home = () => {
  return (
    <main className="home-page">
      <Hero1 />
      <CategorySection />
      <ProductSection />
      <VideoSection />
      <PromoBar />
      <HomeProductsGrid />
      <OffersTrustSection />
      <Footer />
    </main>
  );
};

export default Home;


import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Smartphone, Footprints, ShoppingBasket, Shirt, Home as HomeIcon, Sparkles } from "lucide-react";
import "./Hero2.css";

const CATEGORIES = [
  { name: "Electronics", icon: Smartphone },
  { name: "Footwear", icon: Footprints },
  { name: "Groceries", icon: ShoppingBasket },
  { name: "Fashion", icon: Shirt },
  { name: "Home & Living", icon: HomeIcon },
  { name: "Beauty & Care", icon: Sparkles },
];

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-glow" />

      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-eyebrow">
            <Zap size={14} strokeWidth={2.5} />
            MEGA SALE • LIMITED TIME
          </span>

          <h1 className="hero-heading">
            Deals worth
            <span className="hero-heading-accent"> stopping the scroll </span>
            for.
          </h1>

          <p className="hero-subtext">
            Thousands of products across electronics, fashion, home and
            beauty — discounted for a limited time only. New drops every
            week, prices that don't wait around.
          </p>

          <div className="hero-actions">
            <button className="hero-btn-primary" onClick={() => navigate("/products")}>
              Shop Now
              <ArrowRight size={17} strokeWidth={2.25} />
            </button>
            <a href="#offers" className="hero-btn-secondary">
              View Offers
            </a>
          </div>
        </div>

        {/* Transparent Right Category Sidebar */}
        <div className="hero-category-sidebar">
          <div className="sidebar-categories">
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.name}
                  className="sidebar-category-btn"
                  onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                >
                  <IconComponent size={18} className="cat-icon" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
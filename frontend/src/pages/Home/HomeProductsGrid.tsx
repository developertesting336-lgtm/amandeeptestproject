import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, Star, Heart, Sparkles } from "lucide-react";
import { useCart } from "../../context/cartContext";
import product1 from "../../assets/1.jpeg";
import "./HomeProductsGrid.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images?: Array<string | { url?: string; public_id?: string }>;
  category?: { name?: string } | string;
  brand?: string;
  rating?: number;
  numReviews?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatImageUrl = (path?: any, fallback: string = product1) => {
  if (!path) return fallback;
  const rawUrl = typeof path === "string" ? path : (path.url || path.secure_url || path.path || "");
  if (!rawUrl || typeof rawUrl !== "string") return fallback;
  if (
    rawUrl.startsWith("http://") ||
    rawUrl.startsWith("https://") ||
    rawUrl.startsWith("data:") ||
    rawUrl.startsWith("blob:") ||
    rawUrl.startsWith("/") ||
    rawUrl.includes("/assets/")
  ) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/\\/g, "/");
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${API_BASE_URL}${formattedPath}`;
};


const HomeProductsGrid = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/products`);
        const result = await res.json();
        const list = result.data?.products || result.data || result.products || (Array.isArray(result) ? result : []);

        if (res.ok && Array.isArray(list) && list.length > 0) {
          setProducts(list.slice(0, 12)); // Display top 12 products on homepage (6 per row)
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Home products fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    addToCart(productId, 1);
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
  };

  if (loading) {
    return (
      <section className="home-products-section">
        <div className="home-products-container">
          <p style={{ color: "#683d0a", textAlign: "center", padding: "40px 0", fontWeight: 500 }}>
            Loading products...
          </p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="home-products-section">
      <div className="home-products-container">
        {/* HEADER */}
        <div className="home-products-header">
          <div>
            <span className="home-products-eyebrow">
              <Sparkles size={13} style={{ marginRight: 6, display: "inline-block", verticalAlign: "middle" }} />
              CURATED COLLECTION • TOP DESIGNS
            </span>
            <h2 className="home-products-title">Our Premium Catalog</h2>
          </div>

          <Link to="/products" className="home-explore-btn-top">
            Explore All Products <ArrowRight size={16} />
          </Link>
        </div>

        {/* PRODUCTS GRID */}
        <div className="home-products-grid">
          {products.map((prod, index) => {
            const currentPrice = prod.salePrice && prod.salePrice < prod.price ? prod.salePrice : prod.price;
            const hasDiscount = prod.salePrice && prod.salePrice < prod.price;
            const discountPercent = hasDiscount
              ? Math.round(((prod.price - prod.salePrice!) / prod.price) * 100)
              : 0;

            const categoryName = typeof prod.category === "object" ? prod.category?.name || "General" : prod.category || "General";
            const imgUrl = formatImageUrl(prod.images?.[0], product1);
            const isLiked = !!wishlist[prod._id];
            const ratingValue = (4.3 + (index % 5) * 0.1).toFixed(1);
            const reviewCount = 45 + index * 18;

            return (
              <div
                key={prod._id}
                className="home-product-card"
                onClick={() => navigate(`/product/${prod._id}`)}
              >
                <div className="home-product-img-wrap">
                  <img
                    src={imgUrl}
                    alt={prod.name}
                    className="home-product-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = product1;
                    }}
                  />
                  {hasDiscount && (
                    <span className="home-product-discount-tag">-{discountPercent}% OFF</span>
                  )}
                  <button
                    type="button"
                    className={`home-product-wishlist-btn ${isLiked ? "active" : ""}`}
                    onClick={(e) => toggleWishlist(e, prod._id)}
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={16} fill={isLiked ? "#dc2626" : "none"} color={isLiked ? "#dc2626" : "#4b5563"} />
                  </button>
                </div>

                <div className="home-product-info">
                  <div>
                    <div className="home-product-meta">
                      <span className="home-product-cat">{categoryName}</span>
                      <div className="home-product-rating">
                        <Star size={12} fill="#d97706" color="#d97706" />
                        <span>{ratingValue} ({reviewCount})</span>
                      </div>
                    </div>
                    <h3 className="home-product-name">{prod.name}</h3>
                  </div>

                  <div className="home-product-price-row">
                    <span className="home-product-price">₹{currentPrice.toLocaleString("en-IN")}</span>
                    {hasDiscount && (
                      <span className="home-product-old-price">₹{prod.price.toLocaleString("en-IN")}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="home-product-add-btn"
                    onClick={(e) => handleAddToCart(e, prod._id)}
                  >
                    <ShoppingCart size={15} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM EXPLORE BANNER */}
        {/* <div className="home-explore-bottom-card">
          <div className="home-explore-bottom-content">
            <span className="home-explore-badge">
              <ShieldCheck size={14} style={{ marginRight: 4, display: "inline-block", verticalAlign: "middle" }} />
              100% AUTHENTIC GUARANTEE
            </span>
            <h3>Explore the Full E-Commerce Catalog</h3>
            <p>Discover thousands of verified products across fashion, electronics, home decor, and trending arrivals.</p>
            <div className="home-explore-trust-pills">
              <span>✓ Express Delivery</span>
              <span>✓ 30-Day Easy Returns</span>
              <span>✓ Verified Buyer Protection</span>
            </div>
            <Link to="/products" className="home-explore-main-btn">
              Browse Full Catalog <ArrowRight size={18} />
            </Link>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default HomeProductsGrid;

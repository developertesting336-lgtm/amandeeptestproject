import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import "./ProductSection.css";

import product1 from "../../assets/1.jpeg";
import product2 from "../../assets/2.jpeg";
import product3 from "../../assets/3.jpeg";
import electronicsImg from "../../assets/electronics.jpg";
import clothImg from "../../assets/cloth.jpg";
import toyImg from "../../assets/toys.jpg";

interface DisplayProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviewsCount?: number;
  category: string;
}

const FALLBACK_PRODUCTS: DisplayProduct[] = [
  {
    id: "p1",
    name: "Wireless Over-Ear Noise Cancelling Headphones",
    image: product1,
    price: 4999,
    oldPrice: 7999,
    rating: 4.8,
    reviewsCount: 128,
    category: "Electronics",
  },
  {
    id: "p2",
    name: "Premium Everyday Cotton Casual T-Shirt",
    image: product2,
    price: 999,
    oldPrice: 1499,
    rating: 4.5,
    reviewsCount: 84,
    category: "Fashion",
  },
  {
    id: "p3",
    name: "Smart Fitness Watch with AMOLED Display",
    image: product3,
    price: 3499,
    oldPrice: 5999,
    rating: 4.7,
    reviewsCount: 210,
    category: "Electronics",
  },
  {
    id: "p4",
    name: "Kids Educational Creative Building Blocks Set",
    image: toyImg,
    price: 1299,
    oldPrice: 1999,
    rating: 4.6,
    reviewsCount: 65,
    category: "Toys",
  },
  {
    id: "p5",
    name: "Portable Outdoor Waterproof Bluetooth Speaker",
    image: electronicsImg,
    price: 2499,
    oldPrice: 3999,
    rating: 4.4,
    reviewsCount: 92,
    category: "Electronics",
  },
  {
    id: "p6",
    name: "Classic Heavyweight Denim Jacket",
    image: clothImg,
    price: 2999,
    oldPrice: 4499,
    rating: 4.3,
    reviewsCount: 45,
    category: "Fashion",
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatImageUrl = (image: any, fallback: string = product1): string => {
  if (!image) return fallback;
  const rawUrl = typeof image === "string" ? image : (image?.url || image?.secure_url || image?.path || "");
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

const CATEGORIES = ["All", "Electronics", "Fashion", "Toys"];

const ProductSection = () => {
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState<DisplayProduct[]>(FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [cardsPerView, setCardsPerView] = useState(4);

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        const w = sliderRef.current.parentElement?.clientWidth || window.innerWidth;
        const count = Math.max(1, Math.floor(w / 205));
        setCardsPerView(count);
      } else {
        const w = window.innerWidth;
        if (w <= 480) setCardsPerView(1);
        else if (w <= 680) setCardsPerView(2);
        else if (w <= 900) setCardsPerView(3);
        else if (w <= 1120) setCardsPerView(4);
        else setCardsPerView(5);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/featured`);
        const result = await res.json();

        const rawList =
          result.data?.products ||
          result.data ||
          result.products ||
          (Array.isArray(result) ? result : []);

        if (res.ok && Array.isArray(rawList) && rawList.length > 0) {
          const mapped: DisplayProduct[] = rawList.map((item: any) => {
            const itemPrice = typeof item.price === "number" && item.price > 0 ? item.price : 999;
            const itemSale = typeof item.salePrice === "number" && item.salePrice > 0 ? item.salePrice : itemPrice;
            const hasSale = itemSale < itemPrice;
            return {
              id: item._id || item.id,
              name: item.name || "Product",
              image: formatImageUrl(item.images?.[0], product1),
              price: hasSale ? itemSale : itemPrice,
              oldPrice: hasSale ? itemPrice : itemPrice,
              rating: item.rating || 4.5,
              reviewsCount: item.numReviews || 36,
              category:
                typeof item.category === "object"
                  ? item.category?.name || "Electronics"
                  : item.category || "Electronics",
            };
          });
          setAllProducts(mapped);
        }
      } catch (err) {
        console.log("Using fallback products for home slider:", err);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const filteredProducts = activeCategory === "All"
    ? allProducts
    : allProducts.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );

  const displayList = filteredProducts.length > 0 ? filteredProducts : allProducts;
  const maxIndex = Math.max(0, displayList.length - cardsPerView);
  const safeIndex = Math.min(currentIndex, maxIndex);

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (isPaused || displayList.length === 0 || maxIndex <= 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused, displayList.length, maxIndex]);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const goToProduct = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <section className="product-section">
      <div className="product-section-wrapper">
        {/* HEADER & CATEGORY TABS */}
        <div className="product-section-header">
          <div className="product-heading-content">
            <h2 className="product-section-title">Featured Products</h2>
          </div>

          <div className="product-header-actions">
            <div className="product-category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`product-tab-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setCurrentIndex(0);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              className="product-section-viewall"
              onClick={() => navigate("/products")}
            >
              View All
            </button>
          </div>
        </div>

        {/* SLIDER CONTAINER */}
        <div
          className="product-slider-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* NAVIGATION ARROWS - ONLY SLIDE IF THERE IS NEXT / PREV PRODUCT */}
          {safeIndex > 0 && (
            <button
              className="product-slider-arrow product-slider-prev"
              onClick={prevSlide}
              aria-label="Previous product"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {safeIndex < maxIndex && (
            <button
              className="product-slider-arrow product-slider-next"
              onClick={nextSlide}
              aria-label="Next product"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* VIEWPORT & TRACK */}
          <div className="product-slider-viewport">
            <div
              ref={sliderRef}
              className="product-slider-track"
              style={{
                transform: `translateX(-${safeIndex * 205}px)`,
              }}
            >
              {displayList.map((product) => {
                const discount =
                  product.oldPrice > product.price
                    ? Math.round(
                        ((product.oldPrice - product.price) / product.oldPrice) * 100
                      )
                    : 0;

                const isWishlisted = !!wishlist[product.id];

                return (
                  <div key={product.id} className="product-slide">
                    <article
                      className="product-card"
                      onClick={() => goToProduct(product.id)}
                    >
                      {/* IMAGE CONTAINER */}
                      <div className="product-image-wrap">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-image-slider"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = product1;
                          }}
                        />

                        {/* WISHLIST BUTTON */}
                        <button
                          className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
                          onClick={(e) => toggleWishlist(e, product.id)}
                          aria-label="Wishlist product"
                        >
                          <Heart
                            size={15}
                            fill={isWishlisted ? "#dc2626" : "none"}
                            color={isWishlisted ? "#dc2626" : "#64748b"}
                          />
                        </button>
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="product-info">
                        <div className="product-meta-row">
                          <span className="product-category">{product.category}</span>
                          {discount > 0 && (
                            <span className="product-discount-badge">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        <h3 className="product-name">{product.name}</h3>

                        <div className="product-bottom-row">
                          <div className="product-price-row">
                            <span className="product-price">
                              ₹{(product.price || 0).toLocaleString("en-IN")}
                            </span>
                            {typeof product.oldPrice === "number" && product.oldPrice > product.price && (
                              <span className="product-old-price">
                                ₹{product.oldPrice.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SLIDER DOTS */}
        {maxIndex > 0 && (
          <div className="product-slider-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`product-slider-dot ${index === safeIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart, Filter, ArrowUpDown, Check, RotateCcw } from "lucide-react";
import { useCart } from "../../context/cartContext";
import Footer from "../Home/footersection";
import "./UserProducts.css";

import product1 from "../../assets/1.jpeg";
import product2 from "../../assets/2.jpeg";
import product3 from "../../assets/3.jpeg";
import electronicsImg from "../../assets/electronics.jpg";
import clothImg from "../../assets/cloth.jpg";
import toyImg from "../../assets/toys.jpg";

type ProductImageItem = string | { public_id?: string; url?: string; _id?: string };

interface Product {
  _id: string;
  name: string;
  short_description?: string;
  full_description?: string;
  description?: string;
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  category: { _id: string; name: string } | string | null;
  subcategory?: { _id: string; name: string } | string | null;
  brand: string;
  images: ProductImageItem[];
  isFeatured: boolean;
}

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "electronics", label: "Electronics" },
  { id: "fashion", label: "Fashion" },
  { id: "home-living", label: "Home & Living" },
  { id: "sports-outdoors", label: "Sports & Outdoors" },
  { id: "beauty-health", label: "Beauty & Health" },
  { id: "toys", label: "Toys & Games" },
];

const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: "p1",
    name: "Wireless Over-Ear Headphones",
    description: "High fidelity noise-canceling wireless headphones.",
    price: 89.99,
    salePrice: 59.99,
    sku: "AUD-001",
    stock: 25,
    category: { _id: "c1", name: "Electronics" },
    brand: "SoundMaster",
    images: [product1],
    isFeatured: true,
  },
  {
    _id: "p2",
    name: "Everyday Cotton T-Shirt",
    description: "100% organic cotton classic fit t-shirt.",
    price: 29.99,
    salePrice: 19.99,
    sku: "FAS-002",
    stock: 50,
    category: { _id: "c2", name: "Fashion" },
    brand: "UrbanWear",
    images: [product2],
    isFeatured: false,
  },
  {
    _id: "p3",
    name: "Smart Fitness Watch",
    description: "Water-resistant fitness tracker with heart rate monitor.",
    price: 109.99,
    salePrice: 79.99,
    sku: "TEC-003",
    stock: 12,
    category: { _id: "c1", name: "Electronics" },
    brand: "PulseTech",
    images: [product3],
    isFeatured: true,
  },
  {
    _id: "p4",
    name: "Kids Building Blocks Set",
    description: "Creative 500-piece educational building set.",
    price: 34.99,
    salePrice: 24.99,
    sku: "TOY-004",
    stock: 40,
    category: { _id: "c3", name: "Toys & Games" },
    brand: "PlayBlocks",
    images: [toyImg],
    isFeatured: false,
  },
  {
    _id: "p5",
    name: "Portable Bluetooth Speaker",
    description: "360-degree surround sound outdoor speaker.",
    price: 54.99,
    salePrice: 39.99,
    sku: "AUD-005",
    stock: 18,
    category: { _id: "c1", name: "Electronics" },
    brand: "SoundMaster",
    images: [electronicsImg],
    isFeatured: true,
  },
  {
    _id: "p6",
    name: "Classic Denim Jacket",
    description: "Timeless denim jacket crafted from premium indigo denim.",
    price: 64.99,
    salePrice: 44.99,
    sku: "FAS-006",
    stock: 30,
    category: { _id: "c2", name: "Fashion" },
    brand: "UrbanWear",
    images: [clothImg],
    isFeatured: false,
  },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatImageUrl = (path?: ProductImageItem, fallback: string = product1): string => {
  if (!path) return fallback;
  const rawUrl = typeof path === "string" ? path : (path.url || (path as any).secure_url || (path as any).path || "");
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

const UserProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search");

    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlSearch) setSearchQuery(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append("search", searchQuery.trim());
        if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
        if (sortBy) params.append("sort", sortBy);

        const queryString = params.toString();
        const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`;

        let res = await fetch(url);
        let result = await res.json();

        let rawProducts =
          result.data?.products ||
          result.data ||
          result.products ||
          (Array.isArray(result) ? result : []);

        // If specific filtered URL returned no results or failed, fallback to base products URL
        if (!res.ok || !Array.isArray(rawProducts) || rawProducts.length === 0) {
          const fallbackRes = await fetch(`${API_BASE_URL}/api/products`);
          const fallbackResult = await fallbackRes.json();
          rawProducts =
            fallbackResult.data?.products ||
            fallbackResult.data ||
            fallbackResult.products ||
            (Array.isArray(fallbackResult) ? fallbackResult : []);
        }

        if (Array.isArray(rawProducts) && rawProducts.length > 0) {
          setProducts(rawProducts);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        console.error("Failed to fetch user products from /api/products:", err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy]);

  // Filter & Sort logic
  const filteredProducts = products
    .filter((product) => {
      const q = searchQuery.toLowerCase().trim();
      const catName = typeof product.category === "object" ? product.category?.name || "" : String(product.category || "");
      const subcatName = typeof product.subcategory === "object" ? product.subcategory?.name || "" : String(product.subcategory || "");

      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.brand?.toLowerCase().includes(q) ||
        product.short_description?.toLowerCase().includes(q) ||
        product.full_description?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        catName.toLowerCase().includes(q) ||
        subcatName.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" ||
        !selectedCategory ||
        catName.toLowerCase() === selectedCategory.toLowerCase() ||
        subcatName.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      const priceA = a.salePrice ? a.salePrice : a.price;
      const priceB = b.salePrice ? b.salePrice : b.price;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    addToCart(productId, 1);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const isFiltered = selectedCategory !== "all" || searchQuery.trim() !== "" || sortBy !== "featured";

  return (
    <div className="user-products-page">
      <main className="user-products-container">

        <div className="user-products-layout">


          <aside className="user-products-sidebar">


            <div className="sidebar-block">
              <div className="sidebar-block-header">
                <Filter size={18} />
                <h3>Categories</h3>
              </div>
              <div className="category-list">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-item ${isActive ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <span>{cat.label}</span>
                      {isActive && <Check size={16} className="active-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>


            <div className="sidebar-block">
              <div className="sidebar-block-header">
                <ArrowUpDown size={18} />
                <h3>Sort By</h3>
              </div>
              <div className="sort-list">
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`sort-item ${isActive ? "active" : ""}`}
                      onClick={() => setSortBy(option.id)}
                    >
                      <span>{option.label}</span>
                      {isActive && <Check size={16} className="active-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RESET BUTTON */}
            {isFiltered && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={handleResetFilters}
              >
                <RotateCcw size={15} />
                <span>Reset Filters</span>
              </button>
            )}
          </aside>

          {/* RIGHT MAIN SECTION: SEARCH & PRODUCT RESULTS */}
          <section className="user-products-content">

            {/* RIGHT SIDE SEARCH & RESULTS TOOLBAR */}
            <div className="content-toolbar">
              <div className="user-products-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search products, brands or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="results-count">
                <span>{filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found</span>
              </div>
            </div>

            {/* PRODUCTS GRID */}
            <div className="user-products-grid">
              {loading ? (
                <div className="user-products-loading">
                  <p>Loading products catalog...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="user-products-empty">
                  <h3>No products found</h3>
                  <p>Try resetting your search query or selected category filter.</p>
                  <button className="reset-empty-btn" onClick={handleResetFilters}>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const currentPrice = product.salePrice ? product.salePrice : product.price;
                  const hasDiscount = product.salePrice && product.salePrice < product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
                    : 0;

                  const imageUrl = formatImageUrl(product.images?.[0], product1);

                  return (
                    <article
                      key={product._id}
                      className="user-product-card"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="user-product-image-wrapper">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="user-product-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = product1;
                          }}
                        />

                        {discountPercent > 0 && (
                          <span className="user-product-badge">-{discountPercent}%</span>
                        )}

                        <button
                          className="user-product-cart-btn"
                          onClick={(e) => handleAddToCart(e, product._id)}
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={17} strokeWidth={2} />
                        </button>
                      </div>

                      <div className="user-product-body">
                        <span className="user-product-category">
                          {typeof product.category === "object" ? product.category?.name || "General" : product.category || "General"}
                        </span>

                        <h3 className="user-product-title">{product.name}</h3>

                        <div className="user-product-footer">
                          <span className="user-product-price">₹{currentPrice.toLocaleString("en-IN")}</span>
                          {hasDiscount && (
                            <span className="user-product-old-price">₹{product.price.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProducts;


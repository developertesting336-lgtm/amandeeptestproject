import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingCart,
  Filter,
  ArrowUpDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../../context/cartContext";
import Footer from "../Home/footersection";
import "./UserProducts.css";

// =====================================================
// TYPES
// =====================================================

type ProductImageItem =
  | string
  | {
    public_id?: string;
    url?: string;
    _id?: string;
  };

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

// =====================================================
// CATEGORIES
// =====================================================

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "electronics", label: "Electronics" },
  { id: "fashion", label: "Fashion" },
  { id: "home-living", label: "Home & Living" },
  { id: "sports-outdoors", label: "Sports & Outdoors" },
  { id: "beauty-health", label: "Beauty & Health" },
  { id: "toys", label: "Toys & Games" },
];

// =====================================================
// SORT OPTIONS
// =====================================================

const SORT_OPTIONS = [
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

// =====================================================
// API BASE URL & ITEMS PER PAGE
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const ITEMS_PER_PAGE = 12;

// =====================================================
// IMAGE URL FORMATTER
// =====================================================

const formatImageUrl = (
  path?: ProductImageItem,
  fallback: string = ""
): string => {
  if (!path) return fallback;

  const rawUrl =
    typeof path === "string"
      ? path
      : path.url ||
      (path as any).secure_url ||
      (path as any).path ||
      "";

  if (!rawUrl || typeof rawUrl !== "string") {
    return fallback;
  }

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
  const formattedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  return `${API_BASE_URL}${formattedPath}`;
};

const UserProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(""); // Default unselected
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});


  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);

  // Mobile Bottom Sheet Modal State
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"filter" | "sort">("filter");

  // Read URL search params
  useEffect(() => {
    const catParam = searchParams.get("category");
    const searchParam = searchParams.get("search");
    const pageParam = searchParams.get("page");

    if (catParam) {
      const match = CATEGORIES.find(
        (c) => c.label.toLowerCase() === catParam.toLowerCase() || c.id.toLowerCase() === catParam.toLowerCase()
      );
      if (match) {
        setSelectedCategory(match.id);
      } else {
        setSelectedCategory(catParam);
      }
    } else {
      setSelectedCategory("all");
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery("");
    }

    if (pageParam && !isNaN(Number(pageParam))) {
      setCurrentPage(Number(pageParam));
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/api/wishlist`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch wishlist");
        }

        if (data.success) {
          const wishlistState: Record<string, boolean> = {};

          data.products.forEach((product: Product) => {
            wishlistState[product._id] = true;
          });

          setWishlist(wishlistState);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

  // Fetch Products with Backend API Params
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }
        if (selectedCategory && selectedCategory !== "all") {
          queryParams.append("category", selectedCategory);
        }
        if (sortBy) {
          queryParams.append("sort", sortBy);
        }

        queryParams.append("page", String(currentPage));
        queryParams.append("limit", String(ITEMS_PER_PAGE));

        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`;

        const res = await fetch(url);
        const result = await res.json();

        const rawProducts =
          result.data?.products ||
          result.data ||
          result.products ||
          (Array.isArray(result) ? result : []);

        if (res.ok && Array.isArray(rawProducts)) {
          setProducts(rawProducts);
          if (result.data?.pagination?.totalPages) {
            setServerTotalPages(result.data.pagination.totalPages);
          } else {
            setServerTotalPages(null);
          }
        } else {
          if (queryString) {
            const fallbackRes = await fetch(`${API_BASE_URL}/api/products`);
            const fallbackResult = await fallbackRes.json();
            const fallbackList = fallbackResult.data?.products || fallbackResult.data || fallbackResult.products || [];
            if (Array.isArray(fallbackList)) {
              setProducts(fallbackList);
            } else {
              setProducts([]);
            }
          } else {
            setProducts([]);
          }
          setServerTotalPages(null);
        }
      } catch (err) {
        console.error("Failed to fetch user products:", err);
        setProducts([]);
        setServerTotalPages(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, currentPage]);

  // Toggle/Deselect Sort Option
  const handleSortToggle = (optionId: string) => {
    if (sortBy === optionId) {
      setSortBy("");
    } else {
      setSortBy(optionId);
    }
    setCurrentPage(1);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  // Filter & Sort
  const filteredProducts = products
    .filter((product) => {
      const catName =
        typeof product.category === "object"
          ? product.category?.name || ""
          : String(product.category || "");

      const cleanCat = catName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanSelected = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, "");

      const matchesCat =
        selectedCategory === "all" ||
        cleanCat.includes(cleanSelected) ||
        cleanSelected.includes(cleanCat) ||
        catName.toLowerCase().includes(selectedCategory.toLowerCase());

      const cleanSearch = searchQuery.trim().toLowerCase();
      const matchesSearch =
        cleanSearch === "" ||
        product.name.toLowerCase().includes(cleanSearch) ||
        (product.brand && product.brand.toLowerCase().includes(cleanSearch)) ||
        cleanCat.includes(cleanSearch.replace(/[^a-z0-9]/g, ""));

      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortBy) return 0;

      const priceA = a.salePrice !== null && a.salePrice !== undefined ? a.salePrice : a.price;
      const priceB = b.salePrice !== null && b.salePrice !== undefined ? b.salePrice : b.price;

      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  // Calculate Total Pages
  const calculatedTotalPages = serverTotalPages !== null
    ? serverTotalPages
    : Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Determine Paginated Display List
  const displayedProducts = serverTotalPages !== null
    ? filteredProducts
    : filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("");
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > calculatedTotalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const toggleWishlist = async (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/wishlist/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update wishlist");
      }

      if (data.success) {
        setWishlist((prev) => ({
          ...prev,
          [id]: data.action === "added",
        }));
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    addToCart(productId, 1);
  };

  const isFiltered = selectedCategory !== "all" || searchQuery.trim() !== "" || sortBy !== "";

  return (
    <div className="user-products-page">
      <main className="user-products-container">
        {/* HEADER */}
        <div className="user-products-header">
          <h1 className="user-products-title">Shop Catalog</h1>
          <p className="user-products-subtitle">
            Explore premium items across all categories with best offers
          </p>
        </div>

        {/* LAYOUT GRID */}
        <div className="user-products-layout">
          {/* DESKTOP PERMANENT SIDEBAR FILTERS (>1024px) */}
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
                      onClick={() => handleCategorySelect(cat.id)}
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
                      onClick={() => handleSortToggle(option.id)}
                    >
                      <span>{option.label}</span>
                      {isActive && <Check size={16} className="active-icon" />}
                    </button>
                  );
                })}
              </div>
            </div>

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

          {/* MAIN CONTENT AREA */}
          <section className="user-products-content">
            {/* TOP COMPACT CHIPS FILTER FOR TABLET VIEW (600px - 1024px) */}
            <div className="compact-chips-bar">
              <div className="chips-scroll-container">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`chip-pill ${isActive ? "active" : ""}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      {cat.label}
                    </button>
                  );
                })}
                <div className="chip-divider" />
                {SORT_OPTIONS.map((option) => {
                  const isActive = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`chip-pill ${isActive ? "active" : ""}`}
                      onClick={() => handleSortToggle(option.id)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRODUCTS GRID */}
            <div className="user-products-grid">
              {loading ? (
                <>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} className="user-product-skeleton-card">
                      <div className="skeleton-image" />
                      <div className="skeleton-pill" />
                      <div className="skeleton-title" />
                      <div className="skeleton-title-short" />
                      <div className="skeleton-price" />
                    </div>
                  ))}
                </>
              ) : displayedProducts.length === 0 ? (
                <div className="user-products-empty">
                  <h3>No products found</h3>
                  <p>No products match your search or selected filters.</p>
                  <button
                    className="reset-empty-btn"
                    onClick={handleResetFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                displayedProducts.map((product) => {
                  const currentPrice =
                    product.salePrice !== null && product.salePrice !== undefined
                      ? product.salePrice
                      : product.price;

                  const brand = product.brand
                  const hasDiscount =
                    product.salePrice !== null &&
                    product.salePrice !== undefined &&
                    product.salePrice < product.price;

                  const discountPercent = hasDiscount
                    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
                    : 0;

                  // const categoryName =
                  //   typeof product.category === "object"
                  //     ? product.category?.name || "General"
                  //     : String(product.category || "General");

                  const imgUrl = formatImageUrl(product.images?.[0]);
                  const isLiked = !!wishlist[product._id];

                  return (
                    <article
                      key={product._id}
                      className="user-product-card"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <div className="user-product-image-wrapper">
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="user-product-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />

                        <button
                          type="button"
                          className={`home-product-wishlist-btn ${isLiked ? "active" : ""}`}
                          onClick={(e) => toggleWishlist(e, product._id)}
                          aria-label="Add to Wishlist"
                        >
                          <Heart
                            size={15}
                            fill={isLiked ? "#dc2626" : "none"}
                            color={isLiked ? "#dc2626" : "#64748b"}
                          />
                        </button>
                      </div>

                      <div className="user-product-info">
                        <div className="user-product-meta">
                          <span className="user-product-category">{brand}</span>
                          {hasDiscount && (
                            <span className="user-product-discount-tag">-{discountPercent}%</span>
                          )}
                        </div>

                        <h3 className="user-product-title">{product.name}</h3>

                        <div className="user-product-price-row">
                          <div className="user-product-price-block">
                            <span className="user-product-price">
                              ₹{(currentPrice || 0).toLocaleString("en-IN")}
                            </span>
                            {hasDiscount && (
                              <span className="user-product-old-price">
                                ₹{(product.price || 0).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="user-product-cart-btn"
                            onClick={(e) => handleAddToCart(e, product._id)}
                            title="Add to Cart"
                            aria-label="Add to Cart"
                          >
                            <ShoppingCart size={15} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* PAGINATION CONTROLS */}
            {!loading && calculatedTotalPages > 1 && (
              <div className="user-products-pagination">
                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: calculatedTotalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`pagination-btn num-btn ${pageNum === currentPage ? "active" : ""}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === calculatedTotalPages}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MOBILE FLOATING BOTTOM ACTION BAR (<600px) */}
      <div className="mobile-bottom-bar">
        <div className="mobile-bottom-bar-content">
          <button
            type="button"
            className="mobile-bar-btn"
            onClick={() => {
              setMobileTab("sort");
              setIsMobileFilterOpen(true);
            }}
          >
            <ArrowUpDown size={16} />
            <span>Sort {sortBy ? `(${SORT_OPTIONS.find((s) => s.id === sortBy)?.label.split(":")[0]})` : ""}</span>
          </button>

          <button
            type="button"
            className="mobile-bar-btn primary"
            onClick={() => {
              setMobileTab("filter");
              setIsMobileFilterOpen(true);
            }}
          >
            <SlidersHorizontal size={16} />
            <span>Filter {selectedCategory !== "all" ? `(1)` : ""}</span>
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            className="bottom-sheet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bottom-sheet-header">
              <h3>{mobileTab === "filter" ? "Filter Categories" : "Sort Products"}</h3>
              <button
                type="button"
                className="bottom-sheet-close-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="bottom-sheet-content">
              {mobileTab === "filter" ? (
                <div>
                  <div className="bottom-sheet-section-title">Categories</div>
                  <div className="category-list">
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-item ${isActive ? "active" : ""}`}
                          onClick={() => {
                            handleCategorySelect(cat.id);
                          }}
                        >
                          <span>{cat.label}</span>
                          {isActive && <Check size={16} className="active-icon" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="bottom-sheet-section-title">Sort Options</div>
                  <div className="sort-list">
                    {SORT_OPTIONS.map((option) => {
                      const isActive = sortBy === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`sort-item ${isActive ? "active" : ""}`}
                          onClick={() => {
                            handleSortToggle(option.id);
                          }}
                        >
                          <span>{option.label}</span>
                          {isActive && <Check size={16} className="active-icon" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="bottom-sheet-apply-btn"
              onClick={() => setIsMobileFilterOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserProducts;
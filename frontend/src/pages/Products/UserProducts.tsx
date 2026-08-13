import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Filter,
  ArrowUpDown,
  Check,
  RotateCcw,
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
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

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

// =====================================================
// COMPONENT
// =====================================================

const UserProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [selectedCategory, setSelectedCategory] =
    useState(
      searchParams.get("category") || "all"
    );

  const [sortBy, setSortBy] = useState("featured");

  // =====================================================
  // SYNC URL SEARCH PARAMS
  // =====================================================

  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search");

    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }

    if (urlSearch !== null) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        // -------------------------------------------------
        // SEARCH
        // Backend searches ONLY:
        // - name
        // - brand
        // -------------------------------------------------

        if (searchQuery.trim()) {
          params.append(
            "search",
            searchQuery.trim()
          );
        }

        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (
          selectedCategory &&
          selectedCategory !== "all"
        ) {
          params.append(
            "category",
            selectedCategory
          );
        }

        // -------------------------------------------------
        // SORT
        // -------------------------------------------------

        if (sortBy) {
          params.append("sort", sortBy);
        }

        const queryString = params.toString();

        const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""
          }`;

        console.log(
          "Fetching products:",
          url
        );

        const res = await fetch(url);

        const result = await res.json();

        console.log(
          "Products API response:",
          result
        );

        // =================================================
        // IMPORTANT
        // Do NOT fallback to /api/products when the
        // filtered/search request returns 0 products.
        //
        // 0 products means there are genuinely no matches.
        // =================================================

        if (!res.ok) {
          console.error(
            "Products API error:",
            result
          );

          setProducts([]);
          return;
        }

        const rawProducts =
          result.data?.products ||
          result.data ||
          result.products ||
          (Array.isArray(result)
            ? result
            : []);

        if (Array.isArray(rawProducts)) {
          setProducts(rawProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch user products:",
          err
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

  // =====================================================
  // LOCAL FILTER
  //
  // SEARCH IS NOT DONE HERE.
  //
  // Backend is responsible for:
  // - search
  // - category filtering
  //
  // Frontend only handles category display matching
  // and sorting.
  const filteredProducts = products
    .filter((product) => {
      const catName =
        typeof product.category === "object"
          ? product.category?.name || ""
          : String(product.category || "");

      const subcatName =
        typeof product.subcategory === "object"
          ? product.subcategory?.name || ""
          : String(product.subcategory || "");

      const cleanCat = catName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanSubcat = subcatName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cleanSelected = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, "");

      // -------------------------------------------------
      // CATEGORY FILTER
      // -------------------------------------------------

      const matchesCat =
        selectedCategory === "all" ||
        !selectedCategory ||
        cleanCat.includes(cleanSelected) ||
        cleanSubcat.includes(cleanSelected) ||
        (cleanCat.length > 0 && cleanSelected.includes(cleanCat));

      return matchesCat;
    })
    .sort((a, b) => {
      // -------------------------------------------------
      // PRICE
      // -------------------------------------------------

      const priceA =
        a.salePrice !== null &&
          a.salePrice !== undefined
          ? a.salePrice
          : a.price;

      const priceB =
        b.salePrice !== null &&
          b.salePrice !== undefined
          ? b.salePrice
          : b.price;

      // -------------------------------------------------
      // PRICE LOW → HIGH
      // -------------------------------------------------

      if (sortBy === "price-low") {
        return priceA - priceB;
      }

      // -------------------------------------------------
      // PRICE HIGH → LOW
      // -------------------------------------------------

      if (sortBy === "price-high") {
        return priceB - priceA;
      }

      // -------------------------------------------------
      // NAME A → Z
      // -------------------------------------------------

      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      // -------------------------------------------------
      // FEATURED
      // -------------------------------------------------

      return (
        (b.isFeatured ? 1 : 0) -
        (a.isFeatured ? 1 : 0)
      );
    });

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = (
    e: React.MouseEvent,
    productId: string
  ) => {
    e.stopPropagation();

    addToCart(productId, 1);
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  // =====================================================
  // CHECK FILTER STATE
  // =====================================================

  const isFiltered =
    selectedCategory !== "all" ||
    searchQuery.trim() !== "" ||
    sortBy !== "featured";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="user-products-page">
      <main className="user-products-container">

        <div className="user-products-layout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="user-products-sidebar">

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <div className="sidebar-block">

              <div className="sidebar-block-header">
                <Filter size={18} />

                <h3>
                  Categories
                </h3>
              </div>

              <div className="category-list">

                {CATEGORIES.map((cat) => {

                  const isActive =
                    selectedCategory.toLowerCase() ===
                    cat.id.toLowerCase();

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-item ${isActive
                        ? "active"
                        : ""
                        }`}
                      onClick={() =>
                        setSelectedCategory(
                          cat.id
                        )
                      }
                    >
                      <span>
                        {cat.label}
                      </span>

                      {isActive && (
                        <Check
                          size={16}
                          className="active-icon"
                        />
                      )}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* =================================================
                SORT
            ================================================= */}

            <div className="sidebar-block">

              <div className="sidebar-block-header">

                <ArrowUpDown size={18} />

                <h3>
                  Sort By
                </h3>

              </div>

              <div className="sort-list">

                {SORT_OPTIONS.map(
                  (option) => {

                    const isActive =
                      sortBy ===
                      option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`sort-item ${isActive
                          ? "active"
                          : ""
                          }`}
                        onClick={() =>
                          setSortBy(
                            option.id
                          )
                        }
                      >
                        <span>
                          {option.label}
                        </span>

                        {isActive && (
                          <Check
                            size={16}
                            className="active-icon"
                          />
                        )}
                      </button>
                    );
                  }
                )}

              </div>
            </div>

            {/* =================================================
                RESET
            ================================================= */}

            {isFiltered && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={
                  handleResetFilters
                }
              >
                <RotateCcw size={15} />

                <span>
                  Reset Filters
                </span>
              </button>
            )}

          </aside>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <section className="user-products-content">

            {/* =================================================
                SEARCH TOOLBAR
            ================================================= */}

            <div className="content-toolbar">

              <div className="user-products-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search products or brands..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="results-count">

                <span>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length ===
                    1
                    ? "Product"
                    : "Products"}{" "}
                  Found
                </span>

              </div>

            </div>

            {/* =================================================
                PRODUCTS GRID
            ================================================= */}

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

              ) : filteredProducts.length ===
                0 ? (

                <div className="user-products-empty">

                  <h3>
                    No products found
                  </h3>

                  <p>
                    No products match
                    your search or
                    selected filters.
                  </p>

                  <button
                    className="reset-empty-btn"
                    onClick={
                      handleResetFilters
                    }
                  >
                    Clear All Filters
                  </button>

                </div>

              ) : (

                filteredProducts.map(
                  (product) => {

                    // =================================================
                    // PRICE
                    // =================================================

                    const currentPrice =
                      product.salePrice !==
                        null &&
                        product.salePrice !==
                        undefined
                        ? product.salePrice
                        : product.price;

                    // =================================================
                    // DISCOUNT
                    // =================================================

                    const hasDiscount =
                      product.salePrice !==
                      null &&
                      product.salePrice !==
                      undefined &&
                      product.salePrice <
                      product.price;

                    const discountPercent =
                      hasDiscount
                        ? Math.round(
                          ((product.price -
                            product.salePrice!) /
                            product.price) *
                          100
                        )
                        : 0;

                    // =================================================
                    // IMAGE
                    // =================================================

                    const imageUrl =
                      formatImageUrl(
                        product.images?.[0]
                      );

                    return (
                      <article
                        key={product._id}
                        className="user-product-card"
                        onClick={() =>
                          navigate(
                            `/product/${product._id}`
                          )
                        }
                      >

                        {/* =================================================
                            IMAGE
                        ================================================= */}

                        <div className="user-product-image-wrapper">

                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="user-product-image"
                            onError={(e) => {
                              (
                                e.target as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />

                        </div>

                        {/* =================================================
                            PRODUCT BODY
                        ================================================= */}

                        <div className="user-product-body">

                          {/* =================================================
                              META
                          ================================================= */}

                          <div className="user-product-meta-row">

                            <span className="user-product-category">

                              {typeof product.category ===
                                "object"
                                ? product.category
                                  ?.name ||
                                "General"
                                : product.category ||
                                "General"}

                            </span>

                            {discountPercent >
                              0 && (
                                <span className="user-product-discount-tag">
                                  -
                                  {
                                    discountPercent
                                  }
                                  %
                                </span>
                              )}

                          </div>

                          {/* =================================================
                              NAME
                          ================================================= */}

                          <h3 className="user-product-title">
                            {product.name}
                          </h3>

                          {/* =================================================
                              FOOTER
                          ================================================= */}

                          <div className="user-product-footer">

                            <div className="user-product-price-block">

                              <span className="user-product-price">
                                ₹
                                {currentPrice.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                              {hasDiscount && (
                                <span className="user-product-old-price">
                                  ₹
                                  {product.price.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              )}

                            </div>

                            {/* =================================================
                                CART
                            ================================================= */}

                            <button
                              type="button"
                              className="user-product-cart-btn"
                              onClick={(e) =>
                                handleAddToCart(
                                  e,
                                  product._id
                                )
                              }
                              title="Add to Cart"
                              aria-label="Add to Cart"
                            >
                              <ShoppingCart
                                size={15}
                                strokeWidth={2}
                              />
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )

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
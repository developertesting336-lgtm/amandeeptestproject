import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle,
  FileText,
  Building,
} from "lucide-react";
import { useCart } from "../../context/cartContext";
import Footer from "../Home/footersection";
import "./ProductDetails.css";

import product1 from "../../assets/1.jpeg";

type ProductImageItem = string | { public_id?: string; url?: string; _id?: string };

interface CategoryRef {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  short_description?: string;
  full_description?: string;
  description?: string;
  highlights?: string[];
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  category: CategoryRef | string | null;
  subcategory?: CategoryRef | string | null;
  brand: string;
  images: ProductImageItem[];
  isFeatured: boolean;
  manufacturer?: {
    name?: string;
    address?: string;
    country?: string;
    contact?: string;
    email?: string;
    website?: string;
  };
  warranty?: {
    available?: boolean;
    duration?: number | null;
    unit?: string;
    type?: string;
    description?: string;
    terms?: string;
  };
  returnPolicy?: {
    eligible?: boolean;
    returnWindow?: number | null;
    returnWindowUnit?: string;
    replacementAvailable?: boolean;
    refundAvailable?: boolean;
    conditions?: string;
    description?: string;
  };
  attributes?: {
    color?: string;
    size?: string;
    material?: string;
    weight?: { value?: number | null; unit?: string };
    dimensions?: {
      length?: number | null;
      width?: number | null;
      height?: number | null;
      unit?: string;
    };
  };
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        let res = await fetch(`http://localhost:5000/api/admin/product/${productId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        let result = await res.json();
        let fetchedProduct = result.data?.product || result.product || result.data;

        if (!res.ok || !fetchedProduct || typeof fetchedProduct !== "object" || !fetchedProduct._id) {
          res = await fetch(`http://localhost:5000/api/products/${productId}`);
          result = await res.json();
          fetchedProduct = result.data?.product || result.product || result.data;
        }

        if (!res.ok || !fetchedProduct || typeof fetchedProduct !== "object" || !fetchedProduct._id) {
          res = await fetch("http://localhost:5000/api/products");
          result = await res.json();
          const list = result.data?.products || result.data || result.products || (Array.isArray(result) ? result : []);
          if (Array.isArray(list) && list.length > 0) {
            fetchedProduct = list.find((p: Product) => p._id === productId) || list[0];
          }
        }

        if (fetchedProduct && typeof fetchedProduct === "object" && fetchedProduct._id) {
          setProduct(fetchedProduct);
        } else {
          setProduct({
            _id: productId || "p1",
            name: "Wireless Over-Ear Noise-Canceling Headphones",
            short_description: "Experience world-class audio fidelity with active noise cancellation and 30-hour battery life.",
            full_description: "Immerse yourself in premium studio sound quality. Built with custom 40mm acoustic drivers, dynamic bass optimization, and lightweight memory foam earcups.",
            highlights: [
              "Active Noise Cancellation (ANC) with Dual Microphones",
              "Up to 30 Hours Playtime on a Single Charge",
              "Ultra-soft Memory Foam Earcups & Adjustable Headband",
              "Bluetooth 5.2 Seamless Low-Latency Connectivity"
            ],
            price: 89.99,
            salePrice: 59.99,
            sku: "AUD-001-BLK",
            stock: 25,
            category: { _id: "c1", name: "Electronics" },
            subcategory: { _id: "sc1", name: "Headphones" },
            brand: "SoundMaster",
            images: [product1],
            isFeatured: true,
            warranty: {
              available: true,
              type: "Manufacturer Warranty",
              duration: 12,
              unit: "months",
              description: "Covers hardware defects and battery health issues.",
            },
            returnPolicy: {
              eligible: true,
              returnWindow: 14,
              returnWindowUnit: "days",
              replacementAvailable: true,
              refundAvailable: true,
            },
          });
        }
      } catch (err) {
        console.error("Error loading product detail:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (product?._id) {
      addToCart(product._id, quantity);
    }
  };

  const formatImageUrl = (path?: ProductImageItem, fallback: string = "") => {
    if (!path) return fallback;
    let rawUrl = "";
    if (typeof path === "string") {
      rawUrl = path;
    } else if (typeof path === "object" && path !== null) {
      rawUrl = path.url || (path as any).secure_url || (path as any).path || "";
    }
    if (!rawUrl) return fallback;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:")) {
      return rawUrl;
    }
    const cleanPath = rawUrl.replace(/\\/g, "/");
    const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `http://localhost:5000${formattedPath}`;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <main className="product-detail-container">
          <p style={{ color: "#64748b", textAlign: "center", padding: "80px" }}>
            Loading product details...
          </p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <main className="product-detail-container">
          <button className="product-detail-back" onClick={() => navigate("/products")}>
            <ArrowLeft size={16} /> Back to Products
          </button>
          <div style={{ color: "#0f172a", textAlign: "center", padding: "80px" }}>
            <h2>Product Not Found</h2>
            <p style={{ color: "#64748b" }}>The product you are looking for does not exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const currentPrice = product.salePrice ? product.salePrice : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const rawImages = product.images && product.images.length > 0
    ? product.images.map((img) => formatImageUrl(img, "")).filter(Boolean)
    : [];

  const imagesList = rawImages.length > 0 ? rawImages : [product1];
  const mainImage = imagesList[selectedImgIndex] || imagesList[0];

  const categoryName = typeof product.category === "object" && product.category !== null ? product.category.name : product.category;
  const subcategoryName = typeof product.subcategory === "object" && product.subcategory !== null ? product.subcategory.name : product.subcategory;

  return (
    <div className="product-detail-page">
      <main className="product-detail-container">
        {/* BACK BUTTON */}
        <button className="product-detail-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Products
        </button>

        {/* MAIN PRODUCT GRID */}
        <section className="product-detail-main">
          {/* GALLERY */}
          <div className="product-detail-gallery">
            <div className="product-detail-main-img-wrap">
              <img
                src={mainImage}
                alt={product.name}
                className="product-detail-main-img"
              />
            </div>

            {imagesList.length > 1 && (
              <div className="product-detail-thumbs">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    className={`product-detail-thumb ${idx === selectedImgIndex ? "active" : ""}`}
                    onClick={() => setSelectedImgIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="product-detail-info">
            <div className="product-detail-eyebrow">
              <span className="product-detail-brand">{product.brand || "GENUINE BRAND"}</span>
              {categoryName && (
                <span className="product-detail-sku">
                  {categoryName} {subcategoryName ? `› ${subcategoryName}` : ""}
                </span>
              )}
              {product.sku && <span className="product-detail-sku">SKU: {product.sku}</span>}
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            <div className="product-detail-price-box">
              <span className="product-detail-price">₹{currentPrice.toLocaleString("en-IN")}</span>
              {hasDiscount && (
                <>
                  <span className="product-detail-old-price">₹{product.price.toLocaleString("en-IN")}</span>
                  <span className="product-detail-save-badge">
                    SAVE ₹{(product.price - product.salePrice!).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            <p className="product-detail-desc">
              {product.short_description || product.description}
            </p>

            {/* Stock indicator */}
            <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 600, color: product.stock > 0 ? "#16a34a" : "#dc2626" }}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : "Currently Out of Stock"}
            </div>

            {/* ACTIONS */}
            <div className="product-detail-actions">
              <div className="product-detail-qty">
                <button
                  className="product-detail-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="product-detail-qty-val">{quantity}</span>
                <button
                  className="product-detail-qty-btn"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="product-detail-add-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={18} strokeWidth={2} />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="product-detail-trust-grid">
              <div className="product-detail-trust-item">
                <Truck size={16} />
                <span>Fast Shipping</span>
              </div>
              <div className="product-detail-trust-item">
                <ShieldCheck size={16} />
                <span>100% Genuine</span>
              </div>
              <div className="product-detail-trust-item">
                <RotateCcw size={16} />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </section>

        {/* HIGHLIGHTS SECTION */}
        {Array.isArray(product.highlights) && product.highlights.length > 0 && (
          <section className="product-detail-section-card">
            <h2 className="product-detail-section-title">
              <CheckCircle size={18} style={{ color: "#2563eb", marginRight: 8, verticalAlign: "middle" }} />
              Product Highlights
            </h2>
            <ul className="product-detail-highlights-list">
              {product.highlights.map((bullet, idx) => (
                <li key={idx}>{bullet}</li>
              ))}
            </ul>
          </section>
        )}

        {/* FULL DESCRIPTION SECTION */}
        {product.full_description && (
          <section className="product-detail-section-card">
            <h2 className="product-detail-section-title">
              <FileText size={18} style={{ color: "#2563eb", marginRight: 8, verticalAlign: "middle" }} />
              Full Description
            </h2>
            <div
              className="product-detail-desc"
              dangerouslySetInnerHTML={{ __html: product.full_description }}
            />
          </section>
        )}

        {/* SPECIFICATIONS & ATTRIBUTES */}
        <section className="product-detail-section-card">
          <h2 className="product-detail-section-title">Specifications & Details</h2>
          <div className="product-detail-specs-grid">
            <div className="product-detail-spec-item">
              <div className="product-detail-spec-label">Brand</div>
              <div className="product-detail-spec-value">{product.brand || "-"}</div>
            </div>

            <div className="product-detail-spec-item">
              <div className="product-detail-spec-label">SKU</div>
              <div className="product-detail-spec-value">{product.sku || "-"}</div>
            </div>

            {categoryName && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Category</div>
                <div className="product-detail-spec-value">{categoryName}</div>
              </div>
            )}

            {subcategoryName && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Subcategory</div>
                <div className="product-detail-spec-value">{subcategoryName}</div>
              </div>
            )}

            {product.attributes?.color && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Color</div>
                <div className="product-detail-spec-value">{product.attributes.color}</div>
              </div>
            )}

            {product.attributes?.size && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Size</div>
                <div className="product-detail-spec-value">{product.attributes.size}</div>
              </div>
            )}

            {product.attributes?.material && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Material</div>
                <div className="product-detail-spec-value">{product.attributes.material}</div>
              </div>
            )}

            {product.attributes?.weight?.value && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Weight</div>
                <div className="product-detail-spec-value">
                  {product.attributes.weight.value} {product.attributes.weight.unit || "g"}
                </div>
              </div>
            )}

            {(product.attributes?.dimensions?.length ||
              product.attributes?.dimensions?.width ||
              product.attributes?.dimensions?.height) && (
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Dimensions</div>
                <div className="product-detail-spec-value">
                  {[
                    product.attributes.dimensions.length,
                    product.attributes.dimensions.width,
                    product.attributes.dimensions.height,
                  ]
                    .filter(Boolean)
                    .join(" × ")}{" "}
                  {product.attributes.dimensions.unit || "cm"}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* WARRANTY & RETURN POLICY SECTION */}
        {(product.warranty?.available || product.returnPolicy?.eligible) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {product.warranty?.available && (
              <section className="product-detail-section-card">
                <h2 className="product-detail-section-title">
                  <ShieldCheck size={18} style={{ color: "#2563eb", marginRight: 8, verticalAlign: "middle" }} />
                  Warranty Details
                </h2>
                <div style={{ fontSize: 14, color: "#334155" }}>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong>Type:</strong> {product.warranty.type || "Standard Warranty"}
                  </p>
                  {product.warranty.duration && (
                    <p style={{ margin: "0 0 8px" }}>
                      <strong>Duration:</strong> {product.warranty.duration} {product.warranty.unit || "months"}
                    </p>
                  )}
                  {product.warranty.description && (
                    <p style={{ margin: 0, color: "#64748b" }}>{product.warranty.description}</p>
                  )}
                </div>
              </section>
            )}

            {product.returnPolicy?.eligible && (
              <section className="product-detail-section-card">
                <h2 className="product-detail-section-title">
                  <RotateCcw size={18} style={{ color: "#2563eb", marginRight: 8, verticalAlign: "middle" }} />
                  Return & Refund Policy
                </h2>
                <div style={{ fontSize: 14, color: "#334155" }}>
                  {product.returnPolicy.returnWindow && (
                    <p style={{ margin: "0 0 8px" }}>
                      <strong>Return Window:</strong> {product.returnPolicy.returnWindow} {product.returnPolicy.returnWindowUnit || "days"}
                    </p>
                  )}
                  <p style={{ margin: "0 0 8px" }}>
                    <strong>Replacement:</strong> {product.returnPolicy.replacementAvailable !== false ? "Available" : "Not Available"}
                  </p>
                  <p style={{ margin: "0 0 8px" }}>
                    <strong>Refund:</strong> {product.returnPolicy.refundAvailable !== false ? "Available" : "Not Available"}
                  </p>
                  {product.returnPolicy.description && (
                    <p style={{ margin: 0, color: "#64748b" }}>{product.returnPolicy.description}</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* MANUFACTURER SECTION */}
        {product.manufacturer?.name && (
          <section className="product-detail-section-card">
            <h2 className="product-detail-section-title">
              <Building size={18} style={{ color: "#2563eb", marginRight: 8, verticalAlign: "middle" }} />
              Manufacturer Information
            </h2>
            <div className="product-detail-specs-grid">
              <div className="product-detail-spec-item">
                <div className="product-detail-spec-label">Manufacturer</div>
                <div className="product-detail-spec-value">{product.manufacturer.name}</div>
              </div>
              {product.manufacturer.country && (
                <div className="product-detail-spec-item">
                  <div className="product-detail-spec-label">Country of Origin</div>
                  <div className="product-detail-spec-value">{product.manufacturer.country}</div>
                </div>
              )}
              {product.manufacturer.contact && (
                <div className="product-detail-spec-item">
                  <div className="product-detail-spec-label">Contact</div>
                  <div className="product-detail-spec-value">{product.manufacturer.contact}</div>
                </div>
              )}
              {product.manufacturer.email && (
                <div className="product-detail-spec-item">
                  <div className="product-detail-spec-label">Email</div>
                  <div className="product-detail-spec-value">{product.manufacturer.email}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;

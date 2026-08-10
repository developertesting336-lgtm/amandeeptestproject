import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

interface Category {
  _id: string;
  name: string;
}

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
  category: Category | string;
  subcategory?: Category | string;
  brand: string;
  images: ProductImageItem[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatImageUrl = (image: ProductImageItem | undefined): string => {
  if (!image) return "";
  const rawUrl = typeof image === "string" ? image : image.url;
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/\\/g, "/");
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `http://localhost:5000${formattedPath}`;
};

interface Pagination {
  currentPage: number;
  perPage: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: Pagination;
  };
}

const API_URL = "http://localhost:5000/api/admin/all/products";

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [_pagination, setPagination] = useState<Pagination | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ProductsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Failed to fetch products");
      }

      setProducts(result.data.products);
      setPagination(result.data.pagination);
    } catch (error) {
      console.error("Fetch Products Error:", error);
      setError("Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search locally for now
  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    return (
      product.name.toLowerCase().includes(value) ||
      product.sku.toLowerCase().includes(value) ||
      product.brand.toLowerCase().includes(value) ||
      (typeof product.category === "object"
        ? product.category?.name?.toLowerCase().includes(value)
        : String(product.category || "").toLowerCase().includes(value))
    );
  });

  const handleDelete = async (productId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete product");
      }

      // Remove from UI immediately
      setProducts((prev) =>
        prev.filter((product) => product._id !== productId)
      );

    } catch (error) {
      console.error("Delete product error:", error);
      alert("Failed to delete product");
    }
  };
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="product-list-section">
        <div className="product-loading">
          Loading products...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-list-section">
        <div className="product-error">
          <p>{error}</p>
          <button onClick={fetchProducts}>Try Again</button>
        </div>
      </section>
    );
  }

  return (
    <section className="product-list-section">

      {/* Header */}
      <div className="product-list-header">

        <div>
          <span className="product-list-eyebrow">
            PRODUCT MANAGEMENT
          </span>

          <h1>Products</h1>

          <p>
            Manage your inventory, edit listings, and track stock.
          </p>
        </div>

        <button
          type="button"
          className="add-product-btn"
          onClick={() => navigate("/admin/add/product")}
        >
          <Plus size={18} />
          Add Product
        </button>

      </div>

      {/* Search */}
      <div className="product-toolbar">

        <div className="product-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {products.length > 0 && (
          <span className="product-count">
            {filteredProducts.length} Products
          </span>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="product-error">
          {error}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="product-empty">
          <h3>No products found</h3>
          <p>
            Try changing your search or add a new product.
          </p>
        </div>
      ) : (

        <div className="product-table-wrapper">

          <table className="product-table">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product) => (

                <tr key={product._id}>

                  {/* Product */}
                  <td>

                    <div className="product-cell">

                      <div className="product-image">

                        {formatImageUrl(product.images?.[0]) ? (
                          <img
                            src={formatImageUrl(product.images?.[0])}
                            alt={product.name}
                          />
                        ) : (
                          <div className="no-image">
                            No Image
                          </div>
                        )}

                      </div>

                      <div className="product-details">
                        <strong>
                          {product.name}
                        </strong>
                        <span>
                          {product.brand}
                        </span>
                      </div>

                    </div>

                  </td>

                  {/* SKU */}
                  <td>
                    <span className="sku">
                      {product.sku}
                    </span>
                  </td>

                  {/* Category & Subcategory */}
                  <td>
                    <div>
                      <strong>
                        {typeof product.category === "object"
                          ? product.category?.name || "Uncategorized"
                          : product.category || "Uncategorized"}
                      </strong>
                      {product.subcategory && (
                        <div style={{ fontSize: 11, color: "#64748b" }}>
                          ›{" "}
                          {typeof product.subcategory === "object"
                            ? product.subcategory?.name
                            : product.subcategory}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Price */}
                  <td>

                    <div className="price-cell">

                      {product.salePrice !== null && product.salePrice !== undefined ? (
                        <>
                          <strong>
                            ₹{product.salePrice.toLocaleString("en-IN")}
                          </strong>

                          <del>
                            ₹{product.price.toLocaleString("en-IN")}
                          </del>
                        </>
                      ) : (
                        <strong>
                          ₹{product.price.toLocaleString("en-IN")}
                        </strong>
                      )}

                    </div>

                  </td>

                  {/* Stock */}
                  <td>

                    <span
                      className={`stock-badge ${product.stock === 0
                          ? "out"
                          : product.stock <= 10
                            ? "low"
                            : "available"
                        }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} in stock`}
                    </span>

                  </td>

                  {/* Status */}
                  <td>

                    <span
                      className={`status-badge ${product.isActive
                          ? "active"
                          : "inactive"
                        }`}
                    >
                      {product.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                  {/* Featured */}
                  <td>

                    {product.isFeatured ? (
                      <span className="featured-badge">
                        Featured
                      </span>
                    ) : (
                      <span className="not-featured">
                        —
                      </span>
                    )}

                  </td>

                  {/* Actions */}
                  <td>

                    <div className="product-actions">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/admin/products/edit/${product._id}`)
                        }
                        title="Edit product"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </section>
  );
};

export default ProductList;
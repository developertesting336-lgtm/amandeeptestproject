import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  MapPin,
  CreditCard,
  Banknote,
  Calendar,
  Layers,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { getUserOrders } from "../../services/orderService";
import type { UserOrder, UserOrderItem } from "../../services/orderService";
import productFallback from "../../assets/1.jpeg";
import Footer from "../Home/footersection";
import "./UserOrders.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const formatImageUrl = (image?: any): string => {
  if (!image) return productFallback;
  const rawUrl =
    typeof image === "string"
      ? image
      : image?.url || (Array.isArray(image) && image[0]?.url) || (Array.isArray(image) && typeof image[0] === "string" ? image[0] : null);

  if (!rawUrl || typeof rawUrl !== "string") return productFallback;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }
  const cleanPath = rawUrl.replace(/\\/g, "/");
  const formattedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
  return `${API_BASE_URL}${formattedPath}`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Recent";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
};

const formatCurrency = (amount?: number): string => {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0.00";
  return `Purchase Price: ₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusBadge = (status?: string, paymentStatus?: string) => {
  const normalized = (status || "").toLowerCase();
  const payNorm = (paymentStatus || "").toLowerCase();

  if (normalized.includes("deliver")) {
    return {
      label: "Delivered",
      className: "status-badge-delivered",
      icon: <CheckCircle2 size={13} />,
    };
  }
  if (normalized.includes("ship")) {
    return {
      label: "Shipped",
      className: "status-badge-shipped",
      icon: <Truck size={13} />,
    };
  }
  if (normalized.includes("process") || normalized.includes("confirm")) {
    return {
      label: "Processing",
      className: "status-badge-processing",
      icon: <Layers size={13} />,
    };
  }
  if (normalized.includes("cancel")) {
    return {
      label: "Cancelled",
      className: "status-badge-cancelled",
      icon: <XCircle size={13} />,
    };
  }
  if (payNorm === "paid") {
    return {
      label: "Confirmed",
      className: "status-badge-processing",
      icon: <CheckCircle2 size={13} />,
    };
  }
  return {
    label: "Order Placed",
    className: "status-badge-pending",
    icon: <Clock size={13} />,
  };
};

const UserOrders: React.FC = () => {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUserOrders(token);
      if (res.success) {
        setOrders(res.orders || []);
      } else {
        setError(res.error || "Unable to fetch orders at the moment.");
      }
    } catch (err: any) {
      console.error("Orders fetching error:", err);
      setError(err?.message || "Something went wrong while fetching orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  return (
    <div className="user-orders-page">
      <div className="orders-compact-container">
        <div className="orders-compact-header">
          <h1 className="orders-compact-title">Your Orders</h1>
          {!loading && !error && orders.length > 0 && (
            <span className="orders-count-badge">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="orders-loading-skeleton">
            <div className="skeleton-card shimmer"></div>
            <div className="skeleton-card shimmer"></div>
          </div>
        ) : error ? (
          <div className="orders-compact-card-state">
            <AlertCircle size={36} className="state-icon error-color" />
            <h3>Unable to load orders</h3>
            <p>{error}</p>
            <button onClick={fetchOrders} className="compact-action-btn">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-compact-card-state">
            <div className="empty-icon-wrap">
              <ShoppingBag size={38} />
            </div>
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="compact-action-btn">
              <span>Browse Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="orders-compact-stack">
            {orders.map((order) => {
              const orderId = order.orderId || order._id;
              const productsList: UserOrderItem[] = order.products || order.items || [];
              const statusInfo = getStatusBadge(order.orderStatus || order.status, order.paymentStatus);
              const address = order.shippingAddress || order.address;
              const paymentMode = (order.paymentMode || order.paymentMethod || "COD").toUpperCase();

              // Items total, delivery charges, and final order total
              const itemsTotal =
                typeof order.itemsTotal === "number"
                  ? order.itemsTotal
                  : productsList.reduce((sum, item) => {
                    const price =
                      item.purchasePrice ??
                      item.price ??
                      (typeof item.productId === "object" ? item.productId?.price : 0) ??
                      0;
                    return sum + price * (item.quantity || 1);
                  }, 0);

              const deliveryCharges = typeof order.deliveryCharges === "number" ? order.deliveryCharges : 0;
              const orderTotal =
                typeof order.orderTotal === "number"
                  ? order.orderTotal
                  : typeof order.totalAmount === "number"
                    ? order.totalAmount
                    : typeof order.amount === "number"
                      ? order.amount
                      : itemsTotal + deliveryCharges;

              return (
                <div key={order._id} className="compact-order-card">
                  {/* Card Header */}
                  <div className="compact-card-top">
                    <div className="card-top-left">
                      <span className="order-id-txt">#{orderId}</span>
                      <span className="sep">•</span>
                      <span className="order-date-txt">
                        <Calendar size={12} />
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="card-top-right">
                      <div className={`compact-status-tag ${statusInfo.className}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Products Section */}
                  <div className="compact-products-box">
                    {productsList.length === 0 ? (
                      <p className="compact-empty-txt">No items details available.</p>
                    ) : (
                      productsList.map((item, idx) => {
                        const productObj =
                          typeof item.productId === "object"
                            ? item.productId
                            : typeof item.product === "object"
                              ? item.product
                              : null;

                        const prodId =
                          typeof item.productId === "string"
                            ? item.productId
                            : productObj?._id || (typeof item.product === "string" ? item.product : undefined);

                        const prodName =
                          item.name || item.productName || productObj?.name || `Product Item #${idx + 1}`;

                        // Extract image from item.images array, item.image, or productObj
                        const firstImageObj =
                          (Array.isArray(item.images) && item.images.length > 0 && item.images[0]) ||
                          item.image ||
                          (productObj?.images && productObj.images[0]) ||
                          productObj?.image;

                        const prodImgUrl =
                          typeof firstImageObj === "string"
                            ? firstImageObj
                            : firstImageObj?.url || "";

                        const unitPrice =
                          item.purchasePrice ??
                          item.price ??
                          productObj?.price ??
                          productObj?.salePrice ??
                          productObj?.salesPrice ??
                          (itemsTotal && item.quantity ? itemsTotal / item.quantity : 0);

                        const quantity = item.quantity || 1;
                        const itemSubtotal = unitPrice * quantity;

                        return (
                          <div key={item._id || idx} className="compact-item-row">
                            <img
                              src={formatImageUrl(prodImgUrl)}
                              alt={prodName}
                              className="compact-item-thumb"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = productFallback;
                              }}
                            />

                            <div className="compact-item-info">
                              <h4 className="compact-item-title">{prodName}</h4>
                              <div className="compact-item-pricing">
                                <span>{formatCurrency(unitPrice)} × {quantity}</span>
                                <span className="dot-sep">•</span>
                                <span className="item-subtotal-val">{formatCurrency(itemSubtotal)}</span>
                              </div>
                            </div>

                            {prodId && (
                              <div className="compact-item-right">
                                <Link
                                  to={`/product/${prodId}`}
                                  className="compact-view-link"
                                >
                                  View
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Compact Bottom Details */}
                  <div className="compact-details-footer">
                    {/* Shipping Address Block */}
                    <div className="compact-footer-col">
                      <span className="footer-col-title">
                        <MapPin size={12} /> Shipping Address
                      </span>
                      {address ? (
                        <div className="compact-address-info">
                          <div className="compact-person">
                            <UserIcon size={12} />
                            <strong>{address.fullname || address.fullName || address.name || user?.name || "Customer"}</strong>
                            {address.tag && <span className="compact-tag">{address.tag}</span>}
                          </div>
                          <p className="compact-addr-line">
                            {address.address || address.addressLine || address.street || ""}
                          </p>
                          <p className="compact-addr-line compact-addr-muted">
                            {[address.city, address.state, address.postalCode || address.pincode, address.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {Boolean(address.phone || (user as any)?.phone) && (
                            <p className="compact-phone">
                              <Phone size={11} /> {address.phone || (user as any)?.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="compact-empty-txt">Standard checkout address.</p>
                      )}
                    </div>

                    {/* Payment & Order Summary with Delivery Charges */}
                    <div className="compact-footer-col">
                      <span className="footer-col-title">
                        {paymentMode === "COD" ? <Banknote size={12} /> : <CreditCard size={12} />} Payment & Summary
                      </span>
                      <div className="compact-payment-info">
                        <div className="compact-pay-row">
                          <span className="pay-label">Payment Mode:</span>
                          <strong className="pay-val">{paymentMode === "COD" ? "Cash on Delivery" : "Online Payment"}</strong>
                        </div>
                        <div className="compact-pay-row">
                          <span className="pay-label">Payment Status:</span>
                          <span
                            className={`compact-pay-status ${(order.paymentStatus || "").toLowerCase() === "paid" ? "paid" : "pending"
                              }`}
                          >
                            {(order.paymentStatus || (paymentMode === "COD" ? "Pay on Delivery" : "Pending")).toUpperCase()}
                          </span>
                        </div>
                        <div className="compact-pay-row subtotal-row">
                          <span className="pay-label">Items Total:</span>
                          <span>{formatCurrency(itemsTotal)}</span>
                        </div>
                        <div className="compact-pay-row delivery-row">
                          <span className="pay-label">Delivery Charges:</span>
                          {deliveryCharges === 0 ? (
                            <span className="free-delivery-badge">FREE</span>
                          ) : (
                            <span className="delivery-val">+{formatCurrency(deliveryCharges)}</span>
                          )}
                        </div>
                        <div className="compact-pay-total-row">
                          <span>Order Total:</span>
                          <strong className="compact-grand-total">{formatCurrency(orderTotal)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default UserOrders;

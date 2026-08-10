import { useEffect, useState } from "react";
import { Search, Trash2, ShoppingBag } from "lucide-react";
import "./Orders.css";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: "Paid" | "Pending" | "Failed";
  orderStatus: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

const API_ADMIN_ORDERS = "http://localhost:5000/api/admin/orders";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(API_ADMIN_ORDERS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const rawList = result.data?.orders || result.data || result.orders || [];
        setOrders(Array.isArray(rawList) ? rawList : []);
      } else {
        // If API is not implemented yet on backend, keep state clean with empty list
        setOrders([]);
      }
    } catch (err) {
      console.log("Unable to load live admin orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_ADMIN_ORDERS}/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus as any } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this order record?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_ADMIN_ORDERS}/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (err) {
      console.error("Delete order error:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName?.toLowerCase().includes(search.toLowerCase().trim()) ||
      order._id?.toLowerCase().includes(search.toLowerCase().trim()) ||
      order.customerEmail?.toLowerCase().includes(search.toLowerCase().trim());

    const matchesStatus =
      statusFilter === "all" ||
      order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="admin-orders-section">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <span className="orders-eyebrow">ADMINISTRATION</span>
          <h1>Orders Management</h1>
          <p>Track customer purchases, update fulfillment status, and inspect transaction logs.</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="orders-toolbar">
        <div className="orders-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="orders-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* ERROR */}
      {error && <div className="orders-error">{error}</div>}

      {/* TABLE / EMPTY STATE */}
      {loading ? (
        <div className="orders-loading">Loading customer orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="orders-empty">
          <ShoppingBag size={48} color="#d9a256" style={{ margin: "0 auto 16px" }} />
          <h3>No Orders Found</h3>
          <p>Customer orders will automatically appear here once checkout is completed.</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total Items</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id-badge">#{order._id.substring(0, 8)}</span>
                  </td>

                  <td>
                    <strong>{order.customerName}</strong>
                    <br />
                    <span style={{ fontSize: "12px", color: "#9fae9f" }}>{order.customerEmail}</span>
                  </td>

                  <td>{order.items?.length || 0} item(s)</td>

                  <td>
                    <strong style={{ color: "#d9a256" }}>
                      ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                    </strong>
                  </td>

                  <td>
                    <span
                      style={{
                        color: order.paymentStatus === "Paid" ? "#7fae8a" : "#e08a52",
                        fontWeight: 600,
                      }}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`order-status-badge ${
                        order.orderStatus?.toLowerCase() || "pending"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  <td>
                    <div className="order-actions">
                      <select
                        className="order-action-select"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        className="order-delete-btn"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete order record"
                      >
                        <Trash2 size={15} />
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

export default Orders;

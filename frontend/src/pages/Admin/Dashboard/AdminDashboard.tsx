import { Link } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { Package, ShoppingBag, Users, DollarSign, Plus, ArrowRight, ShieldCheck } from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="admin-dashboard">
      <section className="admin-header">
        <div>
          <span className="admin-eyebrow">
            <ShieldCheck size={14} strokeWidth={2.5} />
            ADMIN PANEL
          </span>

          <h1 className="admin-title">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="admin-subtext">
            Control center for your e-commerce store. Monitor metrics and manage catalog & users.
          </p>
        </div>

        <div className="admin-header-actions">
          <Link to="/admin/add/product" className="admin-btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            Add New Product
          </Link>
        </div>
      </section>

      <section className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-icon">
            <Package size={20} />
          </div>
          <div className="admin-stat-info">
            <span>Total Products</span>
            <strong>Manage Catalog</strong>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat-icon">
            <ShoppingBag size={20} />
          </div>
          <div className="admin-stat-info">
            <span>Total Orders</span>
            <strong>View Orders</strong>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat-icon">
            <Users size={20} />
          </div>
          <div className="admin-stat-info">
            <span>Registered Users</span>
            <strong>User Base</strong>
          </div>
        </div>

        <div className="admin-stat">
          <div className="admin-stat-icon">
            <DollarSign size={20} />
          </div>
          <div className="admin-stat-info">
            <span>Store Revenue</span>
            <strong>Analytics</strong>
          </div>
        </div>
      </section>

      <section className="admin-content">
        <Link to="/admin/products" className="admin-panel">
          <p>PRODUCTS</p>
          <h2>Product Management</h2>
          <span>Add products, update prices, stock levels and manage product gallery.</span>
          <span className="admin-panel-link">
            Open Products <ArrowRight size={14} />
          </span>
        </Link>

        <Link to="/admin/categories" className="admin-panel">
          <p>CATEGORIES</p>
          <h2>Category Management</h2>
          <span>Add, edit, and organize product categories across your store.</span>
          <span className="admin-panel-link">
            Open Categories <ArrowRight size={14} />
          </span>
        </Link>

        <div className="admin-panel">
          <p>ORDERS</p>
          <h2>Order Management</h2>
          <span>View customer purchases, fulfill shipping, and track delivery status.</span>
          <span className="admin-panel-link">
            View Orders <ArrowRight size={14} />
          </span>
        </div>

        <div className="admin-panel">
          <p>USERS</p>
          <h2>User Management</h2>
          <span>View customer accounts, user roles, and order history details.</span>
          <span className="admin-panel-link">
            Manage Users <ArrowRight size={14} />
          </span>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
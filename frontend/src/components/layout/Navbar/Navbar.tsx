import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { useCart } from "../../../context/cartContext";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import "./Navbar.css";
import logo from "../../../assets/logo.png";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Shopora Logo" className="logo" />
          <span className="brand-name">Shopora</span>
        </Link>

        {/* Hamburger */}
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation */}
        <nav className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          {/* Search */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <Search size={16} strokeWidth={2} />
            </button>
          </form>

          {/* Common Links */}
          <Link to="/" className="navbar-link" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/products" className="navbar-link" onClick={closeMenu}>
            Products
          </Link>

          <Link to="/about" className="navbar-link" onClick={closeMenu}>
            About
          </Link>

          {/* Guest */}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="navbar-link" onClick={closeMenu}>
                Login
              </Link>

              <Link to="/register" className="register-btn" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}

          {/* Normal User */}
          {isAuthenticated && user?.role !== "admin" && (
            <>
              <Link
                to="/cart"
                className="navbar-link navbar-icon-link"
                onClick={closeMenu}
                style={{ position: "relative" }}
              >
                <ShoppingCart size={18} strokeWidth={1.9} />
                <span>Cart</span>
                {totalItems > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-6px",
                      background: "#d9a256",
                      color: "#12211a",
                      fontSize: "10px",
                      fontWeight: 700,
                      borderRadius: "10px",
                      padding: "2px 6px",
                      lineHeight: 1,
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                className="navbar-link navbar-icon-link"
                onClick={closeMenu}
              >
                <User size={18} strokeWidth={1.9} />
                <span>Profile</span>
              </Link>

              <button type="button" className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

          {/* Admin */}
          {isAuthenticated && user?.role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="navbar-link" onClick={closeMenu}>
                Dashboard
              </Link>

              <Link to="/admin/products" className="navbar-link" onClick={closeMenu}>
                Manage Products
              </Link>

              <Link to="/admin/categories" className="navbar-link" onClick={closeMenu}>
                Categories
              </Link>

              <Link to="/admin/orders" className="navbar-link" onClick={closeMenu}>
                Orders
              </Link>

              <Link to="/admin/users" className="navbar-link" onClick={closeMenu}>
                Users
              </Link>

              <button type="button" className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
import Navbar from "./components/layout/Navbar/Navbar";
import Home from "./pages/Home/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import About from "./pages/About/About";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AddProduct from "./pages/Admin/Products";
import ProductList from "./pages/Admin/ProductList";
import EditProduct from "./pages/Admin/EditProduct";
import Categories from "./pages/Admin/Categories";
import Orders from "./pages/Admin/Orders";
import Users from "./pages/Admin/Users";
import UserProducts from "./pages/Products/UserProducts";
import ProductDetails from "./pages/Products/ProductDetails";
import Cart from "./pages/Cart/Cart";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import TermsConditions from "./pages/Legal/TermsConditions";
import ShippingPolicy from "./pages/Legal/ShippingPolicy";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products" element={<UserProducts />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/admin/products" element={<ProductList />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/profile" element={<Dashboard />} />
        <Route path="/admin/add/product" element={<AddProduct />} />
        <Route path="/admin/products/edit/:productId" element={<EditProduct />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
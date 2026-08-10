import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./authContext";

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images?: Array<string | { url?: string }>;
  stock?: number;
  category?: { name?: string } | string;
  brand?: string;
}

export interface CartItem {
  _id?: string;
  product: CartProduct;
  quantity: number;
  price?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_CART = `${API_BASE_URL}/api/cart`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { token, isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const parseCartResponse = (data: any) => {
    if (!data) return;

    const rawItems = data.items || data.data?.items || (Array.isArray(data) ? data : []);

    const formattedItems: CartItem[] = (Array.isArray(rawItems) ? rawItems : []).map((item: any) => {
      const productObj = item.product || item.productId || item;
      const qty = item.quantity || 1;
      const itemPrice =
        item.price ||
        (productObj.salePrice && productObj.salePrice < productObj.price
          ? productObj.salePrice
          : productObj.price || 0);

      return {
        _id: item._id || productObj._id,
        product: {
          _id: productObj._id || item.productId,
          name: productObj.name || "Product",
          price: productObj.price || 0,
          salePrice: productObj.salePrice || null,
          images: productObj.images || [],
          stock: productObj.stock ?? 10,
          category: productObj.category || "General",
          brand: productObj.brand || "",
        },
        quantity: qty,
        price: itemPrice,
      };
    });

    setCartItems(formattedItems);

    const calculatedTotalItems =
      data.totalItems ??
      data.data?.totalItems ??
      formattedItems.reduce((acc, item) => acc + item.quantity, 0);

    const calculatedSubtotal =
      data.subtotal ??
      data.data?.subtotal ??
      formattedItems.reduce((acc, item) => acc + (item.price || item.product.price) * item.quantity, 0);

    setTotalItems(calculatedTotalItems);
    setSubtotal(calculatedSubtotal);
  };

  const fetchCart = async () => {
    if (!isAuthenticated || !token) {
      setCartItems([]);
      setTotalItems(0);
      setSubtotal(0);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(API_CART, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok) {
        parseCartResponse(result.data || result);
      } else {
        console.warn("Cart fetch returned non-ok status:", result.message);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      alert("Please log in to add items to your cart.");
      return false;
    }

    try {
      setLoading(true);
      const res = await fetch(API_CART, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const result = await res.json();

      if (res.ok && (result.success !== false)) {
        await fetchCart();
        return true;
      } else {
        alert(result.message || "Failed to add product to cart.");
        return false;
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("An error occurred while adding to cart.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_CART}/${productId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      const result = await res.json();

      if (res.ok && (result.success !== false)) {
        await fetchCart();
        return true;
      } else {
        alert(result.message || "Failed to update quantity.");
        return false;
      }
    } catch (err) {
      console.error("Update cart quantity error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated || !token) return false;

    try {
      setLoading(true);
      const res = await fetch(`${API_CART}/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && (result.success !== false)) {
        await fetchCart();
        return true;
      } else {
        alert(result.message || "Failed to remove item from cart.");
        return false;
      }
    } catch (err) {
      console.error("Remove from cart error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

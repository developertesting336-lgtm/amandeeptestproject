// Order Service for Checkout and Order Management
// Handles COD order creation and communicates with /api/order/cod

export interface PlaceCodOrderPayload {
  userId?: string;
  productId?: string;
  products?: Array<{
    productId: string;
    quantity: number;
    price?: number;
  }>;
  items?: Array<{
    productId: string;
    quantity: number;
    price?: number;
  }>;
  paymentMode: string; // "COD"
  address: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    tag?: string;
  };
  totalAmount?: number;
}

export interface PlaceCodOrderResponse {
  success: boolean;
  orderId?: string;
  data?: any;
  message?: string;
  error?: string;
}

export interface OrderProductImage {
  _id?: string;
  url: string;
  public_id?: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface OrderItemProduct {
  _id?: string;
  name?: string;
  price?: number;
  salePrice?: number | null;
  salesPrice?: number | null;
  images?: Array<OrderProductImage | string | { url?: string }>;
  image?: string;
  category?: any;
  brand?: string;
}

export interface UserOrderItem {
  _id?: string;
  productId?: string | OrderItemProduct;
  product?: OrderItemProduct | string;
  name?: string;
  productName?: string;
  purchasePrice?: number;
  price?: number;
  quantity: number;
  images?: Array<OrderProductImage | string | { url?: string }>;
  image?: string;
}

export interface UserOrderAddress {
  fullname?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  address?: string;
  addressLine?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  pincode?: string;
  zipCode?: string;
  country?: string;
  tag?: string;
}

export interface UserOrder {
  _id: string;
  orderId?: string;
  user?: string | any;
  userId?: string | any;
  products?: UserOrderItem[];
  items?: UserOrderItem[];
  itemsTotal?: number;
  deliveryCharges?: number;
  orderTotal?: number;
  totalAmount?: number;
  amount?: number;
  shippingAddress?: UserOrderAddress;
  address?: UserOrderAddress;
  paymentMode?: string;
  paymentMethod?: string;
  paymentStatus?: "paid" | "pending" | "failed" | string;
  orderStatus?: "Pending" | "Processing" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface GetOrdersResponse {
  success: boolean;
  count?: number;
  orders: UserOrder[];
  message?: string;
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Places a Cash on Delivery (COD) order via POST /api/order/cod
 */
export const placeCodOrder = async (
  payload: PlaceCodOrderPayload,
  token?: string | null
): Promise<PlaceCodOrderResponse> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/order/cod`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success !== false) {
      // Extract orderId from various possible response formats
      const orderId =
        result.orderId ||
        result.order?._id ||
        result.order?.orderId ||
        result.data?.orderId ||
        result.data?._id ||
        result.data?.order?._id ||
        result._id ||
        `OD${Date.now().toString().slice(-8)}`;

      return {
        success: true,
        orderId,
        data: result.data || result,
        message: result.message || "Order placed successfully!",
      };
    } else {
      return {
        success: false,
        error: result.message || "Failed to place COD order. Please try again.",
      };
    }
  } catch (err: any) {
    console.error("Error placing COD order:", err);
    return {
      success: false,
      error: err.message || "Network error while connecting to server. Please try again.",
    };
  }
};

/**
 * Fetches user orders via GET /api/order
 */
export const getUserOrders = async (token?: string | null): Promise<GetOrdersResponse> => {
  try {
    const activeToken = token || localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: "GET",
      headers,
    });

    const result = await response.json();

    if (response.ok && result.success !== false) {
      // Handle various response wrappers: { orders: [...] }, { data: [...] }, { data: { orders: [...] } }, or array directly
      let ordersList: UserOrder[] = [];
      if (Array.isArray(result)) {
        ordersList = result;
      } else if (Array.isArray(result.orders)) {
        ordersList = result.orders;
      } else if (Array.isArray(result.data)) {
        ordersList = result.data;
      } else if (result.data && Array.isArray(result.data.orders)) {
        ordersList = result.data.orders;
      } else if (result.order && typeof result.order === "object") {
        ordersList = [result.order];
      }

      return {
        success: true,
        orders: ordersList,
        message: result.message || "Orders fetched successfully",
      };
    } else {
      return {
        success: false,
        orders: [],
        error: result.message || "Failed to load orders",
      };
    }
  } catch (err: any) {
    console.error("Error fetching user orders from /api/order:", err);
    return {
      success: false,
      orders: [],
      error: err.message || "Network error while fetching orders",
    };
  }
};


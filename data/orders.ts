export type OrderStatus = "Processing" | "Fulfilled" | "Cancelled";
export type PaymentMethod =
  | "COD"
  | "bKash"
  | "Cash"
  | "bKash (Shipping Advance)"
  | "bKash (Advance Payment)";

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  /** Null for dashboard-created walk-in/POS sales, which don't collect an email. */
  email: string | null;
  status: OrderStatus;
  payment: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | null;
  total: number;
  date: string;
};

export type OrderItem = {
  id: string;
  name: string;
  variant: string | null;
  image: string | null;
  price: number;
  qty: number;
};

export type OrderDetail = Order & {
  phone: string | null;
  address: string | null;
  district: string | null;
  subtotal: number;
  shippingCost: number;
  discountCode: string | null;
  discountAmount: number;
  /** How much was already charged online via bKash, for the two hybrid
   * "pay part now, rest on delivery" methods. Null for COD/Cash/full bKash. */
  advanceAmount: number | null;
  /** What's left to collect on delivery — the courier's COD amount. */
  codAmountDue: number;
  bkashNumber: string | null;
  courier: "steadfast" | "pathao" | null;
  courierConsignmentId: string | null;
  courierTrackingCode: string | null;
  courierStatus: string | null;
  items: OrderItem[];
};

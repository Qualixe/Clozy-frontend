export type OrderStatus = "Processing" | "Fulfilled" | "Cancelled";
export type PaymentMethod = "COD" | "bKash";

export type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  status: OrderStatus;
  payment: PaymentMethod;
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
  phone: string;
  address: string;
  district: string;
  subtotal: number;
  shippingCost: number;
  bkashNumber: string | null;
  items: OrderItem[];
};

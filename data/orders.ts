export type OrderStatus = "Processing" | "Fulfilled" | "Cancelled";
export type PaymentMethod = "COD" | "bKash";

export type Order = {
  id: string;
  customer: string;
  email: string;
  status: OrderStatus;
  payment: PaymentMethod;
  total: number;
  date: string;
};

// Placeholder orders until a real orders API exists.
export const ORDERS: Order[] = [
  { id: "#3241", customer: "Daniel R.", email: "daniel.r@example.com", status: "Fulfilled", payment: "bKash", total: 210, date: "2026-07-28" },
  { id: "#3240", customer: "Priya K.", email: "priya.k@example.com", status: "Processing", payment: "COD", total: 74, date: "2026-07-28" },
  { id: "#3239", customer: "Marcus T.", email: "marcus.t@example.com", status: "Fulfilled", payment: "bKash", total: 145, date: "2026-07-27" },
  { id: "#3238", customer: "Elena V.", email: "elena.v@example.com", status: "Cancelled", payment: "COD", total: 68, date: "2026-07-27" },
  { id: "#3237", customer: "Sam O.", email: "sam.o@example.com", status: "Fulfilled", payment: "bKash", total: 98, date: "2026-07-26" },
  { id: "#3236", customer: "Jade L.", email: "jade.l@example.com", status: "Fulfilled", payment: "COD", total: 120, date: "2026-07-26" },
  { id: "#3235", customer: "Noah F.", email: "noah.f@example.com", status: "Processing", payment: "bKash", total: 165, date: "2026-07-25" },
  { id: "#3234", customer: "Ana P.", email: "ana.p@example.com", status: "Fulfilled", payment: "COD", total: 45, date: "2026-07-25" },
  { id: "#3233", customer: "Chris B.", email: "chris.b@example.com", status: "Fulfilled", payment: "bKash", total: 210, date: "2026-07-24" },
  { id: "#3232", customer: "Mia S.", email: "mia.s@example.com", status: "Cancelled", payment: "COD", total: 74, date: "2026-07-24" },
  { id: "#3231", customer: "Tomas H.", email: "tomas.h@example.com", status: "Fulfilled", payment: "bKash", total: 68, date: "2026-07-23" },
  { id: "#3230", customer: "Grace N.", email: "grace.n@example.com", status: "Processing", payment: "COD", total: 145, date: "2026-07-23" },
  { id: "#3229", customer: "Ivy C.", email: "ivy.c@example.com", status: "Fulfilled", payment: "bKash", total: 98, date: "2026-07-22" },
  { id: "#3228", customer: "Ben K.", email: "ben.k@example.com", status: "Fulfilled", payment: "COD", total: 120, date: "2026-07-22" },
  { id: "#3227", customer: "Habib R.", email: "habib.r@example.com", status: "Fulfilled", payment: "bKash", total: 165, date: "2026-07-21" },
  { id: "#3226", customer: "Nadia J.", email: "nadia.j@example.com", status: "Cancelled", payment: "COD", total: 45, date: "2026-07-21" },
  { id: "#3225", customer: "Omar S.", email: "omar.s@example.com", status: "Fulfilled", payment: "bKash", total: 210, date: "2026-07-20" },
  { id: "#3224", customer: "Lily W.", email: "lily.w@example.com", status: "Processing", payment: "COD", total: 74, date: "2026-07-20" },
];

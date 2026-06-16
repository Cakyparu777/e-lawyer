export type UserRole = "CLIENT" | "LAWYER" | "ADMIN";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export type User = {
  id: string;
  role: UserRole;
  username: string;
  email: string;
  phone_number: string;
  phone_verified: boolean;
};

export type Category = {
  id: string;
  name: Record<"en" | "mn", string>;
  description: Record<"en" | "mn", string>;
  icon: string;
  is_active: boolean;
};

export type Lawyer = {
  user_id: string;
  username: string;
  email?: string | null;
  phone_number?: string | null;
  photo_url?: string | null;
  bio: string;
  categories: string[];
  price_per_consultation: number;
  currency: string;
  credentials: string;
  avg_rating: number;
  review_count: number;
  availability: Record<string, unknown>;
};

export type Appointment = {
  id: string;
  client_id: string;
  lawyer_id: string;
  category_id: string;
  date_time: string;
  status: AppointmentStatus;
  payment_id?: string | null;
  client_contact_snapshot?: Record<string, string> | null;
  created_at: string;
};

export type Review = {
  id: string;
  appointment_id: string;
  client_id: string;
  lawyer_id: string;
  rating: number;
  text: string;
  is_hidden: boolean;
  created_at: string;
};

export type AuthResponse = {
  user: User;
  token: { access_token: string; token_type: "bearer" };
  dev_otp_code?: string | null;
};

export type CheckoutResponse = {
  appointment_id: string;
  payment_id: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  checkout_payload: Record<string, unknown>;
};


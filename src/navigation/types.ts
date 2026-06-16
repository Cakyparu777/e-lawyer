import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: { role?: "CLIENT" | "LAWYER" } | undefined;
  Otp: { devCode?: string | null } | undefined;
};

export type ClientStackParamList = {
  ClientTabs: NavigatorScreenParams<ClientTabParamList> | undefined;
  LawyerDirectory: { categoryId: string; categoryName: string };
  LawyerProfile: { lawyerId: string; categoryId?: string };
  BookConsultation: { lawyerId: string; categoryId: string };
  PaymentCheckout: { lawyerId: string; categoryId: string; dateTime: string };
  BookingConfirmed: { appointmentId: string };
  Chat: { appointmentId: string };
  Review: { appointmentId: string; lawyerId: string };
};

export type ClientTabParamList = {
  ClientHome: undefined;
  ClientAppointments: undefined;
  ClientSettings: undefined;
};

export type LawyerTabParamList = {
  LawyerDashboard: undefined;
  LawyerAppointments: undefined;
  LawyerReviews: undefined;
  LawyerProfileEditor: undefined;
};

export type LawyerStackParamList = {
  LawyerTabs: undefined;
  Chat: { appointmentId: string };
};

export type AdminStackParamList = {
  AdminHome: undefined;
};

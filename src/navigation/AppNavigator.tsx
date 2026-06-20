import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeBottomTabNavigator,
  type NativeBottomTabIcon,
  type NativeBottomTabNavigationOptions
} from "@react-navigation/bottom-tabs/unstable";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { SFSymbol } from "sf-symbols-typescript";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "@/theme/colors";
import { useAuthStore } from "@/state/authStore";
import type {
  AdminStackParamList,
  AuthStackParamList,
  ClientStackParamList,
  ClientTabParamList,
  LawyerStackParamList,
  LawyerTabParamList
} from "@/navigation/types";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { OtpScreen } from "@/screens/auth/OtpScreen";
import { ClientHomeScreen } from "@/screens/client/ClientHomeScreen";
import { ClientSearchScreen } from "@/screens/client/ClientSearchScreen";
import { ClientQuickBookScreen } from "@/screens/client/ClientQuickBookScreen";
import { LawyerDirectoryScreen } from "@/screens/client/LawyerDirectoryScreen";
import { LawyerProfileScreen } from "@/screens/client/LawyerProfileScreen";
import { BookConsultationScreen } from "@/screens/client/BookConsultationScreen";
import { PaymentCheckoutScreen } from "@/screens/client/PaymentCheckoutScreen";
import { BookingConfirmedScreen } from "@/screens/client/BookingConfirmedScreen";
import { ClientAppointmentsScreen } from "@/screens/client/ClientAppointmentsScreen";
import { ReviewScreen } from "@/screens/client/ReviewScreen";
import { ClientSettingsScreen } from "@/screens/client/ClientSettingsScreen";
import { LawyerDashboardScreen } from "@/screens/lawyer/LawyerDashboardScreen";
import { LawyerAppointmentsScreen } from "@/screens/lawyer/LawyerAppointmentsScreen";
import { LawyerReviewsScreen } from "@/screens/lawyer/LawyerReviewsScreen";
import { LawyerProfileEditorScreen } from "@/screens/lawyer/LawyerProfileEditorScreen";
import { AdminHomeScreen } from "@/screens/admin/AdminHomeScreen";
import { ChatScreen } from "@/screens/chat/ChatScreen";
import { ChatListScreen } from "@/screens/chat/ChatListScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const ClientTabs = createNativeBottomTabNavigator<ClientTabParamList>();
const LawyerStack = createNativeStackNavigator<LawyerStackParamList>();
const LawyerTabs = createNativeBottomTabNavigator<LawyerTabParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function tabOptions(
  label: string,
  symbol: SFSymbol
): NativeBottomTabNavigationOptions {
  const icon: NativeBottomTabIcon = { type: "sfSymbol", name: symbol };

  return {
    title: label,
    tabBarLabel: label,
    tabBarIcon: icon
  };
}

function tabScreenOptions(): NativeBottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarControllerMode: "tabBar" as const,
    tabBarMinimizeBehavior: "none" as const,
    overrideScrollViewContentInsetAdjustmentBehavior: true
  };
}

function ClientTabNavigator() {
  return (
    <ClientTabs.Navigator
      screenOptions={tabScreenOptions}
    >
      <ClientTabs.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={tabOptions("Нүүр", "house")}
      />
      <ClientTabs.Screen
        name="ClientSearch"
        component={ClientSearchScreen}
        options={tabOptions("Хайх", "magnifyingglass")}
      />
      <ClientTabs.Screen
        name="ClientQuickBook"
        component={ClientQuickBookScreen}
        options={tabOptions("Захиалах", "calendar.badge.plus")}
      />
      <ClientTabs.Screen
        name="ClientChats"
        component={ChatListScreen}
        options={tabOptions("Чат", "message")}
      />
      <ClientTabs.Screen
        name="ClientProfile"
        component={ClientSettingsScreen}
        options={tabOptions("Профайл", "person.crop.circle")}
      />
    </ClientTabs.Navigator>
  );
}

function ClientNavigator() {
  return (
    <ClientStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientStack.Screen name="ClientTabs" component={ClientTabNavigator} />
      <ClientStack.Screen name="ClientAppointments" component={ClientAppointmentsScreen} />
      <ClientStack.Screen name="LawyerDirectory" component={LawyerDirectoryScreen} />
      <ClientStack.Screen name="LawyerProfile" component={LawyerProfileScreen} />
      <ClientStack.Screen name="BookConsultation" component={BookConsultationScreen} />
      <ClientStack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <ClientStack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} />
      <ClientStack.Screen name="Chat" component={ChatScreen} />
      <ClientStack.Screen name="Review" component={ReviewScreen} />
    </ClientStack.Navigator>
  );
}

function LawyerTabNavigator() {
  return (
    <LawyerTabs.Navigator
      screenOptions={tabScreenOptions}
    >
      <LawyerTabs.Screen
        name="LawyerDashboard"
        component={LawyerDashboardScreen}
        options={tabOptions("Самбар", "square.grid.2x2")}
      />
      <LawyerTabs.Screen
        name="LawyerAppointments"
        component={LawyerAppointmentsScreen}
        options={tabOptions("Хуваарь", "calendar")}
      />
      <LawyerTabs.Screen
        name="LawyerChats"
        component={ChatListScreen}
        options={tabOptions("Чат", "message")}
      />
      <LawyerTabs.Screen
        name="LawyerReviews"
        component={LawyerReviewsScreen}
        options={tabOptions("Үнэлгээ", "star")}
      />
      <LawyerTabs.Screen
        name="LawyerProfileEditor"
        component={LawyerProfileEditorScreen}
        options={tabOptions("Профайл", "person.crop.circle")}
      />
    </LawyerTabs.Navigator>
  );
}

function LawyerNavigator() {
  return (
    <LawyerStack.Navigator screenOptions={{ headerShown: false }}>
      <LawyerStack.Screen name="LawyerTabs" component={LawyerTabNavigator} />
      <LawyerStack.Screen name="Chat" component={ChatScreen} />
    </LawyerStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="Otp" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

function PhoneVerificationGate() {
  return (
    <AuthStack.Navigator initialRouteName="Otp" screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Otp" component={OtpScreen} />
    </AuthStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminHome" component={AdminHomeScreen} />
    </AdminStack.Navigator>
  );
}

export function AppNavigator() {
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : !user.phone_verified ? (
        <PhoneVerificationGate />
      ) : user.role === "LAWYER" ? (
        <LawyerNavigator />
      ) : user.role === "ADMIN" ? (
        <AdminNavigator />
      ) : (
        <ClientNavigator />
      )}
    </NavigationContainer>
  );
}

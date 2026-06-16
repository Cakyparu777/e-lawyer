import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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
import { OnboardingScreen } from "@/screens/auth/OnboardingScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { OtpScreen } from "@/screens/auth/OtpScreen";
import { ClientHomeScreen } from "@/screens/client/ClientHomeScreen";
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

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const ClientTabs = createBottomTabNavigator<ClientTabParamList>();
const LawyerStack = createNativeStackNavigator<LawyerStackParamList>();
const LawyerTabs = createBottomTabNavigator<LawyerTabParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function tabOptions(icon: keyof typeof Ionicons.glyphMap) {
  return {
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Ionicons name={icon} size={size} color={color} />
    )
  };
}

function ClientTabNavigator() {
  return (
    <ClientTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.outlineVariant }
      }}
    >
      <ClientTabs.Screen name="ClientHome" component={ClientHomeScreen} options={{ title: "Нүүр", ...tabOptions("home") }} />
      <ClientTabs.Screen
        name="ClientAppointments"
        component={ClientAppointmentsScreen}
        options={{ title: "Захиалга", ...tabOptions("calendar") }}
      />
      <ClientTabs.Screen
        name="ClientSettings"
        component={ClientSettingsScreen}
        options={{ title: "Тохиргоо", ...tabOptions("person-circle") }}
      />
    </ClientTabs.Navigator>
  );
}

function ClientNavigator() {
  return (
    <ClientStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientStack.Screen name="ClientTabs" component={ClientTabNavigator} />
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
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: colors.surfaceContainerLowest, borderTopColor: colors.outlineVariant }
      }}
    >
      <LawyerTabs.Screen
        name="LawyerDashboard"
        component={LawyerDashboardScreen}
        options={{ title: "Хянах самбар", ...tabOptions("grid") }}
      />
      <LawyerTabs.Screen
        name="LawyerAppointments"
        component={LawyerAppointmentsScreen}
        options={{ title: "Хуваарь", ...tabOptions("calendar") }}
      />
      <LawyerTabs.Screen
        name="LawyerReviews"
        component={LawyerReviewsScreen}
        options={{ title: "Үнэлгээ", ...tabOptions("star-half") }}
      />
      <LawyerTabs.Screen
        name="LawyerProfileEditor"
        component={LawyerProfileEditorScreen}
        options={{ title: "Профайл", ...tabOptions("person-circle") }}
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
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
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

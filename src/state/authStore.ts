import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { User } from "@/types/domain";

type AuthState = {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  signIn: (user: User, token: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const TOKEN_KEY = "e-lawyer:token";
const USER_KEY = "e-lawyer:user";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  signIn: async (user, token) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)]
    ]);
    set({ user, token });
  },
  setUser: async (user) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
  signOut: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    set({ user: null, token: null });
  },
  hydrate: async () => {
    const [[, token], [, userJson]] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
    set({ token, user: userJson ? JSON.parse(userJson) : null, hydrated: true });
  }
}));

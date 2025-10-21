/**
 * Authentication Store
 * Zustand store for managing authentication state
 */

import { auth } from "@/services/firebase.config";
import { createUserProfile, getUserProfile } from "@/services/user";
import { AuthState } from "@/types";
import { onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * Set the current user
   */
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clear user data (logout)
   */
  clearUser: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Set loading state
   */
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  /**
   * Set error message
   */
  setError: (error) => {
    set({ error, isLoading: false });
  },

  /**
   * Initialize auth state - listen to Firebase auth changes
   */
  initializeAuth: async () => {
    return new Promise((resolve) => {
      set({ isLoading: true });

      // Listen to Firebase auth state changes
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          console.log(
            "🔄 Auth state changed, user:",
            firebaseUser?.email || "null"
          );

          if (firebaseUser) {
            console.log("🔐 User authenticated:", firebaseUser.email);

            // Fetch full user profile from Firestore
            console.log("📥 Fetching user profile from Firestore...");
            const result = await getUserProfile(firebaseUser.uid);

            if (result.success && result.data) {
              console.log("✅ User profile loaded successfully");
              get().setUser(result.data);
            } else {
              // If profile doesn't exist, create it
              console.log("📝 Profile not found, creating new user profile...");
              const createResult = await createUserProfile(
                firebaseUser.uid,
                firebaseUser.email!,
                firebaseUser.displayName || "User"
              );

              if (createResult.success && createResult.data) {
                console.log("✅ User profile created successfully");
                get().setUser(createResult.data);
              } else {
                console.error(
                  "❌ Failed to create user profile:",
                  createResult.error
                );
                get().setError(
                  createResult.error || "Failed to load user profile"
                );
              }
            }
          } else {
            console.log("👤 No user authenticated");
            get().clearUser();
          }

          resolve();
        },
        (error) => {
          console.error("❌ Auth state change error:", error);
          get().setError("Authentication error occurred");
          resolve();
        }
      );

      // Note: In a real app, you'd want to store and call unsubscribe when needed
      // For this implementation, the listener stays active throughout the app lifecycle
    });
  },
}));

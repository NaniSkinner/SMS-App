/**
 * UI Store
 * Zustand store for managing UI state (theme, offline status, etc.)
 */

import { UIState } from "@/types";
import { create } from "zustand";

export const useUIStore = create<UIState>((set) => ({
  theme: "system",
  isOffline: false,
  offlineBannerVisible: false,

  /**
   * Set theme preference
   */
  setTheme: (theme) => {
    set({ theme });
  },

  /**
   * Set offline status
   */
  setOffline: (offline) => {
    set({ isOffline: offline });

    // Auto-show banner when going offline
    if (offline) {
      set({ offlineBannerVisible: true });
    } else {
      // Auto-hide banner after brief delay when going online
      setTimeout(() => {
        set({ offlineBannerVisible: false });
      }, 2000);
    }
  },

  /**
   * Manually set offline banner visibility
   */
  setOfflineBannerVisible: (visible) => {
    set({ offlineBannerVisible: visible });
  },
}));

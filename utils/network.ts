/**
 * Network Utilities
 * Handles network status monitoring
 */

import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/**
 * Hook to monitor network connectivity status
 */
export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
      setIsInternetReachable(state.isInternetReachable ?? true);

      console.log("🌐 Network status:", {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, []);

  // Consider offline if either not connected OR internet not reachable
  const isOffline = !isConnected || !isInternetReachable;

  return {
    isOnline: !isOffline,
    isOffline,
    isConnected,
    isInternetReachable,
  };
};

/**
 * Get current network status (one-time check)
 */
export const getNetworkStatus = async (): Promise<{
  isOnline: boolean;
  isOffline: boolean;
  isConnected: boolean;
  isInternetReachable: boolean;
}> => {
  const state = await NetInfo.fetch();

  const isConnected = state.isConnected ?? true;
  const isInternetReachable = state.isInternetReachable ?? true;
  const isOffline = !isConnected || !isInternetReachable;

  return {
    isOnline: !isOffline,
    isOffline,
    isConnected,
    isInternetReachable,
  };
};

/**
 * Check if device is connected to the internet
 */
export const checkConnection = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return (state.isConnected && state.isInternetReachable) ?? false;
};

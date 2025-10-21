import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { doc, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { db } from "./firebase.config";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Deprecated but still works
    shouldShowBanner: true, // New iOS 14+ property
    shouldShowList: true, // Show in notification list
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 * @returns Promise<boolean> - true if granted, false if denied
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Only real devices can receive push notifications
    if (!Device.isDevice) {
      console.log("Push notifications only work on physical devices");
      return false;
    }

    // Check existing permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    console.log("Notification permission granted");
    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Get the Expo Push Token for this device
 * @returns Promise<string | null> - Expo push token or null if failed
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    // Only real devices can get push tokens
    if (!Device.isDevice) {
      console.log("Push tokens only work on physical devices");
      return null;
    }

    // Get the Expo push token
    // For Expo Go, projectId is automatically detected from app.json
    const tokenData = await Notifications.getExpoPushTokenAsync();

    console.log("Expo Push Token:", tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error("Error getting Expo push token:", error);
    return null;
  }
}

/**
 * Save the push token to the user's Firestore document
 * @param userId - User ID
 * @param token - Expo push token
 */
export async function savePushTokenToFirestore(
  userId: string,
  token: string
): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      pushToken: token,
      pushTokenUpdatedAt: new Date(),
    });
    console.log("Push token saved to Firestore");
  } catch (error) {
    console.error("Error saving push token to Firestore:", error);
    throw error;
  }
}

/**
 * Register for push notifications (request permissions + get token + save to Firestore)
 * @param userId - User ID
 * @returns Promise<string | null> - Expo push token or null if failed
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  try {
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Get push token
    const token = await getExpoPushToken();
    if (!token) {
      return null;
    }

    // Save to Firestore
    await savePushTokenToFirestore(userId, token);

    return token;
  } catch (error) {
    console.error("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Set up notification received listener (foreground notifications)
 * @param callback - Function to call when notification received
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function setupNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Set up notification response listener (notification tapped)
 * @param callback - Function to call when notification tapped
 * @returns Subscription object (call .remove() to unsubscribe)
 */
export function setupNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the notification that opened the app (if any)
 * Used when app was killed and opened by tapping notification
 * @returns Promise<NotificationResponse | null>
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response;
  } catch (error) {
    console.error("Error getting last notification response:", error);
    return null;
  }
}

/**
 * Clear all delivered notifications
 */
export async function clearAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
}

/**
 * Set badge count
 * @param count - Badge count (0 to clear)
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    if (Platform.OS === "ios") {
      await Notifications.setBadgeCountAsync(count);
    }
  } catch (error) {
    console.error("Error setting badge count:", error);
  }
}

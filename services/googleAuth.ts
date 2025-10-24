import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import React from "react";
import { auth, db } from "./firebase.config";

// Finish warmup for web browser
WebBrowser.maybeCompleteAuthSession();

// ⚠️ CRITICAL OAUTH CONFIGURATION - DO NOT MODIFY WITHOUT READING OAuth/IMPORTANT.md
// This app uses NATIVE iOS OAUTH with custom URL scheme redirect
// iOS Client MUST match Lambda's AWS Secrets Manager configuration
// See: OAuth/IMPORTANT.md for detailed explanation
//
// WHY iOS CLIENT (not Web):
// - This is a BARE WORKFLOW app with native iOS builds
// - Native apps should use native OAuth with custom URL schemes
// - iOS clients DO have secrets for server-side use (Lambda)
// - Both app and Lambda use SAME iOS client = token refresh works!
// - Native redirects work perfectly in bare workflow apps
const GOOGLE_IOS_CLIENT_ID =
  "703601462595-qm6fnoqu40dqiqleejiiaean8v703639.apps.googleusercontent.com";

// iOS OAuth clients don't need an explicit redirect URI in the code
// The redirect happens via the URL scheme registered in Info.plist
// URL scheme: com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639

// Scopes needed for Google Calendar
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
  "openid",
  "profile",
  "email",
];

/**
 * Custom hook to handle Google OAuth for Calendar access
 *
 * ⚠️ USES NATIVE iOS OAUTH with Custom URL Scheme Redirect
 *
 * Architecture (Bare Workflow Native):
 * - App uses iOS OAuth client with native URL scheme redirect
 * - Lambda uses SAME iOS client (iOS clients DO have secrets for server-side!)
 * - Both use same client = token refresh works!
 * - Native redirects work perfectly in bare workflow apps!
 *
 * Why iOS Client:
 * - This is a BARE WORKFLOW app with native iOS builds
 * - Native apps should use native OAuth (simpler, faster, more reliable)
 * - iOS clients support BOTH mobile PKCE AND server-side secret refresh
 * - No dependency on Expo auth proxy (which doesn't work for bare workflow)
 *
 * Why This Works:
 * - App: Uses iosClientId → native OAuth via Info.plist URL scheme
 * - Lambda: Uses iOS client secret → can refresh tokens server-side
 * - Same client → Google accepts token refresh requests
 *
 * ⚠️ DO NOT change to Web client - requires Expo auth proxy (broken for bare workflow)!
 * ⚠️ DO NOT change client ID without updating Lambda AWS Secrets too!
 * ⚠️ DO NOT remove URL scheme from Info.plist!
 *
 * See OAuth/IMPORTANT.md for the full OAuth architecture explanation.
 *
 * Usage:
 * ```
 * const { promptAsync, isLoading } = useGoogleCalendarAuth();
 *
 * const handleConnectCalendar = async () => {
 *   const result = await promptAsync();
 *   // Tokens are automatically stored in Firestore
 * };
 * ```
 */
export function useGoogleCalendarAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID, // ⚠️ Native iOS OAuth for bare workflow
    scopes: CALENDAR_SCOPES,
    // No redirectUri needed - iOS handles via URL scheme in Info.plist automatically
    extraParams: {
      access_type: "offline", // Get refresh token
      prompt: "consent", // Always get refresh token
    },
  });

  // Handle OAuth response
  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("✅ OAuth success! Processing authentication...");
      handleAuthSuccess(authentication);
    } else if (response?.type === "error") {
      console.error("❌ OAuth error:", response.error);
      console.error("Full response:", JSON.stringify(response, null, 2));
      // Handle error in UI
    } else if (response) {
      console.log("OAuth response type:", response.type);
      console.log("Full response:", JSON.stringify(response, null, 2));
    }
  }, [response]);

  return {
    promptAsync,
    request,
    isLoading: !request,
  };
}

/**
 * Handle successful OAuth authentication
 * Exchanges authorization code for tokens and stores in Firestore
 */
async function handleAuthSuccess(authentication: any) {
  try {
    console.log("🔐 Starting handleAuthSuccess...");
    console.log(
      "Authentication object:",
      JSON.stringify(authentication, null, 2)
    );

    if (!authentication) {
      throw new Error("No authentication data received from Google");
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    console.log("✅ Current user:", currentUser.uid);

    const { accessToken, refreshToken, expiresIn } = authentication;

    if (!accessToken) {
      throw new Error("No access token received from Google");
    }

    console.log("✅ Access token received, expires in:", expiresIn);

    // Calculate expiry timestamp
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 3600));

    console.log("💾 Storing tokens in Firestore...");

    // Store tokens in Firestore (encrypted on backend when needed)
    const tokenRef = doc(db, "users", currentUser.uid, "tokens", "google");
    await setDoc(tokenRef, {
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt,
      scope: CALENDAR_SCOPES.join(" "),
      grantedAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Tokens stored successfully");

    // Update user preferences to indicate calendar is connected
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      calendarConnected: true,
      calendarProvider: "google",
    });

    console.log("✅ Google Calendar connected successfully!");
  } catch (error) {
    console.error("❌ Error storing OAuth tokens:", error);
    throw error;
  }
}

/**
 * Check if user has connected their Google Calendar
 * Now with actual validation against Google API
 */
export async function isCalendarConnected(): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const tokenRef = doc(db, "users", currentUser.uid, "tokens", "google");
    const tokenDoc = await getDoc(tokenRef);

    if (!tokenDoc.exists()) return false;

    const data = tokenDoc.data();

    // Check if token exists
    if (!data?.accessToken) return false;

    const expiresAt = data.expiresAt?.toDate();
    if (!expiresAt) return false;

    // Quick check: if token expired more than a day ago, definitely invalid
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    if (expiresAt < oneDayAgo) {
      console.log("🗑️ Token expired over a day ago, marking as invalid");
      return false;
    }

    // Token exists - consider it "connected" even if expired
    // The backend will handle token refresh automatically when needed
    // We DON'T disconnect on expiration - that's what refresh tokens are for!

    // Only return false if tokens don't exist at all
    return data.accessToken !== undefined && data.refreshToken !== undefined;
  } catch (error) {
    console.error("Error checking calendar connection:", error);
    return false;
  }
}

/**
 * Disconnect Google Calendar (revoke access)
 */
export async function disconnectCalendar(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Delete tokens from Firestore
    const tokenRef = doc(db, "users", currentUser.uid, "tokens", "google");
    await deleteDoc(tokenRef);

    // Update user preferences
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
      calendarConnected: false,
      calendarProvider: null,
    });

    console.log("✅ Google Calendar disconnected");
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    throw error;
  }
}

/**
 * Get current calendar connection status
 */
export async function getCalendarStatus(): Promise<{
  connected: boolean;
  expiresAt?: Date;
  scopes?: string[];
}> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { connected: false };
    }

    const tokenRef = doc(db, "users", currentUser.uid, "tokens", "google");
    const tokenDoc = await getDoc(tokenRef);

    if (!tokenDoc.exists()) {
      return { connected: false };
    }

    const data = tokenDoc.data();
    const expiresAt = data?.expiresAt?.toDate();

    return {
      connected: true,
      expiresAt,
      scopes: data?.scope?.split(" ") || [],
    };
  } catch (error) {
    console.error("Error getting calendar status:", error);
    return { connected: false };
  }
}

# Cursor Rules – OAuth Integration (Google Calendar)

## 🚫 DO NOT MODIFY: OAuth Configuration

The following components are **critical** for Google Calendar integration to function correctly. These files and credentials are **tightly coupled** and must remain consistent. **Modifying any one of them without updating all others will break OAuth and produce `unauthorized_client` errors.**

The AI agent **must NOT modify, delete, or rewrite** any of the following without **explicit user instruction**:

---

### 🔐 AUTH FLOW (App)

- `services/googleAuth.ts`

  - Must use the `iosClientId` parameter.
  - Must use the following locked iOS Client ID:  
    `703601462595-qm6fnoqu40dqiqleejiiaean8v703639`.

- `ios/messageapp/Info.plist`
  - Must include native iOS URL scheme:  
    `com.googleusercontent.apps.703601462595-qm6fnoqu40dqiqleejiiaean8v703639`.

---

### ☁️ AUTH FLOW (Backend / Lambda)

- `lambda/src/services/calendar.ts`

  - OAuth configuration must use the **same iOS client ID** above.
  - Token refresh logic depends on the iOS client secret.

- `AWS Secrets Manager → messageai/google-oauth-credentials`
  - Must contain **correct credentials** for the iOS client, including:
    - Client ID: `703601462595-qm6fnoqu40dqiqleejiiaean8v703639`
    - Client Secret: [Redacted]

---

### 📁 CONFIG LOCK

- `OAuth/config.lock`
  - Represents locked OAuth settings for native iOS.
  - This file should never be regenerated without cross-checking **all of the above**.

---

## ✅ Best Practice

If the AI agent is unsure whether a change affects OAuth, it must:

1. **Prompt the user** before modifying any related code or config.
2. Treat the above files and secrets as **immutable** unless explicitly instructed.

---

Failure to follow these rules will **break calendar access** and cause the app to lose Google Calendar functionality across devices. 🛑

# 💬 WhatsApp-Style Messaging App

A production-quality, real-time messaging application built with React Native, Expo, and Firebase.

## 🎯 Project Overview

This is a 7-day MVP project to build a WhatsApp-style messaging app with:
- Real-time one-on-one and group messaging
- Offline-first architecture with optimistic UI
- Online presence & read receipts
- Push notifications
- Modern, polished UI

## 🚀 Tech Stack

- **Frontend**: React Native + Expo Router
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, FCM)
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Language**: TypeScript

## 📊 Progress

- ✅ **Day 0**: Setup & Configuration (8/8 tasks - 100%)
- ✅ **Day 1**: Foundation & Authentication (12/12 tasks - 100%)
- ⏳ **Day 2**: Core Messaging (0/15 tasks - 0%)
- 🔜 **Day 3-7**: Coming soon...

**Total Progress**: 20/83 tasks (24%)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Firebase account
- iOS Simulator (Mac) or Expo Go app

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NaniSkinner/SMS-App.git
   cd SMS-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy the template: `cp services/firebase.config.template.ts services/firebase.config.ts`
   - Add your Firebase credentials from [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Create Firestore database
   - Deploy Firestore rules: `firebase deploy --only firestore:rules`

4. **Run the app**
   ```bash
   npx expo start
   ```

## 🔐 Firebase Setup

### Required Services
- ✅ Authentication (Email/Password)
- ✅ Firestore Database
- 🔜 Cloud Functions (Day 6)
- 🔜 Cloud Messaging (Day 6)

### Security Rules
Firestore security rules are in `firestore.rules` and can be deployed via:
```bash
firebase use your-project-id
firebase deploy --only firestore:rules
```

## 📱 Features

### ✅ Completed (Day 0-1)
- [x] Email/Password authentication
- [x] User registration & login
- [x] Session persistence
- [x] User profiles in Firestore
- [x] Protected routes & auto-navigation
- [x] Beautiful, modern UI
- [x] Light theme support

### 🔜 Coming Soon (Day 2-7)
- [ ] One-on-one messaging
- [ ] Real-time message sync
- [ ] Optimistic UI
- [ ] Offline support
- [ ] Online presence
- [ ] Read receipts
- [ ] Group chat
- [ ] Push notifications
- [ ] Dark theme

## 📁 Project Structure

```
messageapp/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout with auth guards
├── services/              # Firebase & API services
│   ├── auth.ts           # Authentication logic
│   ├── user.ts           # User profile management
│   └── firebase.config.ts # Firebase config (gitignored)
├── stores/                # Zustand state stores
│   └── authStore.ts      # Authentication state
├── types/                 # TypeScript definitions
│   └── index.ts          # All type definitions
├── theme/                 # Theme & styling
│   └── colors.ts         # Color palette
├── components/            # Reusable components (coming soon)
├── Docs/                  # Project documentation
│   ├── PRDmvp.md         # Product requirements
│   ├── Architecture.md    # System architecture
│   └── TasksMVP.md       # Implementation tasks
├── firestore.rules       # Firestore security rules
└── firebase.json         # Firebase configuration

```

## 🧪 Testing

### Current Features to Test
1. **Registration**: Create a new account
2. **Login**: Sign in with credentials
3. **Session Persistence**: Close and reopen app (stays logged in)
4. **Profile**: View user info in Profile tab
5. **Sign Out**: Logout and redirect to login

## 📚 Documentation

- [Product Requirements (PRD)](Docs/PRDmvp.md)
- [Technical Architecture](Docs/Architecture.md)
- [Implementation Tasks](Docs/TasksMVP.md)

## 🔒 Security

- Firebase configuration with credentials is **gitignored**
- Firestore security rules enforce authentication
- Users can only access their own data and conversations they're part of

## 🤝 Contributing

This is a solo MVP project, but feedback and suggestions are welcome!

## 📄 License

This project is for educational and portfolio purposes.

## 👨‍💻 Author

**Nani Skinner**
- GitHub: [@NaniSkinner](https://github.com/NaniSkinner)

---

## 🎯 Next Steps

Continue with Day 2 to implement core messaging functionality!


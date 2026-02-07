# How to Trigger Signer Flow on Mobile

## Overview

The signer flow can now be triggered in **two ways** on mobile:

1. **Onboarding Screen** - First time users see the sign-in screen
2. **Protected Routes** - Sign-in drawer appears when accessing protected content

---

## 1. Onboarding Screen (First Time)

**Location:** `apps/mobile/app/index.tsx`

**When it triggers:**
- User opens app for the first time
- User hasn't completed onboarding
- User doesn't have an active signer

**Flow:**
1. App checks `hasSeenOnboarding()` and `hasActiveSigner()`
2. If both are false → Shows onboarding screen
3. User clicks "Connect Farcaster" → Starts signer flow
4. After completion → Navigates to main app

**To trigger manually:**
- Clear AsyncStorage: `FARCASTER_SIGNER` and `HAS_SEEN_ONBOARDING`
- Or delete and reinstall the app

---

## 2. Protected Routes (Sign-In Drawer)

**Location:** Multiple places

### A. Tab Bar Navigation

**File:** `apps/mobile/components/LiquidGlassTabBar.tsx`

**When it triggers:**
- User taps "Notifications" tab (🔔)
- User taps "Profile" tab (👤)
- User is NOT authenticated

**What happens:**
- Sign-in drawer slides up from bottom
- User can sign in without leaving current screen
- After sign-in → Drawer closes, user can access protected content

**Protected routes:**
- `notifications` - Requires auth
- `user` - Requires auth

**Public routes:**
- `index` (Home) - No auth required
- `explore` - No auth required

### B. Protected Screen Access

**Files:**
- `apps/mobile/app/(tabs)/notifications.tsx`
- `apps/mobile/app/(tabs)/user.tsx`

**When it triggers:**
- User navigates directly to notifications/profile screen
- User is NOT authenticated

**What happens:**
- Sign-in drawer automatically appears
- Screen shows empty state: "Sign in required"
- After sign-in → Data loads, drawer closes

---

## Sign-In Drawer Component

**Location:** `apps/mobile/components/SignInDrawer.tsx`

**Features:**
- ✅ Slides up from bottom (iOS-style)
- ✅ Blur backdrop (iOS) or semi-transparent (Android)
- ✅ Full signer flow integration
- ✅ Loading states for each step
- ✅ Error handling with retry
- ✅ Success animation

**Usage:**
```typescript
import { SignInDrawer } from '../components/SignInDrawer';

function MyComponent() {
  const [showSignIn, setShowSignIn] = useState(false);
  
  return (
    <>
      <TouchableOpacity onPress={() => setShowSignIn(true)}>
        <Text>Sign In</Text>
      </TouchableOpacity>
      
      <SignInDrawer
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSuccess={() => {
          setShowSignIn(false);
          // Refresh auth state, navigate, etc.
        }}
      />
    </>
  );
}
```

---

## Auth Hook

**Location:** `apps/mobile/hooks/useAuth.ts`

**Features:**
- Checks if user has active signer
- Returns signer data (including FID)
- Provides loading state
- Can refetch auth state

**Usage:**
```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, signer, isLoading, refetch } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <SignInPrompt />;
  
  return <Content fid={signer?.fid} />;
}
```

**Returns:**
- `isAuthenticated: boolean | null` - Auth status (null = loading)
- `signer: StoredSigner | null` - Signer data including FID
- `isLoading: boolean` - Loading state
- `refetch: () => Promise<void>` - Refresh auth state

---

## Complete Flow Example

### Scenario: User Taps Notifications Tab

1. **Tab Bar** (`LiquidGlassTabBar.tsx`)
   - Checks `isAuthenticated` from `useAuth()`
   - If false → Opens `SignInDrawer`
   - If true → Navigates to notifications screen

2. **Notifications Screen** (`notifications.tsx`)
   - Checks `isAuthenticated` on mount
   - If false → Shows `SignInDrawer` automatically
   - Uses `signer?.fid` for API calls (or `DEFAULT_FID` if not authenticated)

3. **Sign-In Drawer** (`SignInDrawer.tsx`)
   - User clicks "Sign in with Farcaster"
   - Generates keypair → Creates request → Opens Farcaster app
   - Polls for approval → Stores signer → Closes drawer

4. **After Sign-In**
   - `onSuccess` callback fires
   - `refetchAuth()` updates auth state
   - Screen automatically loads user's notifications

---

## Testing the Flow

### Test Onboarding Flow
```bash
# Clear app data or reinstall
# Open app → Should see onboarding screen
# Click "Connect Farcaster" → Should start flow
```

### Test Protected Route Flow
```bash
# Ensure you're NOT signed in
# Tap "Notifications" or "Profile" tab
# Sign-in drawer should appear
# Complete sign-in → Should access protected content
```

### Test Direct Navigation
```bash
# Ensure you're NOT signed in  
# Navigate directly to /notifications or /user
# Sign-in drawer should appear automatically
```

---

## Code Locations

### Components
- **SignInDrawer:** `apps/mobile/components/SignInDrawer.tsx`
- **TabBar:** `apps/mobile/components/LiquidGlassTabBar.tsx`

### Hooks
- **useAuth:** `apps/mobile/hooks/useAuth.ts`

### Screens
- **Onboarding:** `apps/mobile/app/index.tsx`
- **Notifications:** `apps/mobile/app/(tabs)/notifications.tsx`
- **Profile:** `apps/mobile/app/(tabs)/user.tsx`

### Signer Functions
- **All signer logic:** `apps/mobile/lib/farcaster/signer.ts`

---

## Summary

✅ **Onboarding:** First-time users see full-screen onboarding  
✅ **Protected Routes:** Sign-in drawer appears when accessing protected content  
✅ **Tab Bar:** Prevents navigation to protected tabs, shows drawer instead  
✅ **Auto-Detection:** Screens automatically show drawer if not authenticated  
✅ **Seamless UX:** User can sign in without leaving current context  

The signer flow is now fully integrated throughout the mobile app! 🎉

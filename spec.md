# PayCollect - User Dashboard with Firebase Auth

## Current State
- App has a PaymentForm (/) for guest users to make payments
- PaymentSuccess (/payment-success) and PaymentFailed (/payment-failed) pages
- AdminDashboard (/admin) with Internet Identity login showing all payments
- Backend has createCashfreeOrder, getAllPayments, getFilteredPayments, getPaymentStatus APIs

## Requested Changes (Diff)

### Add
- Firebase authentication (email/password) - Login and Signup screens
- User Dashboard page (/dashboard) showing:
  - Logged-in user's name
  - Total amount added (sum of their SUCCESS transactions)
  - Full transaction history (filtered by user's email)
  - "Add Money" button to open a Cashfree payment flow
- Firebase context/provider for auth state management
- Protected route: redirect to /login if not authenticated

### Modify
- App.tsx: Replace AdminDashboard route with Login (/login) and Dashboard (/dashboard) routes
- PaymentForm: Reuse the Cashfree order creation but trigger from Add Money modal inside dashboard
- PaymentSuccess: After success redirect back to /dashboard instead of home
- Root route (/) redirects to /dashboard if logged in, else /login

### Remove
- AdminDashboard page and /admin route
- Admin link from PaymentForm footer

## Implementation Plan
1. Install firebase package
2. Create src/firebase.ts with Firebase config and auth initialization
3. Create src/context/AuthContext.tsx with Firebase auth state
4. Create src/pages/Login.tsx (email/password login + signup toggle)
5. Create src/pages/Dashboard.tsx showing user name, balance, transactions, Add Money button
6. Create src/components/AddMoneyModal.tsx reusing Cashfree order creation
7. Update App.tsx routing - remove admin, add login+dashboard routes
8. Update PaymentSuccess to redirect to /dashboard
9. Remove AdminDashboard.tsx references

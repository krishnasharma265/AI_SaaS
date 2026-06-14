# Lumina — Frontend

React + Vite frontend for the Lumina AI chat API.

## Setup

```bash
cd lumina-frontend
npm install
cp .env.example .env     # edit VITE_API_URL if needed
npm run dev              # starts at http://localhost:5173
```

## Structure

```
src/
├── api/
│   └── client.js          # Axios instance + all API calls
├── hooks/
│   └── useAuth.jsx        # Auth context (user, logout, loading)
├── components/
│   ├── UI.jsx             # Logo, Spinner, Avatar, Toast, TypingDots
│   ├── Sidebar.jsx        # Session list + nav
│   ├── ChatWindow.jsx     # Message thread + input
│   └── NewChatModal.jsx   # Create session modal
├── pages/
│   ├── AuthPage.jsx       # Login + signup (split-panel layout)
│   ├── ChatPage.jsx       # Main shell — sidebar + chat
│   ├── PlansPage.jsx      # Pricing / Razorpay upgrade
│   └── SettingsPage.jsx   # Email + password update
├── styles/
│   └── global.css         # CSS variables + base resets
└── App.jsx                # BrowserRouter + protected routes
```

## API endpoints used

| Method | Path | Page |
|--------|------|------|
| POST | /auth/login | AuthPage |
| POST | /auth/signup | AuthPage |
| GET | /users/me | Auth context |
| PATCH | /users/me | SettingsPage |
| GET | /chat/sessions | ChatPage |
| POST | /chat/sessions?title= | NewChatModal |
| DELETE | /chat/sessions/:id | Sidebar |
| GET | /chat/sessions/:id/messages | ChatWindow |
| POST | /ai/chat/:sessionId | ChatWindow |
| POST | /payment/create-order | PlansPage |

## Connecting Razorpay

In `PlansPage.jsx`, replace the `alert()` in `handleUpgrade()` with:

```js
const { data } = await createOrder(plan.id);
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY,
  order_id: data.order_id,
  amount: data.amount,
  currency: "INR",
  name: "Lumina",
  description: `${plan.name} Plan`,
  handler: (response) => {
    // POST /payment/verify with response data
  },
};
new window.Razorpay(options).open();
```

Add `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>` to `index.html`.

## Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the build locally
```

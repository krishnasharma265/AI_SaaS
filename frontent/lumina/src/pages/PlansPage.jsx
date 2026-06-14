import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo, Toast, Spinner } from "../components/UI";
import { useAuth } from "../hooks/useAuth";
import { createOrder } from "../api/client";
import client from "../api/client";

// Plan IDs must match the integer PKs in your Plans table
// Update these to match what's in your DB (check GET /plans if you add that route)
const PLANS = [
  {
    dbId: null, // Free — no payment needed
    name: "Free",
    price: null,
    tagline: "Get started for nothing",
    limit: "100 messages / day",
    features: [
      "LLaMA 3.3 70B model",
      "Unlimited chat sessions",
      "Full message history",
      "Response caching",
    ],
    cta: "Your current plan",
    ctaDisabled: true,
  },
  {
    dbId: 2, // PK of "pro" row in Plans table
    name: "Pro",
    price: 299,
    tagline: "For daily power users",
    limit: "1,000 messages / day",
    features: [
      "Everything in Free",
      "10× higher daily quota",
      "Priority response queue",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    dbId: 3, // PK of "enterprise" row in Plans table
    name: "Enterprise",
    price: 499,
    tagline: "Built for teams",
    limit: "10,000 messages / day",
    features: [
      "Everything in Pro",
      "100× daily quota",
      "Dedicated account support",
      "SLA & uptime guarantee",
    ],
    cta: "Upgrade to Enterprise",
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PlansPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [toast, setToast] = useState(null);
  const [successPlan, setSuccessPlan] = useState(null);

  async function handleUpgrade(plan) {
    if (!plan.dbId) return;

    setLoadingPlanId(plan.dbId);
    setToast(null);

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setToast({ type: "error", message: "Could not load Razorpay. Check your internet connection." });
        return;
      }

      // 2. Create order on backend → POST /payment/create-order?plan_id=1
      const { data: order } = await createOrder(plan.dbId);

      // 3. Open Razorpay checkout modal
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        setToast({ type: "error", message: "Razorpay key not set. Add VITE_RAZORPAY_KEY_ID to your .env file." });
        return;
      }

      const options = {
        key: rzpKey,
        amount: order.amount,         // in paise, as returned by backend
        currency: order.currency || "INR",
        name: "Lumina",
        description: `${plan.name} Plan — ₹${plan.price}/month`,
        order_id: order.id,           // Razorpay order ID from backend
        prefill: {
          email: user?.email || "",
        },
        theme: { color: "#6366f1" },

        handler: async function (response) {
          // 4. Verify signature on backend → POST /payment/verify
          try {
            await client.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccessPlan(plan.name);
            setToast({ type: "success", message: `🎉 You're now on the ${plan.name} plan!` });
          } catch (err) {
            setToast({
              type: "error",
              message: err.response?.data?.detail || "Payment verification failed. Contact support.",
            });
          }
        },

        modal: {
          ondismiss: () => {
            setToast({ type: "info", message: "Payment cancelled." });
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setToast({
          type: "error",
          message: `Payment failed: ${response.error?.description || "Unknown error"}`,
        });
      });

      rzp.open();

    } catch (err) {
      const detail = err.response?.data?.detail;
      setToast({ type: "error", message: detail || "Could not initiate payment. Try again." });
    } finally {
      setLoadingPlanId(null);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <Logo />
        <button style={s.backBtn} onClick={() => navigate("/")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to chat
        </button>
      </div>

      <div style={s.hero}>
        <p style={s.eyebrow}>Pricing</p>
        <h1 style={s.heroTitle}>Simple, honest pricing</h1>
        <p style={s.heroSub}>
          Start free and scale as you grow. No hidden fees, no auto-renew tricks.
        </p>
      </div>

      <div style={s.grid}>
        {PLANS.map((plan) => {
          const isLoading = loadingPlanId === plan.dbId;
          const isSuccess = successPlan === plan.name;
          return (
            <div
              key={plan.name}
              style={{
                ...s.card,
                ...(plan.highlight ? s.cardHighlight : {}),
                ...(isSuccess ? s.cardSuccess : {}),
              }}
            >
              {plan.highlight && !isSuccess && (
                <div style={s.popularBadge}>Most popular</div>
              )}
              {isSuccess && (
                <div style={{ ...s.popularBadge, background: "var(--green)" }}>✓ Active</div>
              )}

              <div style={s.cardTop}>
                <h2 style={s.planName}>{plan.name}</h2>
                <p style={s.planTagline}>{plan.tagline}</p>

                <div style={s.priceRow}>
                  {plan.price == null ? (
                    <span style={s.priceNum}>Free</span>
                  ) : (
                    <>
                      <span style={s.priceCurr}>₹</span>
                      <span style={s.priceNum}>{plan.price.toLocaleString("en-IN")}</span>
                      <span style={s.pricePer}>/mo</span>
                    </>
                  )}
                </div>

                <div style={s.limitBadge}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {plan.limit}
                </div>
              </div>

              <ul style={s.featureList}>
                {plan.features.map((f) => (
                  <li key={f} style={s.featureItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                style={{
                  ...s.cta,
                  ...(plan.highlight ? s.ctaHighlight : {}),
                  ...(plan.ctaDisabled || isSuccess ? s.ctaDisabled : {}),
                  ...(isLoading ? { opacity: 0.7 } : {}),
                }}
                onClick={() => !plan.ctaDisabled && !isSuccess && handleUpgrade(plan)}
                disabled={plan.ctaDisabled || isLoading || isSuccess}
              >
                {isLoading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Spinner size={14} color={plan.highlight ? "#fff" : "var(--indigo)"} />
                    Processing…
                  </span>
                ) : isSuccess ? (
                  "✓ Subscribed"
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Setup instructions if env var missing */}
      {!import.meta.env.VITE_RAZORPAY_KEY_ID && (
        <div style={s.setupNote}>
          <strong>Developer note:</strong> Add your Razorpay key to <code>.env</code>:
          <pre style={s.pre}>VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx</pre>
          Also make sure plan IDs in <code>PlansPage.jsx</code> match your database rows.
        </div>
      )}

      <p style={s.footer}>
        All prices in Indian Rupees (INR) · Payments processed securely via Razorpay · Cancel anytime
      </p>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-base)",
    padding: "0 24px 60px",
    fontFamily: "var(--font-body)",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 0",
    maxWidth: 900,
    margin: "0 auto",
    borderBottom: "1px solid var(--border)",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "var(--text-secondary)",
    fontSize: 13,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  },
  hero: {
    textAlign: "center",
    padding: "56px 0 48px",
    maxWidth: 560,
    margin: "0 auto",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "var(--indigo-light)",
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 40,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 15,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
    maxWidth: 900,
    margin: "0 auto",
  },
  card: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-xl)",
    padding: "28px 24px 24px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  cardHighlight: {
    border: "1.5px solid var(--indigo)",
    background: "var(--bg-raised)",
  },
  cardSuccess: {
    border: "1.5px solid var(--green)",
  },
  popularBadge: {
    position: "absolute",
    top: -13,
    left: "50%",
    transform: "translateX(-50%)",
    background: "var(--indigo)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 16px",
    borderRadius: 20,
    whiteSpace: "nowrap",
    letterSpacing: "0.3px",
  },
  cardTop: { marginBottom: 24 },
  planName: {
    fontFamily: "var(--font-display)",
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: 4,
  },
  planTagline: {
    fontSize: 13,
    color: "var(--text-secondary)",
    marginBottom: 18,
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 2,
    marginBottom: 14,
  },
  priceCurr: { fontSize: 16, color: "var(--text-secondary)", marginRight: 2 },
  priceNum: {
    fontFamily: "var(--font-display)",
    fontSize: 36,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
  },
  pricePer: { fontSize: 13, color: "var(--text-muted)", marginLeft: 4 },
  limitBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color: "var(--indigo-light)",
    background: "var(--indigo-dim)",
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid var(--indigo-dim-border)",
  },
  featureList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
    marginBottom: 24,
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  cta: {
    width: "100%",
    padding: "11px",
    background: "none",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity 0.15s",
    fontFamily: "var(--font-body)",
  },
  ctaHighlight: {
    background: "var(--indigo)",
    border: "none",
    color: "#fff",
    fontWeight: 600,
  },
  ctaDisabled: { opacity: 0.45, cursor: "default" },
  setupNote: {
    maxWidth: 900,
    margin: "32px auto 0",
    padding: "16px 20px",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: "var(--radius-md)",
    fontSize: 13,
    color: "var(--text-secondary)",
    lineHeight: 1.7,
  },
  pre: {
    marginTop: 8,
    padding: "8px 12px",
    background: "var(--bg-base)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    color: "var(--indigo-light)",
  },
  footer: {
    marginTop: 48,
    textAlign: "center",
    fontSize: 12,
    color: "var(--text-muted)",
  },
};

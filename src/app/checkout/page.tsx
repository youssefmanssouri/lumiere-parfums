"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, ArrowLeft, AlertCircle } from "lucide-react";

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  general?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, loading, clearCart } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (!form.address.trim() || form.address.trim().length < 5) {
      errs.address = "Please enter a valid delivery street address.";
    }

    if (!form.city.trim() || form.city.trim().length < 2) {
      errs.city = "Please enter your city.";
    }

    if (!form.state.trim() || form.state.trim().length < 2) {
      errs.state = "Please enter your state or province.";
    }

    if (!form.zip.trim() || form.zip.trim().length < 4) {
      errs.zip = "Please enter a valid postal code.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "Order placement failed. Please verify your details and try again." });
        setSubmitting(false);
        return;
      }

      // Store minimal client-facing receipt details for the confirmation page & account history
      try {
        sessionStorage.setItem("recent_order", JSON.stringify(data.data.order));
        const existing = JSON.parse(localStorage.getItem("lumiere_customer_orders") || "[]");
        const filtered = Array.isArray(existing) ? existing.filter((o: { orderNumber?: string }) => o.orderNumber !== data.data.order.orderNumber) : [];
        const updated = [data.data.order, ...filtered];
        localStorage.setItem("lumiere_customer_orders", JSON.stringify(updated.slice(0, 20)));
      } catch {
        /* storage may be disabled in private mode */
      }

      await clearCart();
      router.push(`/order-confirmation?order=${encodeURIComponent(data.data.order.orderNumber)}`);
    } catch {
      setErrors({ general: "Network error during checkout. Please check your connection and try again." });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-muted">
        Loading checkout details...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-display font-light text-charcoal mb-4">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-muted mb-8">
          Add fragrances to your bag before proceeding to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="flex items-center gap-2 mb-8 text-xs tracking-widest uppercase text-muted">
        <Link href="/cart" className="hover:text-gold flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Bag
        </Link>
      </div>

      <h1 className="text-4xl font-display font-light text-charcoal mb-8">
        Secure Checkout
      </h1>

      {/* Demo Notice Banner */}
      <div className="mb-8 p-4 bg-cream border border-gold/30 rounded-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <div className="text-xs text-charcoal leading-relaxed">
          <p className="font-semibold text-charcoal mb-0.5">
            Lumière Parfums Portfolio Demonstration Store
          </p>
          <p className="text-charcoal/80">
            This boutique operates in demonstration mode. No real credit card or payment transaction will be charged.
            Orders placed will be processed as verified demo transactions with instantaneous confirmation.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-8" noValidate>
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Section 1: Customer & Shipping Information */}
          <div className="bg-white p-6 border border-charcoal/10 rounded-sm space-y-4">
            <h2 className="font-display text-xl text-charcoal font-medium border-b border-charcoal/10 pb-3">
              1. Delivery Address
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="checkout-name" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  name="name"
                  autoComplete="name"
                  required
                  type="text"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g. Jean-Luc Dupont"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.name ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.name && <p id="name-error" className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-email" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  name="email"
                  autoComplete="email"
                  required
                  type="email"
                  value={form.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="jeanluc@example.com"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.email ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.email && <p id="email-error" className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="checkout-address" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  Street Address *
                </label>
                <input
                  id="checkout-address"
                  name="address"
                  autoComplete="street-address"
                  required
                  type="text"
                  value={form.address}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: undefined });
                  }}
                  placeholder="e.g. 124 Avenue des Champs-Élysées"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.address ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.address && <p id="address-error" className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="checkout-city" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  City *
                </label>
                <input
                  id="checkout-city"
                  name="city"
                  autoComplete="address-level2"
                  required
                  type="text"
                  value={form.city}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={errors.city ? "city-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, city: e.target.value });
                    if (errors.city) setErrors({ ...errors, city: undefined });
                  }}
                  placeholder="Paris"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.city ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.city && <p id="city-error" className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label htmlFor="checkout-state" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  State / Province *
                </label>
                <input
                  id="checkout-state"
                  name="state"
                  autoComplete="address-level1"
                  required
                  type="text"
                  value={form.state}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, state: e.target.value });
                    if (errors.state) setErrors({ ...errors, state: undefined });
                  }}
                  placeholder="Île-de-France"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.state ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.state && <p id="state-error" className="text-[11px] text-red-600 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label htmlFor="checkout-zip" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  Postal Code *
                </label>
                <input
                  id="checkout-zip"
                  name="zip"
                  autoComplete="postal-code"
                  required
                  type="text"
                  value={form.zip}
                  aria-invalid={Boolean(errors.zip)}
                  aria-describedby={errors.zip ? "zip-error" : undefined}
                  onChange={(e) => {
                    setForm({ ...form, zip: e.target.value });
                    if (errors.zip) setErrors({ ...errors, zip: undefined });
                  }}
                  placeholder="75008"
                  className={`w-full px-3.5 py-2.5 border text-sm rounded-sm focus:outline-none transition-colors ${
                    errors.zip ? "border-red-400 focus:border-red-500" : "border-charcoal/15 focus:border-gold"
                  }`}
                />
                {errors.zip && <p id="zip-error" className="text-[11px] text-red-600 mt-1">{errors.zip}</p>}
              </div>

              <div>
                <label htmlFor="checkout-country" className="block text-[11px] tracking-widest uppercase text-muted mb-1.5 font-medium">
                  Country
                </label>
                <input
                  id="checkout-country"
                  name="country"
                  autoComplete="country-name"
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-charcoal/15 bg-cream/40 text-sm rounded-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Demo Payment Method */}
          <div className="bg-white p-6 border border-charcoal/10 rounded-sm space-y-4">
            <h2 className="font-display text-xl text-charcoal font-medium border-b border-charcoal/10 pb-3">
              2. Payment Method
            </h2>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === "cod" ? "border-gold bg-gold/5" : "border-charcoal/10 hover:border-gold/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gold" />
                    <span className="font-semibold text-charcoal text-sm">
                      Cash on Delivery (Pay on Arrival)
                    </span>
                  </div>
                  <p className="text-muted mt-1 leading-relaxed">
                    Complimentary white-glove fragrance delivery. Settle by cash or courier terminal upon handover.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${
                  paymentMethod === "demo_card" ? "border-gold bg-gold/5" : "border-charcoal/10 hover:border-gold/40"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="demo_card"
                  checked={paymentMethod === "demo_card"}
                  onChange={() => setPaymentMethod("demo_card")}
                  className="mt-1 accent-gold"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gold" />
                    <span className="font-semibold text-charcoal text-sm">
                      Instant Demo Order (Portfolio Authorization)
                    </span>
                  </div>
                  <p className="text-muted mt-1 leading-relaxed">
                    Test the complete automated fulfillment and CRM pipeline without entering credit card details.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-charcoal hover:bg-gold text-white py-4 text-xs tracking-widest uppercase transition-colors disabled:opacity-50 font-medium shadow-sm"
          >
            {submitting ? "Placing Your Order..." : `Confirm & Place Demo Order — ${formatPrice(totals.total)}`}
          </button>
        </form>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-charcoal/10 p-6 rounded-sm sticky top-28 space-y-6">
            <h2 className="font-display text-2xl text-charcoal">Order Summary</h2>

            <div className="divide-y divide-charcoal/10 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 items-center">
                  <div className="relative w-14 h-16 bg-cream shrink-0 rounded-sm overflow-hidden border border-charcoal/5">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-[10px] tracking-wider uppercase text-muted truncate">
                      {item.product.brand}
                    </p>
                    <p className="font-medium text-charcoal truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gold">
                      {item.product.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-charcoal shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal/10 pt-4 space-y-2 text-xs text-charcoal/80">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Luxury Shipping</span>
                <span>{totals.shipping === 0 ? "Complimentary" : formatPrice(totals.shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Estimated Tax</span>
                <span>{formatPrice(totals.tax)}</span>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-3 text-sm font-semibold text-charcoal">
                <span>Total Due</span>
                <span className="text-base font-display">{formatPrice(totals.total)}</span>
              </div>
            </div>

            <div className="text-[11px] text-muted space-y-1 bg-ivory p-3 rounded-sm border border-charcoal/5">
              <p>✔ Authenticity & Batch Verification</p>
              <p>✔ Dispatched in signature luxury packaging</p>
              <p>✔ 30-day complimentary return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

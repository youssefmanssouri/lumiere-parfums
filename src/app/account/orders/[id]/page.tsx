"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";

interface OrderItem {
  id?: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
}

interface OrderDetail {
  id?: string;
  orderNumber: string;
  createdAt?: string;
  status: string;
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: OrderItem[];
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/account/orders/${encodeURIComponent(orderId)}`);
      return;
    }

    if (user && orderId) {
      setLoading(true);
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success && data.data?.order) {
            setOrder(data.data.order);
            setError(null);
          } else {
            // Check client-side stored demo orders if DB is unavailable or demo order was placed
            try {
              const localRaw = localStorage.getItem("lumiere_customer_orders");
              const sessionRaw = sessionStorage.getItem("recent_order");
              let found: OrderDetail | null = null;

              if (localRaw) {
                const list = JSON.parse(localRaw);
                found = list.find(
                  (o: OrderDetail) => o.orderNumber === orderId || o.id === orderId
                );
              }
              if (!found && sessionRaw) {
                const parsed = JSON.parse(sessionRaw);
                if (parsed.orderNumber === orderId || parsed.id === orderId) {
                  found = parsed;
                }
              }

              if (found) {
                setOrder(found);
                setError(null);
              } else {
                setError(data.error || "Order not found or you are not authorized to view it.");
              }
            } catch {
              setError(data.error || "Order not found.");
            }
          }
        })
        .catch(() => {
          // Fallback to local storage on network/server errors
          try {
            const localRaw = localStorage.getItem("lumiere_customer_orders");
            if (localRaw) {
              const list = JSON.parse(localRaw);
              const found = list.find(
                (o: OrderDetail) => o.orderNumber === orderId || o.id === orderId
              );
              if (found) {
                setOrder(found);
                setError(null);
                setLoading(false);
                return;
              }
            }
          } catch {
            /* ignore */
          }
          setError("Failed to load order details.");
        })
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, orderId, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-muted" />
        </div>
        <h1 className="text-3xl font-display font-light text-charcoal mb-4">
          Order Not Accessible
        </h1>
        <p className="text-xs text-muted leading-relaxed mb-8 max-w-md mx-auto">
          {error || "We could not find the requested order in your account."}
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors font-medium rounded-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Account
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "shipped":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-800 border-red-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Account
        </Link>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-charcoal/10 rounded-sm p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] tracking-widest uppercase text-gold font-semibold block mb-1">
            Order Reference
          </span>
          <h1 className="text-3xl font-display text-charcoal font-medium">
            #{order.orderNumber}
          </h1>
          <p className="text-xs text-muted mt-1">
            Placed on {order.createdAt ? formatDate(order.createdAt) : "Today"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border uppercase tracking-wider ${getStatusBadge(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white border border-charcoal/10 rounded-sm p-6 mb-8">
        <h2 className="font-display text-xl text-charcoal mb-4 border-b border-charcoal/10 pb-3">
          Fragrances Ordered
        </h2>

        <div className="divide-y divide-charcoal/10">
          {order.items.map((item, idx) => (
            <div key={item.id || idx} className="py-4 flex gap-4 items-center">
              <div className="relative w-16 h-20 bg-cream shrink-0 rounded-sm overflow-hidden border border-charcoal/5">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                {item.brand && (
                  <p className="text-[10px] tracking-wider uppercase text-muted truncate">
                    {item.brand}
                  </p>
                )}
                <p className="font-medium text-sm text-charcoal">{item.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {item.size ? `${item.size} · ` : ""}Qty: {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>

              <div className="text-sm font-semibold text-charcoal shrink-0">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="border-t border-charcoal/10 mt-6 pt-4 space-y-2 text-xs text-charcoal/80">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Luxury Shipping</span>
            <span className="font-medium">
              {order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Estimated Tax</span>
            <span className="font-medium">{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-charcoal/10 pt-3 text-base font-semibold text-charcoal">
            <span>Total</span>
            <span className="font-display text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery & Payment Information */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border border-charcoal/10 rounded-sm p-6">
          <div className="flex items-center gap-2 mb-3 text-charcoal font-medium text-sm">
            <MapPin className="w-4 h-4 text-gold" />
            <span>Delivery Information</span>
          </div>
          <p className="text-xs font-semibold text-charcoal">{order.name || user?.name || "Recipient"}</p>
          <p className="text-xs text-muted leading-relaxed mt-1">
            {order.address ? (
              <>
                {order.address}
                <br />
                {order.city}, {order.state} {order.zip}
                <br />
                {order.country || "US"}
              </>
            ) : (
              "Verified delivery address on file"
            )}
          </p>
          <p className="text-xs text-muted mt-2">Email: {order.email || user?.email || "On file"}</p>
        </div>

        <div className="bg-white border border-charcoal/10 rounded-sm p-6">
          <div className="flex items-center gap-2 mb-3 text-charcoal font-medium text-sm">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Order Fulfillment Status</span>
          </div>
          <p className="text-xs font-semibold text-charcoal capitalize">
            Status: {order.status}
          </p>
          <p className="text-xs text-muted leading-relaxed mt-1">
            Dispatched via signature white-glove courier in temperature-controlled luxury packaging.
          </p>
          <div className="mt-4 pt-3 border-t border-charcoal/5 flex items-center gap-2 text-xs text-gold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Authenticity & Quality Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

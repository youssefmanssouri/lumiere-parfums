"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import { LogOut, Package, Shield, User as UserIcon, ArrowRight, CheckCircle2 } from "lucide-react";

interface OrderItem {
  id?: string;
  name: string;
  brand?: string;
  quantity: number;
  price?: number;
  size?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setOrdersLoading(true);
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          let serverOrders: Order[] = [];
          if (data.success && Array.isArray(data.data.orders)) {
            serverOrders = data.data.orders;
          }

          // Check if local demo orders exist (e.g. from checkout in demo mode)
          try {
            const localRaw = localStorage.getItem("lumiere_customer_orders");
            if (localRaw) {
              const localList = JSON.parse(localRaw);
              if (Array.isArray(localList)) {
                // Merge by orderNumber to avoid duplicates
                const serverNumbers = new Set(serverOrders.map((o) => o.orderNumber));
                const filteredLocal = localList
                  .filter((lo: Order) => !serverNumbers.has(lo.orderNumber))
                  .map((lo: Order, idx: number) => ({
                    id: lo.id || `demo-${idx}`,
                    orderNumber: lo.orderNumber,
                    status: lo.status || "confirmed",
                    total: lo.total || 0,
                    createdAt: lo.createdAt || new Date().toISOString(),
                    items: lo.items || [],
                  }));
                setOrders([...serverOrders, ...filteredLocal]);
                return;
              }
            }
          } catch {
            /* ignore storage read */
          }

          setOrders(serverOrders);
        })
        .catch(() => {
          // If server fetch fails, load from client storage
          try {
            const localRaw = localStorage.getItem("lumiere_customer_orders");
            if (localRaw) {
              const localList = JSON.parse(localRaw);
              if (Array.isArray(localList)) {
                setOrders(localList);
              }
            }
          } catch {
            /* ignore */
          }
        })
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  if (loading || !user) {
    return <div className="py-20 text-center text-muted">Loading account...</div>;
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Account Profile Header */}
      <div className="bg-white border border-charcoal/10 rounded-sm p-6 lg:p-8 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cream border border-gold/30 flex items-center justify-center text-gold shrink-0">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-display text-charcoal font-medium">
                {user.name || "Fragrance Connoisseur"}
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] tracking-wider uppercase bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-muted">{user.email}</p>
            <p className="text-[11px] text-charcoal/60 mt-1 uppercase tracking-widest">
              Account Role: <span className="font-semibold text-charcoal">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-charcoal text-white hover:bg-gold px-5 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          )}

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 border border-charcoal/20 text-charcoal hover:border-gold hover:text-gold px-5 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Order History Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-charcoal flex items-center gap-2.5">
          <Package className="w-6 h-6 text-gold" />
          Order History
        </h2>
        <span className="text-xs text-muted">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </span>
      </div>

      {ordersLoading ? (
        <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm text-muted text-xs">
          Loading order history...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-charcoal/10 rounded-sm p-8 shadow-xs">
          <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4 text-muted">
            <Package className="w-8 h-8 text-gold/60" />
          </div>
          <h3 className="font-display text-xl text-charcoal mb-2">No Orders Placed Yet</h3>
          <p className="text-xs text-muted mb-6 max-w-sm mx-auto leading-relaxed">
            Your personal fragrance wardrobe is waiting to be curated. Explore our selection of world-class perfumes.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors font-medium rounded-sm"
          >
            Explore Fragrances
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            return (
              <div
                key={order.id || order.orderNumber}
                className="bg-white border border-charcoal/10 rounded-sm p-6 hover:border-gold/40 transition-colors shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal/5 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] tracking-widest uppercase text-muted block">
                      Order Reference
                    </span>
                    <span className="font-display text-lg text-charcoal font-medium">
                      #{order.orderNumber}
                    </span>
                    <span className="text-xs text-muted block mt-0.5">
                      {order.createdAt ? formatDate(order.createdAt) : "Recent"}
                    </span>
                  </div>

                  <div className="flex items-center sm:text-right gap-4 justify-between sm:justify-end">
                    <div>
                      <span className="text-[10px] tracking-widest uppercase text-muted block">
                        Order Total
                      </span>
                      <span className="font-semibold text-charcoal text-base">
                        {formatPrice(order.total)}
                      </span>
                      <span className="text-xs text-muted block">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items Summary Preview */}
                <div className="text-xs text-muted space-y-1 mb-5">
                  {order.items.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-charcoal truncate max-w-md">
                        {item.brand ? `${item.brand} ` : ""}
                        {item.name}
                        {item.size ? ` (${item.size})` : ""}
                      </span>
                      <span className="text-muted ml-2 shrink-0">× {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-[11px] text-gold italic">
                      + {order.items.length - 3} more fragrance items
                    </p>
                  )}
                </div>

                <div className="border-t border-charcoal/5 pt-3 flex justify-end">
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.orderNumber || order.id)}`}
                    className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-charcoal hover:text-gold font-medium transition-colors"
                  >
                    View Order Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

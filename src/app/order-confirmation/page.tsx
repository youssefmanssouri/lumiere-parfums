"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Home, ShieldCheck, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StoredOrderItem {
  name: string;
  brand?: string;
  quantity: number;
  price: number;
  image?: string;
}

interface StoredOrder {
  orderNumber: string;
  email?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  items?: StoredOrderItem[];
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [orderDetails, setOrderDetails] = useState<StoredOrder | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    try {
      const raw = sessionStorage.getItem("recent_order");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.orderNumber === orderNumber) {
          setOrderDetails(parsed);
        }
      }
    } catch {
      /* ignore storage read error */
    }
  }, [orderNumber]);

  if (!orderNumber) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-muted" />
        </div>
        <h1 className="text-3xl font-display font-light text-charcoal mb-4">
          No Order Reference Found
        </h1>
        <p className="text-xs text-muted leading-relaxed mb-8 max-w-md mx-auto">
          We could not locate an active order reference for this session. If you recently placed an order,
          a confirmation notification was dispatched to your email address, or you can check your orders in your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="bg-charcoal text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors font-medium rounded-sm"
          >
            Explore Fragrances
          </Link>
          <Link
            href="/account"
            className="border border-charcoal/20 px-8 py-3 text-xs tracking-widest uppercase hover:border-gold hover:text-gold transition-colors font-medium rounded-sm"
          >
            My Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gold/10 rounded-full mb-4">
          <CheckCircle className="w-9 h-9 text-gold" />
        </div>
        <p className="text-gold tracking-[0.3em] uppercase text-xs font-semibold mb-2">
          Order Confirmed
        </p>
        <h1 className="text-4xl lg:text-5xl font-display font-light text-charcoal mb-3">
          Thank You for Your Order
        </h1>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          Your luxury fragrance order has been received and verified. Our perfumers are preparing your shipment with care.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white border border-charcoal/10 rounded-sm shadow-xs overflow-hidden mb-8">
        <div className="bg-cream/60 px-6 py-4 border-b border-charcoal/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-muted block">
              Reference Number
            </span>
            <span className="font-mono text-base font-semibold text-charcoal">
              {orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Confirmed & In Preparation
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Items Summary */}
          {orderDetails?.items && orderDetails.items.length > 0 && (
            <div>
              <h2 className="text-xs tracking-widest uppercase text-muted font-medium mb-3">
                Fragrance Summary
              </h2>
              <div className="divide-y divide-charcoal/5 border border-charcoal/5 rounded-sm p-3 bg-ivory/50">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      {item.brand && (
                        <span className="text-[10px] uppercase tracking-wider text-muted block">
                          {item.brand}
                        </span>
                      )}
                      <span className="font-medium text-charcoal">
                        {item.name}
                      </span>
                      <span className="text-muted ml-2">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals Breakdown */}
          {orderDetails?.total !== undefined && (
            <div className="space-y-1.5 text-xs border-t border-charcoal/10 pt-4">
              {orderDetails.subtotal !== undefined && (
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-charcoal font-medium">{formatPrice(orderDetails.subtotal)}</span>
                </div>
              )}
              {orderDetails.shipping !== undefined && (
                <div className="flex justify-between text-muted">
                  <span>Complimentary Shipping</span>
                  <span className="text-charcoal font-medium">
                    {orderDetails.shipping === 0 ? "Free" : formatPrice(orderDetails.shipping)}
                  </span>
                </div>
              )}
              {orderDetails.tax !== undefined && (
                <div className="flex justify-between text-muted">
                  <span>Estimated Tax</span>
                  <span className="text-charcoal font-medium">{formatPrice(orderDetails.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-charcoal border-t border-charcoal/10 pt-2 mt-2">
                <span>Total Amount</span>
                <span className="text-base font-display">{formatPrice(orderDetails.total)}</span>
              </div>
            </div>
          )}

          {/* Delivery & Method Information */}
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-charcoal/10 text-xs">
            <div className="bg-cream/40 p-3.5 rounded-sm border border-charcoal/5">
              <div className="flex items-center gap-1.5 text-gold font-medium mb-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Delivery Address</span>
              </div>
              <p className="text-charcoal font-medium">{orderDetails?.name || "Recipient"}</p>
              <p className="text-muted leading-relaxed">
                {orderDetails?.address ? (
                  <>
                    {orderDetails.address}
                    <br />
                    {orderDetails.city}, {orderDetails.state} {orderDetails.zip}
                    <br />
                    {orderDetails.country || "US"}
                  </>
                ) : (
                  "Address on file in dispatch system"
                )}
              </p>
            </div>

            <div className="bg-cream/40 p-3.5 rounded-sm border border-charcoal/5">
              <div className="flex items-center gap-1.5 text-gold font-medium mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Payment & Verification</span>
              </div>
              <p className="text-charcoal font-medium">Verified Demo Order</p>
              <p className="text-muted leading-relaxed">
                Handover via White Glove Courier Service. No online card charge processed.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center gap-2 bg-charcoal hover:bg-gold text-white px-8 py-3.5 text-xs tracking-widest uppercase transition-colors font-medium rounded-sm shadow-sm"
        >
          <Home className="w-4 h-4" />
          Return to Storefront
        </Link>
        <Link
          href="/account"
          className="inline-flex items-center justify-center gap-2 border border-charcoal/20 bg-white hover:border-gold hover:text-gold text-charcoal px-8 py-3.5 text-xs tracking-widest uppercase transition-colors font-medium rounded-sm"
        >
          View Account Orders
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted">Loading order confirmation...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

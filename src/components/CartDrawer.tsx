"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartDrawer() {
  const { items, totals, loading, isOpen, closeCart, updateQuantity, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-visibility duration-300 ${
        isOpen ? "visible" : "invisible pointer-events-none delay-300"
      }`}
      aria-modal="true"
      role="dialog"
      aria-label="Shopping Bag Drawer"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-charcoal/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-ivory shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-gold/20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-charcoal/10 bg-ivory">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-display text-xl text-charcoal font-medium">Shopping Bag</h2>
            <span className="text-xs bg-gold/15 text-charcoal font-medium px-2 py-0.5 rounded-full">
              {totals.itemCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-charcoal/70 hover:text-charcoal hover:bg-cream transition-colors rounded-sm"
            aria-label="Close Shopping Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-cream/60 px-6 py-3 border-b border-charcoal/5 text-xs text-charcoal/80">
          {totals.subtotal >= 150 ? (
            <p className="text-emerald-700 font-medium">
              ✨ You qualify for complimentary luxury shipping!
            </p>
          ) : (
            <div>
              <p className="mb-1.5">
                Add <span className="font-semibold text-charcoal">{formatPrice(150 - totals.subtotal)}</span> more for complimentary shipping
              </p>
              <div className="w-full bg-charcoal/10 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gold h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (totals.subtotal / 150) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-charcoal/10">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted">
              Loading bag items...
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center text-muted mb-4">
                <ShoppingBag className="w-8 h-8 text-gold/60" />
              </div>
              <h3 className="font-display text-xl text-charcoal mb-2 font-medium">Your Bag is Empty</h3>
              <p className="text-xs text-muted max-w-xs mb-6 leading-relaxed">
                Explore our curated collection of legendary and niche perfumes.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-gold transition-colors"
              >
                Discover Collection
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <div className="relative w-20 h-24 bg-cream shrink-0 rounded-sm overflow-hidden border border-charcoal/5">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-contain p-1.5"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-muted truncate">
                          {item.product.brand}
                        </p>
                        <Link
                          href={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-display text-base text-charcoal hover:text-gold transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted/60 hover:text-red-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gold font-medium mt-0.5">
                      {item.product.size}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-1">
                    <div className="flex items-center border border-charcoal/15 bg-white rounded-sm">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQuantity(item.id, item.quantity - 1)
                            : removeItem(item.id)
                        }
                        className="p-1.5 hover:bg-cream transition-colors text-charcoal/70"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-charcoal min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                        className="p-1.5 hover:bg-cream transition-colors text-charcoal/70"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-charcoal">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals & action */}
        {items.length > 0 && (
          <div className="border-t border-charcoal/10 px-6 py-5 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-charcoal/80">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-charcoal">{formatPrice(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span>{totals.shipping === 0 ? "Complimentary" : formatPrice(totals.shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-charcoal/5 pt-1.5 text-sm font-semibold text-charcoal">
                <span>Estimated Total</span>
                <span className="text-base font-display">{formatPrice(totals.total)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center gap-2 bg-charcoal hover:bg-gold text-white py-3.5 text-xs tracking-widest uppercase transition-colors font-medium shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full block text-center py-2 text-xs tracking-widest uppercase text-muted hover:text-charcoal transition-colors"
              >
                View Full Bag Details
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

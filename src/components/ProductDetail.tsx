"use client";

import { useState, useMemo } from "react";
import ProductImage from "@/components/ProductImage";
import ProductCard, { Product } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Star, Minus, Plus, ShoppingBag, Check, Sparkles } from "lucide-react";

interface ProductDetailProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    description: string;
    notes: string;
    category: string;
    gender: string;
    concentration: string;
    size: string;
    price: number;
    image: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
  };
  related: Product[];
}

interface VolumeOption {
  size: string;
  price: number;
  label: string;
}

function getVolumeOptions(baseSize: string, basePrice: number): VolumeOption[] {
  // Extract number from size string (e.g. "100ml" -> 100)
  const match = baseSize.match(/(\d+)\s*ml/i);
  const sizeNum = match ? parseInt(match[1], 10) : 100;

  if (sizeNum >= 120) {
    return [
      { size: "75ml", price: Math.round(basePrice * 0.7), label: "75ml Travel Flacon" },
      { size: baseSize, price: basePrice, label: `${baseSize} Signature (Standard)` },
      { size: "200ml", price: Math.round(basePrice * 1.45), label: "200ml Grand Flacon" },
    ];
  }

  if (sizeNum <= 75) {
    return [
      { size: "35ml", price: Math.round(basePrice * 0.65), label: "35ml Discovery Flacon" },
      { size: baseSize, price: basePrice, label: `${baseSize} Signature (Standard)` },
      { size: "200ml", price: Math.round(basePrice * 1.8), label: "200ml Grand Flacon" },
    ];
  }

  // Default 100ml
  return [
    { size: "50ml", price: Math.round(basePrice * 0.65), label: "50ml Petite Flacon" },
    { size: baseSize, price: basePrice, label: `${baseSize} Signature (Standard)` },
    { size: "200ml", price: Math.round(basePrice * 1.6), label: "200ml Grand Flacon" },
  ];
}

function parseOlfactoryPyramid(notesStr: string) {
  const notes = notesStr.split(",").map((s) => s.trim()).filter(Boolean);
  if (notes.length <= 2) {
    return {
      top: notes.slice(0, 1),
      heart: notes.slice(1, 2),
      base: notes.slice(2),
    };
  }
  if (notes.length === 3) {
    return {
      top: [notes[0]],
      heart: [notes[1]],
      base: [notes[2]],
    };
  }
  if (notes.length === 4) {
    return {
      top: [notes[0]],
      heart: [notes[1]],
      base: [notes[2], notes[3]],
    };
  }
  if (notes.length === 5) {
    return {
      top: [notes[0], notes[1]],
      heart: [notes[2]],
      base: [notes[3], notes[4]],
    };
  }
  const third = Math.ceil(notes.length / 3);
  return {
    top: notes.slice(0, third),
    heart: notes.slice(third, third * 2),
    base: notes.slice(third * 2),
  };
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Available bottle volumes
  const volumeOptions = useMemo(
    () => getVolumeOptions(product.size, product.price),
    [product.size, product.price]
  );
  const [selectedVolume, setSelectedVolume] = useState<VolumeOption>(
    volumeOptions.find((v) => v.size === product.size) || volumeOptions[1] || volumeOptions[0]
  );

  // Parsed Olfactory Pyramid
  const pyramid = useMemo(() => parseOlfactoryPyramid(product.notes), [product.notes]);

  const handleAdd = async () => {
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedVolume.size);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Product Image */}
        <div className="relative aspect-square bg-cream rounded-sm overflow-hidden border border-charcoal/5 shadow-sm">
          <ProductImage
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            className="object-contain p-8 lg:p-12"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right: Product Details & Controls */}
        <div className="flex flex-col justify-center">
          <p className="text-gold tracking-[0.3em] uppercase text-xs font-semibold mb-2">
            {product.brand}
          </p>
          <h1 className="text-4xl lg:text-5xl font-display font-light text-charcoal mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-charcoal/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted">
              {product.rating} ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          {/* Price display with reactive volume updating */}
          <div className="flex items-baseline gap-3 mb-6">
            <p className="text-3xl font-medium text-charcoal font-display">
              {formatPrice(selectedVolume.price)}
            </p>
            {selectedVolume.size !== product.size && (
              <span className="text-xs text-muted uppercase tracking-wider">
                ({selectedVolume.size} flacon)
              </span>
            )}
          </div>

          {/* Volume Selection Controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-widest uppercase text-muted font-medium">
                Bottle Volume
              </span>
              <span className="text-xs text-gold font-medium">
                Selected: {selectedVolume.size}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {volumeOptions.map((opt) => {
                const isSelected = selectedVolume.size === opt.size;
                return (
                  <button
                    key={opt.size}
                    type="button"
                    onClick={() => setSelectedVolume(opt)}
                    className={`py-3 px-3 text-center border transition-all rounded-sm text-xs ${
                      isSelected
                        ? "border-gold bg-gold/10 text-charcoal font-semibold shadow-xs"
                        : "border-charcoal/15 bg-white text-charcoal/70 hover:border-gold/40 hover:text-charcoal"
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.size}</div>
                    <div className="text-[11px] text-muted mt-0.5">{formatPrice(opt.price)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs bg-cream/50 p-4 rounded-sm border border-charcoal/5">
            <div>
              <span className="text-muted block">Concentration</span>
              <p className="text-charcoal font-medium mt-0.5">{product.concentration}</p>
            </div>
            <div>
              <span className="text-muted block">Category</span>
              <p className="text-charcoal font-medium mt-0.5">{product.category}</p>
            </div>
            <div>
              <span className="text-muted block">Gender</span>
              <p className="text-charcoal font-medium mt-0.5">{product.gender}</p>
            </div>
            <div>
              <span className="text-muted block">Availability</span>
              <p className={`font-medium mt-0.5 ${product.inStock ? "text-emerald-700" : "text-red-600"}`}>
                {product.inStock ? "In Stock · Ready to ship" : "Currently Out of Stock"}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-6">{product.description}</p>

          {/* Fragrance / Olfactory Pyramid Presentation */}
          <div className="mb-8 border border-charcoal/10 rounded-sm p-4 bg-white shadow-xs">
            <div className="flex items-center gap-2 mb-3 border-b border-charcoal/5 pb-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-xs tracking-widest uppercase text-charcoal font-medium">
                Olfactory Pyramid
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Top Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="w-24 shrink-0 text-muted font-medium text-[11px] tracking-wider uppercase">
                  Top Notes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pyramid.top.map((note) => (
                    <span
                      key={note}
                      className="bg-ivory border border-gold/30 text-charcoal px-2.5 py-0.5 rounded-full text-[11px]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Heart Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="w-24 shrink-0 text-muted font-medium text-[11px] tracking-wider uppercase">
                  Heart Notes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pyramid.heart.map((note) => (
                    <span
                      key={note}
                      className="bg-gold/10 border border-gold/40 text-charcoal px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Base Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="w-24 shrink-0 text-muted font-medium text-[11px] tracking-wider uppercase">
                  Base Notes
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pyramid.base.map((note) => (
                    <span
                      key={note}
                      className="bg-charcoal text-cream px-2.5 py-0.5 rounded-full text-[11px]"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity and Add to Bag */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-charcoal/15 bg-white rounded-sm">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-cream transition-colors text-charcoal/80"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-3 text-sm font-medium min-w-[3rem] text-center text-charcoal">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="p-3 hover:bg-cream transition-colors text-charcoal/80"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={adding || !product.inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-charcoal hover:bg-gold text-white px-8 py-3.5 text-xs tracking-widest uppercase transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  {adding ? "Adding..." : `Add to Bag · ${formatPrice(selectedVolume.price * quantity)}`}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-muted">
            Complimentary luxury shipping on orders over $150 · 100% Authenticity Guaranteed · 30-Day Returns
          </p>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <h2 className="text-3xl font-display font-light text-charcoal mb-8 text-center">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

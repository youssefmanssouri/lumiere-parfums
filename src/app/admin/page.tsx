"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Package,
  Users,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Search,
  Plus,
  RefreshCw,
  Edit,
} from "lucide-react";

interface Stats {
  productCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
}

interface OrderItem {
  id?: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  size?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  name: string;
  email: string;
  status: string;
  total: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt: string;
  items?: OrderItem[];
}

interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  concentration: string;
  size: string;
  price: number;
  image: string;
  featured: boolean;
  inStock: boolean;
}

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productSearch, setProductSearch] = useState("");

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Product Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    category: "Woody Aromatic",
    gender: "Unisex",
    concentration: "Eau de Parfum",
    size: "100ml",
    price: 185,
    notes: "Bergamot, Amber, Cedar",
    description: "",
  });

  // Verify Admin authorization
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (user.role !== "admin") {
        router.push("/account");
      }
    }
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const [statsRes, productsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/products"),
      ]);

      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data.stats);
        setOrders(statsData.data.recentOrders || []);
      }

      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data.products || []);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load dashboard data." });
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
    }
  }, [user]);

  const handleStatusUpdate = async (orderId: string, orderNumber: string, status: string) => {
    setUpdatingId(orderId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          message: `Order #${orderNumber} successfully updated to "${status}".`,
        });

        // Update local state smoothly
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o))
        );

        if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderNumber === orderId)) {
          setSelectedOrder({ ...selectedOrder, status });
        }
      } else {
        setFeedback({
          type: "error",
          message: data.error || "Failed to update order status.",
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating order status." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleProductStock = async (product: Product) => {
    const newStock = !product.inStock;
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: newStock }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: newStock } : p))
        );
        setFeedback({
          type: "success",
          message: `${product.name} is now ${newStock ? "In Stock" : "Out of Stock"}.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update product stock." });
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    const newFeatured = !product.featured;
    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: newFeatured } : p))
        );
        setFeedback({
          type: "success",
          message: `${product.name} featured status updated.`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update featured status." });
    }
  };

  const handleSavePrice = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/products/${editingProduct.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: editPrice }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, price: editPrice } : p))
        );
        setFeedback({
          type: "success",
          message: `Updated price for ${editingProduct.name} to ${formatPrice(editPrice)}.`,
        });
        setEditingProduct(null);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to update price." });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.product) {
        setProducts((prev) => [data.data.product, ...prev]);
        setFeedback({
          type: "success",
          message: `Fragrance "${newProduct.name}" created successfully.`,
        });
        setIsAddProductOpen(false);
        setNewProduct({
          name: "",
          brand: "",
          category: "Woody Aromatic",
          gender: "Unisex",
          concentration: "Eau de Parfum",
          size: "100ml",
          price: 185,
          notes: "Bergamot, Amber, Cedar",
          description: "",
        });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to create product." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error creating product." });
    }
  };

  if (loading || !user || user.role !== "admin") {
    return <div className="py-20 text-center text-muted">Checking administrator permissions...</div>;
  }

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const statCards = [
    { label: "Active Products", value: stats?.productCount ?? products.length, icon: ShoppingBag },
    { label: "Total Orders", value: stats?.orderCount ?? orders.length, icon: Package },
    { label: "Registered Customers", value: stats?.userCount ?? 1, icon: Users },
    {
      label: "Gross Revenue",
      value: formatPrice(stats?.totalRevenue ?? 0),
      icon: DollarSign,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] tracking-widest uppercase text-gold font-semibold block mb-1">
            Store Administration
          </span>
          <h1 className="text-4xl font-display font-light text-charcoal">
            Management Portal
          </h1>
        </div>

        <button
          onClick={() => {
            startTransition(() => {
              loadData();
            });
          }}
          className="inline-flex items-center gap-2 border border-charcoal/20 px-4 py-2 text-xs tracking-widest uppercase hover:border-gold hover:text-gold transition-colors rounded-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`mb-8 p-4 rounded-sm border flex items-center justify-between gap-3 text-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted hover:text-charcoal p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-charcoal/10 rounded-sm p-6 shadow-xs"
          >
            <card.icon className="w-5 h-5 text-gold mb-3" />
            <p className="text-2xl font-medium text-charcoal">{card.value}</p>
            <p className="text-xs tracking-widest uppercase text-muted mt-1 font-medium">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-charcoal/10 mb-8 gap-8">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-4 text-xs tracking-widest uppercase font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-gold text-charcoal font-semibold"
              : "border-transparent text-muted hover:text-charcoal"
          }`}
        >
          <Package className="w-4 h-4" />
          Order Management ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-4 text-xs tracking-widest uppercase font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "products"
              ? "border-gold text-charcoal font-semibold"
              : "border-transparent text-muted hover:text-charcoal"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Catalog Products ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDER MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-charcoal/10 rounded-sm shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, customer, or email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-charcoal/15 rounded-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-muted font-medium whitespace-nowrap">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-charcoal/15 bg-white px-3 py-2 rounded-sm focus:border-gold focus:outline-none w-full sm:w-auto"
              >
                <option value="all">All Statuses</option>
                {ALLOWED_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-charcoal/10 rounded-sm overflow-x-auto shadow-xs">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted">
                No orders match your filter criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-charcoal/10 bg-ivory text-muted uppercase tracking-wider">
                    <th className="p-4 font-normal">Reference</th>
                    <th className="p-4 font-normal">Customer</th>
                    <th className="p-4 font-normal">Date</th>
                    <th className="p-4 font-normal">Total</th>
                    <th className="p-4 font-normal">Current Status</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/5">
                  {filteredOrders.map((order) => (
                    <tr key={order.id || order.orderNumber} className="hover:bg-cream/40 transition-colors">
                      <td className="p-4 font-medium text-charcoal">
                        #{order.orderNumber}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-charcoal">{order.name}</p>
                        <p className="text-muted text-[11px]">{order.email}</p>
                      </td>
                      <td className="p-4 text-muted">
                        {order.createdAt ? formatDate(order.createdAt) : "Today"}
                      </td>
                      <td className="p-4 font-semibold text-charcoal">
                        {formatPrice(order.total)}
                      </td>
                      <td className="p-4">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order.id, order.orderNumber, e.target.value)
                          }
                          className="text-xs border border-charcoal/20 px-2.5 py-1 rounded-sm focus:border-gold focus:outline-none capitalize bg-white font-medium"
                        >
                          {ALLOWED_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-charcoal/20 hover:border-gold hover:text-gold text-charcoal rounded-sm transition-colors uppercase tracking-wider text-[11px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 border border-charcoal/10 rounded-sm shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by brand or name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-charcoal/15 rounded-sm focus:border-gold focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-2 bg-charcoal hover:bg-gold text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Add New Fragrance
            </button>
          </div>

          <div className="bg-white border border-charcoal/10 rounded-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-charcoal/10 bg-ivory text-muted uppercase tracking-wider">
                  <th className="p-4 font-normal">Fragrance</th>
                  <th className="p-4 font-normal">Category</th>
                  <th className="p-4 font-normal">Retail Price</th>
                  <th className="p-4 font-normal">Stock Status</th>
                  <th className="p-4 font-normal">Featured</th>
                  <th className="p-4 font-normal text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-cream rounded-xs overflow-hidden shrink-0 border border-charcoal/5">
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-contain p-1"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
                            {p.brand}
                          </p>
                          <p className="font-semibold text-charcoal">{p.name}</p>
                          <p className="text-[10px] text-muted">{p.size} · {p.concentration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted">{p.category}</td>
                    <td className="p-4 font-semibold text-charcoal">
                      {formatPrice(p.price)}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleProductStock(p)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border uppercase tracking-wider transition-colors ${
                          p.inStock
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border uppercase tracking-wider transition-colors ${
                          p.featured
                            ? "bg-gold/15 text-gold border-gold/40"
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:text-charcoal"
                        }`}
                      >
                        {p.featured ? "Featured" : "Standard"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setEditPrice(p.price);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-charcoal/20 hover:border-gold hover:text-gold text-charcoal rounded-sm transition-colors text-[11px] uppercase tracking-wider"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit Price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs">
          <div className="bg-white border border-charcoal/10 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-muted block">
                  Order Details
                </span>
                <h3 className="text-2xl font-display text-charcoal font-medium">
                  #{selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-muted hover:text-charcoal rounded-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-xs tracking-widest uppercase text-muted font-medium mb-3">
                Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-charcoal/10 border border-charcoal/10 rounded-sm p-3 bg-ivory/40">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-charcoal">
                        {item.brand ? `${item.brand} ` : ""}
                        {item.name}
                      </p>
                      <p className="text-muted text-[11px]">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs bg-cream/40 p-4 rounded-sm border border-charcoal/5">
              <div>
                <p className="font-semibold text-charcoal mb-1">Customer & Delivery</p>
                <p className="text-charcoal">{selectedOrder.name}</p>
                <p className="text-muted">{selectedOrder.email}</p>
                <p className="text-muted mt-1 leading-relaxed">
                  {selectedOrder.address || "Street address on file"}
                  <br />
                  {selectedOrder.city ? `${selectedOrder.city}, ` : ""}
                  {selectedOrder.state} {selectedOrder.zip}
                </p>
              </div>

              <div>
                <p className="font-semibold text-charcoal mb-1">Financial Breakdown</p>
                <div className="space-y-1 text-muted">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.subtotal || selectedOrder.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{selectedOrder.shipping === 0 ? "Complimentary" : formatPrice(selectedOrder.shipping || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-charcoal border-t border-charcoal/10 pt-1 mt-1">
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Modification */}
            <div className="border-t border-charcoal/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted font-medium">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusUpdate(selectedOrder.id, selectedOrder.orderNumber, e.target.value)
                  }
                  className="text-xs border border-charcoal/20 px-3 py-1.5 rounded-sm capitalize font-medium focus:border-gold focus:outline-none"
                >
                  {ALLOWED_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-charcoal text-white hover:bg-gold px-6 py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRICE MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs">
          <div className="bg-white border border-charcoal/10 rounded-sm max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-lg text-charcoal font-medium">
                Edit Retail Price
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                {editingProduct.brand}
              </p>
              <p className="text-sm font-semibold text-charcoal mb-4">
                {editingProduct.name}
              </p>

              <label className="block text-xs uppercase tracking-widest text-muted mb-1.5 font-medium">
                Price (USD)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-charcoal/20 rounded-sm text-sm focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSavePrice}
                className="flex-1 bg-charcoal hover:bg-gold text-white py-2 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium"
              >
                Save Price
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="border border-charcoal/20 text-charcoal py-2 px-4 text-xs tracking-widest uppercase transition-colors rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs">
          <div className="bg-white border border-charcoal/10 rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-3">
              <h3 className="font-display text-xl text-charcoal font-medium">
                Add New Fragrance
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 text-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Fragrance Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Bois Impérial"
                    className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Brand *
                  </label>
                  <input
                    required
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g. Essential Parfums"
                    className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Retail Price (USD) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Gender
                  </label>
                  <select
                    value={newProduct.gender}
                    onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                    className="w-full px-2 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none bg-white"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                  </select>
                </div>

                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Concentration
                  </label>
                  <input
                    type="text"
                    value={newProduct.concentration}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, concentration: e.target.value })
                    }
                    className="w-full px-2 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                    Size
                  </label>
                  <input
                    type="text"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                    className="w-full px-2 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                  Fragrance Notes (comma-separated)
                </label>
                <input
                  type="text"
                  value={newProduct.notes}
                  onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                  placeholder="e.g. Basil, Akigalawood, Vetiver"
                  className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block tracking-wider uppercase text-muted mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Artisanal fragrance description..."
                  className="w-full px-3 py-2 border border-charcoal/20 rounded-sm focus:border-gold focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-charcoal/10">
                <button
                  type="submit"
                  className="flex-1 bg-charcoal hover:bg-gold text-white py-2.5 text-xs tracking-widest uppercase transition-colors rounded-sm font-medium"
                >
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="border border-charcoal/20 text-charcoal py-2.5 px-4 text-xs tracking-widest uppercase transition-colors rounded-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

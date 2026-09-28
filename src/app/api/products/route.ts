import { NextRequest } from "next/server";
import { getProducts } from "@/lib/db";
import { getStaticProducts } from "@/data/products";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const gender = searchParams.get("gender") || "";
    const featured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "featured";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const note = searchParams.get("note") || "";

    const products = await getProducts({
      search: search || undefined,
      category: category || undefined,
      gender: gender || undefined,
      featured: featured === "true" ? true : undefined,
      sort,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      note: note || undefined,
    });

    const allProducts = getStaticProducts();
    const categories = [...new Set(allProducts.map((p) => p.category))];
    const genders = [...new Set(allProducts.map((p) => p.gender))];
    const notes = [
      ...new Set(
        allProducts.flatMap((p) => p.notes.split(",").map((n) => n.trim()))
      ),
    ].sort();

      return apiSuccess({
        products,
        filters: { categories, genders, notes },
      });
    } catch {
      return apiError("Failed to fetch products", 500);
    }
  }

  export async function POST(request: NextRequest) {
    try {
      const { requireAdmin } = await import("@/lib/auth");
      await requireAdmin();

      const body = await request.json();
      const { name, brand, description, notes, category, gender, concentration, size, price, image, featured } = body;

      if (!name || !brand || !price) {
        return apiError("Name, brand, and price are required", 400);
      }

      const { isDatabaseAvailable } = await import("@/lib/db");
      if (!(await isDatabaseAvailable())) {
        return apiError("Database service is unavailable", 503);
      }

      const { prisma } = await import("@/lib/prisma");

      const baseSlug = `${brand}-${name}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      let slug = baseSlug;
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        slug = `${baseSlug}-${Date.now()}`;
      }

      const product = await prisma.product.create({
        data: {
          slug,
          name,
          brand,
          description: description || `${name} by ${brand}.`,
          notes: notes || "Bergamot, Cedar, Musk",
          category: category || "Woody Aromatic",
          gender: gender || "Unisex",
          concentration: concentration || "Eau de Parfum",
          size: size || "100ml",
          price: parseFloat(String(price)),
          image: image || "/products/dior-sauvage-edp.jpg",
          featured: Boolean(featured),
          inStock: true,
        },
      });

      return apiSuccess({ product });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create product";
      const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
      return apiError(message, status);
    }
  }

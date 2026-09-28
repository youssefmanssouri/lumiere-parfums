import { prisma } from "@/lib/prisma";
import { getStaticProducts } from "@/data/products";

const globalForDb = globalThis as unknown as {
  dbAvailable: boolean | undefined;
};

export async function isDatabaseAvailable(): Promise<boolean> {
  if (globalForDb.dbAvailable !== undefined) {
    return globalForDb.dbAvailable;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    globalForDb.dbAvailable = true;
    return true;
  } catch {
    globalForDb.dbAvailable = false;
    return false;
  }
}

export function getPrisma() {
  return prisma;
}

export { prisma };

export async function getProducts(filters?: {
  search?: string;
  category?: string;
  gender?: string;
  featured?: boolean;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  note?: string;
}) {
  if (await isDatabaseAvailable()) {
    const where: Record<string, unknown> = { inStock: true };
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    if (filters?.category) where.category = filters.category;
    if (filters?.gender) where.gender = filters.gender;
    if (filters?.featured) where.featured = true;
    if (filters?.note) where.notes = { contains: filters.note, mode: "insensitive" };
    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) (where.price as Record<string, number>).gte = filters.minPrice;
      if (filters.maxPrice) (where.price as Record<string, number>).lte = filters.maxPrice;
    }

    let orderBy: Record<string, string> = { featured: "desc" };
    switch (filters?.sort) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
    }

    return prisma.product.findMany({
      where,
      orderBy: [orderBy, { name: "asc" }],
    });
  }

  let items = getStaticProducts();
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
    );
  }
  if (filters?.category) items = items.filter((p) => p.category === filters.category);
  if (filters?.gender) items = items.filter((p) => p.gender === filters.gender);
  if (filters?.featured) items = items.filter((p) => p.featured);
  if (filters?.note) {
    const n = filters.note.toLowerCase();
    items = items.filter((p) => p.notes.toLowerCase().includes(n));
  }
  if (filters?.minPrice) items = items.filter((p) => p.price >= filters.minPrice!);
  if (filters?.maxPrice) items = items.filter((p) => p.price <= filters.maxPrice!);

  switch (filters?.sort) {
    case "price-asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case "rating":
      items = [...items].sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      items = [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return items;
}

export async function getProductBySlug(slug: string) {
  if (await isDatabaseAvailable()) {
    return prisma.product.findUnique({ where: { slug } });
  }
  const { getStaticProductBySlug } = await import("@/data/products");
  return getStaticProductBySlug(slug);
}

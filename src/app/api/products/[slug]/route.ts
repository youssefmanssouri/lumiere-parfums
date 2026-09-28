import { NextRequest } from "next/server";
import { getProductBySlug, getProducts } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return apiError("Product not found", 404);
    }

    const all = await getProducts({ category: product.category });
    const related = all
      .filter((p) => p.slug !== product.slug)
      .slice(0, 4);

    return apiSuccess({ product, related });
  } catch {
    return apiError("Failed to fetch product", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { requireAdmin } = await import("@/lib/auth");
    await requireAdmin();

    const { slug } = await params;
    const body = await request.json();

    const { isDatabaseAvailable } = await import("@/lib/db");
    if (!(await isDatabaseAvailable())) {
      return apiError("Database service is unavailable", 503);
    }

    const { prisma } = await import("@/lib/prisma");

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!existing) {
      return apiError("Product not found", 404);
    }

    const dataToUpdate: Record<string, unknown> = {};
    if (body.price !== undefined) dataToUpdate.price = parseFloat(String(body.price));
    if (body.inStock !== undefined) dataToUpdate.inStock = Boolean(body.inStock);
    if (body.featured !== undefined) dataToUpdate.featured = Boolean(body.featured);
    if (body.name !== undefined) dataToUpdate.name = String(body.name);
    if (body.brand !== undefined) dataToUpdate.brand = String(body.brand);
    if (body.concentration !== undefined) dataToUpdate.concentration = String(body.concentration);
    if (body.description !== undefined) dataToUpdate.description = String(body.description);

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });

    return apiSuccess({ product: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { requireAdmin } = await import("@/lib/auth");
    await requireAdmin();

    const { slug } = await params;
    const { isDatabaseAvailable } = await import("@/lib/db");
    if (!(await isDatabaseAvailable())) {
      return apiError("Database service is unavailable", 503);
    }

    const { prisma } = await import("@/lib/prisma");

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!existing) {
      return apiError("Product not found", 404);
    }

    // Safely deactivate to preserve order referential integrity
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: { inStock: false },
    });

    return apiSuccess({ message: "Product deactivated", product: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to deactivate product";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

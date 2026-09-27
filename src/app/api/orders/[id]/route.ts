import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
type OrderStatus = (typeof ALLOWED_ORDER_STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    if (!id) {
      return apiError("Order ID required", 400);
    }

    const body = await request.json();
    const { status } = body;

    if (!status || typeof status !== "string") {
      return apiError("Status is required", 400);
    }

    if (!ALLOWED_ORDER_STATUSES.includes(status as OrderStatus)) {
      return apiError(
        `Invalid status. Allowed statuses: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
        400
      );
    }

    const { isDatabaseAvailable } = await import("@/lib/db");
    if (!(await isDatabaseAvailable())) {
      return apiError("Database service unavailable", 503);
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return apiError("Order not found", 404);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return apiSuccess({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

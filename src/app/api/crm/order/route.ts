import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

export async function POST(request: NextRequest) {
  try {
    const expectedToken = process.env.CRM_SYNC_TOKEN;
    if (!expectedToken) {
      return NextResponse.json({ error: "CRM synchronization is not configured" }, { status: 503 });
    }

    const syncToken = request.headers.get("X-Sync-Token");
    if (!syncToken || syncToken !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized sync call" }, { status: 401 });
    }

    const body = await request.json();
    const { orderNumber, status } = body;

    if (!orderNumber || !status || typeof status !== "string") {
      return NextResponse.json({ error: "Missing required order sync fields" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(status as AllowedStatus)) {
      return NextResponse.json(
        { error: `Invalid order status. Allowed: ${ALLOWED_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const { isDatabaseAvailable } = await import("@/lib/db");
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database service unavailable" }, { status: 503 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found on website database" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: { status },
    });

    return NextResponse.json({ success: true, orderId: updatedOrder.id });
  } catch (error) {
    console.error("CRM Order sync receiver error:", error);
    return NextResponse.json({ error: "Internal sync error" }, { status: 500 });
  }
}

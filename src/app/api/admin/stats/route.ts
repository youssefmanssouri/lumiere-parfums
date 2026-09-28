import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiSuccess } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();

    const { isDatabaseAvailable } = await import("@/lib/db");
    if (!(await isDatabaseAvailable())) {
      const { getStaticProducts } = await import("@/data/products");
      const staticProducts = getStaticProducts();
      return apiSuccess({
        stats: {
          productCount: staticProducts.length,
          orderCount: 0,
          userCount: 1,
          totalRevenue: 0,
        },
        recentOrders: [],
      });
    }

    const [productCount, orderCount, userCount, revenue, recentOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({ where: { role: "customer" } }),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.findMany({
          take: 50,
          orderBy: { createdAt: "desc" },
          include: { items: true },
        }),
      ]);

    return apiSuccess({
      stats: {
        productCount,
        orderCount,
        userCount,
        totalRevenue: revenue._sum.total || 0,
      },
      recentOrders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return apiError(message, status);
  }
}

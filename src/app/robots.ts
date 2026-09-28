import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/product/", "/about", "/contact"],
        disallow: [
          "/admin",
          "/admin/",
          "/account",
          "/account/",
          "/checkout",
          "/order-confirmation",
          "/login",
          "/api/",
        ],
      },
    ],
    sitemap: "https://lumiere-parfums-mu.vercel.app/sitemap.xml",
  };
}

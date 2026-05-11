import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products",
          "/product",
          "/apps",
          "/ai-tools",
          "/academy",
          "/services",
          "/trading",
          "/earning",
          "/blog",
          "/about",
          "/contact",
          "/faq",
          "/zero-protocols",
          "/values",
          "/criticism",
          "/privacy",
          "/terms",
          "/return-policy",
          "/shipping-policy",
        ],
        disallow: [
          "/api/",
          "/_next/",
          "/cart",
          "/wishlist",
          "/orders",
          "/dashboard",
          "/profile",
          "/login",
          "/register",
          "/forgot-password",
          "/offline",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

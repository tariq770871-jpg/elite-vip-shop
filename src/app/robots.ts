import type { MetadataRoute } from "next";

const BASE_URL = "https://elite-vip-shop.vercel.app";

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
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

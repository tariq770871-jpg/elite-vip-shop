import type { MetadataRoute } from "next";

const BASE_URL = "https://elite-vip-shop.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: {
    path: string;
    priority: number;
    changeFrequency:
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never";
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "daily" },
    { path: "/products", priority: 0.9, changeFrequency: "daily" },
    { path: "/apps", priority: 0.8, changeFrequency: "weekly" },
    { path: "/services", priority: 0.8, changeFrequency: "weekly" },
    { path: "/trading", priority: 0.8, changeFrequency: "weekly" },
    { path: "/earning", priority: 0.8, changeFrequency: "weekly" },
    { path: "/ai-tools", priority: 0.8, changeFrequency: "weekly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" },
    { path: "/register", priority: 0.5, changeFrequency: "monthly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/return-policy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

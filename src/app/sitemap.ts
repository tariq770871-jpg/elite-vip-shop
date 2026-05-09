import type { MetadataRoute } from "next";
import { products } from "@/lib/mock-data";
import { getAllPosts } from "@/lib/blog-data";

const BASE_URL = "https://elite-vip-shop.vercel.app";

// Static page definitions with realistic lastModified dates and priorities
const staticPages: {
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
  lastModified: string;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily", lastModified: "2025-01-15" },
  { path: "/products", priority: 0.9, changeFrequency: "daily", lastModified: "2025-01-20" },
  { path: "/apps", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-10" },
  { path: "/ai-tools", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-12" },
  { path: "/academy", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-08" },
  { path: "/services", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-05" },
  { path: "/trading", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-14" },
  { path: "/earning", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-11" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: "2025-01-20" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly", lastModified: "2024-12-20" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly", lastModified: "2024-12-20" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly", lastModified: "2025-01-18" },
  { path: "/zero-protocols", priority: 0.5, changeFrequency: "monthly", lastModified: "2024-12-20" },
  { path: "/values", priority: 0.5, changeFrequency: "monthly", lastModified: "2024-12-20" },
  { path: "/criticism", priority: 0.5, changeFrequency: "monthly", lastModified: "2024-12-20" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: "2024-11-01" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: "2024-11-01" },
  { path: "/return-policy", priority: 0.3, changeFrequency: "yearly", lastModified: "2024-11-01" },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly", lastModified: "2024-11-01" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(page.lastModified),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        ar: `${BASE_URL}${page.path}`,
      },
    },
  }));

  // Dynamic product pages
  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.availability)
    .map((product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: new Date("2025-01-20"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          ar: `${BASE_URL}/product/${product.id}`,
        },
      },
    }));

  // Blog post pages
  const blogPosts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        ar: `${BASE_URL}/blog/${post.slug}`,
      },
    },
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}

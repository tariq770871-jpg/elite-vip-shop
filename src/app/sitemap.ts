import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/site-config";
import { getSupabaseServiceClient } from "@/lib/supabase-server";
import { products as mockProducts } from "@/lib/mock-data";

// Static page definitions with changeFrequency + priority.
// lastModified is computed at build/request time so the sitemap never
// reports stale dates (H16 fix). Pages are grouped by update cadence:
//   - daily  : home, products (inventory changes)
//   - weekly : content sections + blog index
//   - monthly: legal/about
//   - yearly : policy pages
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
  lastModified: Date;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily", lastModified: new Date() },
  { path: "/products", priority: 0.9, changeFrequency: "daily", lastModified: new Date() },
  { path: "/apps", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/ai-tools", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/academy", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/services", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/trading", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/earning", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly", lastModified: new Date() },
  { path: "/about", priority: 0.6, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/zero-protocols", priority: 0.5, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/values", priority: 0.5, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/criticism", priority: 0.5, changeFrequency: "monthly", lastModified: new Date() },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
  { path: "/return-policy", priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly", lastModified: new Date() },
];

// Fetch real product IDs + their updated_at (or created_at) from Supabase.
// Falls back to mock data when Supabase is unreachable so the sitemap
// always returns a valid XML even during DB outages (H17 fix).
async function fetchProductEntries(): Promise<MetadataRoute.Sitemap> {
  const fallback = mockProducts
    .filter((p) => p.availability)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages: { ar: `${SITE_URL}/product/${p.id}` } },
    }));
  const sc = getSupabaseServiceClient();
  if (!sc) return fallback;
  try {
    const { data, error } = await sc
      .from("products")
      .select("product_id, updated_at, created_at, availability")
      .eq("availability", true)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error || !data || data.length === 0) return fallback;
    return (data as Array<{ product_id: string; updated_at: string | null; created_at: string | null }>).map((p) => ({
      url: `${SITE_URL}/product/${p.product_id}`,
      // Prefer updated_at, fall back to created_at, then to now()
      lastModified: new Date(p.updated_at || p.created_at || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      alternates: { languages: { ar: `${SITE_URL}/product/${p.product_id}` } },
    }));
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified: page.lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        ar: `${SITE_URL}${page.path}`,
      },
    },
  }));

  // Dynamic product pages — fetched from Supabase (H17 fix)
  const productEntries = await fetchProductEntries();

  // Blog post pages
  const blogPosts = getAllPosts();
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        ar: `${SITE_URL}/blog/${post.slug}`,
      },
    },
  }));

  return [...staticEntries, ...productEntries, ...blogEntries];
}

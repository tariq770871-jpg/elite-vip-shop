import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { getAllPosts } from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { BlogImage } from "@/components/blog-image";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `المدونة | ${SITE_NAME}`,
  description:
    "مقالات ونصائح متخصصة في التسويق الرقمي، الربح من الإنترنت، التجارة الإلكترونية، الذكاء الاصطناعي، تصميم المواقع والتداول. محتوى عربي حصري ومفيد.",
  openGraph: {
    title: `المدونة | ${SITE_NAME}`,
    description:
      "مقالات ونصائح متخصصة في التسويق الرقمي، الربح من الإنترنت، التجارة الإلكترونية، الذكاء الاصطناعي، تصميم المواقع والتداول.",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    locale: "ar_AR",
    type: "website",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: `مدونة ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `المدونة | ${SITE_NAME}`,
    description:
      "مقالات ونصائح متخصصة في التسويق الرقمي، الربح من الإنترنت، التجارة الإلكترونية، الذكاء الاصطناعي، تصميم المواقع والتداول.",
    images: ["/icons/icon-512.png"],
  },
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المدونة", url: "/blog" },
        ]}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,168,67,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gold/10">
              <BookOpen className="size-7 text-gold" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-black md:text-5xl">
            <span className="text-gold-gradient">مدونة النخبة</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm text-gold/70 md:text-lg">
            مقالات ونصائح متخصصة في التسويق الرقمي، التجارة الإلكترونية، التقنية والأعمال
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <BlogImage
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
                  <span className="absolute top-3 right-3 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="mb-2 line-clamp-2 text-base font-bold leading-relaxed transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        {new Date(post.date).toLocaleDateString("ar-YE", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                      اقرأ المزيد ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

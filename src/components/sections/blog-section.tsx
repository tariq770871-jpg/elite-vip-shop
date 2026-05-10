"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, BookOpen } from "lucide-react";
import { getRecentPosts } from "@/lib/blog-data";

export function BlogSection() {
  const recentPosts = getRecentPosts(3);

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
              <BookOpen className="size-6 text-primary" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-bold md:text-3xl">من مدونة النخبة</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            مقالات ونصائح متخصصة في التسويق الرقمي والتجارة الإلكترونية والتقنية
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                {/* Fallback gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
                {/* Category tag */}
                <span className="absolute top-3 right-3 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-2 line-clamp-2 text-base font-bold leading-relaxed transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
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
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-md"
          >
            <span>شاهد جميع المقالات</span>
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

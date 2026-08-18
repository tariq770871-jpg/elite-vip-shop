import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, ArrowRight, Share2 } from "lucide-react";
import { getPostBySlug, getAllPosts, getRelatedPosts } from "@/lib/blog-data";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { BlogImage } from "@/components/blog-image";
import { BlogShareButtons } from "./share-buttons";
import { RelatedPosts } from "./related-posts";
import { BlogCTA } from "./blog-cta";
import DOMPurify from "isomorphic-dompurify";
import { safeJsonLd } from "@/lib/utils";
import { SITE_URL, SITE_NAME, WHATSAPP_LINK } from "@/lib/site-config";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "المقال غير موجود | Elite VIP Shop" };
  }

  return {
    title: `${post.title} | مدونة النخبة`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | مدونة النخبة`,
      description: post.excerpt,
      url: `${SITE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      locale: "ar_YE",
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: [post.category],
      images: [
        {
          url: post.image.startsWith("/") ? `${SITE_URL}${post.image}` : post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | مدونة النخبة`,
      description: post.excerpt,
      images: [post.image.startsWith("/") ? `${SITE_URL}${post.image}` : post.image],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);

  // Article JSON-LD structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image.startsWith("/") ? `${SITE_URL}${post.image}` : post.image,
    author: {
      "@type": "Organization",
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Elite VIP Shop",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.svg`,
      },
    },
    datePublished: post.date,
    dateModified: undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    articleSection: post.category,
    inLanguage: "ar",
  };

  // Convert markdown-like content to HTML
  const rawHtml = post.content
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-8 mb-4 text-foreground">$1</h2>')
    .replace(/^\- \*\*(.+?)\*\*: (.+)$/gm, '<li class="mb-2 mr-4"><strong class="text-foreground">$1:</strong> $2</li>')
    .replace(/^\- (.+)$/gm, '<li class="mb-2 mr-4">$1</li>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p class='mb-4 leading-relaxed text-muted-foreground'>")
    .replace(
      /^([^<#\-\n].+)/gm,
      "<p class='mb-4 leading-relaxed text-muted-foreground'>$1</p>"
    );

  // Sanitize HTML to prevent XSS — strip script tags and event handlers
  const contentHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h2', 'h3', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'br', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
  });

  return (
    <div className="min-h-screen">
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المدونة", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-black via-black/95 to-black/90 py-8 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,168,67,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gold/70 transition-colors hover:text-gold"
          >
            <ArrowRight className="size-4" />
            <span>العودة للمدونة</span>
          </Link>

          {/* Category */}
          <span className="mb-4 inline-block rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="mb-4 text-2xl font-black leading-relaxed text-white md:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gold/70">
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {new Date(post.date).toLocaleDateString("ar-YE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            {/* Main content */}
            <article className="min-w-0">
              {/* Featured image */}
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-muted">
                <BlogImage
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 700px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
              </div>

              {/* Content body */}
              <div
                className="prose prose-lg max-w-none text-muted-foreground [&_h2]:text-foreground [&_h2]:font-bold [&_h3]:text-foreground [&_h3]:font-bold [&_strong]:text-foreground [&_li]:text-muted-foreground [&_p]:leading-relaxed"
                dir="rtl"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {/* Share buttons */}
              <div className="mt-10 border-t border-border/50 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 className="size-5 text-primary" />
                  <span className="text-sm font-bold">شارك هذا المقال</span>
                </div>
                <BlogShareButtons post={post} />
              </div>

              {/* CTA */}
              <div className="mt-10">
                <BlogCTA />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 space-y-6">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="rounded-2xl border border-border/50 bg-card p-5">
                    <h3 className="mb-4 text-sm font-bold">مقالات ذات صلة</h3>
                    <div className="space-y-4">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="group flex gap-3"
                        >
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <BlogImage
                              src={relatedPost.image}
                              alt={relatedPost.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                              sizes="64px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="line-clamp-2 text-xs font-bold leading-relaxed transition-colors group-hover:text-primary">
                              {relatedPost.title}
                            </h4>
                            <span className="text-[10px] text-muted-foreground">
                              {relatedPost.readTime}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick links */}
                <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-primary/5 to-transparent p-5">
                  <h3 className="mb-3 text-sm font-bold">هل تحتاج مساعدة؟</h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    تواصل معنا عبر واتساب للحصول على استشارة مجانية
                  </p>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d-whatsapp flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold no-underline"
                  >
                    تواصل عبر واتساب
                  </a>
                </div>
              </div>
            </aside>
          </div>

          {/* Mobile Related Posts */}
          <div className="mt-10 lg:hidden">
            <RelatedPosts posts={relatedPosts} />
          </div>
        </div>
      </section>
    </div>
  );
}

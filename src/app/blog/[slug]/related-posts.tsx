import Link from "next/link";
import { Clock } from "lucide-react";
import type { BlogPost } from "@/lib/blog-data";
import { BlogImage } from "@/components/blog-image";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <h3 className="mb-6 text-lg font-bold">مقالات ذات صلة</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <BlogImage
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 -z-10" />
              <span className="absolute top-2 right-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {post.category}
              </span>
            </div>
            <div className="p-4">
              <h4 className="mb-2 line-clamp-2 text-sm font-bold leading-relaxed transition-colors group-hover:text-primary">
                {post.title}
              </h4>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {post.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

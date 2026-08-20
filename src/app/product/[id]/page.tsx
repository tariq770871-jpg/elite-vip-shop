import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailSection } from "@/components/sections/product-detail-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { products } from "@/lib/mock-data";
import { safeJsonLd } from "@/lib/utils";
import { SITE_URL, SITE_NAME } from "@/lib/site-config";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      title: "المنتج غير موجود",
      description: "لم يتم العثور على المنتج المطلوب في متجر النخبة.",
    };
  }

  const price = product.salePrice ?? product.price;
  const title = `${product.name} | Elite VIP Shop`;
  const description = product.description;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${id}`,
      type: "website",
      locale: "ar_YE",
      siteName: SITE_NAME,
      images: product.images[0]
        ? [
            {
              url: product.images[0],
              width: 800,
              height: 800,
              alt: product.name,
            },
          ]
        : [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images[0] ? [product.images[0]] : ["/icons/icon-512.png"],
    },
  };
}

// Product pages are dynamically rendered (SSR) at request time.
// Static generation with mock IDs was removed because real products
// use UUIDs — pre-rendering mock IDs would waste build time and
// not match any real product.
// When Supabase is connected, products are fetched server-side.

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  // Return real 404 for non-existent products (SEO: prevents indexing of empty pages)
  if (!product) {
    notFound();
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map(
      (img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`)
    ),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "YER",
      price: (product.salePrice ?? product.price).toString(),
      availability: product.availability
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.seller,
      },
    },
    brand: {
      "@type": "Brand",
      name: "Elite VIP Shop",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المتجر", url: "/products" },
          { name: product.name, url: `/product/${product.id}` },
        ]}
      />
      <ProductDetailSection productId={id} />
    </>
  );
}

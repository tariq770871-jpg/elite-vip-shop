import type { Metadata } from "next";
import { ProductDetailSection } from "@/components/sections/product-detail-section";
import { BreadcrumbSchema } from "@/components/breadcrumb-schema";
import { products } from "@/lib/mock-data";
import { safeJsonLd } from "@/lib/utils";

const SITE_URL = "https://elite-vip-shop.vercel.app";
const SITE_NAME = "Elite VIP Shop - متجر النخبة";

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
      locale: "ar_AR",
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

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  const productSchema = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map(
          (img) => `${SITE_URL}${img}`
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
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
        />
      )}
      <BreadcrumbSchema
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "المتجر", url: "/products" },
          ...(product ? [{ name: product.name, url: `/product/${product.id}` }] : []),
        ]}
      />
      <ProductDetailSection productId={id} />
    </>
  );
}

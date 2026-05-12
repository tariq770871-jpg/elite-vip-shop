import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { ProductDetailSection } from "@/components/sections/product-detail-section";

export async function generateStaticParams() {
  if (!supabase) {
    return [];
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("id")
    .limit(50);

  if (error || !products) {
    return [];
  }

  return products.map((product) => ({
    id: product.id.toString(),
  }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!supabase) {
    return {
      title: "المنتج غير موجود",
    };
  }

  const { data: product, error } = await supabase
    .from("products")
    .select("name, description, price, sale_price")
    .eq("id", id)
    .single();

  if (error || !product) {
    return {
      title: "المنتج غير موجود",
    };
  }

  const finalPrice = product.sale_price && product.sale_price < product.price
    ? product.sale_price
    : product.price;

  return {
    title: product.name,
    description: product.description?.substring(0, 160) || `سعر المنتج: ${finalPrice} ر.ي`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // التحقق من وجود المنتج (لـ notFound)
  if (supabase) {
    const { data: product, error } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();

    if (error || !product) {
      notFound();
    }
  }

  return <ProductDetailSection productId={id} />;
}
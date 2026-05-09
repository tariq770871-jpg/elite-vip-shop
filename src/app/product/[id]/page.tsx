"use client";

import { useParams } from "next/navigation";
import { ProductDetailSection } from "@/components/sections/product-detail-section";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  return <ProductDetailSection productId={productId} />;
}

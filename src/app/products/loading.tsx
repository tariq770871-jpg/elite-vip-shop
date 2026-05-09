import { ProductGridSkeleton, SectionSkeleton } from "@/components/loading-skeletons";

export default function ProductsLoading() {
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionSkeleton showTitle={true} showSubtitle={true} contentHeight="h-20" />
        <ProductGridSkeleton count={6} />
      </div>
    </div>
  );
}

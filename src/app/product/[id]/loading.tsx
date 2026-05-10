import { SectionSkeleton } from "@/components/loading-skeletons";

export default function ProductLoading() {
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionSkeleton showTitle={false} contentHeight="h-96" />
      </div>
    </div>
  );
}

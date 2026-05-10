import { SectionSkeleton } from "@/components/loading-skeletons";

export default function DashboardLoading() {
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionSkeleton showTitle={true} showSubtitle={false} contentHeight="h-[600px]" />
      </div>
    </div>
  );
}

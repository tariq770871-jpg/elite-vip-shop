import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";
import { NotFoundSection } from "@/components/sections/not-found-section";

export const metadata: Metadata = {
  title: `الصفحة غير موجودة | ${SITE_NAME}`,
  description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
};

export default function NotFound() {
  return <NotFoundSection />;
}

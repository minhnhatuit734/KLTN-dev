import { Suspense } from "react";
import ViewBlogClient from "./ViewBlogClient";

export default function ViewBlogPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sky-600">Đang tải...</div>}>
      <ViewBlogClient />
    </Suspense>
  );
}

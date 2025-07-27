import { Suspense } from "react";
import BlogPostClient from "./BlogPostClient";

export default function BlogPostPage() {
  return (
    <Suspense fallback={<div className="text-center text-sky-600 text-lg py-16">Đang tải...</div>}>
      <BlogPostClient />
    </Suspense>
  );
}
import { Suspense } from "react";
import MyBlogClient from "./MyBlogClient";

export default function MyBlogPage() {
  return (
    <Suspense fallback={<div className="text-center text-sky-600 py-10">Đang tải...</div>}>
      <MyBlogClient />
    </Suspense>
  );
}

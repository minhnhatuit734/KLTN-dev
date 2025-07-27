import { Suspense } from "react";
import ViewTourClient from "./ViewTourClient";

export default function ViewTourPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sky-600 text-xl">Đang tải...</div>}>
      <ViewTourClient />
    </Suspense>
  );
}
import { Suspense } from "react";
import MyBookingClient from "./MyBookingClient";

export default function MyBookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sky-600 text-xl">Đang tải...</div>}>
      <MyBookingClient />
    </Suspense>
  );
}
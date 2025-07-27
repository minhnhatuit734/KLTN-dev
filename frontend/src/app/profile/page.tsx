import { Suspense } from "react";
import ProfileClient from "./ProfileClient";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-sky-600">Đang tải hồ sơ...</div>}>
      <ProfileClient />
    </Suspense>
  );
}
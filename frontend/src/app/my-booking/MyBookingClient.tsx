"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  XCircle,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Tour = {
  _id: string;
  title?: string;
  location?: string;
  description?: string;
  image?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
};

type Booking = {
  _id: string;
  user: User | string | null;
  tour: Tour | string | null;
  num_people: number;
  total_price: number;
  status: string; // 'pending' | 'confirmed' | 'canceled'
  createdAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function MyBookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${BASE}/booking/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleBack = () => router.push("/");

  const handleDelete = async (bookingId: string, onDone?: () => void) => {
    setDeleting(bookingId);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE}/booking/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        alert("Không thể hủy booking, vui lòng thử lại.");
      }
    } catch {
      alert("Lỗi mạng, vui lòng thử lại!");
    } finally {
      setDeleting(null);
      onDone?.();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button
        onClick={handleBack}
        className="flex items-center gap-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl shadow px-4 py-2 mb-2"
        variant="ghost"
      >
        <ArrowLeft size={18} />
        <span className="font-medium hidden sm:inline">Trang chủ</span>
      </Button>

      <h1 className="text-2xl font-bold text-center text-sky-800 mb-4">
        Đơn Đặt Tour của Tôi
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="animate-spin mr-2" />
          Đang tải dữ liệu...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-500">
          Bạn chưa có đơn đặt tour nào.
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((bk) => {
            const tour =
              typeof bk.tour === "object" && bk.tour !== null
                ? (bk.tour as Tour)
                : undefined;
            const isPending = bk.status === "pending";

            return (
              <div
                key={bk._id}
                className="rounded-xl shadow-lg border bg-white flex flex-col md:flex-row gap-4 p-4 relative"
              >
                {isPending && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3 z-10"
                        disabled={deleting === bk._id}
                        title="Hủy đơn đặt tour"
                      >
                        {deleting === bk._id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Bạn muốn hủy đơn đặt tour này?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Thao tác này không thể hoàn tác.
                          <br />
                          Bạn chắc chắn muốn xóa đơn đặt tour:{" "}
                          <b>{tour?.title}</b>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleting === bk._id}
                          className="bg-red-600 text-white hover:bg-red-700"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(bk._id, () => {
                              (document.activeElement as HTMLElement)?.blur();
                            });
                          }}
                        >
                          {deleting === bk._id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            "Xác nhận hủy"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <img
                  src={tour?.image || "/images/default_tour.jpg"}
                  alt={tour?.title || "Tour"}
                  className="rounded-xl w-full md:w-56 h-40 object-cover border"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      "/images/default_tour.jpg")
                  }
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-sky-800">
                        {tour?._id ? (
                          <Link
                            href={`/viewtour?id=${tour._id}`}
                            className="hover:underline hover:text-sky-600 transition-colors"
                          >
                            {tour.title || "Không rõ tên tour"}
                          </Link>
                        ) : (
                          tour?.title || "Không rõ tên tour"
                        )}
                      </h2>
                      <span
                        className={
                          "flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-semibold " +
                          (bk.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : bk.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700")
                        }
                      >
                        {bk.status === "confirmed" && (
                          <CheckCircle2 size={16} />
                        )}
                        {bk.status === "pending" && (
                          <Loader2 size={16} className="animate-spin" />
                        )}
                        {bk.status === "canceled" && <XCircle size={16} />}
                        {bk.status === "confirmed"
                          ? "Đã xác nhận"
                          : bk.status === "pending"
                          ? "Chờ xác nhận"
                          : "Đã hủy"}
                      </span>
                    </div>
                    <div className="text-gray-500 mb-2">
                      {tour?.location || "Không rõ địa điểm"}
                    </div>
                    <div className="text-gray-700 text-sm mb-2 line-clamp-3">
                      {tour?.description || ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-base mt-3">
                    <div>
                      <b>Số người:</b> {bk.num_people}
                    </div>
                    <div>
                      <b>Giá tổng:</b> {bk.total_price?.toLocaleString("vi-VN")}
                      ₫
                    </div>
                    <div>
                      <b>Thời gian:</b>{" "}
                      {tour?.start_date &&
                        new Date(tour.start_date).toLocaleDateString("vi-VN")}{" "}
                      {tour?.end_date &&
                        `- ${new Date(tour.end_date).toLocaleDateString("vi-VN")}`}
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs mt-2">
                    Đặt ngày:{" "}
                    {bk.createdAt
                      ? new Date(bk.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

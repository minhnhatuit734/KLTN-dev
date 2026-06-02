/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type User = { _id?: string; name?: string } | string;

type Tour = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  image?: string;
  location?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  createdAt?: string;
  author?: User;
  capacity?: number;
  remain?: number;
  detail?: string;
};

type Review = {
  _id?: string;
  user?: User;
  tour?: string;
  content: string; // dùng đúng field content!
  rating?: number;
  createdAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "https://api-dev.uittravel.shop";

export default function ViewTourClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Đặt tour
  const [numPeople, setNumPeople] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);
  const totalPrice = tour?.price ? numPeople * tour.price : 0;
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error" | "pending">("idle");

  // Load tour info
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${BASE}/tours/${id}`)
      .then((res) => res.json())
      .then((data) => setTour(data))
      .catch(() => setError("Không tải được thông tin tour"))
      .finally(() => setLoading(false));
    // User info
    const info = localStorage.getItem("user_info");
    if (info) setUser(JSON.parse(info));
  }, [id]);

  // Load reviews
  useEffect(() => {
    if (!id) return;
    setReviewLoading(true);
    fetch(`${BASE}/reviews?tour=${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  }, [id]);

  // Submit review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để nhận xét!");
      return;
    }
    if (!newReview.trim()) {
      alert("Nhập nội dung nhận xét!");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("access_token");

    // ĐÚNG field cho backend
    const res = await fetch(`${BASE}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: user._id,
        tour: id,
        content: newReview.trim(),
        rating,
      }),
    });

    setSubmitting(false);
    let errText = "";
    if (!res.ok) {
      try { errText = await res.text(); } catch {}
      alert("Lỗi khi gửi nhận xét!\n" + (errText || ""));
      return;
    }

    setNewReview("");
    setRating(5);
    fetch(`${BASE}/reviews?tour=${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  };

  // Đặt tour
  const handleBooking = () => {
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đặt tour.");
      router.push("/login");
      return;
    }
    setShowModal(true);
    setBookingStatus("idle");
  };

  // Xác nhận đặt tour
  const handleConfirmBooking = async () => {
    if (!tour || !user) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("⚠️ Bạn chưa đăng nhập.");
      return;
    }
    setBookingStatus("pending");
    const bookingData = {
      user: String(user._id),
      tour: String(tour._id),
      num_people: numPeople,
      total_price: totalPrice,
      status: "pending",
    };

    const url = `${BASE}/booking`;
    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    };

    try {
      const res = await fetch(url, options);
      let data: any;
      try { data = await res.json(); } catch { data = await res.text(); }
      if (res.ok) {
        setBookingStatus("success");
      } else {
        setBookingStatus("error");
        alert(data.message || data || "Lỗi khi tạo booking");
      }
    } catch (err) {
      setBookingStatus("error");
      alert("Lỗi mạng, thử lại sau.");
    }
  };

  const handleBack = () => router.push("/");

  // ===== RENDER =====
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 h-10 w-10 inline-block mr-2"></span>
        Đang tải thông tin tour...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-red-600 text-lg">
        {error}
      </div>
    );

  if (!tour)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-500">
        Không tìm thấy tour.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4 relative">
      {/* Nút back */}
      <Button
        onClick={handleBack}
        className="absolute top-0 left-0 flex items-center gap-2 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl shadow px-4 py-2 mt-2 ml-2 z-20"
        variant="ghost"
      >
        <ArrowLeft size={18} />
        <span className="font-medium hidden sm:inline">Trang chủ</span>
      </Button>

      {/* Thông tin tour */}
      <h1 className="text-3xl font-bold text-center text-sky-800 mb-4">
        {tour.title}
      </h1>
      <img
        src={tour.image || "/images/default_tour.jpg"}
        alt={tour.title}
        className="rounded-xl shadow w-full h-72 object-cover border"
        onError={(e) =>
          ((e.target as HTMLImageElement).src = "/images/default_tour.jpg")
        }
      />

      {/* Grid hiển thị thông tin chi tiết */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <div className="mb-2">
            <strong>Địa điểm:</strong> {tour.location || "Chưa rõ"}
          </div>
          <div className="mb-2">
            <strong>Ngày bắt đầu:</strong>{" "}
            {tour.start_date
              ? new Date(tour.start_date).toLocaleDateString("vi-VN")
              : "—"}
          </div>
          <div className="mb-2">
            <strong>Ngày kết thúc:</strong>{" "}
            {tour.end_date
              ? new Date(tour.end_date).toLocaleDateString("vi-VN")
              : "—"}
          </div>
          <div className="mb-2">
            <strong>Sức chứa:</strong> {tour.capacity ?? "Không rõ"}
          </div>
          <div className="mb-2">
            <strong>Số chỗ còn lại:</strong>{" "}
            {typeof tour.remain === "number" ? tour.remain : "Không rõ"}
          </div>
          <div className="mb-2">
            <strong>Giá:</strong>{" "}
            <span className="font-bold text-sky-700">
              {tour.price ? `${tour.price.toLocaleString()}₫` : "Liên hệ"}
            </span>
          </div>
          {/* Input số người */}
          <div className="mt-4">
            <label htmlFor="numPeople" className="font-medium mr-2">
              Số người đi:
            </label>
            <input
              type="number"
              min={1}
              max={tour.capacity ?? 100}
              id="numPeople"
              value={numPeople}
              onChange={(e) => setNumPeople(Number(e.target.value))}
              className="border rounded px-2 py-1 w-24 text-center"
              style={{ outline: "none" }}
            />
          </div>
          <div className="mt-2 font-semibold text-sky-700">
            Tổng tiền: {totalPrice.toLocaleString()}₫
          </div>
          <Button
            className="mt-6 bg-sky-600 hover:bg-sky-700 text-white rounded-lg px-6 py-2"
            onClick={handleBooking}
          >
            Đặt tour ngay
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-5 border min-h-[180px]">
          <h2 className="text-xl font-semibold mb-2 text-sky-700">
            Mô tả chi tiết
          </h2>
          <div className="text-gray-700 whitespace-pre-line">
            {tour.description || "Chưa có mô tả."}
          </div>
          {tour.detail && (
            <div className="mt-3 text-sky-700">
              <strong>Thông tin bổ sung:</strong>
              <br />
              <span className="text-gray-700">{tour.detail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận đặt tour */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-30 ">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative">
            {bookingStatus === "success" ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-3 text-green-700">
                  🎉 Đặt tour thành công!
                </h2>
                <div className="text-center text-gray-700 mb-2">
                  Đơn đặt tour của bạn đã được tạo ở trạng thái <b>chờ xác nhận</b>.<br />
                  Vui lòng <b>thanh toán bằng QR</b> và <b>liên hệ quản trị viên</b> nếu có vấn đề.
                </div>
                <div className="bg-sky-50 rounded-lg shadow-inner px-5 py-3 my-4 text-base">
                  <div><b>Tên tour:</b> {tour?.title}</div>
                  <div>
                    <b>Ngày bắt đầu:</b>{" "}
                    {tour?.start_date
                      ? new Date(tour.start_date).toLocaleDateString("vi-VN")
                      : "--"}
                  </div>
                  <div>
                    <b>Ngày kết thúc:</b>{" "}
                    {tour?.end_date
                      ? new Date(tour.end_date).toLocaleDateString("vi-VN")
                      : "--"}
                  </div>
                  <div><b>Số người:</b> {numPeople}</div>
                  <div>
                    <b>Tổng tiền:</b>{" "}
                    <span className="text-sky-700 font-semibold">
                      {totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                  <div>
                    <b>Người đặt:</b> {user?.name ?? "Ẩn danh"}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 mb-2">
                  <div>SĐT người hỗ trợ: 0321343456</div>
                  <span className="font-semibold mb-1">
                    Quét mã QR để thanh toán:
                  </span>
                  <img
                    src="/images/qr.jpg"
                    alt="QR Thanh toán"
                    className="w-48 h-48 object-contain rounded border"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src = "/images/default_qr.jpg")
                    }
                  />
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    className="bg-green-600 text-white"
                    onClick={() => setShowModal(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center mb-3 text-green-700">
                  Xác nhận đặt tour?
                </h2>
                <div className="bg-sky-50 rounded-lg shadow-inner px-5 py-3 my-4 text-base">
                  <div><b>Tên tour:</b> {tour?.title}</div>
                  <div>
                    <b>Ngày bắt đầu:</b>{" "}
                    {tour?.start_date
                      ? new Date(tour.start_date).toLocaleDateString("vi-VN")
                      : "--"}
                  </div>
                  <div>
                    <b>Ngày kết thúc:</b>{" "}
                    {tour?.end_date
                      ? new Date(tour.end_date).toLocaleDateString("vi-VN")
                      : "--"}
                  </div>
                  <div><b>Số người:</b> {numPeople}</div>
                  <div>
                    <b>Tổng tiền:</b>{" "}
                    <span className="text-sky-700 font-semibold">
                      {totalPrice.toLocaleString()}₫
                    </span>
                  </div>
                  <div>
                    <b>Người đặt:</b> {user?.name ?? "Ẩn danh"}
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    className="bg-green-600 text-white"
                    onClick={handleConfirmBooking}
                    disabled={bookingStatus === "pending"}
                  >
                    {bookingStatus === "pending" ? "Đang xác nhận..." : "Xác nhận"}
                  </Button>
                  <Button
                    className="bg-red-600 text-white"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-sky-800">Nhận xét & đánh giá</h2>
        {user ? (
          <form
            className="flex flex-col gap-2 mb-6 bg-sky-50 rounded-xl p-4 shadow"
            onSubmit={handleSubmit}
          >
            <textarea
              className="border rounded p-2"
              placeholder="Viết nhận xét của bạn..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={2}
              required
            />
            <div className="flex gap-3 items-center text-base">
              <span>Đánh giá: </span>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option value={r} key={r}>{r}⭐</option>
                ))}
              </select>
              <Button
                type="submit"
                className="bg-sky-600 text-white w-max px-6"
                disabled={submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi nhận xét"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="mb-4 text-gray-500">
            <b>Bạn cần đăng nhập để nhận xét.</b>
          </div>
        )}
        {/* Danh sách nhận xét */}
        {reviewLoading ? (
          <div className="text-sky-600 text-center py-6">
            Đang tải nhận xét...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500 text-center">
            Chưa có nhận xét nào.
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-lg shadow border px-5 py-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sky-700">
                    {typeof r.user === "object" && r.user?.name
                      ? r.user.name
                      : "Ẩn danh"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    •{" "}
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                  <span className="ml-2 text-yellow-500">
                    {r.rating ? "★".repeat(r.rating) : ""}
                  </span>
                </div>
                <div className="text-gray-700">{r.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

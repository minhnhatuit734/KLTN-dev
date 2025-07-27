/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CalendarDays,
  User,
  MapPin,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Tour = {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  price?: number;
  location?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
  capacity?: number;
};

type Blog = {
  id?: string;
  _id?: string;
  title: string;
  content?: string;
  image?: string;
  createdAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://travel-backend.local";

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [user, setUser] = useState<any>(null);
  const [, setUserId] = useState<string | null>(null);
  const [, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Blog state
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const normalizeTours = (rawTours: any[]): Tour[] => {
    return rawTours.map((t) => ({
      ...t,
      id: t.id ?? t._id?.toString(),
    }));
  };

  const fetchTours = async (
    startDate?: Date,
    endDate?: Date,
    guests?: number,
  ) => {
    try {
      let url = `${BASE}/tours`;
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate.toISOString());
      if (endDate) params.append("end_date", endDate.toISOString());
      if (guests) params.append("guests", guests.toString());
      if (params.toString()) url += `?${params.toString()}`;

      setLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch failed");
      const data = await res.json();
      setTours(normalizeTours(data));
    } catch {
      setError("Không tải được tour");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${BASE}/blog-post`);
      if (!res.ok) throw new Error("Fetch blogs failed");
      const data = await res.json();
      setBlogs(data);
    } catch {
      setError("Không tải được blog");
    }
  };

  useEffect(() => {
    fetchTours();
    fetchBlogs();
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      const userParsed = JSON.parse(userInfo);
      setUser(userParsed);
      setUserId(userParsed._id || userParsed.id || null);
    }
  }, []);


  const handleSearch = () => {
    fetchTours(startDate ?? undefined, endDate ?? undefined, guests);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Hero Banner */}
      <section className="relative min-h-[410px] flex items-center justify-center w-full pt-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/homepage.jpg"
            alt="Travel Banner"
            className="w-full h-full object-cover object-center"
            style={{ filter: "brightness(0.6)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-sky-700/60 via-sky-400/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl text-white px-6 py-14 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight flex items-center justify-center gap-3">
            <span>Khám phá thế giới</span>
            <span className="animate-bounce">
              <ArrowRight size={36} />
            </span>
          </h2>
          <p className="mb-7 text-lg md:text-xl text-sky-100">
            {user
              ? "Xin chào! Sẵn sàng lên đường cùng TourismWorld."
              : "Đặt tour dễ dàng – Trải nghiệm tuyệt vời chỉ một cú click!"}
          </p>
          {!user && (
            <Link href="/register">
              <Button className="bg-gradient-to-r from-sky-500 to-sky-700 text-white text-lg px-8 py-3 rounded-2xl shadow-xl hover:scale-105 transition font-semibold">
                Bắt đầu ngay
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Search Bar dưới Banner */}
      <div
        className="flex justify-center w-full z-30 relative"
        style={{ marginTop: "-60px" }}
      >
        <div className="flex flex-wrap items-center gap-3 bg-white p-5 rounded-2xl shadow-2xl w-full max-w-4xl justify-center border border-sky-100">
          <div className="flex items-center gap-2 bg-slate-100 rounded px-4 py-2">
            <CalendarDays size={18} className="text-sky-500" />
            <label className="mr-2 text-sm font-semibold">Đến</label>
            <DatePicker
              selected={startDate}
              onChange={setStartDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày đến"
              className="outline-none border-0 bg-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded px-4 py-2">
            <CalendarDays size={18} className="text-sky-500" />
            <label className="mr-2 text-sm font-semibold">Đi</label>
            <DatePicker
              selected={endDate}
              onChange={setEndDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Chọn ngày đi"
              className="outline-none border-0 bg-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded px-4 py-2">
            <User size={18} className="text-sky-500" />
            <label className="mr-2 text-sm font-semibold">Khách</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="p-1 text-sm rounded border-0 bg-white focus:ring-2 focus:ring-sky-200"
            >
              {[1, 2, 3, 4].map((n) => (
                <option value={n} key={n}>
                  {n} khách
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleSearch}
            className="flex gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold shadow transition"
          >
            <Search size={18} /> Tìm kiếm
          </Button>
        </div>
      </div>

      {/* Tours Carousel Section */}
      <section className="w-full px-2 md:px-8 pb-8 pt-16 bg-slate-50 min-h-[380px]">
        <h2 className="text-2xl font-bold text-sky-800 mb-6 ml-2">
          Các tour nổi bật
        </h2>
        <Carousel opts={{ align: "start", loop: true }}>
          <CarouselContent>
            {loading && (
              <p className="col-span-full text-center text-lg text-sky-700 font-semibold mt-10">
                Đang tải tour...
              </p>
            )}
            {error && (
              <p className="col-span-full text-center text-red-600 mt-10">
                {error}
              </p>
            )}
            {!loading &&
              !error &&
              tours.map((tour) => (
                <CarouselItem
                  key={tour.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="flex flex-col group overflow-hidden shadow-xl rounded-2xl border border-slate-200 transition-all hover:shadow-2xl hover:-translate-y-1 bg-white">
                    <div className="relative">
                      <img
                        src={tour.image || "/images/default_tour.jpg"}
                        alt={tour.title}
                        className="rounded-t-2xl w-full h-56 object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute top-3 right-3 bg-white/80 rounded px-3 py-1 text-xs font-semibold shadow text-sky-700">
                        {tour.price
                          ? `${tour.price.toLocaleString()}₫`
                          : "Liên hệ"}
                      </span>
                    </div>
                    <CardHeader className="flex-0 pb-0 pt-3 px-4">
                      <h3 className="font-semibold text-lg truncate">
                        {tour.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 px-4 pb-4">
                      <div className="flex items-center text-gray-700 gap-2 text-sm mb-1">
                        <MapPin size={16} className="text-sky-500" />
                        <span>{tour.location ?? "Chưa cập nhật địa điểm"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays size={15} className="text-sky-400" />
                        <span>
                          {tour.start_date
                            ? new Date(tour.start_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : ""}{" "}
                          →{" "}
                          {tour.end_date
                            ? new Date(tour.end_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={15} />{" "}
                        <span>Sức chứa: {tour.capacity ?? 0}</span>
                      </div>
                      <Link href={`/viewtour?id=${tour.id}`}>
                        <Button className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg shadow transition">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        {!loading && !error && tours.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Không có tour nào phù hợp
          </div>
        )}
      </section>

      {/* Blog List Section */}
      <section className="w-full px-2 md:px-8 pb-12 pt-4 bg-white">
        <h2 className="text-2xl font-bold text-sky-800 mb-6 ml-2">
          Bài viết nổi bật
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Card
              key={blog._id || blog.id}
              className="group overflow-hidden border rounded-xl shadow hover:shadow-lg bg-slate-50 transition"
            >
              <div className="relative">
                <img
                  src={blog.image || "/images/default_blog.jpg"}
                  alt={blog.title}
                  className="w-full h-44 object-cover rounded-t-xl group-hover:scale-105 transition"
                />
              </div>
              <CardHeader className="pb-1 pt-3 px-4">
                <h3 className="font-semibold text-lg truncate">{blog.title}</h3>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {blog.content?.slice(0, 120) ?? "Không có mô tả..."}
                </div>
                <Link href={`/viewblog/?id=${blog._id || blog.id}`}>
                  <Button className="w-full mt-2 bg-sky-500 hover:bg-sky-700 text-white rounded-lg">
                    Đọc tiếp
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        {!loading && blogs.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            Không có bài viết nào!
          </div>
        )}
      </section>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s;
        }
      `}</style>
    </div>
  );
}

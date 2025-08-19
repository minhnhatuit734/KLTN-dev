/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowRight,
  Users,
  Notebook,
  ShoppingCart,
  BarChart2,
  Globe,
  ImagePlus,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
};
type Booking = {
  _id: string;
  user: any;
  tour: any;
  num_people: number;
  total_price: number;
  status: string;
  createdAt?: string;
};
type Blog = { _id: string; title: string; author: any; createdAt: string };
type Tour = {
  _id: string;
  title: string;
  location?: string;
  description?: string;
  price?: number;
  capacity?: number;
  start_date?: string;
  end_date?: string;
  image?: string;
  organizer?: any;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const tabs = [
  { key: "revenue", label: "Doanh thu", icon: BarChart2 },
  { key: "users", label: "Tài khoản", icon: Users },
  { key: "bookings", label: "Đơn đặt tour", icon: ShoppingCart },
  { key: "tours", label: "Quản lý tour", icon: Globe },
  { key: "blogs", label: "Blog", icon: Notebook },
];

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("revenue");
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [message, setMessage] = useState<string>("");
  const [revenue, setRevenue] = useState<number>(0);

  // Chart
  const [chartMode, setChartMode] = useState<"month" | "year">("month");
  const [chartData, setChartData] = useState<any[]>([]);

  // CRUD Tour
  const [creating, setCreating] = useState(false);
  const [newTour, setNewTour] = useState({
    title: "",
    location: "",
    description: "",
    price: "",
    capacity: "",
    start_date: "",
    end_date: "",
    image: "",
  });
  const [, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Kiểm tra quyền
  useEffect(() => {
    const userInfo = localStorage.getItem("user_info");
    if (!userInfo) {
      setIsAdmin(false);
      window.location.href = "/login";
      return;
    }
    const user = JSON.parse(userInfo);
    if (user.role !== "admin") {
      setIsAdmin(false);
      window.location.href = "/";
      return;
    }
    setIsAdmin(true);
  }, []);

  // Fetch all data
  useEffect(() => {
    if (!isAdmin) return;
    const token = localStorage.getItem("access_token");
    fetch(`${BASE}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setUsers);
    fetch(`${BASE}/booking`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        const total = data
          .filter((b: Booking) => b.status === "confirmed")
          .reduce((sum: number, b: Booking) => sum + (b.total_price || 0), 0);
        setRevenue(total);
      });
    fetch(`${BASE}/blog-post`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setBlogs);
    fetch(`${BASE}/tours`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setTours);
  }, [isAdmin]);

  // Biểu đồ doanh thu
  useEffect(() => {
    if (!isAdmin || !bookings.length) return;
    if (chartMode === "month") {
      const now = new Date();
      const year = now.getFullYear();
      const monthly = Array.from({ length: 12 }, (_, i) => ({
        name: `T${i + 1}`,
        revenue: 0,
        bookings: 0,
      }));
      bookings.forEach((b) => {
        if (b.status !== "confirmed") return;
        const date = new Date(b.createdAt ?? "");
        if (date.getFullYear() === year) {
          const idx = date.getMonth();
          monthly[idx].revenue += b.total_price || 0;
          monthly[idx].bookings += 1;
        }
      });
      setChartData(monthly);
    } else {
      const years: Record<string, { revenue: number; bookings: number }> = {};
      bookings.forEach((b) => {
        if (b.status !== "confirmed") return;
        const date = new Date(b.createdAt ?? "");
        const y = date.getFullYear();
        if (!years[y]) years[y] = { revenue: 0, bookings: 0 };
        years[y].revenue += b.total_price || 0;
        years[y].bookings += 1;
      });
      const sortedYears = Object.entries(years)
        .sort(([a], [b]) => Number(a) - Number(b))
        .slice(-5)
        .map(([year, val]) => ({
          name: year,
          revenue: val.revenue,
          bookings: val.bookings,
        }));
      setChartData(sortedYears);
    }
  }, [bookings, chartMode, isAdmin]);

  // Thông báo tự động ẩn sau 3s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 3200);
    return () => clearTimeout(t);
  }, [message]);

  // CRUD Handlers
  const handleApproveBooking = async (id: string, status: string) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/booking/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setMessage("✔️ Cập nhật booking thành công!");
      setBookings(bookings.map((b) => (b._id === id ? { ...b, status } : b)));
      if (status === "confirmed") {
        const booking = bookings.find((b) => b._id === id);
        setRevenue(revenue + (booking?.total_price || 0));
      }
    } else {
      setMessage("❌ Lỗi khi cập nhật booking.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa tài khoản này?")) return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage("🗑️ Xóa user thành công!");
      setUsers(users.filter((u) => u._id !== id));
    } else {
      setMessage("❌ Lỗi khi xóa user.");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa blog này?")) return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/blog-post/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage("🗑️ Xóa blog thành công!");
      setBlogs(blogs.filter((b) => b._id !== id));
    } else {
      setMessage("❌ Lỗi khi xóa blog.");
    }
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa tour này?")) return;
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/tours/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessage("🗑️ Xóa tour thành công!");
      setTours(tours.filter((t) => t._id !== id));
    } else {
      setMessage("❌ Lỗi khi xóa tour.");
    }
  };

  // Upload ảnh tour riêng
  const handleUploadImage = async (file: File) => {
    setMessage("Đang tải ảnh...");
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE}/tours/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      const { url } = await res.json();
      setNewTour((t) => ({ ...t, image: url }));
      setMessage("Tải ảnh thành công!");
    } else {
      setMessage("❌ Tải ảnh thất bại!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    handleUploadImage(file);
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const token = localStorage.getItem("access_token");
    const payload = {
      ...newTour,
      price: Number(newTour.price),
      capacity: Number(newTour.capacity),
      start_date: newTour.start_date ? newTour.start_date : undefined,
      end_date: newTour.end_date ? newTour.end_date : undefined,
    };
    const res = await fetch(`${BASE}/tours`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    setCreating(false);
    if (res.ok) {
      setMessage("✔️ Đăng tour thành công!");
      const data = await res.json();
      setTours([...tours, data]);
      setNewTour({
        title: "",
        location: "",
        description: "",
        price: "",
        capacity: "",
        start_date: "",
        end_date: "",
        image: "",
      });
      setImageFile(null);
      setPreviewUrl("");
    } else {
      setMessage("❌ Đăng tour thất bại!");
    }
  };

  if (isAdmin === null)
    return (
      <div className="flex items-center justify-center h-screen text-2xl">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  if (!isAdmin)
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-red-500">
        Bạn không có quyền truy cập trang này!
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50">
      {/* Sidebar */}
      <aside className="w-[240px] min-h-screen bg-gradient-to-b from-sky-800 to-sky-500 shadow-2xl flex flex-col gap-2 pt-14 px-5 rounded-r-3xl border-r border-blue-100">
        <div className="text-2xl font-black tracking-tight text-white mb-8 pl-2">
          Admin Panel
        </div>
        {tabs.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            onClick={() => setActiveTab(key)}
            variant="ghost"
            className={`justify-start gap-3 w-full mb-1 text-base font-semibold rounded-xl px-4 py-2
              transition-all duration-150
              ${
                activeTab === key
                  ? "bg-white text-sky-800 shadow-md scale-[1.04]"
                  : "text-sky-100 hover:bg-sky-700 hover:text-white"
              }`}
          >
            <Icon size={22} /> {label}
          </Button>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 mt-8 flex flex-col gap-8">
        {/* Thông báo */}
        {message && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-emerald-400 to-sky-500 text-white shadow-xl px-7 py-3 rounded-2xl text-lg font-semibold flex items-center gap-2 animate-fade-in-up">
            {message}
          </div>
        )}

        {/* 1. Doanh thu & Chart */}
        {activeTab === "revenue" && (
          <Card className="max-w-3xl mx-auto mb-10 rounded-3xl shadow-xl border border-sky-100 bg-white/90">
            <CardContent className="py-10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex gap-4 items-end">
                    <div className="text-5xl font-extrabold text-emerald-600 drop-shadow">
                      {revenue.toLocaleString()}₫
                    </div>
                    <Button
                      variant="outline"
                      className="ml-2 px-3 text-sm font-semibold border-emerald-400 shadow-md rounded-xl"
                      onClick={() =>
                        setChartMode((m) => (m === "month" ? "year" : "month"))
                      }
                    >
                      Xem theo: {chartMode === "month" ? "năm" : "tháng"}
                    </Button>
                  </div>
                  <div className="text-lg text-sky-700 mt-1">
                    Tổng doanh thu các booking đã xác nhận
                  </div>
                </div>
                <ArrowRight
                  size={56}
                  className="text-emerald-400 hidden md:block"
                />
              </div>
              <div className="w-full h-[360px] mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={14} />
                    <YAxis
                      fontSize={14}
                      tickFormatter={(v) => v.toLocaleString()}
                    />
                    <Tooltip
                      formatter={(v) => Number(v).toLocaleString() + "₫"}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      name="Số đơn"
                      stroke="#2563eb"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. User Table */}
        {activeTab === "users" && (
          <Card className="rounded-3xl shadow-xl border border-blue-100 bg-white/90">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-sky-800 mb-6">
                Tài khoản người dùng
              </h2>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>SĐT</TableHead>
                      <TableHead>Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id} className="hover:bg-sky-50/50">
                        <TableCell>{u._id}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell className="capitalize">{u.role}</TableCell>
                        <TableCell>{u.phone || "-"}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-xl flex items-center gap-1 transition-all duration-150 active:scale-95"
                          >
                            <Trash2 size={16} /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3. Bookings Table */}
        {activeTab === "bookings" && (
          <Card className="rounded-3xl shadow-xl border border-sky-100 bg-white/90">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-sky-800 mb-6">
                Đơn đặt tour
              </h2>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50">
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Số người</TableHead>
                      <TableHead>Tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Duyệt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b._id} className="hover:bg-sky-50/40">
                        <TableCell>{b._id}</TableCell>
                        <TableCell>{b.user?.name || "?"}</TableCell>
                        <TableCell>{b.tour?.title || "?"}</TableCell>
                        <TableCell>{b.num_people}</TableCell>
                        <TableCell>
                          {b.total_price?.toLocaleString()}₫
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-2xl text-xs font-bold transition-all
                            ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700"
                                : b.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {b.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {b.status !== "confirmed" && (
                            <Button
                              onClick={() =>
                                handleApproveBooking(b._id, "confirmed")
                              }
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded-xl transition-all duration-150 active:scale-95"
                            >
                              Duyệt
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Tour Table + Đăng Tour */}
        {activeTab === "tours" && (
          <Card className="rounded-3xl shadow-xl border border-sky-100 bg-white/90">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-sky-800 mb-8">
                Quản lý Tour
              </h2>
              {/* Đăng tour mới */}
              <form
                onSubmit={handleCreateTour}
                className="bg-gradient-to-br from-blue-50 via-sky-50 to-white border border-sky-100 rounded-2xl p-8 mb-10 flex flex-wrap gap-6 items-end shadow-md"
              >
                {/* Upload ảnh */}
                <div className="flex flex-col items-center">
                  <label className="cursor-pointer">
                    <span className="flex flex-col items-center gap-2">
                      {previewUrl || newTour.image ? (
                        <img
                          src={previewUrl || newTour.image}
                          alt="preview"
                          className="w-24 h-24 object-cover rounded-2xl border-2 border-emerald-100 shadow"
                        />
                      ) : (
                        <span className="w-24 h-24 flex items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 text-gray-400 bg-white">
                          <ImagePlus size={38} />
                        </span>
                      )}
                      <span className="text-xs text-sky-700 underline">
                        Tải ảnh tour
                      </span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[210px] text-base bg-white shadow-sm"
                  placeholder="Tên tour*"
                  value={newTour.title}
                  onChange={(e) =>
                    setNewTour({ ...newTour, title: e.target.value })
                  }
                  required
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[160px] text-base bg-white shadow-sm"
                  placeholder="Địa điểm*"
                  value={newTour.location}
                  onChange={(e) =>
                    setNewTour({ ...newTour, location: e.target.value })
                  }
                  required
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[120px] text-base bg-white shadow-sm"
                  placeholder="Giá (VNĐ)*"
                  type="number"
                  min="0"
                  value={newTour.price}
                  onChange={(e) =>
                    setNewTour({ ...newTour, price: e.target.value })
                  }
                  required
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[120px] text-base bg-white shadow-sm"
                  placeholder="Sức chứa"
                  type="number"
                  min="1"
                  value={newTour.capacity}
                  onChange={(e) =>
                    setNewTour({ ...newTour, capacity: e.target.value })
                  }
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[155px] text-base bg-white shadow-sm"
                  type="date"
                  placeholder="Ngày bắt đầu"
                  value={newTour.start_date}
                  onChange={(e) =>
                    setNewTour({ ...newTour, start_date: e.target.value })
                  }
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-[155px] text-base bg-white shadow-sm"
                  type="date"
                  placeholder="Ngày kết thúc"
                  value={newTour.end_date}
                  onChange={(e) =>
                    setNewTour({ ...newTour, end_date: e.target.value })
                  }
                />
                <input
                  className="px-4 py-2 rounded-xl border border-sky-200 w-full text-base bg-white shadow-sm"
                  placeholder="Mô tả"
                  value={newTour.description}
                  onChange={(e) =>
                    setNewTour({ ...newTour, description: e.target.value })
                  }
                />
                <Button
                  type="submit"
                  className="bg-sky-600 hover:bg-sky-700 text-white px-10 py-2 text-base font-semibold rounded-2xl shadow-md active:scale-95"
                  disabled={creating || !newTour.image}
                  title={!newTour.image ? "Vui lòng tải ảnh tour" : ""}
                >
                  {creating ? "Đang đăng..." : "Đăng tour"}
                </Button>
              </form>
              {/* Danh sách tour */}
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Tên tour</TableHead>
                      <TableHead>Địa điểm</TableHead>
                      <TableHead>Giá</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Ngày kết thúc</TableHead>
                      <TableHead>Ảnh</TableHead>
                      <TableHead>Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tours.map((tour) => (
                      <TableRow key={tour._id} className="hover:bg-sky-50/40">
                        <TableCell>{tour._id}</TableCell>
                        <TableCell>{tour.title}</TableCell>
                        <TableCell>{tour.location}</TableCell>
                        <TableCell>{tour.price?.toLocaleString()}₫</TableCell>
                        <TableCell>
                          {tour.start_date
                            ? new Date(tour.start_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : ""}
                        </TableCell>
                        <TableCell>
                          {tour.end_date
                            ? new Date(tour.end_date).toLocaleDateString(
                                "vi-VN",
                              )
                            : ""}
                        </TableCell>
                        <TableCell>
                          {tour.image && (
                            <img
                              src={tour.image}
                              alt="tour"
                              className="w-16 h-14 object-cover rounded-xl shadow border"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDeleteTour(tour._id)}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-xl flex items-center gap-1 transition-all duration-150 active:scale-95"
                          >
                            <Trash2 size={16} /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {tours.length === 0 && (
                  <div className="text-center text-gray-500 py-5">
                    Chưa có tour nào.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 5. Blog Table */}
        {activeTab === "blogs" && (
          <Card className="rounded-3xl shadow-xl border border-blue-100 bg-white/90">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-sky-800 mb-6">
                Danh sách Blog
              </h2>
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-sky-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Tác giả</TableHead>
                      <TableHead>Ngày đăng</TableHead>
                      <TableHead>Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((b) => (
                      <TableRow key={b._id} className="hover:bg-sky-50/40">
                        <TableCell>{b._id}</TableCell>
                        <TableCell>{b.title}</TableCell>
                        <TableCell>{b.author?.name || "?"}</TableCell>
                        <TableCell>
                          {b.createdAt
                            ? new Date(b.createdAt).toLocaleDateString("vi-VN")
                            : ""}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDeleteBlog(b._id)}
                            className="bg-red-500 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-xl flex items-center gap-1 transition-all duration-150 active:scale-95"
                          >
                            <Trash2 size={16} /> Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {blogs.length === 0 && (
                  <div className="text-center text-gray-400 py-5">
                    Không có bài viết nào!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

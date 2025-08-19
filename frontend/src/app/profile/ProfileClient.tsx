"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProfileClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";

  const [form, setForm] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "",
  });
  const [preview, setPreview] = useState(""); // Ảnh preview khi chọn file
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Lấy user info
  useEffect(() => {
    if (!id) return;
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user._id === id) {
        setIsOwner(true);
        setForm(user);
        return;
      }
    }
    // Nếu không phải owner thì fetch
    fetch(`${BASE}/users/${id}`)
      .then((res) => res.json())
      .then((user) => setForm(user))
      .catch(() => setMessage("Không tìm thấy người dùng"));
  }, [id]);

  // Xem trước ảnh
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Hiển thị ảnh preview (trước khi upload)
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMessage("⚠️ Bạn chưa đăng nhập");
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE}/users/${form._id}/avatar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setForm((f) => ({ ...f, avatar: updated.avatar }));
        localStorage.setItem("user_info", JSON.stringify(updated));
        setMessage("✅ Upload thành công!");
        setPreview(""); // reset preview (giữ đúng link mới)
      } else {
        setMessage("Upload thất bại");
      }
    } catch {
      setMessage("Lỗi mạng khi upload");
    } finally {
      setUploading(false);
    }
  };

  // Cập nhật thông tin
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setMessage("⚠️ Bạn chưa đăng nhập");
        return;
      }
      const res = await fetch(`${BASE}/users/${form._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user_info", JSON.stringify(updated));
        setMessage("✅ Lưu thành công!");
      } else {
        setMessage("Lỗi lưu thông tin");
      }
    } catch {
      setMessage("Lỗi mạng");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-sky-800 mb-2">
          Hồ sơ
        </h2>
        {/* Upload avatar UI */}
        <div className="flex flex-col items-center relative mb-3">
          <div className="relative group w-24 h-24">
            <img
              src={preview || form.avatar || "/images/default-avatar.png"}
              alt="avatar"
              className="w-24 h-24 rounded-full border-4 border-sky-200 object-cover shadow"
            />
            {isOwner && (
              <>
                {/* Ẩn input file, chỉ show khi bấm vào ảnh */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  title="Đổi ảnh đại diện"
                />
                {/* Overlay icon camera khi hover */}
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 z-10 transition-opacity pointer-events-none">
                  <Camera size={28} className="text-white" />
                </div>
              </>
            )}
          </div>
          {isOwner && (
            <span className="block text-xs text-gray-400 mt-2">
              {uploading ? "Đang tải lên..." : "Nhấn vào ảnh để đổi"}
            </span>
          )}
        </div>

        <div>
          <Label>Họ và tên</Label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={!isOwner}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={form.email} disabled />
        </div>
        <div>
          <Label>Số điện thoại</Label>
          <Input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={!isOwner}
          />
        </div>
        <div>
          <Label>Quyền</Label>
          <Input value={form.role} disabled />
        </div>
        <div>
          <Label>ID</Label>
          <Input value={form._id} disabled />
        </div>
        {message && (
          <div className="text-center text-blue-700 text-sm animate-pulse">
            {message}
          </div>
        )}
        {isOwner && (
          <Button className="w-full bg-sky-600 hover:bg-sky-700">
            Lưu thay đổi
          </Button>
        )}
      </form>
    </div>
  );
}

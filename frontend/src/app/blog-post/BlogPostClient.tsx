"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ImagePlus } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://travel-backend.local";

export default function BlogPostClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorId = searchParams.get("id") || "";

  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    setMessage("Đang tải ảnh...");
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${BASE}/blog-post/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, image: data.url }));
        setMessage("Tải ảnh thành công!");
      } else {
        setMessage("❌ Tải ảnh thất bại! Hãy thử lại.");
      }
    } catch {
      setMessage("❌ Không thể upload ảnh!");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Đăng bài viết mới
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    if (!form.title.trim() || !form.content.trim()) {
      setMessage("Vui lòng nhập đủ tiêu đề và nội dung.");
      setSubmitting(false);
      return;
    }
    if (!authorId) {
      setMessage("Thiếu thông tin tác giả!");
      setSubmitting(false);
      return;
    }
    const token = localStorage.getItem("access_token");
    const payload = {
      ...form,
      author: authorId,
    };
    try {
      const res = await fetch(`${BASE}/blog-post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("✅ Đăng blog thành công!");
        setForm({ title: "", content: "", image: "" });
        setPreviewUrl("");
        setImageFile(null);
        setTimeout(() => router.push("/blog"), 1500);
      } else {
        setMessage("❌ Đăng blog thất bại!");
      }
    } catch {
      setMessage("❌ Lỗi mạng!");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-50 via-pink-50 to-blue-50 flex justify-center items-center py-10">
      <Card className="w-full max-w-xl rounded-3xl shadow-2xl border-sky-100 bg-white/95">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-center text-sky-800 mb-6">
            Đăng Blog Mới
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Tiêu đề */}
            <div>
              <input
                type="text"
                name="title"
                placeholder="Tiêu đề bài viết"
                className="w-full border rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-sky-400"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Upload ảnh */}
            <div className="flex flex-col items-center">
              <label className="cursor-pointer">
                <span className="flex flex-col items-center gap-2">
                  {previewUrl || form.image ? (
                    <img
                      src={previewUrl || form.image}
                      alt="preview"
                      className="w-40 h-32 object-cover rounded-2xl border-2 border-sky-100 shadow"
                    />
                  ) : (
                    <span className="w-40 h-32 flex items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 text-gray-400 bg-white">
                      <ImagePlus size={40} />
                    </span>
                  )}
                  <span className="text-xs text-sky-700 underline">
                    Chọn ảnh đại diện
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

            {/* Nội dung */}
            <textarea
              name="content"
              placeholder="Nhập nội dung blog..."
              rows={7}
              className="w-full border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-sky-400"
              value={form.content}
              onChange={handleChange}
              required
            />

            {/* Thông báo */}
            {message && (
              <div className="text-center text-base font-medium text-blue-700 animate-pulse min-h-[22px]">
                {message}
              </div>
            )}

            {/* Nút submit */}
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white text-lg font-semibold rounded-xl px-8 py-2 mt-2"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin mr-1" />
              ) : null}
              Đăng Blog
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

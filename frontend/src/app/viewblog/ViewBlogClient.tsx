/* eslint-disable @typescript-eslint/no-explicit-any */
// app/viewblog/ViewBlogClient.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type Blog = {
  _id?: string;
  id?: string;
  title: string;
  content?: string;
  image?: string;
  createdAt?: string;
  author?: { _id?: string; name?: string } | string;
};
type Comment = {
  _id?: string;
  user?: { _id?: string; name?: string } | string;
  post?: string;
  comment: string;
  createdAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ViewBlogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load blog
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${BASE}/blog-post/${id}`)
      .then((res) => res.json())
      .then((data) => setBlog(data))
      .catch(() => setError("Không tải được bài viết"))
      .finally(() => setLoading(false));
    // User info
    const info = localStorage.getItem("user_info");
    if (info) setUser(JSON.parse(info));
  }, [id]);

  // Load comments
  useEffect(() => {
    if (!id) return;
    setCommentLoading(true);
    fetch(`${BASE}/blog-comment?post=${id}`)
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
  }, [id]);

  // Submit comment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) {
      alert("Nhập nội dung bình luận!");
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/blog-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: user._id,
        post: id,
        comment: newComment.trim(),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setNewComment("");
      // Reload comments
      fetch(`${BASE}/blog-comment?post=${id}`)
        .then((res) => res.json())
        .then((data) => setComments(data));
    } else {
      alert("Lỗi khi gửi bình luận!");
    }
  };

  const handleBack = () => router.push("/");

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="animate-spin rounded-full border-4 border-sky-200 border-t-sky-600 h-10 w-10 inline-block mr-2"></span>
        Đang tải bài viết...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-red-600 text-lg">
        {error}
      </div>
    );

  if (!blog)
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-500">
        Không tìm thấy bài viết.
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

      <h1 className="text-3xl font-bold text-center text-sky-800 mb-4">
        {blog.title}
      </h1>
      <img
        src={blog.image || "/images/default_blog.jpg"}
        alt={blog.title}
        className="rounded-xl shadow w-full h-72 object-cover border"
        onError={(e) =>
          ((e.target as HTMLImageElement).src = "/images/default_blog.jpg")
        }
      />
      <div className="text-gray-700 text-base whitespace-pre-line mt-4">
        {blog.content || "Không có nội dung."}
      </div>
      <div className="text-gray-400 text-sm mt-2">
        Đăng bởi:{" "}
        <b>
          {typeof blog.author === "object"
            ? blog.author?.name
            : blog.author || "Ẩn danh"}
        </b>{" "}
        •{" "}
        {blog.createdAt ? new Date(blog.createdAt).toLocaleString("vi-VN") : ""}
      </div>

      {/* Comment section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 text-sky-800">Bình luận</h2>
        {user ? (
          <form
            className="flex flex-col gap-2 mb-6 bg-sky-50 rounded-xl p-4 shadow"
            onSubmit={handleSubmit}
          >
            <textarea
              className="border rounded p-2"
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              required
            />
            <Button
              type="submit"
              className="bg-sky-600 text-white w-max px-6"
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </form>
        ) : (
          <div className="mb-4 text-gray-500">
            <b>Bạn cần đăng nhập để bình luận.</b>
          </div>
        )}
        {/* Danh sách bình luận */}
        {commentLoading ? (
          <div className="text-sky-600 text-center py-6">
            Đang tải bình luận...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 text-center">
            Chưa có bình luận nào.
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((cmt) => (
              <div
                key={cmt._id}
                className="bg-white rounded-lg shadow border px-5 py-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sky-700">
                    {typeof cmt.user === "object" && cmt.user?.name
                      ? cmt.user.name
                      : "Ẩn danh"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    •{" "}
                    {cmt.createdAt
                      ? new Date(cmt.createdAt).toLocaleString("vi-VN")
                      : ""}
                  </span>
                </div>
                <div className="text-gray-700">{cmt.comment}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

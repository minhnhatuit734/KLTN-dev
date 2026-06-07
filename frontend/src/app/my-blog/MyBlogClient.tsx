/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Pencil, ImagePlus } from "lucide-react";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Blog = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: any;
};

export default function MyBlogClient() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id") || "";

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit state
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [editImgPreview, setEditImgPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch user's blogs
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`${BASE}/blog-post`)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(
          data.filter(
            (b: any) => b.author === userId || b.author?._id === userId
          )
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Auto-hide message
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 2500);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Delete blog
  const handleDeleteBlog = async (id: string) => {
    setDeletingId(id);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/blog-post/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeletingId(null);
    if (res.ok) {
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      setMessage("🗑️ Đã xóa blog!");
    } else {
      setMessage("❌ Lỗi khi xóa blog.");
    }
  };

  // Open edit modal
  const openEditModal = (blog: Blog) => {
    setEditBlog(blog);
    setEditForm({
      title: blog.title,
      content: blog.content,
      image: blog.image || "",
    });
    setEditImgPreview(blog.image || "");
  };

  // Handle image upload in edit
  const handleEditImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImgPreview(URL.createObjectURL(file));
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE}/blog-post/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setEditForm((f) => ({ ...f, image: data.url }));
      setMessage("Tải ảnh thành công!");
    } else {
      setMessage("❌ Upload ảnh thất bại!");
    }
  };

  // Save edit blog
  const handleSaveEdit = async () => {
    if (!editBlog) return;
    setSaving(true);
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE}/blog-post/${editBlog._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });
    setSaving(false);
    if (res.ok) {
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === editBlog._id
            ? { ...b, ...editForm, updatedAt: new Date().toISOString() }
            : b
        )
      );
      setEditBlog(null);
      setMessage("✔️ Đã cập nhật blog!");
    } else {
      setMessage("❌ Lỗi khi cập nhật blog.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-sky-800 mb-2 text-center">
        Blog của tôi
      </h1>
      {message && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-sky-400 to-pink-400 text-white shadow-xl px-6 py-2 rounded-2xl text-base font-semibold animate-fade-in-up">
          {message}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="animate-spin mr-2" />
          Đang tải blog...
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500">Bạn chưa có blog nào.</div>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="rounded-xl shadow-lg border bg-white flex flex-col md:flex-row gap-4 p-4 relative"
            >
              <img
                src={blog.image || "/images/default_blog.jpg"}
                alt={blog.title}
                className="rounded-xl w-full md:w-52 h-40 object-cover border"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "/images/default_blog.jpg")
                }
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-sky-800">
                    {blog.title}
                  </h2>
                  <div className="text-gray-700 text-base line-clamp-3 mt-2">
                    {blog.content}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  {/* Edit */}
                  <Dialog
                    open={editBlog?._id === blog._id}
                    onOpenChange={(open) =>
                      open ? openEditModal(blog) : setEditBlog(null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-yellow-400 text-sky-900 font-semibold rounded-xl hover:bg-yellow-500 flex items-center gap-1 px-4 py-2"
                      >
                        <Pencil size={16} /> Sửa
                      </Button>
                    </DialogTrigger>
                    {editBlog?._id === blog._id && (
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Chỉnh sửa Blog</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                          <input
                            className="w-full border rounded-xl px-4 py-2 text-base"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Tiêu đề"
                          />
                          <textarea
                            className="w-full border rounded-xl px-4 py-2 text-base"
                            value={editForm.content}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                content: e.target.value,
                              }))
                            }
                            placeholder="Nội dung"
                            rows={6}
                          />
                          {/* Upload image */}
                          <div className="flex flex-col items-center">
                            <label className="cursor-pointer">
                              <span className="flex flex-col items-center gap-2">
                                {editImgPreview || editForm.image ? (
                                  <img
                                    src={editImgPreview || editForm.image}
                                    alt="preview"
                                    className="w-36 h-28 object-cover rounded-2xl border"
                                  />
                                ) : (
                                  <span className="w-36 h-28 flex items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 text-gray-400 bg-white">
                                    <ImagePlus size={30} />
                                  </span>
                                )}
                                <span className="text-xs text-sky-700 underline">
                                  Chọn ảnh mới
                                </span>
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditImageChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="bg-sky-700 text-white rounded-xl"
                          >
                            {saving ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              "Lưu"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl px-4 py-2 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Xóa
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Bạn chắc chắn muốn xóa blog này?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Thao tác này không thể hoàn tác.
                          <br />
                          Xóa blog: <b>{blog.title}</b>?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white"
                          disabled={deletingId === blog._id}
                          onClick={() => handleDeleteBlog(blog._id)}
                        >
                          {deletingId === blog._id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            "Xác nhận"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="text-gray-400 text-xs mt-2">
                  Đăng lúc:{" "}
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleString("vi-VN")
                    : ""}
                  {blog.updatedAt && (
                    <>
                      <br />
                      Cập nhật:{" "}
                      {new Date(blog.updatedAt).toLocaleString("vi-VN")}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

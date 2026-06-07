/* eslint-disable @next/next/no-img-element */
"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Blog = {
  _id: string;
  title: string;
  content?: string;
  image?: string;
  createdAt?: string;
  author?: { name?: string };
};

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filtered, setFiltered] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch(`${BASE}/blog-post`)
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));

    const info = localStorage.getItem("user_info");
    if (info) {
      const user = JSON.parse(info);
      setUserId(user._id || user.id || null);
    }
  }, []);

  // Tìm kiếm theo tiêu đề
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const keyword = search.trim().toLowerCase();
    if (keyword === "") {
      setFiltered(blogs);
    } else {
      setFiltered(
        blogs.filter((blog) => blog.title.toLowerCase().includes(keyword)),
      );
    }
  };

  const handleCreateBlog = () => {
    const info = localStorage.getItem("user_info");
    if (!info) {
      router.push("/login");
    } else {
      const user = JSON.parse(info);
      const id = user._id || user.id;
      router.push(`/blog-post/?id=${id}`);
    }
  };

  return (
    <main className="min-h-screen bg-white" style={{ paddingTop: "84px" }}>
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 px-4 md:px-0 gap-4">
        <h1 className="text-3xl font-bold text-sky-800">Blog</h1>
        <form
          onSubmit={handleSearch}
          className="flex gap-2 items-center w-full md:w-auto"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tiêu đề..."
            className="border border-sky-200 rounded-lg px-3 py-2 outline-sky-400 focus:ring-2 ring-sky-200 text-sm min-w-[180px]"
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold shadow active:scale-95 transition-all"
          >
            Tìm kiếm
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFiltered(blogs);
              }}
              className="ml-1 text-sky-700 border border-sky-300 rounded px-3 py-2 text-sm hover:bg-sky-50"
            >
              Tất cả
            </button>
          )}
        </form>
        <button
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition-all active:scale-95"
          onClick={handleCreateBlog}
        >
          + Đăng blog
        </button>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto px-4 md:px-0">
        {loading && (
          <div className="text-center text-sky-700 text-lg">
            Đang tải bài viết...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-500 text-base py-6">
            Không có bài viết phù hợp.
          </div>
        )}
        {!loading &&
          filtered.map((blog) => (
            <div
              key={blog._id}
              className="flex items-start gap-4 border-b pb-4 last:border-none"
            >
              <img
                src={blog.image || "/images/default_blog.jpg"}
                alt={blog.title}
                className="w-32 h-24 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-sky-800">
                  {blog.title}
                </h2>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {blog.content ?? ""}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>
                    🕒{" "}
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("vi-VN")
                      : ""}
                  </span>
                  <span className="mx-2">|</span>
                  <span>✍️ {blog.author?.name || "Unknown"}</span>
                </div>
                <Link href={`/viewblog/?id=${blog._id}`}>
                  <button className="mt-3 text-sm font-semibold text-sky-600 hover:text-sky-800 underline underline-offset-4 transition">
                    Xem chi tiết →
                  </button>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}

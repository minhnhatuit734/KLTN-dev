"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!form.name || !form.email || !form.password) {
      setMessage("⚠️ Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Đăng ký thành công! Chuyển hướng đến đăng nhập...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(data.message || "Đăng ký thất bại.");
      }
    } catch (err) {
      console.error("Lỗi mạng:", err);
      setMessage("Lỗi mạng, vui lòng thử lại sau.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-center text-blue-800">
          Đăng ký
        </h2>

        <div>
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />
        </div>

        {message && (
          <div className="text-center text-sm text-blue-700 font-medium animate-pulse">
            {message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Đăng ký
        </Button>

        <div className="text-sm text-center mt-2 text-gray-700">
          <Link href="/login" className="underline hover:text-blue-900">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

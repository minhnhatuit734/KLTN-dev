"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!form.email || !form.password) {
      setMessage("⚠️ Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://travel-backend.local"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("👉 server login response", data);

      if (res.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        setMessage("✅ Đăng nhập thành công!");

        setTimeout(() => {
          if (data.user.role === "admin") {
            router.push("/dashboard/?id=${userId}`");
          } else {
            router.push("/");
          }
        }, 1000);
      } else {
        setMessage(data.message || "Sai thông tin đăng nhập.");
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
        <h2 className="text-2xl font-bold text-center text-sky-800">
          Đăng nhập
        </h2>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {message && (
          <div className="text-center text-sm text-blue-700 font-medium animate-pulse">
            {message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-700 transition-colors"
        >
          Đăng nhập
        </Button>

        <div className="text-sm text-center mt-2 text-gray-700">
          <Link href="/register" className="underline hover:text-blue-900">
            Chưa có tài khoản?
          </Link>{" "}
          |{" "}
          <Link href="/forgot" className="underline hover:text-blue-900">
            Quên mật khẩu
          </Link>
        </div>
      </form>
    </div>
  );
}

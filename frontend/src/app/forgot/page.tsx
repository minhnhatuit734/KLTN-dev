"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    name: "",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!form.email || !form.name) {
      setMessage("⚠️ Vui lòng nhập đầy đủ email và tên.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://travel-backend.local"}/auth/forgot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );

      if (res.ok) {
        setMessage(
          "✅ Mật khẩu của bạn đã được đặt lại thành 123456, vui lòng đăng nhập.",
        );
        setTimeout(() => router.push("/login"), 2000);
      } else {
        const data = await res.json();
        setMessage(data.message || "Không tìm thấy tài khoản phù hợp.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi mạng, thử lại sau.");
    }
  };
  console.log("form data submit", form);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-100 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-2xl font-bold text-center text-blue-800">
          Quên mật khẩu
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
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            name="name"
            placeholder="Nguyễn Văn A"
            value={form.name}
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
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Xác nhận
        </Button>

        <div className="text-sm text-center mt-2 text-gray-700">
          <span>Quay về </span>
          <a href="/login" className="underline hover:text-blue-900">
            đăng nhập
          </a>
        </div>
      </form>
    </div>
  );
}

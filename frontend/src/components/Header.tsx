/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserCircle, BookOpen, LogOut } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import ChatbotPopover from "@/components/ChatbotPopover"; // <-- Thêm ChatbotPopover ở đây

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadUser = () => {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      const userParsed = JSON.parse(userInfo);
      setUser(userParsed);
      setUserId(userParsed._id || userParsed.id || null);
    } else {
      setUser(null);
      setUserId(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("userLogin", loadUser);
    window.addEventListener("userLogout", loadUser);
    return () => {
      window.removeEventListener("userLogin", loadUser);
      window.removeEventListener("userLogout", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    window.dispatchEvent(new Event("userLogout"));
    // window.location.reload();
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
    <header className="fixed w-full z-50 bg-gradient-to-r from-sky-400 via-sky-200 to-pink-200 border-b backdrop-blur-xl shadow-[0_2px_12px_rgba(90,180,255,0.09)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            width={40}
            height={40}
            alt="logo"
            className="rounded-xl shadow-md border border-sky-100 bg-white"
            priority
          />
          <span className="font-extrabold text-2xl md:text-3xl tracking-tight select-none flex">
            <span className="text-sky-800 drop-shadow font-black">Tourism</span>
            <span className="ml-1 text-pink-600 font-black drop-shadow-lg">
              World
            </span>
          </span>
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-2 md:gap-4 relative">
          <Link href="/">
            <Button
              variant="ghost"
              className="px-4 rounded-full font-semibold text-base hover:bg-sky-50"
            >
              Trang chủ
            </Button>
          </Link>
          <Link href="/blog">
            <Button
              variant="ghost"
              className="px-4 rounded-full font-semibold text-base hover:bg-sky-50"
            >
              Blog
            </Button>
          </Link>
          <ModeToggle />
          <ChatbotPopover /> {/* Chatbot nằm kế bên ModeToggle */}
          {/* User Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="ml-1 focus:outline-none group"
                aria-label="Tài khoản"
              >
                <div className="w-11 h-11 rounded-full border-2 border-sky-200 shadow-lg overflow-hidden transition-all group-hover:ring-2 group-hover:ring-sky-400 group-hover:scale-105">
                  <Image
                    src={user.avatar || "/images/default-avatar.jpg"}
                    alt="avatar"
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                </div>
              </button>
              {/* Dropdown menu */}
              <div
                className={`absolute top-full right-0 mt-3 min-w-[180px] rounded-2xl bg-white border shadow-2xl z-50 transition-all
                  ${showDropdown ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"}
                  animate-fadeIn`}
                style={{ boxShadow: "0 12px 32px rgba(56,180,255,0.09)" }}
              >
                <Link
                  href={`/profile/?id=${userId}`}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-sky-50 rounded-t-2xl font-medium"
                  onClick={() => setShowDropdown(false)}
                >
                  <UserCircle size={18} /> Hồ sơ cá nhân
                </Link>
                <Link
                  href={`/my-booking/?id=${userId}`}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-sky-50 font-medium"
                  onClick={() => setShowDropdown(false)}
                >
                  <BookOpen size={18} /> Đơn đặt tour
                </Link>
                <Link
                  href={`/my-blog/?id=${userId}`}
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-sky-50 font-medium"
                  onClick={() => setShowDropdown(false)}
                >
                  <BookOpen size={18} /> Blog của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-red-600 hover:bg-sky-50 rounded-b-2xl font-medium"
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="ml-2 px-5 font-semibold rounded-full border-sky-300 hover:border-sky-400"
                >
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="ml-2 px-5 font-semibold rounded-full bg-gradient-to-r from-sky-500 to-sky-700 text-white shadow-md hover:from-sky-600 hover:to-sky-800">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

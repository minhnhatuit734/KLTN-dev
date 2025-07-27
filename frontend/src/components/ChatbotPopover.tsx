"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

export default function ChatbotPopover() {
  const [open, setOpen] = useState(false);
  const [model] = useState<"llama-3">("llama-3"); // Chỉ 1 model, dùng Together AI (LLaMA3)
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Xin chào! Bạn cần hỏi gì về du lịch hoặc website này?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Gửi message qua BE API Route
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    setMessages((msgs) => [...msgs, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    setMessages((msgs) => [
      ...msgs,
      { role: "bot", text: "🤖 Đang trả lời..." },
    ]);

    // Lấy lịch sử hội thoại gần nhất
    const history = [...messages, { role: "user", text: question }]
      .filter((m) => m.text !== "🤖 Đang trả lời...")
      .slice(-8);

    try {
      const res = await fetch("http://travel-backend.local/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
          messages: history.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.choices) {
        const errorMsg = data.error || "Lỗi gọi API!";
        setMessages((msgs) => [
          ...msgs.filter((m) => m.text !== "🤖 Đang trả lời..."),
          { role: "bot", text: `❌ ${errorMsg}` },
        ]);
        return;
      }

      const aiText =
        data.choices?.[0]?.message?.content?.trim() ||
        data.choices?.[0]?.text?.trim() ||
        "AI không trả lời được.";
      setMessages((msgs) => [
        ...msgs.filter((m) => m.text !== "🤖 Đang trả lời..."),
        { role: "bot", text: aiText },
      ]);
    } catch {
      setLoading(false);
      setMessages((msgs) => [
        ...msgs.filter((m) => m.text !== "🤖 Đang trả lời..."),
        { role: "bot", text: "❌ Lỗi server hoặc mạng!" },
      ]);
    }
  };

  // Đóng khi click outside
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".chatbot-popover")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative">
      {/* Nút mở Chatbot */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-sky-500 to-emerald-400 rounded-full shadow-lg text-white text-2xl hover:scale-110 transition-all"
        title="Trợ lý AI"
      >
        <Bot size={26} />
      </button>
      {/* Popover Chatbot */}
      {open && (
        <div className="chatbot-popover absolute right-0 mt-2 z-50 w-[340px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col animate-fade-in-up">
          <div className="px-5 py-3 bg-gradient-to-r from-sky-500 to-emerald-400 text-white font-bold text-lg flex justify-between items-center rounded-t-2xl">
            <span>Chatbot AI</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white text-xl font-bold hover:text-gray-200"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3 px-4 pt-2">
            <span className="text-xs text-gray-500">Model:</span>
            <select
              value={model}
              className="px-2 py-1 rounded border text-xs bg-blue-50 border-sky-200"
              disabled
            >
              <option value="llama-3">LLaMA 3 (Together AI)</option>
            </select>
          </div>
          <div
            className="flex-1 px-4 py-2 space-y-2 overflow-y-auto max-h-[260px] min-h-[120px] bg-blue-50/30
            scrollbar-thin scrollbar-thumb-sky-400 scrollbar-track-blue-100"
            style={{ overscrollBehavior: "contain" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-[80%] shadow text-sm
                    ${
                      msg.role === "user"
                        ? "bg-sky-600 text-white ml-8"
                        : "bg-white text-gray-800 mr-8 border"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-2 bg-white border-t rounded-b-2xl"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-sky-200 outline-none text-base bg-blue-50 focus:border-emerald-400"
              placeholder={loading ? "Đang trả lời..." : "Nhập tin nhắn..."}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend(e);
              }}
            />
            <button
              type="submit"
              className="p-2 bg-sky-600 hover:bg-emerald-500 rounded-full transition-colors text-white"
              disabled={!input.trim() || loading}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

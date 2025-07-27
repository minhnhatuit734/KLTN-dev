import { FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-gradient-to-t from-white via-sky-50 to-sky-100/70 shadow-inner rounded-t-2xl py-8 px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-10 mt-16">
      {/* Left: Contact Info */}
      <div className="flex flex-col items-start space-y-2 max-w-md">
        <h3 className="font-bold text-xl mb-1 text-sky-800">TourismWorld</h3>
        <div className="text-gray-600">
          <span className="font-semibold text-sky-700">Địa điểm:</span> 123
          KTX khu B Đại học Quốc gia Hà Nội, P. Linh Trung, Q. Thủ Đức, TP.HCM
        </div>
        <div className="text-gray-600">
          <span className="font-semibold text-sky-700">Số điện thoại:</span>{" "}
          0123 456 789
        </div>
        <div className="text-gray-600">
          <span className="font-semibold text-sky-700">Email:</span>{" "}
          contact@TourismWorld.vn
        </div>
        <div className="text-gray-600">
          <span className="font-semibold text-sky-700">Đối tác:</span> Công ty
          UIT Travel
        </div>
      </div>

      {/* Center: Social */}
      <div className="flex flex-col items-center">
        <h3 className="font-semibold text-lg mb-2 text-sky-800">
          Theo dõi chúng tôi
        </h3>
        <div className="flex gap-4">
          <a
            href="https://www.facebook.com/hoang.thien.1705"
            className="p-3 rounded-full bg-white shadow hover:scale-110 hover:bg-sky-100 transition-all duration-150"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF className="text-2xl text-sky-700" />
          </a>
          <a
            href="https://www.linkedin.com/in/thi%E1%BB%87n-l%C3%AA-gia-ho%C3%A0ng-5072322b3/"
            className="p-3 rounded-full bg-white shadow hover:scale-110 hover:bg-blue-100 transition-all duration-150"
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedinIn className="text-2xl text-blue-700" />
          </a>
          <a
            href="https://www.instagram.com/lghthien/"
            className="p-3 rounded-full bg-white shadow hover:scale-110 hover:bg-pink-100 transition-all duration-150"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className="text-2xl text-pink-500" />
          </a>
        </div>
      </div>

      {/* Right: Copyright */}
      <div className="text-sm text-gray-500 text-center md:text-right max-w-[200px]">
        <div>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-sky-700">TourismWorld</span>
        </div>
        <div className="text-xs mt-2">
          Cảm ơn bạn đã tin tưởng &amp; đồng hành cùng chúng tôi!
        </div>
      </div>
    </footer>
  );
}

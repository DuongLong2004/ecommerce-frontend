import React from "react";
import { Link } from "react-router-dom";

const Category = () => {
  const Categorys = [
    {
      img: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/dien_thoai_icon_cate_240938806d.png",
      title: "Điện thoại",
      link: "/Phones"
    },
    {
      img: "https://cdn2.fptshop.com.vn/unsafe/360x0/filters:format(webp):quality(75)/laptop_ic_cate_47e7264bc7.png",
      title: "Laptop",
      link: "/LaptopPace"
    }
  ];

  return (
    <div className="flex flex-row justify-center items-stretch gap-3 px-3 pt-2 pb-4 mb-10 overflow-x-auto scroll-smooth snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {Categorys.map((item, index) => (
        <Link
          to={item.link}
          key={index}
          className="
            group
            flex flex-col items-center justify-center gap-2
            cursor-pointer no-underline
            py-3.5 px-4 rounded-[18px]
            bg-white
            border border-[rgba(200,210,255,0.3)]
            shadow-[0_3px_10px_rgba(0,0,0,0.06)]
            min-w-[clamp(100px,40vw,140px)] flex-1 max-w-[180px] flex-shrink-0
            snap-start relative overflow-hidden
            transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            hover:-translate-y-1 hover:scale-[1.04]
            hover:shadow-[0_12px_28px_rgba(80,120,255,0.13)]
            hover:border-[rgba(100,160,255,0.45)]
            active:scale-[0.97] active:shadow-[0_4px_14px_rgba(80,120,255,0.1)]
          "
        >
          {/* Glow conic rotating effect */}
          <span
            className="
              absolute inset-[-60%] rounded-full opacity-0 z-0
              bg-[conic-gradient(from_0deg,#00c6ff,#ff4fd8,#ffe45e,#00ff88,#00c6ff)]
              blur-xl
              transition-opacity duration-500
              group-hover:opacity-20 group-hover:animate-spin
              [animation-duration:6s]
            "
          />

          {/* Image circle */}
          <div
            className="
              relative z-10
              w-[clamp(60px,14vw,80px)] h-[clamp(60px,14vw,80px)]
              rounded-full
              bg-gradient-to-br from-[#eef2ff] to-[#f8f9ff]
              shadow-[0_4px_12px_rgba(100,120,255,0.1)]
              flex items-center justify-center
              transition-all duration-[350ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
              group-hover:scale-110 group-hover:-rotate-6
              group-hover:shadow-[0_8px_20px_rgba(100,120,255,0.18)]
            "
          >
            <img
              src={item.img}
              alt={item.title}
              className="w-[65%] h-[65%] object-contain"
            />
          </div>

          {/* Label */}
          <span
            className="
              relative z-10
              text-[clamp(13px,3.5vw,15px)] font-bold
              font-[Poppins,_Segoe_UI,_sans-serif]
              text-[#1a1a2e] tracking-[0.01em] whitespace-nowrap
              transition-colors duration-300
              group-hover:text-[#0090d9]
            "
          >
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default Category;
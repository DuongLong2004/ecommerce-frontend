import React, { useState } from "react";
import "./Banner.css";

const BannerPhones = () => {
  // Danh sách hình banner nhỏ
  const banners = [
     {
      src: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_40_2bf3710433.png",
      alt: "banner iphone 16",
    },
    {
      src: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_5f28ae23c7.png",
      alt: "banner iphone 16",
    },
   
    {
      src: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_1_77592e58cc.png",
      alt: "banner iphone 16",
    },
    {
      src: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_ff204ca315.png",
      alt: "banner iphone 16",
    },
    {
      src: "https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/H1_1440x242_5f28ae23c7.png",
      alt: "banner iphone 16",
    },
  ];



  return (
    <div className="iamge-banner">
      <div >
        {/* ===== Banner lớn dạng slider ===== */}
        {/* ===== Banner nhỏ ===== */}
        <div className="banner">
          <div className="slider-container">
            <div className="slider">
              <div className="slides">
                {banners.map((banner, index) => (
                  <img
                    key={index}
                    className="banner_img1"
                    src={banner.src}
                    alt={banner.alt}
                    width="950"
                    height="200"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPhones;

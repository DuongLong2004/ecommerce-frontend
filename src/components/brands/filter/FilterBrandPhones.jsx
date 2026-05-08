import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import "./PhoneFilter.css";

/* ============================
   OPTIONS FILTER
============================ */
const filterOptions = {
  brand: [
    { value: "Apple", img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:0:50/q:30/plain/https://cellphones.com.vn/media/tmp/catalog/product/f/r/frame_59.png" },
  ],

  price: [
    { label: "Dưới 5 triệu", value: "0-5000000" },
    { label: "5 – 10 triệu", value: "5000000-10000000" },
    { label: "Trên 10 triệu", value: "10000000-50000000" },
  ],

  ram: [
    { label: "4GB", value: "4GB" },
    { label: "6GB", value: "6GB" },
    { label: "8GB", value: "8GB" },
    { label: "12GB", value: "12GB" },
  ],

  rom: [
    { label: "64GB", value: "64GB" },
    { label: "128GB", value: "128GB" },
    { label: "256GB", value: "256GB" },
    { label: "512GB", value: "512GB" },
  ],

  display: [
    { label: "6.1 inch", value: "6.1" },
    { label: "6.4 inch", value: "6.4" },
    { label: "6.7 inch", value: "6.7" },
    { label: "6.9 inch", value: "6.9" },
  ],

  chip: [
    { label: "Snapdragon 8 Gen 3", value: "Snapdragon 8 Gen 3" },
    { label: "Snapdragon 8 Gen 2", value: "Snapdragon 8 Gen 2" },
    { label: "A18 Pro", value: "A18 Pro" },
    { label: "A17 Pro", value: "A17 Pro" },
  ],

  camera: [
    { label: "48MP", value: "48MP" },
    { label: "50MP", value: "50MP" },
    { label: "64MP", value: "64MP" },
    { label: "108MP", value: "108MP" },
  ],

  battery: [
    { label: "4000mAh", value: "4000" },
    { label: "4500mAh", value: "4500" },
    { label: "5000mAh", value: "5000" },
    { label: "6000mAh", value: "6000" },
  ],
};

/* ============================
   LABEL FILTER
============================ */
const filterLabels = {
  brand: "Hãng",
  price: "Giá",
  ram: "RAM",
  rom: "Bộ nhớ",
  display: "Màn hình",
  chip: "Chip",
  camera: "Camera",
  battery: "Pin",
};

const formatFilterValue = (key, value) => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");

  if (key === "price") {
    const [min, max] = value.split("-").map(Number);
    return `${min / 1_000_000} - ${max / 1_000_000} triệu`;
  }

  if (key === "display") return value + " inch";
  if (key === "battery") return value + " mAh";

  return value;
};

/* ============================
   COMPONENT
============================ */
const PhoneFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState(null);

  const sectionRefs = {
    price: useRef(null),
    ram: useRef(null),
    rom: useRef(null),
    display: useRef(null),
    chip: useRef(null),
    camera: useRef(null),
    battery: useRef(null),
  };

  /* ======================================
      MULTI SELECT FILTER (RAM, ROM...)
  ====================================== */
  const toggleFilterMulti = (key, value) => {
    const current = searchParams.get(key)?.split(",") || [];

    let updated;
    if (current.includes(value)) {
      updated = current.filter((v) => v !== value);
    } else {
      updated = [...current, value];
    }

    const newParams = new URLSearchParams(searchParams);
    if (updated.length === 0) newParams.delete(key);
    else newParams.set(key, updated.join(","));

    setSearchParams(newParams);
  };

  const isActiveMulti = (key, value) => {
    const selected = searchParams.get(key)?.split(",") || [];
    return selected.includes(value);
  };

  /* BRAND (single-select) */
  // const handleBrand = (value) => {
  //   const newParams = new URLSearchParams(searchParams);
  //   if (value === "all") newParams.delete("brand");
  //   else newParams.set("brand", value);
  //   setSearchParams(newParams);
  // };

  /* Dropdown */
  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  /* Click outside close */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown) {
        const ref = sectionRefs[openDropdown];
        if (ref.current && !ref.current.contains(e.target)) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  /* Active Tags */
  const activeTags = [];
  for (const [key, value] of searchParams.entries()) {
    if (!filterLabels[key]) continue;

    const arr = value.includes(",") ? value.split(",") : [value];

    arr.forEach((v) =>
      activeTags.push({
        key,
        value: v,
        label: filterLabels[key],
      })
    );
  }

  const removeOneTag = (key, value) => {
    const current = searchParams.get(key)?.split(",") || [];

    const updated = current.filter((v) => v !== value);

    const newParams = new URLSearchParams(searchParams);
    if (updated.length === 0) newParams.delete(key);
    else newParams.set(key, updated.join(","));

    setSearchParams(newParams);
  };

  const clearAll = () => setSearchParams({});

  /* ============================
       RENDER JSX
  ============================= */
  return (
    <div className="filter-wrapper">
      <div className="filter">


        {/* DROPDOWN FILTERS */}
        <div className="filter-row">
          {["price", "ram", "rom", "display", "chip", "camera", "battery"].map((key) => (
            <div className="filter-section" key={key} ref={sectionRefs[key]}>
              <h4 className="filter-title" onClick={() => toggleDropdown(key)}>
                {filterLabels[key]}
                <span className="arrow">{openDropdown === key ? " ▲" : " ▼"}</span>
              </h4>

              {openDropdown === key && (
                <div className="filter-dropdown">
                  {filterOptions[key].map((item) => (
                    <button
                      key={item.value}
                      className={`filter-btn ${
                        isActiveMulti(key, item.value) ? "active" : ""
                      }`}
                      onClick={() => toggleFilterMulti(key, item.value)}
                    >
                      {item.label}
                    </button>
                  ))}

                  <button
                    className={`filter-btn ${!searchParams.get(key) ? "active" : ""}`}
                    onClick={() => setSearchParams((p) => { p.delete(key); return new URLSearchParams(p); })}
                  >
                    Tất cả
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TAG FILTER */}
      {activeTags.length > 0 && (
        <div className="active-tags">
          {activeTags.map((tag, idx) => (
            <span className="tag" key={idx}>
              {tag.label}: {tag.value}
              <button
                className="remove-tag"
                onClick={() => removeOneTag(tag.key, tag.value)}
              >
                ×
              </button>
            </span>
          ))}

          <button className="clear-all" onClick={clearAll}>Xóa tất cả</button>
        </div>
      )}
    </div>
  );
};

export default PhoneFilter;

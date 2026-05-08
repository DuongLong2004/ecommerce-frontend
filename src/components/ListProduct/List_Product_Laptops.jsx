import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import placementApi from "../../api/placementApi";
import ProductCard from "../Product/ProductCard";
import { useWishlist } from "../../hooks/useWishlist";

/* ─── Scroll Arrow Button ─────────────────────────────────────── */
const ScrollBtn = ({ dir, onClick }) => (
  <button
    onClick={onClick}
    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    className={`
      flex-shrink-0 z-10 w-8 h-8 rounded-full bg-white border border-gray-200
      shadow-md text-gray-500
      hover:bg-red-600 hover:text-white hover:border-red-600
      transition-all duration-200 active:scale-95
      ${dir === "left" ? "mr-1" : "ml-1"}
    `}
  >
    {dir === "left" ? "‹" : "›"}
  </button>
);

/* ─── useScrollable hook ──────────────────────────────────────── */
function useScrollable() {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);
    check();
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollBy = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });
  return { ref, canLeft, canRight, scrollBy };
}

/* ─── Main Component ──────────────────────────────────────────── */
const List_Product_Sale = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { wishlistIds, refetch } = useWishlist();
  const location = useLocation();

  /* Scrollable refs */
  const catScroll = useScrollable();
  const brandScroll = useScrollable();

  /* Drag-to-scroll cho cả 2 thanh */
  const makeDragHandlers = (scrollObj) => {
    const isDragging = { current: false };
    const dragStartX = { current: 0 };
    const dragScrollLeft = { current: 0 };
    const touchStart = { current: 0 };
    const touchSL = { current: 0 };

    return {
      onMouseDown: (e) => {
        if (!scrollObj.ref.current) return;
        isDragging.current = true;
        dragStartX.current = e.pageX - scrollObj.ref.current.offsetLeft;
        dragScrollLeft.current = scrollObj.ref.current.scrollLeft;
        scrollObj.ref.current.style.cursor = "grabbing";
      },
      onMouseMove: (e) => {
        if (!isDragging.current || !scrollObj.ref.current) return;
        e.preventDefault();
        const x = e.pageX - scrollObj.ref.current.offsetLeft;
        scrollObj.ref.current.scrollLeft =
          dragScrollLeft.current - (x - dragStartX.current) * 1.5;
      },
      onMouseUp: () => {
        isDragging.current = false;
        if (scrollObj.ref.current) scrollObj.ref.current.style.cursor = "grab";
      },
      onTouchStart: (e) => {
        if (!scrollObj.ref.current) return;
        touchStart.current = e.touches[0].pageX;
        touchSL.current = scrollObj.ref.current.scrollLeft;
      },
      onTouchMove: (e) => {
        if (!scrollObj.ref.current) return;
        scrollObj.ref.current.scrollLeft =
          touchSL.current + (touchStart.current - e.touches[0].pageX) * 1.2;
      },
    };
  };

  const catDragHandlers = useRef(makeDragHandlers(catScroll)).current;
  const brandDragHandlers = useRef(makeDragHandlers(brandScroll)).current;

  /* Load laptops */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await placementApi.getLaptops();
        setProducts(data);
      } catch (err) {
        console.error("Lỗi load laptops:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayed = showAll ? products : products.slice(0, 8);

  /* ── Data ── */
  const laptopCategories = [
    {
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:96:96/q:90/plain/https://cellphones.com.vn/media/wysiwyg/Group_846.png",
      title: "Văn phòng",
      to: "/laptoppace?special=office",
    },
    {
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:96:96/q:90/plain/https://cellphones.com.vn/media/wysiwyg/Group_848_2.png",
      title: "Gaming",
      to: "/laptoppace?special=gaming",
    },
    {
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:96:96/q:90/plain/https://cellphones.com.vn/media/wysiwyg/image_6__1.png",
      title: "Mỏng nhẹ",
      to: "/laptoppace?special=thin",
    },
    {
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:96:96/q:90/plain/https://cellphones.com.vn/media/wysiwyg/image_1__4.png",
      title: "Đồ họa - kỹ thuật",
      to: "/laptoppace?special=graphic",
    },
    {
      img: "https://cdn2.cellphones.com.vn/insecure/rs:fill:96:96/q:90/plain/https://cellphones.com.vn/media/wysiwyg/image_2__4.png",
      title: "Sinh viên",
      to: "/laptoppace?special=student",
    },
  ];

  const brandLinks = [
    { label: "Tất cả", to: "/laptoppace" },
    { label: "Apple", to: "/laptoppace?brand=Apple" },
    { label: "ASUS", to: "/laptoppace?brand=ASUS" },
    { label: "Dell", to: "/laptoppace?brand=Dell" },
    { label: "HP", to: "/laptoppace?brand=HP" },
    { label: "Lenovo", to: "/laptoppace?brand=Lenovo" },
    { label: "Acer", to: "/laptoppace?brand=Acer" },
    { label: "MSI", to: "/laptoppace?brand=MSI" },
    { label: "Samsung", to: "/laptoppace?brand=Samsung" },
  ];

  /* Active brand: match full path + search */
  const currentFullPath = location.pathname + location.search;
  const isActive = (to) => {
    if (to === "/laptoppace") return currentFullPath === "/laptoppace";
    return currentFullPath === to;
  };

  /* ── Render ── */
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-2 sm:px-3 pt-[72px] sm:pt-[88px] pb-8 sm:pb-10">
        <div className="flex gap-3 lg:gap-4 items-start">
          {/* ── LEFT BANNER (chỉ hiện ở desktop) ── */}
          <aside className="hidden lg:flex flex-col gap-3 w-[200px] min-w-[200px] sticky top-[90px] self-start pt-2">
            {[
              "https://cdn2.cellphones.com.vn/insecure/rs:fill:214:530/q:90/plain/https://media-asset.cellphones.com.vn/page_configs/01K8AK76MB2NCC8QHS16T26ES2.png",
              "https://cdn2.cellphones.com.vn/insecure/rs:fill:214:530/q:90/plain/https://media-asset.cellphones.com.vn/page_configs/01KAT2MC172RE7DNF84QSF6PFP.png",
            ].map((src, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={src}
                  alt={`banner-${i}`}
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
            ))}
          </aside>

          {/* ── RIGHT: Khu vực sản phẩm ── */}
          <div className="flex-1 min-w-0 w-full">
            {/* === Category Pills (HIỆN TRÊN MỌI THIẾT BỊ) === */}
            <div className="flex items-center gap-1 mb-3">
              {/* Nút trái - chỉ hiện desktop khi cần */}
              <div className="hidden sm:block">
                {catScroll.canLeft && (
                  <ScrollBtn dir="left" onClick={() => catScroll.scrollBy(-200)} />
                )}
              </div>

              <div
                ref={catScroll.ref}
                className="
                  flex gap-2 overflow-x-auto sm:overflow-x-hidden flex-1 py-1
                  scrollbar-hide cursor-grab active:cursor-grabbing select-none
                  scroll-smooth snap-x snap-mandatory sm:snap-none
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
                onMouseDown={catDragHandlers.onMouseDown}
                onMouseMove={catDragHandlers.onMouseMove}
                onMouseUp={catDragHandlers.onMouseUp}
                onMouseLeave={catDragHandlers.onMouseUp}
                onTouchStart={catDragHandlers.onTouchStart}
                onTouchMove={catDragHandlers.onTouchMove}
              >
                {laptopCategories.map((item, i) => (
                  <Link
                    key={i}
                    to={item.to}
                    draggable={false}
                    className="
                      flex-shrink-0 flex items-center gap-2 px-3 py-2
                      bg-white rounded-2xl shadow-sm border border-gray-100
                      hover:-translate-y-0.5 hover:shadow-md
                      hover:bg-gradient-to-r hover:from-pink-100 hover:to-blue-100
                      hover:border-transparent transition-all duration-200 cursor-pointer
                      group no-underline snap-start
                    "
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="
                        w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg bg-gray-50 p-1
                        group-hover:scale-110 transition-transform duration-200
                        flex-shrink-0
                      "
                    />
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-600 whitespace-nowrap group-hover:text-gray-800">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Nút phải - chỉ hiện desktop khi cần */}
              <div className="hidden sm:block">
                {catScroll.canRight && (
                  <ScrollBtn dir="right" onClick={() => catScroll.scrollBy(200)} />
                )}
              </div>
            </div>

            {/* === Brand Nav === */}
            <div className="flex items-center gap-1 mb-4">
              <div className="hidden sm:block">
                {brandScroll.canLeft && (
                  <ScrollBtn dir="left" onClick={() => brandScroll.scrollBy(-200)} />
                )}
              </div>

              <div
                ref={brandScroll.ref}
                className="
                  flex-1 overflow-x-auto sm:overflow-x-hidden
                  cursor-grab active:cursor-grabbing select-none scrollbar-hide
                "
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
                onMouseDown={brandDragHandlers.onMouseDown}
                onMouseMove={brandDragHandlers.onMouseMove}
                onMouseUp={brandDragHandlers.onMouseUp}
                onMouseLeave={brandDragHandlers.onMouseUp}
                onTouchStart={brandDragHandlers.onTouchStart}
                onTouchMove={brandDragHandlers.onTouchMove}
              >
                <ul className="flex gap-2 list-none m-0 p-1">
                  {brandLinks.map((item) => (
                    <li key={item.to} className="flex-shrink-0">
                      <Link
                        to={item.to}
                        draggable={false}
                        className={`
                          inline-flex items-center justify-center whitespace-nowrap
                          text-[0.75rem] sm:text-[0.8rem] font-semibold
                          px-4 sm:px-5 py-1.5 sm:py-2 rounded-full
                          border transition-all duration-200
                          ${isActive(item.to)
                            ? "bg-gradient-to-r from-red-600 to-red-400 text-white border-transparent shadow-lg shadow-red-200 -translate-y-0.5"
                            : "bg-white text-gray-500 border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-md"
                          }
                        `}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="hidden sm:block">
                {brandScroll.canRight && (
                  <ScrollBtn dir="right" onClick={() => brandScroll.scrollBy(200)} />
                )}
              </div>
            </div>

            {/* === Loading === */}
            {loading && (
              <div className="flex items-center justify-center gap-3 py-16 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                Đang tải sản phẩm...
              </div>
            )}

            {/* === Error === */}
            {!loading && error && (
              <div className="text-center py-10 px-5 bg-red-50 border border-red-100 rounded-2xl mx-1">
                <div className="text-4xl mb-3">😕</div>
                <p className="text-red-600 font-semibold mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors duration-150"
                >
                  🔄 Thử lại
                </button>
              </div>
            )}

            {/* === Product Grid === */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
                    <span className="text-4xl">💻</span>
                    <p>Chưa có sản phẩm nào được chọn hiển thị</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
                      {displayed.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          wishlistIds={wishlistIds}
                          onWishlistChange={refetch}
                        />
                      ))}
                    </div>

                    {/* Xem thêm / Thu gọn */}
                    {products.length > 8 && (
                      <div className="text-center pt-6 pb-2">
                        <button
                          onClick={() => setShowAll(!showAll)}
                          className={`
                            px-6 sm:px-8 py-2 sm:py-2.5 rounded-full
                            text-[0.78rem] sm:text-[0.82rem] font-semibold
                            border-[1.5px] border-red-600 transition-all duration-200
                            shadow-sm hover:shadow-md active:scale-95
                            ${showAll
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-white text-red-600 hover:bg-red-600 hover:text-white"
                            }
                          `}
                        >
                          {showAll
                            ? "↑ Thu gọn"
                            : `Xem thêm ${products.length - 8} sản phẩm →`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List_Product_Sale;
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../../api/axios";
import ProductCard from "../../Product/ProductCard";
import { useWishlist } from "../../../hooks/useWishlist";

// ─── helpers ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;          // số sản phẩm mỗi lần gọi API
const CLIENT_PAGE_SIZE = 20;   // số sản phẩm hiển thị thêm mỗi lần "Xem thêm" (cho special filter)

const getFilterValues = (searchParams, key) => {
  const all = searchParams.getAll(key);
  if (all.length > 1) return all.map(String);
  const single = searchParams.get(key);
  if (!single) return [];
  return single.split(",").map(String).filter(Boolean);
};

const extractNumber = (val) => {
  if (val == null) return 0;
  const num = String(val).match(/[\d.]+/);
  return num ? parseFloat(num[0]) : 0;
};

const buildServerParams = (searchParams, page = 1, limit = PAGE_SIZE) => {
  const get = (key) => getFilterValues(searchParams, key);

  const params = {
    category: "phone",
    page,
    limit,
  };

  const brand   = get("brand");
  const price   = get("price");
  const ram     = get("ram");
  const rom     = get("rom");
  const display = get("display");
  const chip    = get("chip");
  const camera  = get("camera");
  const battery = get("battery");

  if (brand.length)   params.brand   = brand.join(",");
  if (ram.length)     params.ram     = ram.join(",");
  if (rom.length)     params.rom     = rom.join(",");
  if (display.length) params.display = display.join(",");
  if (chip.length)    params.chip    = chip.join(",");
  if (camera.length)  params.camera  = camera.join(",");
  if (battery.length) params.battery = battery.join(",");

  if (price.length) {
    const mins = [], maxs = [];
    price.forEach((range) => {
      const parts = range.split("-");
      if (parts[0] !== "") mins.push(Number(parts[0]));
      if (parts[1] !== "") maxs.push(Number(parts[1]));
    });
    if (mins.length > 0) params.minPrice = Math.min(...mins);
    if (maxs.length > 0) params.maxPrice = Math.max(...maxs);
  }

  return params;
};

const SPECIAL_FILTERS = {
  gaming: (p) => {
    const ram = extractNumber(p.ram);
    const title = (p.title || "").toLowerCase();
    const chip = (p.chip || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    if (/gaming|chơi game|rog phone|red magic/i.test(title + " " + desc)) return true;
    return ram >= 8 && /ultra|pro max|snapdragon 8|dimensity 9|a1[7-9]|tensor/i.test(title + " " + chip);
  },
  battery: (p) => {
    const mah = extractNumber(p.battery);
    const desc = (p.description || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    if (/pin trâu|pin lớn|pin khủng|battery king|bền king/i.test(desc + " " + title)) return true;
    return mah >= 5000;
  },
  camera: (p) => {
    const cam = extractNumber(p.camera);
    const title = (p.title || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    if (/chụp đẹp|nhiếp ảnh|camera đỉnh|camera ngon|pro max|ultra/i.test(desc + " " + title)) return true;
    return cam >= 50;
  },
  foldable: (p) => {
    const title = (p.title || "").toLowerCase();
    return /fold|flip/i.test(title);
  },
};

const SPECIAL_TITLES = {
  gaming:   "Điện thoại chơi game",
  battery:  "Điện thoại pin trâu",
  camera:   "Điện thoại chụp đẹp",
  foldable: "Điện thoại gập đẹp",
};

// ─── component ───────────────────────────────────────────────────────────────

const BrandPhonePage = () => {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(1);
  const [hasMoreServer, setHasMore]   = useState(true);
  const [visibleCount, setVisibleCnt] = useState(CLIENT_PAGE_SIZE);

  const [searchParams]           = useSearchParams();
  const { wishlistIds, refetch } = useWishlist();
  const reqIdRef                 = useRef(0);

  const special = searchParams.get("special");
  const specialTitle = special ? SPECIAL_TITLES[special] : null;
  const isSpecial = Boolean(special && SPECIAL_FILTERS[special]);

  const filteredProducts = isSpecial
    ? products.filter(SPECIAL_FILTERS[special])
    : products;

  const visibleProducts = isSpecial
    ? filteredProducts.slice(0, visibleCount)
    : filteredProducts;

  const fetchPage = useCallback(async (pageNum, { append }) => {
    const myReqId = ++reqIdRef.current;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      const params = buildServerParams(searchParams, pageNum, PAGE_SIZE);
      const res = await axiosClient.get("/products", { params });

      if (myReqId !== reqIdRef.current) return;

      const list = res.data?.data?.data ?? [];
      const meta = res.data?.data?.meta || res.data?.meta || {};
      const total = meta.total ?? meta.totalItems;
      const lastPage = meta.lastPage ?? meta.totalPages;

      let stillHasMore;
      if (typeof lastPage === "number") {
        stillHasMore = pageNum < lastPage;
      } else if (typeof total === "number") {
        stillHasMore = pageNum * PAGE_SIZE < total;
      } else {
        stillHasMore = list.length >= PAGE_SIZE;
      }

      setProducts((prev) => (append ? [...prev, ...list] : list));
      setHasMore(stillHasMore);
      setPage(pageNum);
    } catch (err) {
      if (myReqId !== reqIdRef.current) return;
      console.error("Lỗi load phones:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      if (!append) setProducts([]);
    } finally {
      if (myReqId === reqIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [searchParams]);

  // Khi filter đổi → reset về page 1
  useEffect(() => {
    setVisibleCnt(CLIENT_PAGE_SIZE);
    fetchPage(1, { append: false });
  }, [fetchPage]);

  const handleLoadMore = () => {
    if (isSpecial) {
      if (visibleCount < filteredProducts.length) {
        setVisibleCnt((c) => c + CLIENT_PAGE_SIZE);
        if (
          hasMoreServer &&
          visibleCount + CLIENT_PAGE_SIZE >= filteredProducts.length - CLIENT_PAGE_SIZE
        ) {
          fetchPage(page + 1, { append: true });
        }
      } else if (hasMoreServer) {
        fetchPage(page + 1, { append: true });
        setVisibleCnt((c) => c + CLIENT_PAGE_SIZE);
      }
    } else {
      if (hasMoreServer) fetchPage(page + 1, { append: true });
    }
  };

  const canLoadMore = isSpecial
    ? visibleCount < filteredProducts.length || hasMoreServer
    : hasMoreServer;

  // ─── UI ─────────────────────────────────────────────────────────────────

  if (loading && products.length === 0) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "80px 20px", color: "#9ca3af", fontFamily: "sans-serif", gap: 10
    }}>
      <span style={{
        width: 20, height: 20, border: "2px solid #fca5a5",
        borderTopColor: "#dc2626", borderRadius: "50%",
        animation: "spin 0.7s linear infinite", display: "inline-block"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Đang tải sản phẩm...
    </div>
  );

  if (error && products.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>
      <button
        onClick={() => fetchPage(1, { append: false })}
        style={{
          padding: "8px 20px", background: "#dc2626", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14
        }}
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .phone-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 16px;
        }
        @media (max-width: 1024px) {
          .phone-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        }
        @media (max-width: 640px) {
          .phone-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px; }
        }
        .special-title {
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 16px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          font-family: sans-serif;
        }
        .load-more-wrap {
          display: flex; justify-content: center; padding: 20px 16px 40px;
        }
        .load-more-btn {
          padding: 10px 28px; background: #fff; color: #dc2626;
          border: 1.5px solid #dc2626; border-radius: 999px; cursor: pointer;
          font-size: 14px; font-weight: 600; font-family: sans-serif;
          transition: all 0.15s;
        }
        .load-more-btn:hover:not(:disabled) { background: #dc2626; color: #fff; }
        .load-more-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {specialTitle && (
        <div className="special-title">
          <span style={{ color: "#dc2626" }}>{specialTitle}</span>
          <span style={{ color: "#9ca3af", fontSize: 14, fontWeight: 400, marginLeft: 8 }}>
            ({isSpecial ? filteredProducts.length : products.length}{hasMoreServer ? "+" : ""} sản phẩm)
          </span>
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af", fontFamily: "sans-serif" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
          <div style={{ fontSize: 16 }}>
            {specialTitle ? `Chưa có ${specialTitle.toLowerCase()} nào` : "Không tìm thấy sản phẩm phù hợp"}
          </div>
        </div>
      ) : (
        <>
          <div className="phone-grid">
            {visibleProducts.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                wishlistIds={wishlistIds}
                onWishlistChange={refetch}
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="load-more-wrap">
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Đang tải..." : "Xem thêm"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default BrandPhonePage;
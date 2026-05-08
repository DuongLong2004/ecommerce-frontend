import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../../api/axios";
import ProductCard from "../../Product/ProductCard";
import { useWishlist } from "../../../hooks/useWishlist";

const getFilterValues = (searchParams, key) => {
  const all = searchParams.getAll(key);
  if (all.length > 1) return all.map(String);
  const single = searchParams.get(key);
  if (!single) return [];
  return single.split(",").map(String).filter(Boolean);
};

const buildServerParams = (searchParams) => {
  const get = (key) => getFilterValues(searchParams, key);

  const params = {
    category: "laptop",
    brand: "Dell",
    limit: 100,
  };

  const price    = get("price");
  const ram      = get("ram");
  const rom      = get("rom");
  const display  = get("display");
  const chip     = get("chip");
  const gpu      = get("gpu");
  const nation   = get("nation");
  const battery  = get("battery");
  const charging = get("charging");

  if (ram.length)      params.ram      = ram.join(",");
  if (rom.length)      params.rom      = rom.join(",");
  if (display.length)  params.display  = display.join(",");
  if (chip.length)     params.chip     = chip.join(",");
  if (gpu.length)      params.gpu      = gpu.join(",");
  if (nation.length)   params.nation   = nation.join(",");
  if (battery.length)  params.battery  = battery.join(",");
  if (charging.length) params.charging = charging.join(",");

  if (price.length) {
    const mins = [], maxs = [];
    price.forEach((range) => {
      const [minStr, maxStr] = range.split("-");
      if (minStr) mins.push(Number(minStr));
      if (maxStr) maxs.push(Number(maxStr));
    });
    if (mins.length) params.minPrice = Math.min(...mins);
    if (maxs.length) params.maxPrice = Math.max(...maxs);
  }

  return params;
};

const BrandLaptopDell = () => {
  const [products, setProducts]  = useState([]);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState(null);
  const [searchParams]           = useSearchParams();
  const { wishlistIds, refetch } = useWishlist();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildServerParams(searchParams);
      const res = await axiosClient.get("/products", { params });
      setProducts(res.data?.data?.data ?? []);
    } catch (err) {
      console.error("Lỗi load laptop Dell:", err);
      setError("Không thể tải sản phẩm. Vui lòng thử lại.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  if (loading) return (
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

  if (error) return (
    <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
      <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>
      <button
        onClick={loadProducts}
        style={{
          padding: "8px 20px", background: "#dc2626", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14
        }}
      >
        Thử lại
      </button>
    </div>
  );

  if (products.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>💻</div>
      <div style={{ fontSize: 16 }}>Không tìm thấy sản phẩm phù hợp</div>
    </div>
  );

  return (
    <>
      <style>{`
        .laptop-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px 16px;
        }
        @media (max-width: 1024px) {
          .laptop-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        }
        @media (max-width: 640px) {
          .laptop-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 12px; }
        }
      `}</style>

      <div className="laptop-grid">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            wishlistIds={wishlistIds}
            onWishlistChange={refetch}
          />
        ))}
      </div>
    </>
  );
};

export default BrandLaptopDell;
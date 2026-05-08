import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Cart.css";

/* ── UTILS ── */
const parsePrice = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[₫đ\s]/g, "").replace(/\./g, "").replace(/,/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

const fmt = (num) => Number(num).toLocaleString("vi-VN") + "đ";

/* ─── Lấy giá thực tế của 1 cart item
   Ưu tiên: finalPrice > salePrice (nếu flash) > price
─── */
const getEffectivePrice = (item) => {
  if (item.finalPrice)             return parsePrice(item.finalPrice);
  if (item.isFlashSale && item.salePrice) return parsePrice(item.salePrice);
  return parsePrice(item.price);
};

/* ── CART KEY ── */
const getCartKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id ? `cart_${user.id}` : "cart_guest";
  } catch { return "cart_guest"; }
};

/* ── ICONS ── */
const IcoTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);
const IcoMinus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcoCart = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IcoShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IcoTruck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IcoTag = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IcoLightning = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

/* ── MAIN ── */
const Cart = () => {
  const [cart,      setCart]      = useState([]);
  const [removing,  setRemoving]  = useState(null);
  const [highlight, setHighlight] = useState(null);
  const navigate = useNavigate();
  const cartKey  = getCartKey();

  /* load */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(cartKey)) || [];
      setCart(stored);
    } catch { setCart([]); }
  }, [cartKey]);

  /* persist + dispatch */
  const persist = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartKey]);

  /* ─── Tính tổng dùng getEffectivePrice ─── */
  const subtotal  = cart.reduce((acc, item) => acc + getEffectivePrice(item) * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  /* Tổng tiết kiệm từ flash sale */
  const flashSaving = cart
    .filter(i => i.isFlashSale && i.salePrice && i.price)
    .reduce((acc, i) => acc + (parsePrice(i.price) - parsePrice(i.salePrice)) * i.quantity, 0);

  /* qty controls — dùng cartItemId nếu có, fallback id */
  const findItem = (id) => cart.find(i => (i.cartItemId ?? i.id) === id);
  const itemKey  = (item) => item.cartItemId ?? item.id;

  const increase = (key) => {
    const item = findItem(key);
    if (item?.stock && item.quantity >= item.stock) return;
    persist(cart.map(i => itemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i));
    flashHighlight(key);
  };

  const decrease = (key) => {
    const item = findItem(key);
    if (!item || item.quantity <= 1) return;
    persist(cart.map(i => itemKey(i) === key ? { ...i, quantity: i.quantity - 1 } : i));
    flashHighlight(key);
  };

  const setQty = (key, val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1) return;
    const item = findItem(key);
    const max  = item?.stock || 999;
    persist(cart.map(i => itemKey(i) === key ? { ...i, quantity: Math.min(num, max) } : i));
    flashHighlight(key);
  };

  const remove = (key) => {
    setRemoving(key);
    setTimeout(() => {
      persist(cart.filter(i => itemKey(i) !== key));
      setRemoving(null);
    }, 320);
  };

  const clearAll = () => {
    if (!window.confirm("Xóa toàn bộ giỏ hàng?")) return;
    persist([]);
  };

  const flashHighlight = (key) => {
    setHighlight(key);
    setTimeout(() => setHighlight(null), 500);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    sessionStorage.removeItem("buynow");
    navigate("/checkout");
  };

  /* ── EMPTY STATE ── */
  if (cart.length === 0) return (
    <div className="ct-empty">
      <div className="ct-empty-icon"><IcoCart/></div>
      <h2>Giỏ hàng trống</h2>
      <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
      <Link to="/" className="ct-empty-btn">Tiếp tục mua sắm <IcoArrow/></Link>
    </div>
  );

  return (
    <div className="ct-page">

      {/* HEADER */}
      <div className="ct-header">
        <div className="ct-header-left">
          <h1 className="ct-heading">Giỏ hàng</h1>
          <span className="ct-badge">{itemCount} sản phẩm</span>
        </div>
        <button className="ct-clear-btn" onClick={clearAll}><IcoTrash/> Xóa tất cả</button>
      </div>

      {/* LAYOUT */}
      <div className="ct-layout">

        {/* ITEMS */}
        <div className="ct-items">
          <div className="ct-col-labels">
            <span>Sản phẩm</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Thành tiền</span>
            <span/>
          </div>

          {cart.map((item, idx) => {
            const key         = itemKey(item);
            const effPrice    = getEffectivePrice(item);
            const origPrice   = parsePrice(item.price);
            const lineTotal   = effPrice * item.quantity;
            const isFlash     = !!item.isFlashSale;
            const isRemoving  = removing  === key;
            const isHighlight = highlight === key;

            return (
              <div
                key={key}
                className={`ct-item${isRemoving ? " ct-item--out" : ""}${isFlash ? " ct-item--flash" : ""}`}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                {/* Thumbnail */}
                <Link to={`/product/${item.id}`} state={{ item }} className="ct-thumb">
                  <img src={item.img} alt={item.title} loading="lazy"/>
                  {/* Flash sale badge */}
                  {isFlash ? (
                    <span className="ct-thumb-badge ct-thumb-badge--flash">
                      <IcoLightning/> SALE
                    </span>
                  ) : item.discount && (() => {
                    const d = String(item.discount).trim();
                    const num = parseFloat(d);
                    if (!isNaN(num) && num < 5) return null;
                    return <span className="ct-thumb-badge">{d.includes("%") ? d : `-${num}%`}</span>;
                  })()}
                </Link>

                {/* Info */}
                <div className="ct-info">
                  <Link to={`/product/${item.id}`} state={{ item }} className="ct-name">
                    {item.title}
                  </Link>
                  {item.brand && <span className="ct-brand">{item.brand}</span>}
                  {/* Flash sale tag */}
                  {isFlash && (
                    <span className="ct-flash-tag">
                      <IcoLightning/> Flash Sale
                    </span>
                  )}
                  {/* Mobile price */}
                  <div className="ct-price-mobile">
                    <span className="ct-price-mobile-main">{fmt(effPrice)}</span>
                    {isFlash && origPrice > effPrice && (
                      <span className="ct-price-mobile-orig">{fmt(origPrice)}</span>
                    )}
                  </div>
                </div>

                {/* Unit price — desktop */}
                <div className="ct-unit-price">
                  <span className={isFlash ? "ct-price-flash" : ""}>{fmt(effPrice)}</span>
                  {isFlash && origPrice > effPrice && (
                    <span className="ct-price-orig">{fmt(origPrice)}</span>
                  )}
                </div>

                {/* Qty control */}
                <div className="ct-qty">
                  <button className="ct-qty-btn" onClick={() => decrease(key)}
                    disabled={item.quantity <= 1} aria-label="Giảm"><IcoMinus/></button>
                  <input className="ct-qty-input" type="number" min="1"
                    max={item.stock || 999} value={item.quantity}
                    onChange={e => setQty(key, e.target.value)} aria-label="Số lượng"/>
                  <button className="ct-qty-btn" onClick={() => increase(key)}
                    disabled={item.stock && item.quantity >= item.stock} aria-label="Tăng"><IcoPlus/></button>
                </div>

                {/* Line total */}
                <div className={`ct-line-total${isHighlight ? " ct-line-total--flash" : ""}`}>
                  {fmt(lineTotal)}
                  {isFlash && origPrice > effPrice && (
                    <span className="ct-line-saving">-{fmt((origPrice - effPrice) * item.quantity)}</span>
                  )}
                </div>

                {/* Remove */}
                <button className="ct-remove" onClick={() => remove(key)} title="Xóa sản phẩm">
                  <IcoTrash/>
                </button>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <aside className="ct-summary">
          <h3 className="ct-summary-title">Tóm tắt đơn hàng</h3>

          <div className="ct-summary-rows">
            <div className="ct-sr">
              <span>Tạm tính</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="ct-sr">
              <span>Số lượng</span>
              <span>{itemCount} sản phẩm</span>
            </div>
            {/* Tiết kiệm flash sale */}
            {flashSaving > 0 && (
              <div className="ct-sr ct-sr--saving">
                <span><IcoLightning/> Flash Sale tiết kiệm</span>
                <span className="ct-saving-val">-{fmt(flashSaving)}</span>
              </div>
            )}
            <div className="ct-sr">
              <span>Vận chuyển</span>
              <span className="ct-free">Miễn phí</span>
            </div>
            <div className="ct-sr ct-sr--promo">
              <span><IcoTag/> Ưu đãi thêm</span>
              <span className="ct-promo-note">Áp dụng ở bước thanh toán</span>
            </div>
          </div>

          <div className="ct-divider"/>

          <div className="ct-total-row">
            <span>Tổng cộng</span>
            <span className="ct-total-num">{fmt(subtotal)}</span>
          </div>
          <p className="ct-tax-note">Đã bao gồm VAT</p>

          <button className="ct-checkout-btn" onClick={handleCheckout}>
            Thanh toán ngay <IcoArrow/>
          </button>

          <Link to="/" className="ct-continue">← Tiếp tục mua sắm</Link>

          <div className="ct-trust">
            <div className="ct-trust-item"><IcoShield/><span>Thanh toán bảo mật</span></div>
            <div className="ct-trust-item"><IcoTruck/><span>Giao hàng 2 giờ</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
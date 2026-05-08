import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axios";
import "./Checkout.css";

/* ── UTILS ── */
const parsePrice = (val) => {
  if (!val && val !== 0) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[₫đ\s]/g, "").replace(/\./g, "").replace(/,/g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};
const fmt = (num) => Number(num).toLocaleString("vi-VN") + "đ";

/* ─── Giá thực tế của 1 item (giống Cart.jsx) ─── */
const getEffectivePrice = (item) => {
  if (item.finalPrice)                      return parsePrice(item.finalPrice);
  if (item.isFlashSale && item.salePrice)   return parsePrice(item.salePrice);
  return parsePrice(item.price);
};

const getCartKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id ? `cart_${user.id}` : "cart_guest";
  } catch { return "cart_guest"; }
};

/* ── SVG ICONS ── */
const IcoChevron = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const IcoCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IcoShield  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoTruck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoLock    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IcoUser    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoPhone   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.54 2 2 0 0 1 3.59 2.36h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.02-.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17z"/></svg>;
const IcoMail    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoMap     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IcoCod     = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IcoBank    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>;
const IcoWallet  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcoCard    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcoZap     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcoStar    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const IcoFlash   = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;

/* ── MAIN ── */
const Checkout = () => {
  const [items,     setItems]     = useState([]);
  const [isBuyNow,  setIsBuyNow]  = useState(false);
  const [payMethod, setPayMethod] = useState("cod");
  const [success,   setSuccess]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [customer,  setCustomer]  = useState({ name:"", email:"", phone:"", address:"" });
  const navigate = useNavigate();

  /* ── Load items ── */
  useEffect(() => {
    const buyNowRaw = sessionStorage.getItem("buynow");
    if (buyNowRaw) {
      try {
        const parsed = JSON.parse(buyNowRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed); setIsBuyNow(true); return;
        }
      } catch {}
    }
    try {
      setItems(JSON.parse(localStorage.getItem(getCartKey())) || []);
    } catch { setItems([]); }
    setIsBuyNow(false);
  }, []);

  /* ── Tính tổng dùng getEffectivePrice ── */
  const subtotal    = items.reduce((acc, item) => acc + getEffectivePrice(item) * item.quantity, 0);
  const flashSaving = items
    .filter(i => i.isFlashSale && i.salePrice && i.price)
    .reduce((acc, i) => acc + (parsePrice(i.price) - parsePrice(i.salePrice)) * i.quantity, 0);

  const handleChange = (e) => {
    setCustomer(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!customer.name.trim())    errs.name    = "Vui lòng nhập họ tên";
    if (!customer.phone.trim())   errs.phone   = "Vui lòng nhập số điện thoại";
    if (!/^\d{9,11}$/.test(customer.phone.replace(/\s/g, ""))) errs.phone = "Số điện thoại không hợp lệ";
    if (!customer.email.trim())   errs.email   = "Vui lòng nhập email";
    if (!/\S+@\S+\.\S+/.test(customer.email))  errs.email = "Email không hợp lệ";
    if (!customer.address.trim()) errs.address = "Vui lòng nhập địa chỉ";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ══════════════════════════════════════════
     SUBMIT — gửi placementId lên BE
  ══════════════════════════════════════════ */
  const handlePayment = async () => {
    if (!validate()) return;
    const token = localStorage.getItem("token");
    if (!token) { alert("Vui lòng đăng nhập để đặt hàng!"); navigate("/login"); return; }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId:   item.id,
        quantity:    item.quantity,
        // ── Flash sale: gửi placementId để BE tăng stockSold ──
        // null nếu không phải flash sale
        placementId: item.isFlashSale && item.placementId ? item.placementId : null,
      }));

      const res = await axiosClient.post("/orders", {
        items:        orderItems,
        shippingInfo: customer,
        payMethod,
      });

      if (res.data.status === "success") {
        if (isBuyNow) sessionStorage.removeItem("buynow");
        else          localStorage.removeItem(getCartKey());
        window.dispatchEvent(new Event("cartUpdated"));
        setSuccess(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Đặt hàng thất bại!";
      // Hiện lỗi hết suất flash sale rõ ràng hơn
      if (err.response?.status === 409) {
        alert("⚡ " + msg + "\n\nSản phẩm flash sale đã hết suất. Vui lòng quay lại và mua với giá thường.");
      } else {
        alert("❌ " + msg);
      }
    } finally { setLoading(false); }
  };

  /* ── SUCCESS ── */
  if (success) return (
    <div className="co-success">
      <div className="co-success-ring">
        <div className="co-success-icon"><IcoStar/></div>
      </div>
      <h2>Đặt hàng thành công!</h2>
      <p>Cảm ơn bạn đã tin tưởng <strong>LongtyJR Phone</strong>.<br/>
        Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.</p>
      <Link to="/" className="co-success-btn">Về trang chủ <IcoArrow/></Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="co-empty">
      <div className="co-empty-ico">📦</div>
      <h2>Không có sản phẩm nào</h2>
      <p>Vui lòng thêm sản phẩm vào giỏ hàng trước.</p>
      <Link to="/" className="co-empty-btn">← Về trang chủ</Link>
    </div>
  );

  const payMethods = [
    { value:"cod",    icon:<IcoCod/>,    label:"Thanh toán khi nhận hàng", sub:"COD — Trả tiền mặt lúc nhận" },
    { value:"bank",   icon:<IcoBank/>,   label:"Chuyển khoản ngân hàng",   sub:"Duyệt trong 5–15 phút" },
    { value:"momo",   icon:<IcoWallet/>, label:"Ví MoMo",                  sub:"Thanh toán ví điện tử" },
    { value:"credit", icon:<IcoCard/>,   label:"Thẻ tín dụng / Ghi nợ",   sub:"Visa, Mastercard, JCB" },
  ];

  const fields = [
    { name:"name",    label:"Họ và tên",        icon:<IcoUser/>,  type:"text",  placeholder:"Nguyễn Văn A",         half:true  },
    { name:"phone",   label:"Số điện thoại",    icon:<IcoPhone/>, type:"tel",   placeholder:"0901 234 567",          half:true  },
    { name:"email",   label:"Email",             icon:<IcoMail/>,  type:"email", placeholder:"example@email.com",    half:false },
    { name:"address", label:"Địa chỉ giao hàng",icon:<IcoMap/>,   type:"area",  placeholder:"Số nhà, đường, phường, quận, tỉnh/thành phố", half:false },
  ];

  return (
    <div className="co-page">
      <nav className="co-breadcrumb">
        <Link to="/">Trang chủ</Link><IcoChevron/>
        {!isBuyNow && <><Link to="/cart">Giỏ hàng</Link><IcoChevron/></>}
        <span>Thanh toán</span>
      </nav>

      {isBuyNow && (
        <div className="co-buynow-bar"><IcoZap/> Mua ngay — Thanh toán nhanh không qua giỏ hàng</div>
      )}

      <h1 className="co-title">Thanh toán đơn hàng</h1>

      <div className="co-layout">
        {/* LEFT */}
        <div className="co-left">

          {/* SHIPPING */}
          <div className="co-card">
            <div className="co-card-head">
              <span className="co-step-num">1</span>
              <div>
                <h3>Thông tin giao hàng</h3>
                <p>Điền chính xác để đảm bảo giao hàng đúng địa chỉ</p>
              </div>
            </div>
            <div className="co-form">
              <div className="co-form-grid">
                {fields.map(f => (
                  <div key={f.name} className={`co-field${f.half ? " co-field--half" : ""}${errors[f.name] ? " co-field--err" : ""}`}>
                    <label>{f.label} <span className="co-req">*</span></label>
                    <div className="co-input-wrap">
                      <span className="co-input-ico">{f.icon}</span>
                      {f.type === "area" ? (
                        <textarea name={f.name} value={customer[f.name]} onChange={handleChange} placeholder={f.placeholder} rows={3}/>
                      ) : (
                        <input type={f.type} name={f.name} value={customer[f.name]} onChange={handleChange} placeholder={f.placeholder}/>
                      )}
                    </div>
                    {errors[f.name] && <span className="co-err-msg">{errors[f.name]}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="co-card">
            <div className="co-card-head">
              <span className="co-step-num">2</span>
              <div><h3>Phương thức thanh toán</h3><p>Chọn hình thức phù hợp với bạn</p></div>
            </div>
            <div className="co-pay-list">
              {payMethods.map(m => (
                <label key={m.value} className={`co-pay-opt${payMethod === m.value ? " co-pay-opt--on" : ""}`}>
                  <input type="radio" name="payMethod" value={m.value} checked={payMethod === m.value} onChange={() => setPayMethod(m.value)}/>
                  <span className="co-pay-ico">{m.icon}</span>
                  <span className="co-pay-txt">
                    <span className="co-pay-name">{m.label}</span>
                    <span className="co-pay-sub">{m.sub}</span>
                  </span>
                  <span className={`co-pay-radio${payMethod === m.value ? " on" : ""}`}>
                    {payMethod === m.value && <IcoCheck/>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <aside className="co-right">
          <div className="co-summary-card">
            <div className="co-card-head">
              <span className="co-step-num">3</span>
              <div><h3>Đơn hàng</h3><p>{items.length} sản phẩm</p></div>
            </div>

            {/* Items */}
            <div className="co-order-items">
              {items.map((item, idx) => {
                const effPrice  = getEffectivePrice(item);
                const origPrice = parsePrice(item.price);
                const isFlash   = !!item.isFlashSale;
                return (
                  <div className="co-oi" key={item.cartItemId ?? item.id ?? idx}>
                    <div className="co-oi-thumb">
                      <img src={item.img} alt={item.title} loading="lazy"/>
                      <span className="co-oi-qty">{item.quantity}</span>
                    </div>
                    <div className="co-oi-info">
                      <span className="co-oi-name">{item.title}</span>
                      {item.brand && <span className="co-oi-brand">{item.brand}</span>}
                      {/* Flash sale tag */}
                      {isFlash && (
                        <span className="co-oi-flash-tag">
                          <IcoFlash/> Flash Sale
                        </span>
                      )}
                    </div>
                    <div className="co-oi-price-col">
                      <span className={`co-oi-total${isFlash ? " co-oi-total--flash" : ""}`}>
                        {fmt(effPrice * item.quantity)}
                      </span>
                      {/* Giá gốc gạch ngang nếu là flash */}
                      {isFlash && origPrice > effPrice && (
                        <span className="co-oi-orig">
                          {fmt(origPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="co-totals">
              <div className="co-trow">
                <span>Tạm tính</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {/* Flash sale saving */}
              {flashSaving > 0 && (
                <div className="co-trow co-trow--saving">
                  <span><IcoFlash/> Flash Sale tiết kiệm</span>
                  <span className="co-saving-val">-{fmt(flashSaving)}</span>
                </div>
              )}
              <div className="co-trow">
                <span>Vận chuyển</span>
                <span className="co-free">Miễn phí</span>
              </div>
              <div className="co-tdiv"/>
              <div className="co-trow co-trow--total">
                <span>Tổng thanh toán</span>
                <span className="co-total-num">{fmt(subtotal)}</span>
              </div>
              <p className="co-vat">Đã bao gồm VAT</p>
            </div>

            {/* CTA */}
            <button
              className={`co-pay-btn${loading ? " co-pay-btn--loading" : ""}`}
              onClick={handlePayment} disabled={loading}
            >
              {loading
                ? <><span className="co-spinner"/><span>Đang xử lý...</span></>
                : <><span>Xác nhận đặt hàng</span><IcoArrow/></>
              }
            </button>

            <div className="co-trust">
              <span><IcoLock/> Bảo mật SSL</span>
              <span><IcoShield/> Hàng chính hãng</span>
              <span><IcoTruck/> Giao 2 giờ</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
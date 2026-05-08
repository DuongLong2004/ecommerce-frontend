import React, { useState, useEffect, useRef, useMemo, useCallback, memo, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import placementApi from '../../../api/placementApi';

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS & TOKENS
══════════════════════════════════════════════════════════════════ */
const STATUS = Object.freeze({
  ACTIVE: 'active',
  UPCOMING: 'upcoming',
  ENDED: 'ended',
  NO_TIME: 'no-time',
});

const TOKENS = Object.freeze({
  color: {
    primary: '#e53e3e',
    primaryDark: '#c41e1e',
    primaryGlow: '#fd5630',
    accent: '#ff8c42',
    gold: '#ffd166',
    bgDark: '#0c0a1e',
    bgDarkAlt: '#1c0730',
    bgDarkRed: '#2d0e00',
    text: '#1a1a2e',
    textMute: '#94a3b8',
    border: '#efefef',
    bgSoft: '#fff0ed',
    bgSofter: '#fffcfb',
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 18, '2xl': 20 },
  font: {
    display: "'Clash Display', sans-serif",
    body: "'DM Sans', sans-serif",
  },
  shadow: {
    card: '0 2px 14px rgba(0,0,0,.05)',
    cardHover: '0 22px 55px rgba(229,62,62,.14), 0 6px 18px rgba(0,0,0,.07)',
    container: '0 10px 60px rgba(20,5,40,.13), 0 2px 12px rgba(0,0,0,.06)',
  },
});

/* ══════════════════════════════════════════════════════════════════
   PURE UTILITIES (testable, side-effect free)
══════════════════════════════════════════════════════════════════ */
const safeMs = (v) => {
  if (!v) return NaN;
  if (typeof v === 'number') return v;
  const ms = new Date(String(v).trim()).getTime();
  return Number.isNaN(ms) ? NaN : ms;
};

const pad2 = (n) => String(n).padStart(2, '0');

const toHMS = (s) => {
  const safe = Math.max(0, s | 0);
  return { h: Math.floor(safe / 3600), m: Math.floor((safe % 3600) / 60), s: safe % 60 };
};

const fmtPrice = (v) => {
  const n = typeof v === 'string' ? parseInt(v.replace(/\D/g, ''), 10) : Number(v);
  if (!n || Number.isNaN(n)) return '';
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
};

const maskPrice = (v) => {
  const n = typeof v === 'string' ? parseInt(v.replace(/\D/g, ''), 10) : Number(v);
  if (!n || Number.isNaN(n)) return '';
  const s = String(n);
  if (s.length <= 3) return s[0] + '✱'.repeat(s.length - 1) + '₫';
  const masked = s[0] + s.slice(1, -2).replace(/\d/g, '✱') + '00';
  const parts = masked.match(/.{1,3}(?=(.{3})*$)/g) || [masked];
  return parts.join('.') + '₫';
};

const calcPct = (orig, sale) => {
  const o = Number(orig); const s = Number(sale);
  if (!o || !s || o <= 0) return 0;
  return Math.round((1 - s / o) * 100);
};

const fmtTime = (ms) => {
  if (!ms || Number.isNaN(ms)) return '--:--';
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const fmtDate = (ms) => {
  if (!ms || Number.isNaN(ms)) return '';
  const d = new Date(ms);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
};

const groupToSessions = (entries) => {
  const map = new Map();
  for (const entry of entries || []) {
    const startMs = safeMs(entry.saleStartAt);
    const endMs = safeMs(entry.saleEndAt);
    const key = `${Number.isNaN(startMs) ? 'x' : startMs}|${Number.isNaN(endMs) ? 'x' : endMs}`;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        startMs: Number.isNaN(startMs) ? null : startMs,
        endMs: Number.isNaN(endMs) ? null : endMs,
        products: [],
      });
    }
    const p = entry.product ?? entry;
    const img =
      p.img ?? p.image ?? p.thumbnail ?? p.avatar ?? p.photo ??
      (Array.isArray(p.images) && p.images[0]) ?? '';
    map.get(key).products.push({
      id: p.id ?? entry.id,
      placementId: entry.placementId ?? entry.id,
      title: p.title ?? p.name ?? '',
      img,
      price: Number(p.price) || 0,
      salePrice: Number(entry.salePrice ?? p.salePrice ?? p.price) || 0,
      stockLimit: Number.isInteger(entry.stockLimit) ? entry.stockLimit : null,
      stockSold: Number(entry.stockSold) || 0,
      stockLeft:
        Number.isInteger(entry.stockLeft) && entry.stockLeft >= 0 ? entry.stockLeft : null,
      productStock: Number(p.stock) || 0,
      status: p.status ?? 'active',
      sortOrder: Number(entry.sortOrder) || 0,
    });
  }
  const list = [...map.values()].sort((a, b) => {
    if (a.startMs == null && b.startMs == null) return 0;
    if (a.startMs == null) return 1;
    if (b.startMs == null) return -1;
    return a.startMs - b.startMs;
  });
  list.forEach((s) => s.products.sort((a, b) => a.sortOrder - b.sortOrder));
  return list;
};

const getStatus = (sess, now = Date.now()) => {
  if (!sess?.startMs || !sess?.endMs) return STATUS.NO_TIME;
  if (now >= sess.startMs && now < sess.endMs) return STATUS.ACTIVE;
  if (now < sess.startMs) return STATUS.UPCOMING;
  return STATUS.ENDED;
};

const getSecsLeft = (sess, now = Date.now()) => {
  if (!sess?.startMs || !sess?.endMs) return 0;
  const st = getStatus(sess, now);
  if (st === STATUS.ACTIVE) return Math.max(0, Math.floor((sess.endMs - now) / 1000));
  if (st === STATUS.UPCOMING) return Math.max(0, Math.floor((sess.startMs - now) / 1000));
  return 0;
};

/* ══════════════════════════════════════════════════════════════════
   GLOBAL CSS (mounted once via singleton)
══════════════════════════════════════════════════════════════════ */
const STYLE_ID = 'fs-hotdeal-styles';
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fs-burn { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes fs-flicker { 0%,100%{opacity:1;transform:scale(1)} 25%{opacity:.92;transform:scaleY(1.04) scaleX(.97)} 75%{opacity:.96;transform:scaleY(.97) scaleX(1.02)} }
@keyframes fs-pulse-ring { 0%{transform:scale(.9);opacity:.7} 70%,100%{transform:scale(1.9);opacity:0} }
@keyframes fs-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes fs-in { from{opacity:0;transform:translateY(14px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes fs-badge-pop { 0%{transform:scale(0) rotate(-18deg);opacity:0} 70%{transform:scale(1.12) rotate(4deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
@keyframes fs-price-shine { 0%{background-position:-200% center} 100%{background-position:200% center} }
@keyframes fs-live-dot { 0%,100%{opacity:1} 50%{opacity:.25} }
@keyframes fs-tab-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes fs-stripe { 0%{background-position:0 0} 100%{background-position:200% 0} }
@keyframes fs-glow-pulse { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.95;transform:scale(1.08)} }
@keyframes fs-spark { 0%,100%{opacity:0;transform:scale(0) rotate(0)} 50%{opacity:.8;transform:scale(1) rotate(180deg)} }
@keyframes fs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; }
}

.fs-tabs::-webkit-scrollbar { display:none; }
.fs-tabs { -ms-overflow-style:none; scrollbar-width:none; scroll-behavior:smooth; }

.fs-tab-btn {
  transition: background .18s ease, border-color .18s ease, transform .18s ease;
  position:relative;
}
.fs-tab-btn:hover:not([aria-selected="true"]) { background: rgba(255,255,255,.08) !important; }
.fs-tab-btn:focus-visible { outline: 2px solid #ffd166; outline-offset: -2px; }

.fs-card-link { text-decoration: none; display: contents; }
.fs-card { will-change: transform; }
.fs-card:focus-within { outline: 2px solid #e53e3e; outline-offset: 3px; border-radius: 18px; }

.fs-cta { transition: all .22s cubic-bezier(.34,1.56,.64,1); }
.fs-cta:hover:not(:disabled) { transform: scale(1.02); }
.fs-cta:active:not(:disabled) { transform: scale(.98); }
.fs-cta:disabled { cursor: not-allowed; }
.fs-cta:focus-visible { outline: 2px solid #e53e3e; outline-offset: 2px; }

.fs-link-btn:hover { background: rgba(255,100,50,.32) !important; border-color: rgba(255,100,50,.55) !important; transform: translateY(-1px); }
.fs-link-btn:focus-visible { outline: 2px solid #ffd166; outline-offset: 2px; }

.fs-swiper .swiper-button-next,
.fs-swiper .swiper-button-prev {
  width:40px !important; height:40px !important; border-radius:50% !important;
  background:#fff !important; border:1.5px solid #f0f0f0 !important;
  box-shadow:0 4px 18px rgba(0,0,0,.1) !important;
  color:#d93e1c !important;
  opacity:0 !important;
  transition:opacity .2s, transform .2s, background .18s, border-color .18s !important;
}
.fs-swiper .swiper-button-next::after,
.fs-swiper .swiper-button-prev::after { font-size:12px !important; font-weight:900 !important; }
.fs-swiper:hover .swiper-button-next,
.fs-swiper:hover .swiper-button-prev,
.fs-swiper .swiper-button-next:focus-visible,
.fs-swiper .swiper-button-prev:focus-visible { opacity:1 !important; }
.fs-swiper .swiper-button-next:hover,
.fs-swiper .swiper-button-prev:hover {
  background:linear-gradient(135deg,#e53e3e,#fd5630) !important;
  color:#fff !important; border-color:transparent !important;
  transform:scale(1.1) !important;
}
.fs-swiper .swiper-button-prev { left:4px !important; }
.fs-swiper .swiper-button-next { right:4px !important; }
.fs-swiper .swiper-button-disabled { opacity:0 !important; pointer-events:none; }

.fs-img-fallback {
  width:64px; height:64px; border-radius:14px; background:#f5f5f5;
  display:flex; align-items:center; justify-content:center;
}
`;

let stylesInjected = false;
const injectStylesOnce = () => {
  if (stylesInjected || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) { stylesInjected = true; return; }
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = GLOBAL_CSS;
  document.head.appendChild(tag);
  stylesInjected = true;
};

/* ══════════════════════════════════════════════════════════════════
   useTicker — single source of truth for time, only re-renders subscribers
══════════════════════════════════════════════════════════════════ */
const useTicker = (active = true) => {
  const [, tick] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(tick, 1000);
    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [active]);
};

/* ══════════════════════════════════════════════════════════════════
   Countdown — isolated tick (only this component re-renders per second)
══════════════════════════════════════════════════════════════════ */
const Countdown = memo(function Countdown({ secsLeft, label, compact = false }) {
  useTicker(false); // parent passes pre-computed secsLeft; ticker lives in <CountdownLive>
  const { h, m, s } = toHMS(secsLeft);

  if (compact) {
    return (
      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#fff', fontFamily: TOKENS.font.body, fontVariantNumeric: 'tabular-nums' }}>
        {pad2(h)}:{pad2(m)}:{pad2(s)}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,190,110,.65)', fontFamily: TOKENS.font.body }}>
        {label}
      </span>
      <div role="timer" aria-live="off" aria-label={`Còn ${h} giờ ${m} phút ${s} giây`} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
        {[
          { v: h, l: 'Giờ' }, null,
          { v: m, l: 'Phút' }, null,
          { v: s, l: 'Giây' },
        ].map((item, i) =>
          item == null ? (
            <span key={i} aria-hidden="true" style={{ fontFamily: TOKENS.font.display, fontSize: 24, fontWeight: 700, color: 'rgba(255,160,80,.45)', lineHeight: 1, paddingTop: 8 }}>:</span>
          ) : (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                fontFamily: TOKENS.font.display,
                fontSize: 'clamp(20px,2.8vw,30px)', fontWeight: 700, lineHeight: 1,
                color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: '-1px',
                background: 'linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.06))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,.14)',
                padding: '6px 10px', borderRadius: 10, minWidth: 46, textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 4px 14px rgba(0,0,0,.18)',
              }}>{pad2(item.v)}</div>
              <span aria-hidden="true" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,190,110,.5)', fontFamily: TOKENS.font.body }}>{item.l}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
});

const CountdownLive = memo(function CountdownLive({ session, label }) {
  useTicker(true);
  const secsLeft = getSecsLeft(session);
  return <Countdown secsLeft={secsLeft} label={label} />;
});

const TabCountdown = memo(function TabCountdown({ session }) {
  useTicker(true);
  const secsLeft = getSecsLeft(session);
  return <Countdown secsLeft={secsLeft} label="" compact />;
});

/* ══════════════════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════════════════ */
const Header = memo(function Header({ sessions, selectedId, onSelect, selectedSess }) {
  const status = selectedSess ? getStatus(selectedSess) : STATUS.UPCOMING;
  const isLive = status === STATUS.ACTIVE || status === STATUS.NO_TIME;
  const visibleSessions = useMemo(
    () => sessions.filter((s) => getStatus(s) !== STATUS.ENDED),
    [sessions]
  );

  const tabsRef = useRef(null);
  const onKeyDown = useCallback((e, idx) => {
    const items = tabsRef.current?.querySelectorAll('[role="tab"]');
    if (!items?.length) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    items[next]?.focus();
    items[next]?.click();
  }, []);

  return (
    <header style={{
      background: `linear-gradient(150deg, ${TOKENS.color.bgDark} 0%, ${TOKENS.color.bgDarkAlt} 45%, ${TOKENS.color.bgDarkRed} 100%)`,
      backgroundSize: '300% 300%',
      animation: 'fs-burn 12s ease infinite',
      borderRadius: '20px 20px 0 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative noise */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px',
      }} />

      {/* Orbs */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: -70, left: -50, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,100,50,.22) 0%, transparent 70%)',
        animation: 'fs-glow-pulse 4s ease-in-out infinite',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,210,80,.14) 0%, transparent 70%)',
        animation: 'fs-glow-pulse 5s ease-in-out infinite .8s',
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: -60, left: '40%', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,62,62,.12) 0%, transparent 70%)',
      }} />

      {/* Spark dots */}
      {[
        { top: 28, left: '32%', delay: 0 },
        { top: 60, left: '70%', delay: 1.2 },
        { top: 90, left: '50%', delay: 2.4 },
      ].map((sp, i) => (
        <div key={i} aria-hidden="true" style={{
          position: 'absolute', top: sp.top, left: sp.left, width: 4, height: 4, borderRadius: '50%',
          background: '#ffd166', boxShadow: '0 0 10px #ffd166, 0 0 20px #ff8c42',
          animation: `fs-spark 3s ease-in-out ${sp.delay}s infinite`,
        }} />
      ))}

      {/* Top rainbow stripe */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #ff6b35, #ffd166, #ff3a20, #ffd166, #ff6b35)',
        backgroundSize: '200% 100%',
        animation: 'fs-stripe 4s linear infinite',
      }} />

      {/* Main row */}
      <div style={{ padding: 'clamp(20px,3vw,28px) clamp(18px,3vw,30px) 0', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div aria-hidden="true" style={{
              width: 58, height: 58, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(255,107,53,.28), rgba(255,58,32,.16))',
              border: '1px solid rgba(255,107,53,.42)',
              backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'fs-flicker 2.4s ease-in-out infinite',
              boxShadow: '0 4px 26px rgba(255,58,32,.26), inset 0 1px 0 rgba(255,255,255,.12)',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 15 5.5 15 8.5C15 10.5 13.9 12 12 12C10.1 12 9 10.5 9 8.5C9 6.3 10.2 4.2 10.2 4.2C10.2 4.2 6.5 8 6.5 12.5C6.5 16.3 9 19.2 12 19.2C15 19.2 17.5 16.3 17.5 12.5C17.5 8 12 2 12 2Z" fill="url(#fgrad)" />
                <path d="M12 13C12 13 13.5 14.5 13.5 16C13.5 17.1 12.8 18 12 18C11.2 18 10.5 17.1 10.5 16C10.5 14.5 12 13 12 13Z" fill="#FFD166" />
                <defs>
                  <linearGradient id="fgrad" x1="6.5" y1="19.2" x2="17.5" y2="2" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FF3A20" />
                    <stop offset=".5" stopColor="#FF8C42" />
                    <stop offset="1" stopColor="#FFD166" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div>
              <h2 style={{
                margin: 0, fontFamily: TOKENS.font.display,
                fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-2px',
                background: 'linear-gradient(90deg, #ffffff 0%, #ffd166 35%, #ff8c42 65%, #ff3a20 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                textShadow: '0 0 30px rgba(255,140,66,.2)',
              }}>FLASH SALE</h2>
              <div style={{
                marginTop: 5, display: 'flex', alignItems: 'center', gap: 7,
                fontSize: 11, fontWeight: 600, letterSpacing: '.14em',
                color: 'rgba(255,200,130,.7)', textTransform: 'uppercase',
                fontFamily: TOKENS.font.body,
              }}>
                {isLive ? (
                  <>
                    <span aria-hidden="true" style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#ff3a20', animation: 'fs-pulse-ring 1.6s ease-out infinite' }} />
                      <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: '#ff5733', animation: 'fs-live-dot 1s ease-in-out infinite', boxShadow: '0 0 8px #ff3a20' }} />
                    </span>
                    Đang diễn ra • Ưu đãi giới hạn
                  </>
                ) : 'Ưu đãi có giới hạn'}
              </div>
            </div>
          </div>

          {/* Right: Timer + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0, flexWrap: 'wrap' }}>
            {selectedSess && (status === STATUS.ACTIVE || status === STATUS.UPCOMING) && (
              <CountdownLive
                session={selectedSess}
                label={status === STATUS.ACTIVE ? '⚡ Kết thúc sau' : '⏳ Bắt đầu sau'}
              />
            )}

            <Link
              to="/flash-sale"
              className="fs-link-btn"
              aria-label="Xem tất cả sản phẩm Flash Sale"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                textDecoration: 'none', whiteSpace: 'nowrap',
                fontFamily: TOKENS.font.body, fontSize: 13, fontWeight: 700, color: '#fff',
                background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)',
                backdropFilter: 'blur(10px)', borderRadius: 999, padding: '9px 20px',
                transition: 'all .22s ease',
              }}
            >
              Xem tất cả
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {visibleSessions.length > 0 && (
        <div
          ref={tabsRef}
          className="fs-tabs"
          role="tablist"
          aria-label="Khung giờ Flash Sale"
          style={{ display: 'flex', overflowX: 'auto', marginTop: 18, padding: '0 clamp(12px,2vw,22px)', gap: 4, position: 'relative', zIndex: 1 }}
        >
          {visibleSessions.map((sess, idx) => {
            const st = getStatus(sess);
            const isSel = sess.id === selectedId;
            return (
              <button
                key={sess.id}
                role="tab"
                aria-selected={isSel}
                aria-controls={`fs-panel-${sess.id}`}
                id={`fs-tab-${sess.id}`}
                tabIndex={isSel ? 0 : -1}
                className="fs-tab-btn"
                onClick={() => onSelect(sess.id)}
                onKeyDown={(e) => onKeyDown(e, idx)}
                style={{
                  flex: '1 0 auto', minWidth: 92, maxWidth: 152,
                  padding: '12px 14px 16px', border: 'none', cursor: 'pointer',
                  borderRadius: '14px 14px 0 0',
                  background: isSel ? 'rgba(255,255,255,.13)' : 'transparent',
                  borderTop: isSel ? '2px solid rgba(255,140,80,.75)' : '2px solid transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  backdropFilter: isSel ? 'blur(14px)' : 'none',
                  animation: `fs-tab-in .35s ease ${Math.min(idx * 0.05, 0.35)}s both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontFamily: TOKENS.font.display, fontSize: 18, fontWeight: 700, lineHeight: 1,
                    color: isSel ? '#fff' : 'rgba(255,255,255,.62)',
                    transition: 'color .18s',
                  }}>{fmtTime(sess.startMs)}</span>
                  {sess.startMs && (
                    <span style={{ fontSize: 10, fontWeight: 500, color: isSel ? 'rgba(255,200,130,.7)' : 'rgba(255,255,255,.32)', fontFamily: TOKENS.font.body }}>
                      {fmtDate(sess.startMs)}
                    </span>
                  )}
                </div>

                {st === STATUS.ACTIVE ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,58,32,.9)', borderRadius: 20, padding: '3px 9px', boxShadow: '0 2px 8px rgba(255,58,32,.4)' }}>
                    <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', animation: 'fs-live-dot 1s infinite', flexShrink: 0 }} />
                    <TabCountdown session={sess} />
                  </div>
                ) : st === STATUS.UPCOMING ? (
                  <span style={{
                    fontSize: 9.5, fontWeight: 600, fontFamily: TOKENS.font.body,
                    color: isSel ? 'rgba(255,200,130,.78)' : 'rgba(255,255,255,.38)',
                    background: isSel ? 'rgba(255,200,130,.14)' : 'transparent',
                    padding: isSel ? '2px 9px' : '2px 0', borderRadius: 20,
                  }}>Sắp diễn ra</span>
                ) : (
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,.32)', fontFamily: TOKENS.font.body }}>Mọi lúc</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
});

/* ══════════════════════════════════════════════════════════════════
   PRODUCT CARD — memoized, no JS hover (CSS-only)
══════════════════════════════════════════════════════════════════ */
const FallbackImg = memo(function FallbackImg() {
  return (
    <div className="fs-img-fallback" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    </div>
  );
});

const ProductCard = memo(function ProductCard({ item, sessStatus, index }) {
  const [imgError, setImgError] = useState(false);
  const isActive = sessStatus === STATUS.ACTIVE || sessStatus === STATUS.NO_TIME;
  const isUpcoming = sessStatus === STATUS.UPCOMING;
  const discount = calcPct(item.price, item.salePrice);
  const salePrice = item.salePrice || item.price;

  const hasFlashLimit = item.stockLimit !== null && item.stockLimit !== undefined;
  const displayLeft = hasFlashLimit
    ? (item.stockLeft ?? Math.max(0, item.stockLimit - item.stockSold))
    : null;
  const isSoldOut = hasFlashLimit ? (displayLeft != null && displayLeft <= 0) : item.productStock <= 0;
  const isLow = displayLeft != null && displayLeft > 0 && displayLeft <= 5;
  const soldPct = hasFlashLimit && item.stockLimit > 0
    ? Math.min(100, Math.round((item.stockSold / item.stockLimit) * 100))
    : 0;
  const showProgress = hasFlashLimit && item.stockLimit > 0;

  const progressBg =
    soldPct >= 80 ? 'linear-gradient(90deg,#ff2000,#e53e3e)' :
    soldPct >= 50 ? 'linear-gradient(90deg,#ff5500,#ff3a20)' :
                    'linear-gradient(90deg,#ff8c42,#ff6b35)';

  const imgEl = imgError ? <FallbackImg /> : (
    <img
      src={item.img}
      alt={item.title}
      loading="lazy"
      decoding="async"
      onError={() => setImgError(true)}
      style={{
        maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
        transition: 'transform .38s cubic-bezier(.34,1.56,.64,1), filter .3s ease',
        filter: isUpcoming ? 'grayscale(30%) blur(2px)' : 'drop-shadow(0 4px 10px rgba(0,0,0,.08))',
        opacity: isUpcoming ? .65 : 1,
      }}
      className="fs-card-img"
    />
  );

  const stockBadge = isUpcoming ? (
    <span style={badgeStyle('#fff4ed', '#c04a00', 'rgba(255,107,53,.22)')}>
      ⚡ {hasFlashLimit ? `Sắp mở ${item.stockLimit} suất` : 'Sắp mở bán'}
    </span>
  ) : isSoldOut ? (
    <span style={badgeStyle('#f5f5f5', '#aaa', 'transparent')}>Hết suất</span>
  ) : displayLeft == null ? (
    <span style={badgeStyle('#fff0ed', '#d93e1c', 'rgba(255,58,32,.2)')}>⚡ Flash Sale</span>
  ) : isLow ? (
    <span style={badgeStyle('#fffbeb', '#92400e', '#fde68a')}>🔥 Còn {displayLeft} suất cuối!</span>
  ) : (
    <span style={badgeStyle('#fff0ed', '#d93e1c', 'rgba(255,58,32,.18)')}>⚡ Còn {displayLeft} suất</span>
  );

  const cardInner = (
    <article
      className="fs-card"
      aria-label={`${item.title}, giá ${fmtPrice(salePrice)}${discount > 0 ? `, giảm ${discount}%` : ''}`}
      style={{
        background: '#fff', borderRadius: TOKENS.radius.xl, height: '100%', boxSizing: 'border-box',
        border: `1.5px solid ${TOKENS.color.border}`,
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible',
        boxShadow: TOKENS.shadow.card,
        transition: 'transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease, border-color .2s',
        animation: `fs-in .45s cubic-bezier(.34,1.56,.64,1) ${Math.min(index * 0.06, 0.4)}s both`,
      }}
    >
      <style>{`
        .fs-card:hover { transform: translateY(-8px) scale(1.012); border-color: rgba(229,62,62,.32); box-shadow: ${TOKENS.shadow.cardHover}; }
        .fs-card:hover .fs-card-img { transform: scale(1.1) translateY(-4px); ${isUpcoming ? '' : 'filter: drop-shadow(0 10px 20px rgba(255,107,53,.3));'} }
        .fs-card:hover .fs-card-accent { opacity: 1 !important; }
        .fs-card:hover .fs-card-glow { opacity: 1 !important; }
        .fs-card:hover .fs-card-title { color: #d93e1c !important; }
        .fs-card:hover .fs-cta-active { background: linear-gradient(135deg,#e53e3e,#fd5630) !important; color:#fff !important; border-color: transparent !important; box-shadow: 0 6px 22px rgba(229,62,62,.4) !important; }
      `}</style>

      {/* Discount pill */}
      {discount > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: -10, right: 12, zIndex: 10,
          background: 'linear-gradient(135deg, #e53e3e, #c41e1e)',
          color: '#fff', fontSize: 11, fontWeight: 800,
          fontFamily: TOKENS.font.display,
          padding: '5px 11px', borderRadius: 999,
          boxShadow: '0 4px 14px rgba(200,30,30,.5), inset 0 1px 0 rgba(255,255,255,.2)',
          animation: 'fs-badge-pop .5s cubic-bezier(.34,1.56,.64,1) both',
          letterSpacing: '.02em',
        }}>−{discount}%</div>
      )}

      {/* Hover top accent */}
      <div aria-hidden="true" className="fs-card-accent" style={{
        position: 'absolute', top: 0, left: 18, right: 18, height: 2.5, borderRadius: '0 0 4px 4px',
        background: 'linear-gradient(90deg, #ff3a20, #ff8c42, #ffd166, #ff8c42, #ff3a20)',
        backgroundSize: '200% 100%',
        animation: 'fs-stripe 3s linear infinite',
        opacity: 0, transition: 'opacity .25s',
      }} />

      {/* Image */}
      <div style={{
        padding: '22px 14px 8px', height: 158,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        borderRadius: '18px 18px 0 0',
      }}>
        <div aria-hidden="true" className="fs-card-glow" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,107,53,.1) 0%, transparent 72%)',
          opacity: 0, transition: 'opacity .3s',
        }} />

        {isUpcoming ? (
          <>
            {imgEl}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(8px)',
                borderRadius: 12, padding: '6px 14px',
                border: '1px solid rgba(255,107,53,.2)',
                boxShadow: '0 4px 16px rgba(0,0,0,.1)',
                animation: 'fs-float 2.4s ease-in-out infinite',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TOKENS.color.accent, fontFamily: TOKENS.font.body }}>🔒 Sắp mở</span>
              </div>
            </div>
          </>
        ) : (
          <Link to={`/product/${item.id}`} state={{ item }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }} aria-label={`Xem ${item.title}`}>
            {imgEl}
          </Link>
        )}
      </div>

      <div style={{ padding: '8px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1, gap: 8 }}>
        <div>{stockBadge}</div>

        {/* Title */}
        {isUpcoming ? (
          <p className="fs-card-title" style={{
            fontSize: 12.5, fontWeight: 600, lineHeight: 1.45, margin: 0, fontFamily: TOKENS.font.body,
            color: '#aaa', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', minHeight: 36, cursor: 'default',
          }}>{item.title}</p>
        ) : (
          <Link to={`/product/${item.id}`} state={{ item }} style={{ textDecoration: 'none' }}>
            <p className="fs-card-title" style={{
              fontSize: 12.5, fontWeight: 600, lineHeight: 1.45, margin: 0, fontFamily: TOKENS.font.body,
              color: TOKENS.color.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', transition: 'color .18s', minHeight: 36,
            }}>{item.title}</p>
          </Link>
        )}

        {/* Price box */}
        <div style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #120924 0%, #1f0b00 100%)',
          padding: '10px 13px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          position: 'relative', overflow: 'hidden',
          boxShadow: isActive ? '0 4px 18px rgba(210,40,0,.22), inset 0 1px 0 rgba(255,255,255,.06)' : 'inset 0 1px 0 rgba(255,255,255,.04)',
        }}>
          <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span style={{
              fontFamily: TOKENS.font.display,
              fontSize: 'clamp(14px,2vw,18px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-.5px',
              ...(isUpcoming ? {
                background: 'linear-gradient(90deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.7) 35%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.7) 65%,rgba(255,255,255,.25) 100%)',
                backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                animation: 'fs-price-shine 2.5s linear infinite',
              } : { color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.3)' }),
            }}>{isUpcoming ? maskPrice(salePrice) : fmtPrice(salePrice)}</span>
            {item.price > 0 && item.price !== salePrice && (
              <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,.32)', textDecoration: 'line-through', fontFamily: TOKENS.font.body }}>
                {fmtPrice(item.price)}
              </span>
            )}
          </div>

          {discount > 0 && (
            <div aria-hidden="true" style={{
              background: 'rgba(255,210,0,.16)', border: '1px solid rgba(255,210,0,.32)',
              borderRadius: 8, padding: '4px 10px',
              filter: isUpcoming ? 'blur(2.5px)' : 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.1)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#ffd700', fontFamily: TOKENS.font.display }}>−{discount}%</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {!isUpcoming && (
          <div>
            <div
              role="progressbar"
              aria-valuenow={soldPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Đã bán ${soldPct}%`}
              style={{ height: 6, background: '#f0f0f0', borderRadius: 99, overflow: 'hidden', marginBottom: 5, position: 'relative' }}
            >
              <div style={{
                height: '100%', borderRadius: 99,
                width: showProgress ? `${Math.max(3, soldPct)}%` : '3%',
                background: progressBg,
                transition: 'width .6s ease',
                boxShadow: soldPct >= 50 ? '0 0 8px rgba(255,58,32,.5)' : 'none',
                position: 'relative',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 14 }}>
              {showProgress ? (
                <>
                  <span style={{ fontSize: 10, color: '#a8a8a8', fontFamily: TOKENS.font.body, fontWeight: 500 }}>
                    Đã bán {soldPct}%
                  </span>
                  {soldPct >= 80 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: TOKENS.color.primary, fontFamily: TOKENS.font.body }}>🔥 Sắp hết</span>
                  )}
                </>
              ) : <span />}
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          className={`fs-cta ${isActive && !isSoldOut ? 'fs-cta-active' : ''}`}
          disabled={!isActive || isSoldOut}
          aria-label={isSoldOut ? 'Đã hết suất' : isActive ? `Mua ${item.title} ngay` : isUpcoming ? 'Sắp diễn ra' : 'Đã kết thúc'}
          style={{
            marginTop: 'auto', width: '100%', padding: '10px 0',
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            fontFamily: TOKENS.font.body, letterSpacing: '.02em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            ...(isSoldOut ? {
              background: '#f8f8f8', color: '#c0c0c0', border: '1.5px solid #eee', cursor: 'not-allowed',
            } : isActive ? {
              background: '#fff', color: TOKENS.color.primary,
              border: '1.5px solid rgba(229,62,62,.4)', cursor: 'pointer',
            } : isUpcoming ? {
              background: '#fff', color: TOKENS.color.accent, border: '1.5px solid rgba(255,140,66,.3)', opacity: .72, cursor: 'not-allowed',
            } : {
              background: '#f8f8f8', color: '#c0c0c0', border: '1.5px solid #eee', cursor: 'not-allowed',
            }),
          }}
        >
          {isSoldOut ? 'Hết suất'
            : isActive ? (
              <>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Mua ngay
              </>
            ) : isUpcoming ? (
              <>
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                Sắp diễn ra
              </>
            ) : 'Đã kết thúc'}
        </button>
      </div>
    </article>
  );

  return cardInner;
});

const badgeStyle = (bg, color, border) => ({
  display: 'inline-flex', alignItems: 'center', gap: 4,
  background: bg, color, fontSize: 10, fontWeight: 700,
  fontFamily: TOKENS.font.body, padding: '3.5px 10px', borderRadius: 6,
  border: `1px solid ${border}`,
  letterSpacing: '.01em',
});

/* ══════════════════════════════════════════════════════════════════
   STATE COMPONENTS
══════════════════════════════════════════════════════════════════ */
const Skeleton = memo(function Skeleton({ delay = 0 }) {
  return (
    <div aria-hidden="true" style={{ borderRadius: TOKENS.radius.xl, overflow: 'hidden', background: '#fff', border: '1.5px solid #f4f4f4', boxShadow: '0 2px 10px rgba(0,0,0,.04)' }}>
      <div style={{ height: 158, background: 'linear-gradient(90deg,#f8f8f8 25%,#efefef 50%,#f8f8f8 75%)', backgroundSize: '200% 100%', animation: `fs-shimmer 1.5s ease-in-out ${delay}s infinite` }} />
      <div style={{ padding: '10px 13px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {[50, 90, 70, 100, 38].map((w, i) => (
          <div key={i} style={{
            height: i === 4 ? 36 : i === 3 ? 50 : 10,
            width: `${w}%`, borderRadius: 8,
            background: 'linear-gradient(90deg,#f4f4f4 25%,#ececec 50%,#f4f4f4 75%)',
            backgroundSize: '200% 100%',
            animation: `fs-shimmer 1.5s ease-in-out ${delay + i * 0.08}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
});

const Empty = memo(function Empty() {
  return (
    <div role="status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '64px 20px' }}>
      <div aria-hidden="true" style={{ width: 64, height: 64, borderRadius: 18, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
      <p style={{ color: '#374151', fontWeight: 700, fontSize: 14.5, margin: 0, fontFamily: TOKENS.font.body }}>Chưa có sản phẩm Flash Sale</p>
      <span style={{ fontSize: 12.5, color: '#9ca3af', fontFamily: TOKENS.font.body }}>Khung giờ này chưa có sản phẩm</span>
    </div>
  );
});

const ErrorState = memo(function ErrorState({ onRetry }) {
  return (
    <div role="alert" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '56px 20px' }}>
      <div aria-hidden="true" style={{ width: 60, height: 60, borderRadius: 18, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p style={{ color: '#374151', fontWeight: 700, fontSize: 14, margin: 0, fontFamily: TOKENS.font.body }}>Không thể tải dữ liệu Flash Sale</p>
      <span style={{ fontSize: 12.5, color: '#9ca3af', fontFamily: TOKENS.font.body }}>Vui lòng thử lại sau</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 4, padding: '8px 18px', borderRadius: 999,
            background: TOKENS.color.primary, color: '#fff', border: 'none',
            fontSize: 12.5, fontWeight: 700, fontFamily: TOKENS.font.body, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(229,62,62,.3)',
          }}
        >Thử lại</button>
      )}
    </div>
  );
});

/* ══════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════ */
export default function HotDeal() {
  const [sessions, setSessions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const autoAdvRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Inject CSS once
  useEffect(() => { injectStylesOnce(); }, []);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await placementApi.getFlashSale();
        if (cancelled) return;
        const grouped = groupToSessions(raw ?? []);
        setSessions(grouped);
        const now = Date.now();
        const sel =
          grouped.find((s) => getStatus(s, now) === STATUS.ACTIVE) ||
          grouped.find((s) => getStatus(s, now) === STATUS.NO_TIME) ||
          grouped.find((s) => getStatus(s, now) === STATUS.UPCOMING) ||
          grouped[0];
        if (sel) setSelectedId(sel.id);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  // Auto-advance when current session ends
  useEffect(() => {
    if (!selectedId || !sessions.length) return;
    const cur = sessions.find((s) => s.id === selectedId);
    if (!cur || getStatus(cur) !== STATUS.ACTIVE || !cur.endMs) return;
    const delay = cur.endMs - Date.now() + 700;
    if (delay <= 0) return;
    clearTimeout(autoAdvRef.current);
    autoAdvRef.current = setTimeout(() => {
      const idx = sessions.findIndex((s) => s.id === selectedId);
      const next = sessions.slice(idx + 1).find((s) => getStatus(s) !== STATUS.ENDED);
      if (next) setSelectedId(next.id);
    }, Math.min(delay, 2147483_000));
    return () => clearTimeout(autoAdvRef.current);
  }, [selectedId, sessions]);

  const selectedSess = useMemo(
    () => sessions.find((s) => s.id === selectedId),
    [sessions, selectedId]
  );
  const sessStatus = selectedSess ? getStatus(selectedSess) : STATUS.UPCOMING;
  const products = selectedSess?.products ?? [];

  const handleRetry = useCallback(() => setReloadKey((k) => k + 1), []);
  const handleSelect = useCallback((id) => setSelectedId(id), []);

  const swiperBreakpoints = useMemo(() => ({
    1200: { slidesPerView: 5, spaceBetween: 14 },
    992:  { slidesPerView: 4, spaceBetween: 14 },
    768:  { slidesPerView: 3, spaceBetween: 12 },
    500:  { slidesPerView: 2, spaceBetween: 10 },
    0:    { slidesPerView: 1.65, spaceBetween: 10 },
  }), []);

  return (
    <section
      aria-labelledby="fs-title"
      style={{ maxWidth: 1200, margin: '0 auto 56px', padding: '0 clamp(8px,2vw,16px)', boxSizing: 'border-box' }}
    >
      <div id="fs-title" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Khu vực Flash Sale
      </div>

      <div style={{
        borderRadius: TOKENS.radius['2xl'], overflow: 'hidden',
        boxShadow: TOKENS.shadow.container,
        background: '#fff',
      }}>
        {loading ? (
          <div aria-hidden="true" style={{ height: 100, background: `linear-gradient(150deg, ${TOKENS.color.bgDark}, ${TOKENS.color.bgDarkRed})`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)', backgroundSize: '200% 100%', animation: 'fs-shimmer 1.8s ease-in-out infinite' }} />
          </div>
        ) : (
          <Header
            sessions={sessions}
            selectedId={selectedId}
            onSelect={handleSelect}
            selectedSess={selectedSess}
          />
        )}

        <div
          id={selectedId ? `fs-panel-${selectedId}` : undefined}
          role="tabpanel"
          aria-labelledby={selectedId ? `fs-tab-${selectedId}` : undefined}
          style={{
            background: `linear-gradient(180deg, ${TOKENS.color.bgSofter} 0%, #fff 100%)`,
            padding: 'clamp(18px,2.5vw,26px) clamp(14px,2vw,22px) clamp(22px,3vw,32px)',
            borderRadius: '0 0 20px 20px',
            minHeight: 240, position: 'relative',
          }}
        >
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,100,50,.14), rgba(229,62,62,.14), transparent)',
          }} />

          {loading ? (
            <div style={{ display: 'flex', gap: 14 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} style={{ flex: 1, minWidth: 0 }}><Skeleton delay={i * 0.09} /></div>
              ))}
            </div>
          ) : error ? (
            <ErrorState onRetry={handleRetry} />
          ) : !products.length ? (
            <Empty />
          ) : (
            <div className="fs-swiper">
              <Swiper
                key={selectedId}
                modules={[Navigation, Autoplay]}
                navigation
                spaceBetween={14}
                loop={products.length >= 5}
                a11y={{
                  prevSlideMessage: 'Sản phẩm trước',
                  nextSlideMessage: 'Sản phẩm sau',
                }}
                autoplay={
                  (sessStatus === STATUS.ACTIVE || sessStatus === STATUS.NO_TIME) && products.length >= 2
                    ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
                    : false
                }
                breakpoints={swiperBreakpoints}
                style={{ paddingBottom: 4, overflow: 'visible' }}
              >
                {products.map((item, i) => (
                  <SwiperSlide key={item.id ?? item.placementId ?? i} style={{ height: 'auto' }}>
                    <ProductCard item={item} sessStatus={sessStatus} index={i} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
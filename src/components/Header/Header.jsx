import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/gogo.png';

/* ══════════════════════════════════════════════════════
   LONGTY JR — Header v4  (production-grade)
   Font: DM Sans (body) + Sora (brand)
   Design tokens via CSS custom properties
══════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Sora:wght@800;900&display=swap');

:root {
  --h-red:        #c00018;
  --h-red-mid:    #a8001a;
  --h-red-deep:   #8c0016;
  --h-gold:       #f4c430;
  --h-gold-soft:  rgba(244,196,48,0.18);
  --h-white:      #ffffff;
  --h-nav-h:      40px;
  --h-top-h:      64px;
  --h-top-h-sm:   52px;
  --h-ease:       cubic-bezier(0.22, 1, 0.36, 1);
  --h-ease-back:  cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ─── Reset inside header ─── */
.hv4 *, .hv4 *::before, .hv4 *::after { box-sizing: border-box; margin: 0; padding: 0; }
.hv4 { font-family: 'DM Sans', sans-serif; }
.hv4 a { text-decoration: none; }
.hv4 button { cursor: pointer; outline: none; }

/* ─── Root ─── */
.hv4 {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
  /* Flat solid red — no heavy gradient */
  background: var(--h-red);
  /* Depth via shadow, not gradient */
  box-shadow:
    0 1px 0  rgba(255,255,255,0.07) inset,
    0 -1px 0 rgba(0,0,0,0.12) inset,
    0 4px 16px rgba(120,0,0,0.22),
    0 1px 4px  rgba(0,0,0,0.1);
  transition: transform 0.34s var(--h-ease), box-shadow 0.3s;
  will-change: transform;
}
/* subtle warm top-edge highlight — not a gradient band */
.hv4::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: rgba(255,255,255,0.12);
  pointer-events: none; z-index: 1;
}
.hv4.is-hidden { transform: translateY(-100%); }
.hv4.is-scrolled {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.07) inset,
    0 8px 28px rgba(100,0,0,0.3),
    0 2px 6px rgba(0,0,0,0.14);
}

/* ─── Top bar ─── */
.hv4-top-inner {
  display: flex; align-items: center; gap: 20px;
  max-width: 1280px; margin: 0 auto;
  padding: 0 32px; height: var(--h-top-h);
  transition: height 0.28s var(--h-ease);
}
.hv4.is-shrunk .hv4-top-inner { height: var(--h-top-h-sm); }

/* ─── Logo ─── */
.hv4-logo {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; transition: opacity 0.18s;
}
.hv4-logo:hover { opacity: 0.82; }
.hv4-logo-box {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 2px 6px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: width 0.28s var(--h-ease), height 0.28s var(--h-ease);
  overflow: hidden;
}
.hv4.is-shrunk .hv4-logo-box { width: 30px; height: 30px; }
.hv4-logo-box img { width: 22px; height: 22px; object-fit: contain; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
.hv4.is-shrunk .hv4-logo-box img { width: 18px; height: 18px; }
.hv4-logo-text { display: flex; flex-direction: column; gap: 1px; }
.hv4-brand {
  font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 900;
  color: #fff; letter-spacing: 0.02em; line-height: 1;
  display: flex; align-items: baseline; gap: 0;
  transition: font-size 0.28s var(--h-ease);
}
.hv4.is-shrunk .hv4-brand { font-size: 15px; }
.hv4-brand-jr { color: var(--h-gold); }
.hv4-brand-sub {
  font-size: 9.5px; font-weight: 500;
  color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-transform: uppercase;
  transition: opacity 0.22s, max-height 0.22s;
  max-height: 20px; overflow: hidden;
}
.hv4.is-shrunk .hv4-brand-sub { opacity: 0; max-height: 0; }

/* ─── Search ─── */
.hv4-search {
  flex: 1; min-width: 0; max-width: 460px;
  display: flex; align-items: center; height: 40px; gap: 8px;
  background: rgba(0,0,0,0.15);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 0 6px 0 14px;
  transition: background 0.2s, border-color 0.22s, box-shadow 0.22s;
}
.hv4-search:hover {
  background: rgba(0,0,0,0.2);
  border-color: rgba(255,255,255,0.18);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.hv4-search:focus-within {
  background: rgba(0,0,0,0.26);
  border-color: rgba(255,255,255,0.32);
  box-shadow: 0 0 0 3px var(--h-gold-soft), 0 2px 10px rgba(0,0,0,0.14);
}
.hv4-s-ico {
  color: rgba(255,255,255,0.45); flex-shrink: 0;
  transition: color 0.2s, transform 0.2s;
}
.hv4-search:focus-within .hv4-s-ico { color: rgba(255,255,255,0.85); transform: scale(1.05); }
.hv4-search:hover:not(:focus-within) .hv4-s-ico { color: rgba(255,255,255,0.62); }
.hv4-s-input {
  flex: 1; min-width: 0; background: none; border: none; outline: none;
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 400;
  color: #fff;
}
.hv4-s-input::placeholder { color: rgba(255,255,255,0.4); transition: color 0.2s; }
.hv4-search:focus-within .hv4-s-input::placeholder { color: rgba(255,255,255,0.32); }
.hv4-s-clear {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: rgba(255,255,255,0.12); border: none;
  color: rgba(255,255,255,0.75);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, transform 0.15s;
}
.hv4-s-clear:hover { background: rgba(255,255,255,0.22); transform: scale(1.1) rotate(90deg); }
.hv4-s-btn {
  height: 30px; padding: 0 14px; border-radius: 7px; flex-shrink: 0;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.12);
  color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 12.5px; font-weight: 600;
  display: flex; align-items: center; gap: 5px; white-space: nowrap;
  transition: background 0.15s, transform 0.12s;
}
.hv4-s-btn:hover { background: rgba(255,255,255,0.23); }
.hv4-s-btn:active { transform: scale(0.96); }

/* ─── Actions ─── */
.hv4-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-left: auto; }

/* ─── Cart button ─── */
.hv4-cart {
  position: relative; display: flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 14px; border-radius: 10px; flex-shrink: 0;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 13px; font-weight: 500;
  transition: background 0.18s, border-color 0.18s, transform 0.18s, color 0.18s;
}
.hv4-cart:hover {
  background: rgba(255,255,255,0.17); border-color: rgba(255,255,255,0.2);
  color: #fff; transform: translateY(-1px);
}
.hv4-cart:active { transform: scale(0.97); }
.hv4-cart-badge {
  position: absolute; top: -6px; right: -6px;
  min-width: 18px; height: 18px; border-radius: 9px;
  background: var(--h-gold); color: #5c2400;
  font-family: 'DM Sans', sans-serif;
  font-size: 9.5px; font-weight: 800; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px; border: 2px solid var(--h-red);
  animation: badgePop 0.32s var(--h-ease-back);
}
@keyframes badgePop {
  0%   { transform: scale(0) rotate(-20deg); }
  65%  { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}

/* ─── Login button ─── */
.hv4-login {
  display: flex; align-items: center; gap: 7px;
  height: 38px; padding: 0 18px; border-radius: 10px; flex-shrink: 0;
  color: var(--h-red-deep); background: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12), inset 0 -1px 0 rgba(0,0,0,0.05);
  transition: transform 0.18s var(--h-ease), box-shadow 0.18s, color 0.18s;
}
.hv4-login:hover {
  color: var(--h-red-mid); transform: translateY(-1px);
  box-shadow: 0 5px 18px rgba(0,0,0,0.16);
}
.hv4-login:active { transform: scale(0.97); }

/* ─── User button ─── */
.hv4-user-wrap { position: relative; }
.hv4-user-btn {
  display: flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 10px 0 5px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.09);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  transition: background 0.18s, border-color 0.18s;
}
.hv4-user-btn:hover, .hv4-user-btn.open {
  background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.2);
}

/* Avatar — gradient + shimmer, not just a letter */
.hv4-ava {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  background: linear-gradient(135deg, #fde68a 0%, var(--h-gold) 100%);
  color: #7c2c00; font-weight: 900; font-size: 12px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}
.hv4-ava::after {
  content: '';
  position: absolute; top: 0; left: -120%; width: 55%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  transform: skewX(-15deg);
  animation: avaShine 5s ease-in-out infinite;
}
@keyframes avaShine {
  0%, 70%, 100% { left: -120%; }
  45%            { left: 150%;  }
}
.hv4-u-name { font-size: 12px; font-weight: 600; color: #fff; line-height: 1.25; }
.hv4-u-role { font-size: 10px; color: rgba(255,255,255,0.45); }
.hv4-caret {
  color: rgba(255,255,255,0.48); flex-shrink: 0;
  transition: transform 0.22s var(--h-ease), color 0.18s;
}
.hv4-caret.open { transform: rotate(180deg); color: rgba(255,255,255,0.78); }

/* ─── Dropdown ─── */
.hv4-drop {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 252px; background: #fff; border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(0,0,0,0.07);
  box-shadow:
    0 2px 6px rgba(0,0,0,0.04),
    0 12px 40px rgba(0,0,0,0.1),
    0 0 0 1px rgba(0,0,0,0.03);
  animation: dropIn 0.22s var(--h-ease);
  transform-origin: top right; z-index: 1000;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.96); }
  to   { opacity: 1; transform: none; }
}
.hv4-drop-head {
  display: flex; align-items: center; gap: 11px;
  padding: 13px 14px; border-bottom: 1px solid #f0f0f0;
  background: #f9f9f9;
}
.hv4-drop-ava {
  width: 38px; height: 38px; border-radius: 9px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--h-red-mid), #d80020);
  color: #fff; font-weight: 800; font-size: 15px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(168,0,26,0.25);
}
.hv4-drop-uname { font-size: 13px; font-weight: 700; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hv4-drop-email { font-size: 11px; color: #aaa; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hv4-drop-tag {
  display: inline-flex; align-items: center; gap: 3px;
  margin-top: 4px; padding: 2px 8px; border-radius: 5px;
  background: rgba(192,0,24,0.08); color: var(--h-red); font-size: 10px; font-weight: 700;
}
.hv4-drop-list { padding: 6px; }
.hv4-drop-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 11px; border-radius: 8px;
  font-size: 13px; color: #3a3a3a; font-weight: 500;
  transition: background 0.14s, color 0.14s, transform 0.14s;
}
.hv4-drop-item:hover { background: #fff2f3; color: var(--h-red); transform: translateX(3px); }
.hv4-drop-item.active { background: #fff2f3; color: var(--h-red); font-weight: 600; }
.hv4-drop-item--admin { color: #5b21b6; }
.hv4-drop-item--admin:hover { background: #f5f3ff; color: #5b21b6; }
.hv4-drop-ico { flex-shrink: 0; opacity: 0.6; transition: opacity 0.14s; }
.hv4-drop-item:hover .hv4-drop-ico { opacity: 1; }
.hv4-drop-chev {
  margin-left: auto; color: #d1d1d1; flex-shrink: 0;
  transition: transform 0.14s, color 0.14s;
}
.hv4-drop-item:hover .hv4-drop-chev { transform: translateX(2px); color: var(--h-red); }
.hv4-drop-item--admin:hover .hv4-drop-chev { color: #5b21b6; }
.hv4-drop-sep { height: 1px; background: #f0f0f0; margin: 3px 8px; }
.hv4-drop-foot { padding: 6px; border-top: 1px solid #f0f0f0; }
.hv4-drop-logout {
  display: flex; align-items: center; gap: 9px; width: 100%;
  padding: 9px 11px; border-radius: 8px;
  background: none; border: 1px solid #fde0e4;
  color: var(--h-red); font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600;
  transition: background 0.14s, border-color 0.14s;
}
.hv4-drop-logout:hover { background: #fff2f3; border-color: #f9a8b4; }

/* ─── Navbar ─── */
.hv4-nav {
  position: relative; z-index: 1;
  background: rgba(0,0,0,0.16);
  border-top: 1px solid rgba(0,0,0,0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
}
.hv4-nav-inner {
  display: flex; align-items: stretch;
  max-width: 1280px; margin: 0 auto;
  padding: 0 20px;             /* slightly less than top for optical alignment */
  overflow-x: auto; scrollbar-width: none;
}
.hv4-nav-inner::-webkit-scrollbar { display: none; }

.hv4-nav-link {
  position: relative; display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.62);
  font-size: 12.5px; font-weight: 500;
  padding: 0 16px;             /* ← more padding = airier spacing */
  height: var(--h-nav-h); white-space: nowrap; flex-shrink: 0;
  transition: color 0.18s;
}
/* animated underline — slides from left */
.hv4-nav-link::after {
  content: ''; position: absolute; bottom: 0;
  left: 16px; right: 16px; height: 2.5px;
  border-radius: 2px 2px 0 0; background: var(--h-gold);
  transform: scaleX(0); transform-origin: left center;
  transition: transform 0.24s var(--h-ease);
}
.hv4-nav-link:hover { color: rgba(255,255,255,0.95); }
.hv4-nav-link:hover::after { transform: scaleX(0.5); background: rgba(255,255,255,0.32); }

/* Active: full pill bg + underline */
.hv4-nav-link.active {
  color: var(--h-gold); font-weight: 600;
}
.hv4-nav-link.active::after { transform: scaleX(1); }

/* Hot: same as active + pulse dot */
.hv4-nav-link.hot { color: var(--h-gold); font-weight: 600; }
.hv4-nav-link.hot::after { transform: scaleX(1); }

.hv4-dot {
  width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
  background: var(--h-gold);
  box-shadow: 0 0 5px rgba(244,196,48,0.9);
  animation: dotPop 1.8s ease-in-out infinite;
}
@keyframes dotPop {
  0%, 100% { opacity: 1; transform: scale(1);    }
  50%       { opacity: 0.4; transform: scale(0.6); }
}

/* ─── Mobile menu ─── */
.hv4-hamburger {
  display: none; flex-direction: column; justify-content: center; gap: 5px;
  width: 36px; height: 36px; padding: 8px; border-radius: 8px;
  background: rgba(255,255,255,0.09); border: 1px solid rgba(255,255,255,0.1);
  transition: background 0.18s;
}
.hv4-hamburger:hover { background: rgba(255,255,255,0.16); }
.hv4-hamburger span {
  display: block; height: 1.5px; border-radius: 2px; background: rgba(255,255,255,0.85);
  transition: transform 0.24s var(--h-ease), opacity 0.18s, width 0.2s;
}
.hv4-hamburger span:nth-child(2) { width: 75%; }
.hv4-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.hv4-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hv4-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* Mobile nav drawer */
.hv4-mobile-nav {
  position: absolute; top: 100%; left: 0; right: 0;
  background: var(--h-red-mid); z-index: 998;
  border-top: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  animation: drawerIn 0.22s var(--h-ease);
  overflow: hidden;
}
@keyframes drawerIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: none; }
}
.hv4-mobile-nav a {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 24px; color: rgba(255,255,255,0.82);
  font-size: 14px; font-weight: 500;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: background 0.14s, color 0.14s;
}
.hv4-mobile-nav a:hover { background: rgba(0,0,0,0.12); color: #fff; }
.hv4-mobile-nav a.active { color: var(--h-gold); font-weight: 600; }
.hv4-mobile-s-row {
  display: flex; align-items: center; gap: 0;
  padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.hv4-mobile-s-row form {
  flex: 1; display: flex; align-items: center; height: 38px;
  background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px; padding: 0 6px 0 12px; gap: 8px;
}
.hv4-mobile-s-row input {
  flex: 1; background: none; border: none; outline: none;
  color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif;
}
.hv4-mobile-s-row input::placeholder { color: rgba(255,255,255,0.38); }
.hv4-mobile-s-btn {
  height: 30px; padding: 0 13px; border-radius: 7px;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.12);
  color: #fff; font-size: 12.5px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}
.hv4-mobile-s-btn:hover { background: rgba(255,255,255,0.22); }

/* ─── Responsive ─── */
@media (max-width: 1024px) {
  .hv4-top-inner { padding: 0 24px; gap: 16px; }
  .hv4-nav-inner { padding: 0 12px; }
  .hv4-search    { max-width: 380px; }
}
@media (max-width: 768px) {
  .hv4-top-inner { padding: 0 16px; gap: 12px; }
  .hv4-nav       { display: none; }
  .hv4-hamburger { display: flex; }
  .hv4-search    { display: none; }  /* mobile search is in drawer */
  .hv4-cart-lbl  { display: none; }
  .hv4-cart      { padding: 0 11px; }
  .hv4-u-meta    { display: none; }
  .hv4-user-btn  { padding: 0 8px 0 5px; }
  .hv4-login .login-txt { display: none; }
  .hv4-login     { padding: 0 13px; }
}
@media (max-width: 480px) {
  .hv4-top-inner { padding: 0 12px; gap: 8px; }
  .hv4-logo-box  { width: 32px; height: 32px; }
  .hv4-logo-box img { width: 20px; height: 20px; }
  .hv4-brand     { font-size: 15.5px; }
  .hv4-drop      { width: 240px; right: -2px; }
  .hv4-actions   { gap: 6px; }
}
`;

/* ─── Icon library (Feather-style, stroke 1.8) ─── */
const Ico = {
  Search:    (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:         (p={}) => <svg {...p} width="8"  height="8"  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Cart:      (p={}) => <svg {...p} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>,
  Login:     (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  ChevD:     (p={}) => <svg {...p} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevR:     (p={}) => <svg {...p} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Logout:    (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Orders:    (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Heart:     (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  User:      (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Shield:    (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Lock:      (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Devices:   (p={}) => <svg {...p} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="14" height="10" rx="1"/><path d="M8 21h8M12 17v4M16 8h4a1 1 0 011 1v10a1 1 0 01-1 1h-4a1 1 0 01-1-1V9a1 1 0 011-1z"/></svg>,
  Star:      (p={}) => <svg {...p} width="9"  height="9"  viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.22 6.52L22 8.69l-5 4.87 1.18 6.88L12 17.27l-6.18 3.17L7 13.56 2 8.69l6.78-.98L12 1z"/></svg>,
  Menu:      (p={}) => null, /* handled inline */
};

const NAV_LINKS = [
  { label: 'Flash Sale',     to: '/hotsale',     hot: true },
  { label: 'Điện thoại',    to: '/phones'                 },
  { label: 'Laptop',         to: '/laptoppace'             },
  { label: 'Máy tính bảng', to: '/tablets'                },
  { label: 'Phụ kiện',      to: '/accessories'            },
  { label: 'Apple',          to: '/Apple'                 },
  { label: 'Samsung',        to: '/Samsung'               },
  { label: 'Xiaomi',         to: '/Xiaomi'                },
  { label: 'Trả góp 0%',    to: '/installment'           },
  { label: 'Tin tức',       to: '/news'                   },
];

const DROP_ITEMS = [
  { to: '/my-orders',       label: 'Đơn hàng của tôi',  Icon: Ico.Orders  },
  { to: '/wishlist',        label: 'Yêu thích',          Icon: Ico.Heart   },
  { to: '/profile',         label: 'Tài khoản',          Icon: Ico.User    },
  { to: '/sessions',        label: 'Quản lý thiết bị',  Icon: Ico.Devices },
  { to: '/change-password', label: 'Đổi mật khẩu',      Icon: Ico.Lock    },
];

export default function Header() {
  const [visible,     setVisible]     = useState(true);
  const [shrunk,      setShrunk]      = useState(false);
  const [cartCount,   setCartCount]   = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileQ,     setMobileQ]     = useState('');
  const [user,        setUser]        = useState(null);
  const [dropOpen,    setDropOpen]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  const prevY   = useRef(0);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* scroll */
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setVisible(y < prevY.current || y < 60);
      setShrunk(y > 90);
      prevY.current = y;
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* sync user */
  useEffect(() => {
    const sync = () => {
      const s = localStorage.getItem('user');
      setUser(s ? JSON.parse(s) : null);
    };
    sync();
    const evs = ['storage', 'userUpdated', 'auth-changed'];
    evs.forEach(e => window.addEventListener(e, sync));
    return () => evs.forEach(e => window.removeEventListener(e, sync));
  }, []);

  /* sync cart */
  useEffect(() => {
    const sync = () => {
      const u   = JSON.parse(localStorage.getItem('user') || '{}');
      const key = u?.id ? `cart_${u.id}` : 'cart_guest';
      const c   = JSON.parse(localStorage.getItem(key) || '[]');
      setCartCount(c.reduce((a, i) => a + i.quantity, 0));
    };
    sync();
    const evs = ['storage', 'cartUpdated', 'auth-changed'];
    evs.forEach(e => window.addEventListener(e, sync));
    return () => evs.forEach(e => window.removeEventListener(e, sync));
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* close everything on route change */
  useEffect(() => { setDropOpen(false); setMenuOpen(false); }, [location.pathname]);

  const handleSearch = useCallback(e => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [searchQuery, navigate]);

  const handleMobileSearch = useCallback(e => {
    e.preventDefault();
    const q = mobileQ.trim();
    if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); setMenuOpen(false); }
  }, [mobileQ, navigate]);

  const handleLogout = () => {
    ['token', 'role', 'user'].forEach(k => localStorage.removeItem(k));
    setUser(null); setCartCount(0); setDropOpen(false);
    window.dispatchEvent(new Event('auth-changed'));
    navigate('/');
  };

  const isActive = to => location.pathname === to;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <header className={`hv4 ${!visible ? 'is-hidden' : ''} ${shrunk ? 'is-shrunk is-scrolled' : ''}`}>

        {/* ════ TOP BAR ════ */}
        <div className="hv4-top-inner">

          {/* Logo */}
          <Link to="/" className="hv4-logo">
            <div className="hv4-logo-box">
              <img src={logo} alt="LongtyJR" />
            </div>
            <div className="hv4-logo-text">
              <div className="hv4-brand">LONGTY<span className="hv4-brand-jr">JR</span></div>
              <div className="hv4-brand-sub">Phone · Laptop · Phụ kiện</div>
            </div>
          </Link>

          {/* Search (desktop) */}
          <form className="hv4-search" onSubmit={handleSearch}>
            <span className="hv4-s-ico"><Ico.Search /></span>
            <input
              className="hv4-s-input"
              type="text"
              placeholder="Tìm iPhone, Samsung, Laptop..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="hv4-s-clear" onClick={() => setSearchQuery('')}>
                <Ico.X />
              </button>
            )}
            <button type="submit" className="hv4-s-btn">
              <span className="hv4-s-btn-txt">Tìm kiếm</span>
              <Ico.Search />
            </button>
          </form>

          {/* Actions */}
          <div className="hv4-actions">

            {/* Cart */}
            <Link to="/Cart" className="hv4-cart">
              <Ico.Cart />
              <span className="hv4-cart-lbl">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="hv4-cart-badge" key={cartCount}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User / Login */}
            {user ? (
              <div className="hv4-user-wrap" ref={dropRef}>
                <button
                  className={`hv4-user-btn ${dropOpen ? 'open' : ''}`}
                  onClick={() => setDropOpen(v => !v)}>
                  <div className="hv4-ava">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hv4-u-meta">
                    <div className="hv4-u-name">{user.name?.split(' ').slice(-1)[0]}</div>
                    <div className="hv4-u-role">{user.role === 'admin' ? 'Admin' : 'Member'}</div>
                  </div>
                  <span className={`hv4-caret ${dropOpen ? 'open' : ''}`}><Ico.ChevD /></span>
                </button>

                {dropOpen && (
                  <div className="hv4-drop">
                    <div className="hv4-drop-head">
                      <div className="hv4-drop-ava">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="hv4-drop-uname">{user.name}</div>
                        <div className="hv4-drop-email">{user.email}</div>
                        {user.role === 'admin' && (
                          <div className="hv4-drop-tag"><Ico.Star /> Admin</div>
                        )}
                      </div>
                    </div>

                    <div className="hv4-drop-list">
                      {DROP_ITEMS.map(({ to, label, Icon: I }) => (
                        <Link key={to} to={to}
                          className={`hv4-drop-item ${isActive(to) ? 'active' : ''}`}
                          onClick={() => setDropOpen(false)}>
                          <span className="hv4-drop-ico"><I /></span>
                          <span>{label}</span>
                          <span className="hv4-drop-chev"><Ico.ChevR /></span>
                        </Link>
                      ))}
                      {user.role === 'admin' && (
                        <>
                          <div className="hv4-drop-sep" />
                          <Link to="/admin" className="hv4-drop-item hv4-drop-item--admin" onClick={() => setDropOpen(false)}>
                            <span className="hv4-drop-ico"><Ico.Shield /></span>
                            <span>Trang Admin</span>
                            <span className="hv4-drop-chev"><Ico.ChevR /></span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="hv4-drop-foot">
                      <button className="hv4-drop-logout" onClick={handleLogout}>
                        <Ico.Logout /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/Login" className="hv4-login">
                <Ico.Login />
                <span className="login-txt">Đăng nhập</span>
              </Link>
            )}

            {/* Hamburger (mobile only) */}
            <button
              className={`hv4-hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ════ DESKTOP NAV ════ */}
        <nav className="hv4-nav">
          <div className="hv4-nav-inner">
            {NAV_LINKS.map(({ label, to, hot }) => (
              <Link key={to} to={to}
                className={`hv4-nav-link ${hot ? 'hot' : ''} ${isActive(to) ? 'active' : ''}`}>
                {hot && <span className="hv4-dot" />}
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* ════ MOBILE DRAWER ════ */}
        {menuOpen && (
          <div className="hv4-mobile-nav">
            {/* search inside drawer */}
            <div className="hv4-mobile-s-row">
              <form style={{ flex: 1, display: 'flex', alignItems: 'center', height: 38, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '0 6px 0 12px', gap: 8 }}
                onSubmit={handleMobileSearch}>
                <Ico.Search style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                <input
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'DM Sans,sans-serif' }}
                  placeholder="Tìm kiếm..."
                  value={mobileQ}
                  onChange={e => setMobileQ(e.target.value)}
                />
                <button type="submit" style={{ height: 28, padding: '0 12px', borderRadius: 7, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: 12.5, fontWeight: 600, fontFamily: 'DM Sans,sans-serif', cursor: 'pointer' }}>
                  Tìm
                </button>
              </form>
            </div>
            {NAV_LINKS.map(({ label, to, hot }) => (
              <Link key={to} to={to}
                className={isActive(to) ? 'active' : ''}
                onClick={() => setMenuOpen(false)}>
                {hot && <span className="hv4-dot" style={{ marginRight: 2 }} />}
                {label}
              </Link>
            ))}
          </div>
        )}

      </header>
    </>
  );
}
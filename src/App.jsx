import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Header from "./components/Header/Header";
// import Navbar from "./components/Navbar/Navbar";

import Homes from "./page/Homes";
import Phones from "./page/Phones";
import LaptopPace from "./page/LaptopPace";

import Apple   from "./page/phonesBrands/Apple";
import Oppo    from "./page/phonesBrands/Oppo";
import Samsung from "./page/phonesBrands/Samsung";
import Xiaomi  from "./page/phonesBrands/Xiaomi";
import Realme  from "./page/phonesBrands/Realme";
import Sony    from "./page/phonesBrands/Sony";
import OnePlus from "./page/phonesBrands/OnePlus";

import Product  from "./components/Product/Product";
import Cart     from "./components/Cart/Cart";
import Checkout from "./components/Cart/Checkout";

import Login          from "./components/Login&SignUp/Login";
import Register       from "./components/Login&SignUp/Register";
import VerifyEmail    from "./components/Login&SignUp/VerifyEmail";
import ForgotPassword from "./components/Login&SignUp/ForgotPassword";
import ResetPassword  from "./components/Login&SignUp/ResetPassword";
import ChangePassword from "./components/Login&SignUp/ChangePassword";
import Sessions from "./pages/Sessions";

import MyOrders from "./pages/MyOrders";
import Wishlist from "./pages/Wishlist";

/* ===== ADMIN ===== */
import AdminRoute    from "./routes/AdminRoute";
import AdminLayout   from "./pages/admin/AdminLayout";
import Dashboard     from "./pages/admin/Dashboard";
import UserManage    from "./pages/admin/UserManage";
import OrderManage   from "./pages/admin/OrderManage";
import ReviewManage  from "./pages/admin/ReviewManage";
import ProductManage from "./pages/admin/ProductManage";

import SearchResults from "./pages/SearchResults";
import NotFound      from "./pages/NotFound";

import Footer_Top    from "./components/Footer/Footer_Top";
import Footer_Bottom from "./components/Footer/Footer_Bottom";

/* ─────────────────────────────────────────────
   ShopWrapper: chỉ render Header + Footer
   khi KHÔNG ở trang /admin/* và KHÔNG ở các trang auth full-screen.
───────────────────────────────────────────── */
function ShopWrapper({ children }) {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  // Auth pages — full-screen layout, không cần Header/Footer
  const isLoginPage    = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  /*
   * Ẩn Header/Footer ở các trang verify email vì:
   *   - Đây là single-purpose pages (1 mục đích duy nhất)
   *   - Hiển thị Header/Footer trên trang này gây nhiễu UX
   *   - User chỉ cần thấy: status + nút action chính
   */
  const isVerifyPage = pathname.startsWith("/verify-email");

  /*
   * Forgot/Reset/Change password dùng full-screen layout giống Login/Register
   * (component tự render fixed inset-0 z-[9999] + body.lx-page-active
   * để ẩn header/footer). Tuy nhiên vẫn set hideShopChrome = true
   * như defense-in-depth phòng trường hợp CSS class không apply kịp.
   */
  const isForgotPwPage = pathname === "/forgot-password";
  const isResetPwPage  = pathname === "/reset-password";
  const isChangePwPage = pathname === "/change-password";

  const hideShopChrome =
    isAdmin          ||
    isLoginPage      ||
    isRegisterPage   ||
    isVerifyPage     ||
    isForgotPwPage   ||
    isResetPwPage    ||
    isChangePwPage;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!hideShopChrome && <Header />}

      {children}

      {!hideShopChrome && <Footer_Top />}
      {!hideShopChrome && <Footer_Bottom />}
    </>
  );
}

/* ─────────────────────────────────────────────
   App
───────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <ShopWrapper>
        <Routes>
          {/* ── Shop routes ── */}
          <Route path="/"            element={<Homes />} />
          <Route path="/phones"      element={<Phones />} />
          <Route path="/laptoppace"  element={<LaptopPace />} />

          <Route path="/apple"   element={<Apple />} />
          <Route path="/oppo"    element={<Oppo />} />
          <Route path="/samsung" element={<Samsung />} />
          <Route path="/xiaomi"  element={<Xiaomi />} />
          <Route path="/realme"  element={<Realme />} />
          <Route path="/sony"    element={<Sony />} />
          <Route path="/oneplus" element={<OnePlus />} />

          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart"        element={<Cart />} />
          <Route path="/checkout"    element={<Checkout />} />

          {/* ── Auth routes ── */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Email verification routes ── */}
          {/*
            Cả 3 paths cùng dùng <VerifyEmail /> component.
            BE redirect về /verify-email-success hoặc /verify-email-error.
          */}
          <Route path="/verify-email"         element={<VerifyEmail />} />
          <Route path="/verify-email-success" element={<VerifyEmail />} />
          <Route path="/verify-email-error"   element={<VerifyEmail />} />

          {/* ── Forgot/Reset password routes (Phần 3) ── */}
          {/*
            Flow:
              1. User click "Quên mật khẩu?" ở Login → /forgot-password
              2. Nhập email → BE gửi link {FE}/reset-password?token=xxx
              3. User click link trong email → /reset-password?token=xxx
              4. Nhập password mới → BE verify token → success
              5. Redirect về /login (auto sau 3s)
          */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── Change password route (Phần 4) ── */}
          {/*
            Flow:
              1. User đã login → click link "Đổi mật khẩu" ở Profile/Header
              2. Nhập currentPassword + newPassword + confirmPassword
              3. BE verify → cấp tokens MỚI (Option C)
              4. FE update localStorage với tokens mới
              5. Success countdown 3s → về trang chủ (KHÔNG bị logout)
          */}
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/sessions" element={<Sessions />} />

          {/* ── User routes ── */}
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/wishlist"  element={<Wishlist />} />
          <Route path="/search"    element={<SearchResults />} />

          {/* ── Admin routes ── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index           element={<Dashboard />} />
              <Route path="users"    element={<UserManage />} />
              <Route path="products" element={<ProductManage />} />
              <Route path="orders"   element={<OrderManage />} />
              <Route path="reviews"  element={<ReviewManage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ShopWrapper>
    </Router>
  );
}

export default App;
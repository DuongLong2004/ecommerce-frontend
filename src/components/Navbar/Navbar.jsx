import { Link } from "react-router-dom";
import './Navbar.css';

function Navbar() {
  return (
    <div className="nav Reponsive_mobile">
      <nav>
        <ul>
          <li>
            <Link to="/" style={{ color: "red" }}>
              Trang chủ
            </Link>
          </li>
          <li>
            <Link to="/gioithieu">Giới thiệu</Link>
          </li>
          <li>
            <Link to="/sanpham">Sản phẩm</Link>
          </li>
          <li>
            <Link to="/dealhot">Deal hot</Link>
          </li>
          <li className="a--Lh">
            <Link to="/lienhe">Liên hệ</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;

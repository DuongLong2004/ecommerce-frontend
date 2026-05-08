import React from "react";
import BrandApple from "../../components/brands/phones/BrandApple.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Apple = () => {
  return (
    <div>
      <style>{`
        .apple-layout {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          max-width: 1280px;
          margin: 24px auto;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .apple-sidebar {
          width: 264px;
          min-width: 264px;
          max-width: 264px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          box-sizing: border-box;
        }
        .apple-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .apple-layout  { flex-direction: column; gap: 14px; }
          .apple-sidebar { width: 100% !important; min-width: 100% !important; max-width: 100% !important; position: static; }
        }
      `}</style>

      <div className="apple-layout">
        <aside className="apple-sidebar">
          <BrandPhoneFilter brand="iPhone" />
        </aside>
        <main className="apple-content">
          <BrandApple />
        </main>
      </div>
    </div>
  );
};

export default Apple;
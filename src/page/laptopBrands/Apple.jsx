import React from "react";
import BrandLaptopApple from "../../components/brands/laptops/BrandLaptopApple.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Apple = () => {
  return (
    <div>
      <style>{`
        .lapple-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lapple-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lapple-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lapple-layout { flex-direction:column; gap:14px; }
          .lapple-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lapple-layout">
        <aside className="lapple-sidebar"><BrandLaptopFilter brand="Apple" /></aside>
        <main className="lapple-content"><BrandLaptopApple /></main>
      </div>
    </div>
  );
};

export default Apple;

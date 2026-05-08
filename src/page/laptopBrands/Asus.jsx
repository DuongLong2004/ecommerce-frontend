import React from "react";
import BrandLaptopAsus from "../../components/brands/laptops/BrandLaptopAsus.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Asus = () => {
  return (
    <div>
      <style>{`
        .lasus-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lasus-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lasus-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lasus-layout { flex-direction:column; gap:14px; }
          .lasus-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lasus-layout">
        <aside className="lasus-sidebar"><BrandLaptopFilter brand="Asus" /></aside>
        <main className="lasus-content"><BrandLaptopAsus /></main>
      </div>
    </div>
  );
};

export default Asus;

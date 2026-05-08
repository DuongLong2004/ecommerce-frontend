import React from "react";
import BrandLaptopSamsung from "../../components/brands/laptops/BrandLaptopSamsung.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Samsung = () => {
  return (
    <div>
      <style>{`
        .lsamsung-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lsamsung-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lsamsung-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lsamsung-layout { flex-direction:column; gap:14px; }
          .lsamsung-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lsamsung-layout">
        <aside className="lsamsung-sidebar"><BrandLaptopFilter brand="Samsung" /></aside>
        <main className="lsamsung-content"><BrandLaptopSamsung /></main>
      </div>
    </div>
  );
};

export default Samsung;

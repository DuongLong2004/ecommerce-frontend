import React from "react";
import BrandLaptopHP from "../../components/brands/laptops/BrandLaptopHP.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const HP = () => {
  return (
    <div>
      <style>{`
        .lhp-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lhp-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lhp-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lhp-layout { flex-direction:column; gap:14px; }
          .lhp-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lhp-layout">
        <aside className="lhp-sidebar"><BrandLaptopFilter brand="HP" /></aside>
        <main className="lhp-content"><BrandLaptopHP /></main>
      </div>
    </div>
  );
};

export default HP;

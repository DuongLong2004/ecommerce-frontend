import React from "react";
import BrandLaptopAcer from "../../components/brands/laptops/BrandLaptopAcer.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Acer = () => {
  return (
    <div>
      <style>{`
        .lacer-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lacer-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lacer-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lacer-layout { flex-direction:column; gap:14px; }
          .lacer-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lacer-layout">
        <aside className="lacer-sidebar"><BrandLaptopFilter brand="Acer" /></aside>
        <main className="lacer-content"><BrandLaptopAcer /></main>
      </div>
    </div>
  );
};

export default Acer;

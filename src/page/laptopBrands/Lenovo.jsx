import React from "react";
import BrandLaptopLenovo from "../../components/brands/laptops/BrandLaptopLenovo.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Lenovo = () => {
  return (
    <div>
      <style>{`
        .llenovo-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .llenovo-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .llenovo-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .llenovo-layout { flex-direction:column; gap:14px; }
          .llenovo-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="llenovo-layout">
        <aside className="llenovo-sidebar"><BrandLaptopFilter brand="Lenovo" /></aside>
        <main className="llenovo-content"><BrandLaptopLenovo /></main>
      </div>
    </div>
  );
};

export default Lenovo;

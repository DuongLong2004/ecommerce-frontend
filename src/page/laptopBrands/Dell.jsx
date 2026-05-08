import React from "react";
import BrandLaptopDell from "../../components/brands/laptops/BrandLaptopDell.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const Dell = () => {
  return (
    <div>
      <style>{`
        .ldell-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .ldell-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .ldell-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .ldell-layout { flex-direction:column; gap:14px; }
          .ldell-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="ldell-layout">
        <aside className="ldell-sidebar"><BrandLaptopFilter brand="Dell" /></aside>
        <main className="ldell-content"><BrandLaptopDell /></main>
      </div>
    </div>
  );
};

export default Dell;

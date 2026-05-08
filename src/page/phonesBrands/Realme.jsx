import React from "react";
import BrandRealme from "../../components/brands/phones/BrandRealme.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Realme = () => {
  return (
    <div>
      <style>{`
        .realme-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .realme-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .realme-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .realme-layout  { flex-direction:column; gap:14px; }
          .realme-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="realme-layout">
        <aside className="realme-sidebar"><BrandPhoneFilter brand="Realme" /></aside>
        <main className="realme-content"><BrandRealme /></main>
      </div>
    </div>
  );
};
export default Realme;
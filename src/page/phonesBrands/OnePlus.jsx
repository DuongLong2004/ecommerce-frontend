import React from "react";
import BrandOnePlus from "../../components/brands/phones/BrandOnePlus.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const OnePlus = () => {
  return (
    <div>
      <style>{`
        .oneplus-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .oneplus-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .oneplus-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .oneplus-layout  { flex-direction:column; gap:14px; }
          .oneplus-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="oneplus-layout">
        <aside className="oneplus-sidebar"><BrandPhoneFilter brand="OnePlus" /></aside>
        <main className="oneplus-content"><BrandOnePlus /></main>
      </div>
    </div>
  );
};
export default OnePlus;
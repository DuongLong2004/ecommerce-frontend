import React from "react";
import BrandSamsung from "../../components/brands/phones/BrandSamsung.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Samsung = () => {
  return (
    <div>
      <style>{`
        .samsung-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .samsung-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .samsung-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .samsung-layout  { flex-direction:column; gap:14px; }
          .samsung-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="samsung-layout">
        <aside className="samsung-sidebar"><BrandPhoneFilter brand="Samsung" /></aside>
        <main className="samsung-content"><BrandSamsung /></main>
      </div>
    </div>
  );
};
export default Samsung;
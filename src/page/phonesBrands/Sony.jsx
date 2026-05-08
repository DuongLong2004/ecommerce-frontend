import React from "react";
import BrandSony from "../../components/brands/phones/BrandSony.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Sony = () => {
  return (
    <div>
      <style>{`
        .sony-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .sony-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .sony-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .sony-layout  { flex-direction:column; gap:14px; }
          .sony-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="sony-layout">
        <aside className="sony-sidebar"><BrandPhoneFilter brand="Sony" /></aside>
        <main className="sony-content"><BrandSony /></main>
      </div>
    </div>
  );
};
export default Sony;
import React from "react";
import BrandOppo from "../../components/brands/phones/BrandOppo.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Oppo = () => {
  return (
    <div>
      <style>{`
        .oppo-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .oppo-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .oppo-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .oppo-layout  { flex-direction:column; gap:14px; }
          .oppo-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="oppo-layout">
        <aside className="oppo-sidebar"><BrandPhoneFilter brand="OPPO" /></aside>
        <main className="oppo-content"><BrandOppo /></main>
      </div>
    </div>
  );
};
export default Oppo;
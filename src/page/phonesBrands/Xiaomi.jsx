import React from "react";
import BrandXiaomi from "../../components/brands/phones/BrandXiaomi.jsx";
import BrandPhoneFilter from "../../components/brands/filter/BrandPhoneFilter.jsx";

const Xiaomi = () => {
  return (
    <div>
      <style>{`
        .xiaomi-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .xiaomi-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .xiaomi-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .xiaomi-layout  { flex-direction:column; gap:14px; }
          .xiaomi-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="xiaomi-layout">
        <aside className="xiaomi-sidebar"><BrandPhoneFilter brand="Xiaomi" /></aside>
        <main className="xiaomi-content"><BrandXiaomi /></main>
      </div>
    </div>
  );
};
export default Xiaomi;
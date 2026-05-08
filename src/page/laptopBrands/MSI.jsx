import React from "react";
import BrandLaptopMSI from "../../components/brands/laptops/BrandLaptopMSI.jsx";
import BrandLaptopFilter from "../../components/brands/filter/BrandLaptopFilter.jsx";

const MSI = () => {
  return (
    <div>
      <style>{`
        .lmsi-layout { display:flex; align-items:flex-start; gap:20px; max-width:1280px; margin:24px auto; padding:0 16px; box-sizing:border-box; }
        .lmsi-sidebar { width:264px; min-width:264px; max-width:264px; flex-shrink:0; position:sticky; top:80px; box-sizing:border-box; }
        .lmsi-content { flex:1; min-width:0; overflow:hidden; }
        @media (max-width:900px) {
          .lmsi-layout { flex-direction:column; gap:14px; }
          .lmsi-sidebar { width:100% !important; min-width:100% !important; max-width:100% !important; position:static; }
        }
      `}</style>
      <div className="lmsi-layout">
        <aside className="lmsi-sidebar"><BrandLaptopFilter brand="MSI" /></aside>
        <main className="lmsi-content"><BrandLaptopMSI /></main>
      </div>
    </div>
  );
};

export default MSI;

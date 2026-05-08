import Banner_Homes from "../components/Banner/Banner_Homes";
// import BrandLaptopPage from "../components/brands/laptops/BrandLaptopPage";
import BrandLaptopPage from "../components/brands/laptops/BrandLaptopPage";
import LaptopFilter from "../components/brands/filter/LaptopFilter";

const LaptopPage = () => {
  return (
    <div>
      <Banner_Homes />

      <style>{`
        .lp-layout {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          max-width: 1280px;
          margin: 24px auto;
          padding: 0 16px;
          box-sizing: border-box;
        }
        .lp-sidebar {
          width: 264px;
          min-width: 264px;
          max-width: 264px;
          flex-shrink: 0;
          position: sticky;
          top: 80px;
          box-sizing: border-box;
        }
        .lp-content {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        @media (max-width: 900px) {
          .lp-layout   { flex-direction: column; gap: 14px; }
          .lp-sidebar  { width: 100% !important; min-width: 100% !important; max-width: 100% !important; position: static; }
        }
      `}</style>

      <div className="lp-layout">
        <aside className="lp-sidebar">
          <LaptopFilter />
        </aside>
        <main className="lp-content">
          <BrandLaptopPage />
        </main>
      </div>
    </div>
  );
};

export default LaptopPage;
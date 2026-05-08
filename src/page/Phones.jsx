


import BannerPhones from "../components/Banner/BannerPhones";
import BrandPhonePage from "../components/brands/phones/BrandPhonePage.jsx";
import PhoneFilter from "../components/brands/filter/PhoneFilter";
import Banner_Homes from "../components/Banner/Banner_Homes";

const PhonePage = () => {
  return (
    <div>
      <Banner_Homes />

      <>
        <style>{`
          .phone-page-layout {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            max-width: 1280px;
            margin: 24px auto;
            padding: 0 16px;
          }

          /* sidebar filter cố định width */
          .phone-page-sidebar {
            width: 260px;
            flex-shrink: 0;
            position: sticky;
            top: 80px; /* dính theo scroll, điều chỉnh nếu header cao hơn */
          }

          /* phần sản phẩm chiếm hết còn lại */
          .phone-page-content {
            flex: 1;
            min-width: 0; /* fix overflow trong flex */
          }

          @media (max-width: 900px) {
            .phone-page-layout {
              flex-direction: column;
              gap: 16px;
            }
            .phone-page-sidebar {
              width: 100%;
              position: static;
            }
          }
        `}</style>

        <div className="phone-page-layout">
          {/* SIDEBAR FILTER */}
          <aside className="phone-page-sidebar">
            <PhoneFilter />
          </aside>

          {/* DANH SÁCH SẢN PHẨM */}
          <main className="phone-page-content">
            <BrandPhonePage />
          </main>
        </div>
      </>
    </div>
  );
};

export default PhonePage;

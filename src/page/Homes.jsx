import Banner from "../components/Banner/Banner";
import Category from "../components/Category/Category";
import HotDeal from "../components/ListProduct/HotSale/HotDeal";
import ListProduct from "../components/ListProduct/List_product_Phones";
import List_Product_Sale from "../components/ListProduct/List_Product_Laptops";
import DealsSection from "../components/DealsSection/DealsSection";
import Navbar from "../components/Navbar/Navbar";
// import UserInfo from "../components/Auth/UserInfo";



function Homes() {
  return (
    <>
      {/* <Navbar/> */}
      <Banner />
      
      <Category />
      <HotDeal />
      <ListProduct />
      <List_Product_Sale />
      <DealsSection />
    </>
  );
}

export default Homes;

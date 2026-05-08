

import { useState, useEffect } from "react";
import axiosClient from "../api/axios";

export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState([]);

  const fetchIds = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setWishlistIds([]); return; }
    try {
      const res = await axiosClient.get("/wishlist/ids");
      setWishlistIds(res.data.data || []);
    } catch {
      setWishlistIds([]);
    }
  };

  useEffect(() => {
    fetchIds();

    // ✅ Lắng nghe khi login/logout — refetch lại
    window.addEventListener("auth-changed", fetchIds);
    return () => window.removeEventListener("auth-changed", fetchIds);
  }, []);

  return { wishlistIds, refetch: fetchIds };
};
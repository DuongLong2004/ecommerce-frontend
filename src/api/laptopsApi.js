import axiosClient from "./axios";

const laptopsApi = {
  getAll: async (params = {}) => {
    const res = await axiosClient.get("/products", {
      // ✅ status: "active" trước ...params → có thể override nếu cần
      params: { category: "laptop", limit: 100, status: "active", ...params },
    });
    return res.data.data.data;
  },

  getById: async (id) => {
    // Giữ nguyên — lấy 1 sp cụ thể không cần lọc status
    const res = await axiosClient.get(`/products/${id}`);
    return res.data.data;
  },

  getByBrand: async (brand) => {
    const res = await axiosClient.get("/products", {
      // ✅ thêm status: "active"
      params: { category: "laptop", brand, limit: 100, status: "active" },
    });
    return res.data.data.data;
  },

  search: async (keyword) => {
    const res = await axiosClient.get("/products", {
      // ✅ thêm status: "active"
      params: { category: "laptop", search: keyword, limit: 100, status: "active" },
    });
    return res.data.data.data;
  },
};

export default laptopsApi;
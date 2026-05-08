// import axiosClient from "./axios";

// const phonesApi = {
//   getAll: async (params = {}) => {
//     const res = await axiosClient.get("/products", {
//       params: { category: "phone", limit: 100, ...params } // ✅ thêm limit
//     });
//     return res.data.data.data;
//   },

//   getById: async (id) => {
//     const res = await axiosClient.get(`/products/${id}`);
//     return res.data.data;
//   },

//   getByBrand: async (brand) => {
//     const res = await axiosClient.get("/products", {
//       params: { category: "phone", brand, limit: 100 }
//     });
//     return res.data.data.data;
//   },

//   search: async (keyword) => {
//     const res = await axiosClient.get("/products", {
//       params: { category: "phone", search: keyword, limit: 100 }
//     });
//     return res.data.data.data;
//   },
// };

// export default phonesApi;


import axiosClient from "./axios";

const phonesApi = {
  getAll: async (params = {}) => {
    const res = await axiosClient.get("/products", {
      params: { category: "phone", limit: 100, status: "active", ...params } // ✅ thêm status
    });
    return res.data.data.data;
  },

  getById: async (id) => {
    // ✅ getById giữ nguyên — lấy 1 sp cụ thể không cần lọc status
    const res = await axiosClient.get(`/products/${id}`);
    return res.data.data;
  },

  getByBrand: async (brand) => {
    const res = await axiosClient.get("/products", {
      params: { category: "phone", brand, limit: 100, status: "active" } // ✅ thêm status
    });
    return res.data.data.data;
  },

  search: async (keyword) => {
    const res = await axiosClient.get("/products", {
      params: { category: "phone", search: keyword, limit: 100, status: "active" } // ✅ thêm status
    });
    return res.data.data.data;
  },
};

export default phonesApi;
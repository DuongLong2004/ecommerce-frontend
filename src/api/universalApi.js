import axios from "axios";

const BASE_URL = "http://localhost:3001";

const universalApi = {
  // Lấy danh sách theo type: phones, laptops, tablets...
  getAll: async (type) => {
    const res = await axios.get(`${BASE_URL}/${type}`);
    return res.data;
  },

  // Lấy 1 sản phẩm theo type + id
  getById: async (type, id) => {
    const res = await axios.get(`${BASE_URL}/${type}/${id}`);
    return res.data;
  },

  // Thêm sản phẩm
  create: async (type, data) => {
    const res = await axios.post(`${BASE_URL}/${type}`, data);
    return res.data;
  },

  // Update sản phẩm
  update: async (type, id, data) => {
    const res = await axios.put(`${BASE_URL}/${type}/${id}`, data);
    return res.data;
  },

  // Xóa sản phẩm
  delete: async (type, id) => {
    const res = await axios.delete(`${BASE_URL}/${type}/${id}`);
    return res.data;
  },
};

export default universalApi;

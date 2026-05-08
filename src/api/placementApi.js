// import axiosClient from "./axios";

// /**
//  * placementApi — FE user dùng để fetch sản phẩm theo vị trí
//  *
//  * Các placement hợp lệ: "homepage" | "phones" | "laptops" | "flashsale"
//  */
// const placementApi = {
//   // Lấy sản phẩm nổi bật trang chủ
//   getHomepage: async () => {
//     const res = await axiosClient.get("/placements", {
//       params: { placement: "homepage" },
//     });
//     return res.data.data;
//   },

//   // Lấy sản phẩm ưu tiên trang điện thoại
//   getPhones: async () => {
//     const res = await axiosClient.get("/placements", {
//       params: { placement: "phones" },
//     });
//     return res.data.data;
//   },

//   // Lấy sản phẩm ưu tiên trang laptop
//   getLaptops: async () => {
//     const res = await axiosClient.get("/placements", {
//       params: { placement: "laptops" },
//     });
//     return res.data.data;
//   },

//   // Lấy sản phẩm flash sale (đang trong thời gian sale)
//   getFlashSale: async () => {
//     const res = await axiosClient.get("/placements", {
//       params: { placement: "flashsale" },
//     });
//     return res.data.data; // mỗi item có thêm: salePrice, saleStartAt, saleEndAt
//   },
// };

// /**
//  * adminPlacementApi — chỉ dùng ở trang admin
//  */
// export const adminPlacementApi = {
//   // Lấy danh sách theo placement để hiển thị trong panel quản lý
//   getByPlacement: async (placement) => {
//     const res = await axiosClient.get("/placements/admin", {
//       params: { placement },
//     });
//     return res.data.data;
//   },

//   // Thêm sản phẩm vào placement
//   // data = { productId, placement, salePrice?, saleStartAt?, saleEndAt? }
//   add: async (data) => {
//     const res = await axiosClient.post("/placements", data);
//     return res.data.data;
//   },

//   // Cập nhật flash sale fields
//   update: async (id, data) => {
//     const res = await axiosClient.put(`/placements/${id}`, data);
//     return res.data.data;
//   },

//   // Xóa sản phẩm khỏi placement
//   remove: async (id) => {
//     const res = await axiosClient.delete(`/placements/${id}`);
//     return res.data;
//   },

//   // Cập nhật thứ tự sau drag & drop
//   // items = [{ id, sortOrder }, ...]
//   reorder: async (placement, items) => {
//     const res = await axiosClient.put("/placements/reorder", { placement, items });
//     return res.data;
//   },
// };

// export default placementApi;


import axiosClient from "./axios";

/* ═══════════════════════════════════════════════════════════════
   PLACEMENT API
   
   Luồng dữ liệu số lượng Flash Sale:
   
   DB field       Ý nghĩa
   ─────────────────────────────────────────────────────────────
   stockLimit     Admin set — tổng suất tối đa được mua sale
   stockSold      Hệ thống tự tăng — số suất đã bán
   stockLeft      (computed) = stockLimit - stockSold
   
   Luồng khi user mua:
   1. FE gọi POST /orders  (tạo đơn hàng)
   2. BE kiểm tra stockLeft > 0, nếu đủ → tạo đơn + atomically INCREMENT stockSold
   3. Nếu stockLeft = 0 → trả lỗi 409 "Hết suất flash sale"
   4. FE dùng getFlashSale() để refresh thanh tiến trình
   
   LƯU Ý: FE KHÔNG gọi incrementSold trực tiếp.
   Việc tăng stockSold phải xảy ra trong cùng 1 DB transaction với tạo đơn,
   tránh race condition khi nhiều user mua cùng lúc.
═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   placementApi — FE user (trang khách hàng)
───────────────────────────────────────────── */
const placementApi = {
  /** Sản phẩm nổi bật trang chủ */
  getHomepage: async () => {
    const res = await axiosClient.get("/placements", {
      params: { placement: "homepage" },
    });
    return res.data.data;
    /*
     * Response mỗi item:
     * { id, sortOrder, product: { id, title, price, img, ... } }
     */
  },

  /** Sản phẩm ưu tiên trang điện thoại */
  getPhones: async () => {
    const res = await axiosClient.get("/placements", {
      params: { placement: "phones" },
    });
    return res.data.data;
  },

  /** Sản phẩm ưu tiên trang laptop */
  getLaptops: async () => {
    const res = await axiosClient.get("/placements", {
      params: { placement: "laptops" },
    });
    return res.data.data;
  },

  /**
   * Sản phẩm Flash Sale — chỉ trả về sản phẩm đang trong khung giờ sale
   *
   * Response mỗi item có thêm:
   * {
   *   salePrice:   number,   // giá sale
   *   saleStartAt: string,   // ISO datetime
   *   saleEndAt:   string,   // ISO datetime
   *   stockLimit:  number | null,  // tổng suất (null = không giới hạn)
   *   stockSold:   number,   // đã bán — dùng để tính thanh tiến trình
   *   stockLeft:   number | null,  // còn lại (null nếu không giới hạn)
   * }
   *
   * FE tính % bán:  (stockSold / stockLimit) * 100
   * FE tính còn lại: stockLeft ?? "∞"
   */
  getFlashSale: async () => {
    const res = await axiosClient.get("/placements", {
      params: { placement: "flashsale" },
    });
    return res.data.data;
  },

  /**
   * Lấy tất cả sessions flash sale (nhóm theo khung giờ)
   * Dùng cho component tab selector trên trang flash sale
   *
   * Response: [{ sessionKey, saleStartAt, saleEndAt, status, items[] }]
   * status: "live" | "upcoming" | "ended"
   */
  getFlashSaleSessions: async () => {
    const res = await axiosClient.get("/placements/flashsale-sessions");
    return res.data.data;
  },
};

/* ─────────────────────────────────────────────
   adminPlacementApi — chỉ dùng ở trang admin
───────────────────────────────────────────── */
export const adminPlacementApi = {
  /**
   * Lấy danh sách theo placement để hiển thị trong panel quản lý
   *
   * Response mỗi item:
   * {
   *   id, sortOrder, placement,
   *   product: { id, title, price, img, brand, status },
   *   salePrice, saleStartAt, saleEndAt,
   *   stockLimit,   // admin đã set
   *   stockSold,    // hệ thống track — FE dùng để hiển thị thanh tiến trình
   *   stockLeft,    // computed = stockLimit - stockSold
   * }
   */
  getByPlacement: async (placement) => {
    const res = await axiosClient.get("/placements/admin", {
      params: { placement },
    });
    return res.data.data;
  },

  /**
   * Thêm sản phẩm vào placement
   *
   * data = {
   *   productId:   string,
   *   placement:   "homepage" | "phones" | "laptops" | "flashsale",
   *   salePrice?:  number,    // chỉ dùng cho flashsale
   *   saleStartAt?: string,   // ISO datetime
   *   saleEndAt?:  string,    // ISO datetime
   *   stockLimit?: number,    // null = không giới hạn
   * }
   */
  add: async (data) => {
    const res = await axiosClient.post("/placements", data);
    return res.data.data;
  },

  /**
   * Cập nhật flash sale fields của 1 placement entry
   *
   * data = {
   *   salePrice?:  number,
   *   saleStartAt?: string | null,
   *   saleEndAt?:  string | null,
   *   stockLimit?: number | null,  // null để bỏ giới hạn
   * }
   *
   * LƯU Ý: stockSold KHÔNG được cập nhật qua endpoint này.
   * stockSold chỉ được tăng bởi BE khi xử lý đơn hàng.
   */
  update: async (id, data) => {
    // Đảm bảo không vô tình gửi stockSold lên BE
    const { stockSold, stockLeft, ...safeData } = data;
    const res = await axiosClient.put(`/placements/${id}`, safeData);
    return res.data.data;
  },

  /**
   * Reset stockSold về 0 (dùng khi admin muốn restart campaign)
   * Endpoint riêng để tránh nhầm lẫn với update thông thường
   */
  resetStock: async (id) => {
    const res = await axiosClient.post(`/placements/${id}/reset-stock`);
    return res.data.data;
  },

  /**
   * Xóa 1 sản phẩm khỏi placement
   */
  remove: async (id) => {
    const res = await axiosClient.delete(`/placements/${id}`);
    return res.data;
  },

  /**
   * Xóa nhiều sản phẩm cùng lúc (bulk delete)
   * ids = string[]
   */
  removeBulk: async (ids) => {
    const res = await axiosClient.delete("/placements/bulk", {
      data: { ids },
    });
    return res.data;
  },

  /**
   * Cập nhật thứ tự sau drag & drop
   * items = [{ id, sortOrder }, ...]
   */
  reorder: async (placement, items) => {
    const res = await axiosClient.put("/placements/reorder", { placement, items });
    return res.data;
  },

  /**
   * Lấy thống kê flash sale:
   * - Tổng suất đã bán
   * - Revenue từ flash sale
   * - Sản phẩm bán chạy nhất
   * Dùng cho dashboard admin
   */
  getStats: async (placement = "flashsale") => {
    const res = await axiosClient.get("/placements/stats", {
      params: { placement },
    });
    return res.data.data;
    /*
     * Response:
     * {
     *   totalSold:    number,
     *   totalRevenue: number,
     *   topProducts:  [{ productId, title, sold, revenue }],
     *   bySession:    [{ saleStartAt, saleEndAt, sold, revenue }]
     * }
     */
  },
};

export default placementApi;


/* ═══════════════════════════════════════════════════════════════
   BACKEND CẦN LÀM (checklist để sync với BE)
   
   □ DB: thêm cột stockSold (int default 0) vào bảng placements
   □ DB: thêm computed/virtual column stockLeft = stockLimit - stockSold
   
   □ GET /placements?placement=flashsale
       → trả về stockLimit, stockSold, stockLeft trong mỗi item
   
   □ GET /placements/admin?placement=flashsale
       → trả về stockLimit, stockSold, stockLeft
   
   □ POST /placements (add)
       → nhận stockLimit, set stockSold = 0
   
   □ PUT /placements/:id (update)
       → nhận stockLimit (có thể null)
       → KHÔNG nhận stockSold (BE ignore nếu có trong body)
   
   □ POST /placements/:id/reset-stock
       → set stockSold = 0
       → chỉ admin được gọi
   
   □ DELETE /placements/bulk
       → nhận body { ids: string[] }
       → xóa tất cả ids một lần
   
   □ POST /orders (tạo đơn hàng — quan trọng nhất)
       → Khi item là flash sale:
          1. SELECT stockLimit, stockSold FROM placements WHERE id = ?
          2. IF stockLimit IS NOT NULL AND stockSold >= stockLimit → 409 "Hết suất"
          3. BEGIN TRANSACTION
             - INSERT order
             - UPDATE placements SET stockSold = stockSold + quantity WHERE id = ?
          4. COMMIT
       → Dùng SELECT FOR UPDATE hoặc optimistic lock để tránh oversell
   
   □ GET /placements/flashsale-sessions (tùy chọn)
       → GROUP BY saleStartAt, saleEndAt
       → Trả về danh sách sessions với status tính theo NOW()
   
   □ GET /placements/stats?placement=flashsale (tùy chọn)
       → Aggregate stockSold, tính revenue = salePrice * stockSold
═══════════════════════════════════════════════════════════════ */
import axios from "./axios";

/**
 * Lấy danh sách thiết bị đang đăng nhập của user.
 *
 * @returns {Promise<Array>} Sessions với fields:
 *   - deviceId
 *   - deviceName     "Chrome on Windows"
 *   - ip
 *   - createdAt
 *   - lastActive
 *   - isCurrent      (true nếu là device đang dùng)
 */
export const listSessions = async () => {
  const res = await axios.get("/auth/sessions");
  return res.data; // { status, message, data: [...] }
};

/**
 * Đăng xuất 1 thiết bị cụ thể (không thể logout self qua endpoint này).
 *
 * @param {string} deviceId
 * @throws BE trả 400 nếu deviceId === current device
 */
export const revokeSession = async (deviceId) => {
  const res = await axios.delete(`/auth/sessions/${deviceId}`);
  return res.data;
};

/**
 * Đăng xuất khỏi TẤT CẢ thiết bị khác (giữ thiết bị hiện tại).
 */
export const revokeOtherSessions = async () => {
  const res = await axios.delete("/auth/sessions");
  return res.data;
};
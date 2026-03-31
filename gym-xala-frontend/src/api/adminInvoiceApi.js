import axiosClient from "./axiosClient";

const BASE_URL = "/admin/invoices";

// Lấy danh sách hóa đơn với filter (status mặc định là PENDING nếu không truyền)
export const getInvoices = async (status = "", memberCode = "", registrationDate = "") => {
    try {
        const params = {};
        if (status) params.status = status;
        if (memberCode) params.memberCode = memberCode;
        if (registrationDate) params.registrationDate = registrationDate;

        const response = await axiosClient.get(BASE_URL, {
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi Token
            }});
        return response.data;
    } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
    }
};

// Cập nhật trạng thái hóa đơn (VD: Duyệt -> ACTIVE, Hủy -> CANCELLED)
export const updateInvoiceStatus = async (id, status) => {
    try {
        const response = await axiosClient.put(`${BASE_URL}/${id}/status`, null, {
            params: { status },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }});
        return response.data;
    } catch (error) {
        console.error("Error updating invoice status:", error);
        throw error;
    }
}

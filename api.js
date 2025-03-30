import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const API_BASE_URL = "http://192.168.1.4:5084"; // Thay bằng địa chỉ IP của bạn


// 1. Đăng ký người dùng
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    return { error: error.response?.data?.message || "Đăng ký thất bại!" };
  }
};

// 2. Đăng nhập người dùng
export const loginUser = async (email, password) => {
  console.log("Bắt đầu loginUser, gửi yêu cầu đến:", `${API_BASE_URL}/api/users/login`); // Debug
  console.log("Dữ liệu gửi đi:", { email, password }); // Debug

  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, { email, password });
    console.log("Phản hồi từ server:", response.data); // Debug

    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      console.log("Đã lưu token và user vào AsyncStorage"); // Debug
    }

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    if (error.response) {
      console.log("Phản hồi từ backend (lỗi):", error.response.data);
      return { error: error.response.data.message || `Lỗi từ server: ${error.response.status}` };
    } else if (error.request) {
      console.log("Không nhận được phản hồi từ server:", error.request);
      return { error: "Không thể kết nối đến server!" };
    } else {
      console.log("Lỗi khác:", error.message);
      return { error: "Đăng nhập thất bại!" };
    }
  }
};

// 3. Lấy danh sách người chơi theo môn thể thao (có xác thực)
export const getPlayersBySport = async (sport) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) {
      console.error("❌ Không tìm thấy token trong AsyncStorage");
      throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");
    }

    const apiUrl = `${API_BASE_URL}/api/Player/${encodeURIComponent(sport)}`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    // Kiểm tra nếu API trả về object thay vì mảng
    if (!response.ok || !Array.isArray(data)) {
      console.warn("⚠️ API trả về lỗi hoặc dữ liệu không hợp lệ:", data);
      return []; // Trả về danh sách rỗng thay vì ném lỗi
    }

    return data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error);
    return []; // Đảm bảo luôn trả về mảng
  }
};

// 4. Đăng xuất (Gọi API & Xóa token)
export const logoutUser = async () => {
  try {
    // Xóa dữ liệu local
    await AsyncStorage.removeItem("userToken"); // Sửa: Sử dụng key "userToken"
    await AsyncStorage.removeItem("user");
    console.log("✅ Đăng xuất thành công!");
    return { success: true, message: "Đăng xuất thành công." };
  } catch (error) {
    console.error("❌ Lỗi khi đăng xuất:", error);
    throw error;
  }
};

// API: Tab khám phá
export const getEvents = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.get(`${API_BASE_URL}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy sự kiện:", error);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    console.log("Token gửi đi:", token);
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    const text = await response.text();
    console.log("Phản hồi từ backend:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi tạo sự kiện:", error);
    throw error;
  }
};

export const getEventById = async (eventId) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.get(`${API_BASE_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sự kiện:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.put(`${API_BASE_URL}/api/events/${eventId}`, eventData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật sự kiện:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.delete(`${API_BASE_URL}/api/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa sự kiện:", error);
    throw error;
  }
};

export const joinEvent = async (eventId) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.post(
      `${API_BASE_URL}/api/events/${eventId}/join`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tham gia sự kiện:", error);
    throw error;
  }
};

export const leaveEvent = async (eventId) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token");

    const response = await axios.post(
      `${API_BASE_URL}/api/events/${eventId}/leave`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy tham gia sự kiện:", error);
    throw error;
  }
};

export const getSports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Sports`);
    console.log("Dữ liệu nhận được:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách môn thể thao:", error.response?.data || error.message);
    throw error;
  }
};

export const sendFriendRequest = async (targetUserId) => {
  const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
  const response = await fetch(`${API_BASE_URL}/api/Player/friend-request`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUserId }),
  });
  return response.json();
};

export const inviteToEvent = async (targetUserId, eventId) => {
  const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
  const response = await fetch(`${API_BASE_URL}/api/Player/invite-event`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ targetUserId, eventId }),
  });
  return response.json();
};

export const getFriends = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    console.log("Token gửi đi (getFriends):", token);

    const response = await fetch(`${API_BASE_URL}/api/friends`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (getFriends):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bạn bè:", error);
    throw error;
  }
};

export const searchFriends = async (keyword) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/friends/search?keyword=${encodeURIComponent(keyword)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (searchFriends):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bạn bè:", error);
    throw error;
  }
};

// Lấy danh sách hội thoại
export const getConversations = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/friends/conversations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (getConversations):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách hội thoại:", error);
    throw error;
  }
};

// Chi tiết hội thoại
export const getConversation = async (conversationId) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/friends/conversations/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (getConversation):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết hội thoại:", error);
    throw error;
  }
};

// Gửi tin nhắn
export const sendMessage = async (conversationId, content, type) => {
  try {
    const token = await AsyncStorage.getItem("userToken"); // Sửa: Sử dụng key "userToken"
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/friends/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, type }),
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (sendMessage):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    throw error;
  }
};

// Xóa hội thoại
export const deleteConversation = async (conversationId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    console.log("Token gửi đi (deleteConversation):", token);

    const response = await fetch(`${API_BASE_URL}/api/friends/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (deleteConversation):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi xóa hội thoại:", error);
    throw error;
  }
};

// Tab Thông báo
// Sơ đồ 1: Lấy danh sách thông báo
export const getNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (getNotifications):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách thông báo:", error);
    throw error;
  }
};

// Sơ đồ 2: Xem chi tiết thông báo
export const getNotificationDetails = async (notificationId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (getNotificationDetails):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thông báo:", error);
    throw error;
  }
};

// Sơ đồ 3: Tương tác với thông báo (Chấp nhận/Từ chối yêu cầu kết bạn)
export const respondToNotification = async (notificationId, action) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action }),
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (respondToNotification):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi tương tác với thông báo:", error);
    throw error;
  }
};

// Sơ đồ 4: Xóa một thông báo
export const deleteNotification = async (notificationId) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (deleteNotification):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    throw error;
  }
};

// Sơ đồ 4: Xóa tất cả thông báo
export const deleteAllNotifications = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications/delete-all`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (deleteAllNotifications):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi xóa tất cả thông báo:", error);
    throw error;
  }
};

// Sơ đồ 5: Đánh dấu tất cả thông báo là đã đọc
export const markAllNotificationsAsRead = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) throw new Error("Không tìm thấy token, vui lòng đăng nhập lại!");

    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("Phản hồi từ backend (markAllNotificationsAsRead):", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`Phản hồi không phải JSON: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `Lỗi từ server: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi đánh dấu tất cả thông báo là đã đọc:", error);
    throw error;
  }
};

// API cập nhật hồ sơ
export const updateProfile = async (profileData) => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) {
      return { error: "Bạn chưa đăng nhập!" };
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/users/update-profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật hồ sơ:", error);
    if (error.response) {
      console.log("Phản hồi từ backend (updateProfile):", error.response.data);
      return { error: error.response.data.message || `Lỗi từ server: ${error.response.status}` };
    } else if (error.request) {
      console.log("Không nhận được phản hồi từ server:", error.request);
      return { error: "Không thể kết nối đến server!" };
    } else {
      console.log("Lỗi khác:", error.message);
      return { error: "Yêu cầu cập nhật hồ sơ thất bại!" };
    }
  }
};

// API lấy danh sách môn thể thao
export const getSportsList = async () => {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) {
      return { error: "Bạn chưa đăng nhập!" };
    }

    const response = await axios.get(`${API_BASE_URL}/api/sports`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách môn thể thao:", error);
    if (error.response) {
      console.log("Phản hồi từ backend (getSportsList):", error.response.data);
      return { error: error.response.data.message || `Lỗi từ server: ${error.response.status}` };
    } else if (error.request) {
      console.log("Không nhận được phản hồi từ server:", error.request);
      return { error: "Không thể kết nối đến server!" };
    } else {
      console.log("Lỗi khác:", error.message);
      return { error: "Yêu cầu lấy danh sách môn thể thao thất bại!" };
    }
  }
};
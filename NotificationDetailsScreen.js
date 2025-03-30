import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { getNotificationDetails, respondToNotification } from "../../Services/api";

const NotificationDetailsScreen = ({ route, navigation }) => {
  const { notificationId } = route.params;
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchNotificationDetails();
  }, []);

  const fetchNotificationDetails = async () => {
    try {
      const data = await getNotificationDetails(notificationId);
      setNotification(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải chi tiết thông báo!");
      navigation.goBack();
    }
  };

  const handleRespond = async (action) => {
    try {
      const response = await respondToNotification(notificationId, action);
      Alert.alert("Thành công", response.message);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể thực hiện hành động!");
    }
  };

  if (!notification) {
    return <View style={styles.container}><Text>Đang tải...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết thông báo</Text>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Người gửi:</Text>
        <Text style={styles.value}>{notification.sender.userName}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Nội dung:</Text>
        <Text style={styles.value}>{notification.content}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Thời gian:</Text>
        <Text style={styles.value}>{new Date(notification.createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Trạng thái:</Text>
        <Text style={styles.value}>{notification.isRead ? "Đã đọc" : "Chưa đọc"}</Text>
      </View>
      {notification.type === "FriendRequest" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRespond("accept")}
          >
            <Text style={styles.actionButtonText}>Chấp nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRespond("reject")}
          >
            <Text style={styles.actionButtonText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  detailContainer: { flexDirection: "row", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", width: 100 },
  value: { fontSize: 16, flex: 1 },
  actionButtons: { flexDirection: "row", marginTop: 20 },
  actionButton: { padding: 10, borderRadius: 5, marginRight: 10 },
  acceptButton: { backgroundColor: "#28a745" },
  rejectButton: { backgroundColor: "#dc3545" },
  actionButtonText: { color: "#fff", fontSize: 16 },
});

export default NotificationDetailsScreen;
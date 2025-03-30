import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.4:5084/api/Player/notifications", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleResponse = async (type, id, accept) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const endpoint = type === "friend" ? "friend-request/respond" : "invite-event/respond";
      const response = await fetch(`http://192.168.1.4:5084/api/Player/${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ [type === "friend" ? "requestId" : "invitationId"]: id, accept }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", data.message);
        fetchNotifications(); // Cập nhật lại danh sách thông báo
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const renderNotification = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: "#ddd" }}>
      <Text>{item.message}</Text>
      {item.status === "Pending" && (
        <View style={{ flexDirection: "row", gap: 10, marginTop: 5 }}>
          <Button title="Chấp nhận" onPress={() => handleResponse(item.type, item.id, true)} />
          <Button title="Từ chối" onPress={() => handleResponse(item.type, item.id, false)} />
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Thông báo</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
      />
    </View>
  );
};

export default NotificationsScreen;
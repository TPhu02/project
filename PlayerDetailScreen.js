import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendFriendRequest } from "../../Services/api";

const API_BASE_URL = "http://192.168.1.4:5084"; // Địa chỉ backend của bạn

const PlayerDetailScreen = ({ route, navigation }) => {
  const { playerId } = route.params; // playerId là Guid (chuỗi)
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin chi tiết người chơi
  const fetchPlayerDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/Player/details/${playerId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPlayer(data);
      } else {
        throw new Error(data.message || "Không thể tải thông tin người chơi.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerDetails();
  }, []);

  // Gửi yêu cầu kết bạn
  const handleFriendRequest = async () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn gửi yêu cầu kết bạn?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const data = await sendFriendRequest(playerId);
              Alert.alert("Thành công", data.message);
            } catch (error) {
              Alert.alert("Lỗi", error.message);
            }
          },
        },
      ]
    );
  };

  // Mời tham gia sự kiện
  const handleInviteEvent = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/Player/invite-event`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: playerId,
          eventId: "some-event-id", // Thay bằng eventId thực tế từ logic của bạn
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", data.message || "Lời mời tham gia sự kiện đã được gửi!");
      } else {
        throw new Error(data.message || "Không thể gửi lời mời.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  // Chuyển hướng đến màn hình Chat
  const handleSendMessage = () => {
    navigation.navigate("Friends", { recipientId: playerId });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.container}>
        <Text>Không tìm thấy thông tin người chơi.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: player.avatar || "https://via.placeholder.com/100" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{player.userName}</Text>
      <Text>Tuổi: {player.age}</Text>
      <Text>Giới tính: {player.gender}</Text>
      <Text>Vị trí: {player.location}</Text>
      <Text>Môn thể thao: {player.sport}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Kết bạn" onPress={handleFriendRequest} />
        <Button title="Mời tham gia sự kiện" onPress={handleInviteEvent} />
        <Button title="Gửi tin nhắn" onPress={handleSendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20, backgroundColor: "#f5f5f5" },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  buttonContainer: { marginTop: 20, width: "100%", gap: 10 },
});

export default PlayerDetailScreen;
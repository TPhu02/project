import React from "react";
import { View, Text, StyleSheet } from "react-native";

const FriendDetailScreen = ({ route }) => {
    const friend = route?.params?.friend || null; // Kiểm tra tránh lỗi undefined
  
    if (!friend) {
      return <Text>Không tìm thấy thông tin bạn bè!</Text>;
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin chi tiết bạn bè</Text>
      <Text style={styles.info}>Tên: {friend.userName}</Text>
      <Text style={styles.info}>Email: {friend.email}</Text>
      <Text style={styles.info}>Tuổi: {friend.age}</Text>
      <Text style={styles.info}>Giới tính: {friend.gender}</Text>
      <Text style={styles.info}>Địa điểm: {friend.location}</Text>
      <Text style={styles.info}>
        Trạng thái: {friend.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
      </Text>
      <Text style={styles.info}>Hoạt động cuối: {friend.lastActive}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
});

export default FriendDetailScreen;
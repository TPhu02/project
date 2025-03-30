import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList } from "react-native";
import { getEventById, updateEvent, deleteEvent } from "../../Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) setUserId(JSON.parse(user).userId);
    };
    fetchUser();
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const data = await getEventById(eventId);
      setEvent(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải chi tiết sự kiện.");
    }
  };

  const handleEditEvent = () => {
    if (event.createdBy !== userId) {
      Alert.alert("Lỗi", "Bạn không có quyền chỉnh sửa sự kiện này.");
      return;
    }
    navigation.navigate("EditEventScreen", { event });
  };

  const handleDeleteEvent = async () => {
    if (event.createdBy !== userId) {
      Alert.alert("Lỗi", "Bạn không có quyền xóa sự kiện này.");
      return;
    }
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa sự kiện này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            Alert.alert("Thành công", "Sự kiện đã được xóa!");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa sự kiện.");
          }
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!event) return <Text>Đang tải...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.eventName}</Text>
      <Text style={styles.info}>Môn: {event.sportName}</Text>
      <Text style={styles.info}>📍 {event.location}</Text>
      <Text style={styles.info}>⏰ {formatDate(event.eventDate)}</Text>
      <Text style={styles.info}>👥 Tối đa: {event.maxParticipants} người</Text>
      <Text style={styles.info}>Thể thức: {event.matchFormat === "daily" ? "Trận đấu thường ngày" : "Đấu giải"}</Text>

      <Text style={styles.sectionTitle}>Danh sách người tham gia:</Text>
      <FlatList
        data={event.participants}
        keyExtractor={(item) => item.toString()}
        renderItem={({ item }) => <Text style={styles.participant}>{item}</Text>}
        ListEmptyComponent={<Text style={styles.noParticipants}>Chưa có người tham gia.</Text>}
      />

      {event.createdBy === userId && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditEvent}>
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEvent}>
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, color: "gray", marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  participant: { fontSize: 16, padding: 5 },
  noParticipants: { fontSize: 16, color: "gray", textAlign: "center" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  editButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
  deleteButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});

export default EventDetailScreen;
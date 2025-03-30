import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getEvents, joinEvent, leaveEvent } from "../../Services/api";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MatchesScreen = ({ matchType, navigation, searchKeyword, filters }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) setUserId(JSON.parse(user).userId);
    };
    fetchUser();
    fetchEvents();
  }, [matchType, searchKeyword, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      let filteredEvents = data.filter((e) => e.matchFormat === matchType);

      // Lọc theo từ khóa tìm kiếm
      if (searchKeyword) {
        filteredEvents = filteredEvents.filter(
          (e) =>
            e.eventName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            e.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            e.sportName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      // Lọc nâng cao
      if (filters) {
        if (filters.sport) {
          filteredEvents = filteredEvents.filter((e) =>
            e.sportName.toLowerCase().includes(filters.sport.toLowerCase())
          );
        }
        if (filters.location) {
          filteredEvents = filteredEvents.filter((e) =>
            e.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
        if (filters.time) {
          filteredEvents = filteredEvents.filter((e) =>
            new Date(e.eventDate).toISOString().includes(filters.time)
          );
        }
      }

      setEvents(filteredEvents);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinEvent = async (eventId) => {
    try {
      await joinEvent(eventId);
      Alert.alert("Thành công", "Bạn đã tham gia sự kiện!");
      fetchEvents(); // Làm mới danh sách
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tham gia sự kiện.");
    }
  };

  const handleLeaveEvent = async (eventId) => {
    try {
      await leaveEvent(eventId);
      Alert.alert("Thành công", "Bạn đã hủy tham gia sự kiện!");
      fetchEvents(); // Làm mới danh sách
    } catch (error) {
      Alert.alert("Lỗi", "Không thể hủy tham gia sự kiện.");
    }
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : events.length === 0 ? (
        <Text style={styles.noEventsText}>
          {matchType === "daily"
            ? "Không có trận đấu thường ngày nào phù hợp"
            : "Không có trận đấu giải nào phù hợp"}
        </Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => item?.eventId?.toString() || index.toString()}
          renderItem={({ item }) => {
            const isParticipant = item.participants?.includes(userId);
            return (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => navigation.navigate("EventDetailScreen", { eventId: item.eventId })}
              >
                <Text style={styles.eventTitle}>{item.eventName}</Text>
                <Text style={styles.eventInfo}>Môn: {item.sportName}</Text>
                <Text style={styles.eventInfo}>
                  📍 {item.location} ⏰ {formatDate(item.eventDate)}
                </Text>
                <Text style={styles.eventInfo}>👥 Tối đa: {item.maxParticipants} người</Text>
                <TouchableOpacity
                  style={isParticipant ? styles.leaveButton : styles.joinButton}
                  onPress={() =>
                    isParticipant ? handleLeaveEvent(item.eventId) : handleJoinEvent(item.eventId)
                  }
                >
                  <Text style={styles.joinText}>
                    {isParticipant ? "Hủy tham gia" : "Tham gia"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateEventScreen")}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  eventCard: { padding: 15, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10, elevation: 3 },
  eventTitle: { fontSize: 16, fontWeight: "bold" },
  eventInfo: { color: "gray", marginBottom: 5 },
  joinButton: { backgroundColor: "#28a745", padding: 8, borderRadius: 5, alignItems: "center" },
  leaveButton: { backgroundColor: "#dc3545", padding: 8, borderRadius: 5, alignItems: "center" },
  joinText: { color: "#fff", fontWeight: "bold" },
  createButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#007bff", padding: 15, borderRadius: 50 },
  noEventsText: { textAlign: "center", marginTop: 20, color: "gray" },
});

export default MatchesScreen;
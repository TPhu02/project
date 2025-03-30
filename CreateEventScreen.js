import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getSports, createEvent } from "../../Services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateEventScreen = ({ navigation }) => {
  const [eventName, setEventName] = useState("");
  const [sportId, setSportId] = useState("");
  const [location, setLocation] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [matchFormat, setMatchFormat] = useState("daily");
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const sportsData = await getSports();
        setSports(sportsData);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn thể thao:", error);
        setError("Không thể tải danh sách môn thể thao. Vui lòng thử lại.");
        Alert.alert("Lỗi", error.response?.data?.message || "Không thể tải danh sách môn thể thao.");
      } finally {
        setLoading(false);
      }
    };
    fetchSports();
  }, []);

  const handleCreateEvent = async () => {
    if (!eventName || !sportId || !location || !maxParticipants) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      const eventData = {
        eventName,
        sportId,
        location,
        maxParticipants: parseInt(maxParticipants, 10),
        matchFormat,
        status: "pending",
      };
      console.log("Dữ liệu gửi đi:", eventData); // Log dữ liệu gửi đi
      await createEvent(eventData);
      Alert.alert("Thành công", "Sự kiện đã được gửi để kiểm duyệt!");
      navigation.goBack();
    } catch (error) {
      console.error("Lỗi khi tạo sự kiện:", error);
      Alert.alert("Lỗi", "Không thể tạo sự kiện.");
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={styles.container}>
          <Text style={styles.label}>Tên sự kiện:</Text>
          <TextInput style={styles.input} value={eventName} onChangeText={setEventName} />

          <View style={styles.card}>
            <Text style={styles.label}>Môn thể thao:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : sports.length === 0 ? (
              <Text style={styles.errorText}>Không có môn thể thao nào.</Text>
            ) : (
              <Picker selectedValue={sportId} onValueChange={(itemValue) => setSportId(itemValue)} style={styles.picker}>
                <Picker.Item label="Chọn môn thể thao" value="" />
                {sports.map((sport) => (
                  <Picker.Item key={sport.sportId} label={sport.sportName} value={sport.sportId} />
                ))}
              </Picker>
            )}
          </View>

          <Text style={styles.label}>Địa điểm:</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>Số người tối đa:</Text>
          <TextInput style={styles.input} value={maxParticipants} onChangeText={setMaxParticipants} keyboardType="numeric" />

          <Text style={styles.label}>Thể thức trận đấu:</Text>
          <Picker selectedValue={matchFormat} onValueChange={(itemValue) => setMatchFormat(itemValue)} style={styles.picker}>
            <Picker.Item label="Trận đấu thường ngày" value="daily" />
            <Picker.Item label="Đấu giải" value="tournament" />
          </Picker>

          <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
            <Text style={styles.buttonText}>Tạo sự kiện</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  picker: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, backgroundColor: "#fff", marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  button: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  errorText: { color: "red", textAlign: "center" },
});

export default CreateEventScreen;
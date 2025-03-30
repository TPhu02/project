import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getSports, updateEvent } from "../../Services/api";

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [eventName, setEventName] = useState(event.eventName);
  const [sportId, setSportId] = useState(event.sportId);
  const [location, setLocation] = useState(event.location);
  const [maxParticipants, setMaxParticipants] = useState(event.maxParticipants.toString());
  const [matchFormat, setMatchFormat] = useState(event.matchFormat);
  const [sports, setSports] = useState([]);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const sportsData = await getSports();
        setSports(sportsData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn thể thao:", error);
      }
    };
    fetchSports();
  }, []);

  const handleUpdateEvent = async () => {
    if (!eventName || !sportId || !location || !maxParticipants) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn lưu thay đổi?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Lưu",
        onPress: async () => {
          try {
            await updateEvent(event.eventId, { eventName, sportId, location, maxParticipants, matchFormat });
            Alert.alert("Thành công", "Sự kiện đã được cập nhật!");
            navigation.goBack();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể cập nhật sự kiện.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={styles.container}>
          <Text style={styles.label}>Tên sự kiện:</Text>
          <TextInput style={styles.input} value={eventName} onChangeText={setEventName} />

          <View style={styles.card}>
            <Text style={styles.label}>Môn thể thao:</Text>
            <Picker selectedValue={sportId} onValueChange={(itemValue) => setSportId(itemValue)} style={styles.picker}>
              <Picker.Item label="Chọn môn thể thao" value="" />
              {sports.map((sport) => (
                <Picker.Item key={sport.sportId} label={sport.sportName} value={sport.sportId} />
              ))}
            </Picker>
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

          <TouchableOpacity style={styles.button} onPress={handleUpdateEvent}>
            <Text style={styles.buttonText}>Lưu thay đổi</Text>
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
});

export default EditEventScreen;
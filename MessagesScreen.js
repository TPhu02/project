import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TextInput, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MessagesScreen = ({ route }) => {
  const { recipientId } = route.params || {}; // Đổi tên nếu cần
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`http://192.168.1.7:5084/api/Player/messages/${recipientId}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải tin nhắn.");
    }
  };

  useEffect(() => {
    if (recipientId) fetchMessages();
  }, [recipientId]);

  const sendMessage = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.7:5084/api/Player/messages", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: recipientId, content: newMessage }), // Đổi recipientId thành receiverId
      });
      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        throw new Error("Không thể gửi tin nhắn.");
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={{ padding: 10, backgroundColor: item.isSender ? "#e0f7fa" : "#fff", marginVertical: 5 }}>
      <Text>{item.content}</Text>
      <Text style={{ fontSize: 10 }}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <FlatList data={messages} keyExtractor={(item) => item.id} renderItem={renderMessage} />
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5 }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Nhập tin nhắn..."
        />
        <Button title="Gửi" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default MessagesScreen;
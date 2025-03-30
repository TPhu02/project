import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { getConversation, sendMessage } from "../../Services/api";

const ConversationDetailScreen = ({ route }) => {
  const { conversationId, friendName, friendId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const conversationData = await getConversation(conversationId);
        setMessages(conversationData.messages);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết hội thoại:", error);
        setError("Không thể tải hội thoại. Vui lòng thử lại.");
        Alert.alert("Lỗi", error.message || "Không thể tải hội thoại.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversation();
  }, [conversationId]);

  const handleSendMessage = async (type = "text") => {
    if (!newMessage.trim() && type === "text") {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung tin nhắn.");
      return;
    }

    try {
      const messageData = await sendMessage(conversationId, newMessage, type);
      setMessages([...messages, messageData]);
      setNewMessage("");
      Alert.alert("Thành công", type === "text" ? "Tin nhắn đã được gửi." : `${type} đã được gửi.`);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      Alert.alert("Lỗi", error.message || "Không thể gửi tin nhắn.");
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSentByUser ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.senderName}>{item.senderName}</Text>
      {item.type === "text" ? (
        <Text style={styles.messageContent}>{item.content}</Text>
      ) : item.type === "image" ? (
        <Image source={{ uri: item.content }} style={styles.messageImage} />
      ) : (
        <Text style={styles.messageFile}>File: {item.content}</Text>
      )}
      <Text style={styles.messageTime}>{item.sentAt}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hội thoại với {friendName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.messageList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập tin nhắn..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <View style={styles.buttonContainer}>
              <Button title="Gửi" onPress={() => handleSendMessage("text")} />
              <Button title="Gửi ảnh" onPress={() => handleSendMessage("image")} color="green" />
              <Button title="Gửi file" onPress={() => handleSendMessage("file")} color="blue" />
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  messageList: { flex: 1 },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: "80%",
  },
  sentMessage: {
    backgroundColor: "#007bff",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#e5e5e5",
    alignSelf: "flex-start",
  },
  senderName: { fontSize: 12, color: "#555", marginBottom: 5 },
  messageContent: { fontSize: 16, color: "#000" },
  messageImage: { width: 200, height: 200, borderRadius: 10 },
  messageFile: { fontSize: 16, color: "blue", textDecorationLine: "underline" },
  messageTime: { fontSize: 12, color: "#555", marginTop: 5, textAlign: "right" },
  inputContainer: { flexDirection: "column", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
});

export default ConversationDetailScreen;
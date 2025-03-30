import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { getConversations } from "../../Services/api";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const conversationsData = await getConversations();
        setConversations(conversationsData);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hội thoại:", error);
        setError("Không thể tải danh sách hội thoại. Vui lòng thử lại.");
        Alert.alert("Lỗi", error.message || "Không thể tải danh sách hội thoại.");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const handleConversationPress = (conversation) => {
    navigation.navigate("ConversationDetail", {
      conversationId: conversation.id,
      friendName: conversation.friendName,
      friendId: conversation.friendId,
    });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity onPress={() => handleConversationPress(item)} style={styles.conversationCard}>
      <View style={styles.conversationInfo}>
        <Text style={styles.friendName}>{item.friendName}</Text>
        {item.lastMessage ? (
          <Text style={styles.lastMessage}>
            {item.lastMessage.isSentByUser ? "Bạn: " : ""}{item.lastMessage.content}
          </Text>
        ) : (
          <Text style={styles.lastMessage}>Chưa có tin nhắn</Text>
        )}
        {item.unreadMessages > 0 && (
          <Text style={styles.unreadMessages}>
            {item.unreadMessages} tin nhắn chưa đọc
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : conversations.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có hội thoại nào.</Text>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  conversationCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  conversationInfo: { flex: 1 },
  friendName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  lastMessage: { fontSize: 14, color: "#555" },
  unreadMessages: { fontSize: 14, color: "red", marginTop: 5 },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" },
});

export default ChatScreen;
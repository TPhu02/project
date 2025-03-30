import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getConversations, deleteConversation } from "../../Services/api"; // Import API

const ConversationListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hội thoại khi màn hình được load
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy danh sách hội thoại!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa hội thoại
  const handleDeleteConversation = async (conversationId) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa hội thoại này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteConversation(conversationId);
              // Cập nhật danh sách hội thoại sau khi xóa
              setConversations(conversations.filter(conv => conv.ConversationId !== conversationId));
              Alert.alert('Thành công', response.message || 'Hội thoại đã được xóa!');
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa hội thoại!');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const renderConversation = ({ item }) => (
    <View style={styles.conversationItem}>
      <TouchableOpacity
        style={styles.conversationContent}
        onPress={() => navigation.navigate('ConversationDetail', { conversationId: item.ConversationId })}
      >
        <Text style={styles.participantName}>{item.OtherParticipant.UserName}</Text>
        {item.LastMessage ? (
          <Text style={styles.lastMessage}>
            {item.LastMessage.Content} - {new Date(item.LastMessage.SentAt).toLocaleTimeString()}
          </Text>
        ) : (
          <Text style={styles.lastMessage}>Chưa có tin nhắn</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteConversation(item.ConversationId)}
      >
        <Text style={styles.deleteButtonText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.ConversationId.toString()}
          ListEmptyComponent={<Text>Chưa có hội thoại nào!</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  conversationContent: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConversationListScreen;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  Button,
} from "react-native";
import { getFriends, searchFriends } from "../../Services/api";
import { useNavigation } from "@react-navigation/native";

const FriendsScreen = () => {
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsData = await getFriends();
        setFriends(friendsData);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setError("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
        Alert.alert("Lỗi", error.message || "Không thể tải danh sách bạn bè.");
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập từ khóa tìm kiếm.");
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchFriends(searchKeyword);
      setSearchResults(results);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm bạn bè:", error);
      setError("Không tìm thấy bạn bè phù hợp.");
      Alert.alert("Lỗi", error.message || "Không tìm thấy bạn bè phù hợp.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setError(null);
  };

  const handleFriendPress = (friend) => {
    navigation.navigate("FriendDetail", { friend });
  };

  const renderFriend = ({ item }) => (
    <TouchableOpacity onPress={() => handleFriendPress(item)} style={styles.friendCard}>
      <View style={styles.friendInfoContainer}>
        <Text style={styles.friendName}>{item.userName}</Text>
        <Text style={styles.friendInfo}>Email: {item.email}</Text>
        <Text style={styles.friendInfo}>Tuổi: {item.age}</Text>
        <Text style={styles.friendInfo}>Giới tính: {item.gender}</Text>
        <Text style={styles.friendInfo}>Địa điểm: {item.location}</Text>
        <Text style={styles.friendInfo}>
          Trạng thái: {item.isOnline ? "Trực tuyến" : "Ngoại tuyến"}
        </Text>
        <Text style={styles.friendInfo}>Hoạt động cuối: {item.lastActive}</Text>
        {item.unreadMessages > 0 && (
          <Text style={styles.unreadMessages}>
            Tin nhắn chưa đọc: {item.unreadMessages}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity onPress={() => handleFriendPress(item)} style={styles.friendCard}>
      <View style={styles.friendInfoContainer}>
        <Text style={styles.friendName}>{item.userName}</Text>
        <Text style={styles.friendInfo}>Email: {item.email}</Text>
        <Text style={styles.friendInfo}>Trạng thái quan hệ: {item.friendshipStatus}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bạn bè (tên hoặc email)"
          value={searchKeyword}
          onChangeText={setSearchKeyword}
        />
        <View style={styles.searchButtons}>
          <Button title="Tìm kiếm" onPress={handleSearch} disabled={isSearching} />
          <Button title="Xóa" onPress={handleClearSearch} color="red" />
        </View>
      </View>

      {/* Hiển thị kết quả tìm kiếm hoặc danh sách bạn bè */}
      {isSearching ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : searchResults.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.userId.toString()}
          />
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Danh sách bạn bè</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : friends.length === 0 ? (
            <Text style={styles.emptyText}>Bạn chưa có bạn bè nào.</Text>
          ) : (
            <FlatList
              data={friends}
              renderItem={renderFriend}
              keyExtractor={(item) => item.userId.toString()}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  searchContainer: { marginBottom: 20 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  searchButtons: { flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  friendCard: {
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
  friendInfoContainer: { flex: 1 },
  friendName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  friendInfo: { fontSize: 14, color: "#555" },
  unreadMessages: { fontSize: 14, color: "red", marginTop: 5 },
  errorText: { color: "red", textAlign: "center", marginTop: 20 },
  emptyText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" },
});

export default FriendsScreen;
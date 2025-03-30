import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Button, TextInput, Alert, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminScreen = ({ navigation }) => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetailModalVisible, setPlayerDetailModalVisible] = useState(false);
  const [createAdminModalVisible, setCreateAdminModalVisible] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    userName: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    avatar: "",
    location: "",
  });

  const fetchPlayers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.4:5084/api/Player/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPlayers(data);
      } else {
        Alert.alert("Lỗi", data.message || "Không thể lấy danh sách người chơi!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người chơi:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server!");
    }
  };

  const handleViewPlayerDetails = (player) => {
    setSelectedPlayer(player);
    setPlayerDetailModalVisible(true);
  };

  const handleDeletePlayer = async (userId) => {
    // Hiển thị thông báo xác nhận
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa người chơi này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(`http://192.168.1.4:5084/api/Player/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });

              if (response.ok) {
                Alert.alert("Thành công", "Người chơi đã được xóa!");
                fetchPlayers(); // Làm mới danh sách
                setPlayerDetailModalVisible(false); // Đóng modal chi tiết
              } else {
                const data = await response.json();
                Alert.alert("Lỗi", data.message || "Không thể xóa người chơi!");
              }
            } catch (error) {
              console.error("Lỗi khi xóa người chơi:", error);
              Alert.alert("Lỗi", "Không thể kết nối đến server!");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.userName || !newAdmin.email || !newAdmin.password || !newAdmin.age || !newAdmin.gender || !newAdmin.location) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch("http://192.168.1.4:5084/api/Auth/create-admin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: newAdmin.userName,
          email: newAdmin.email,
          password: newAdmin.password,
          age: parseInt(newAdmin.age),
          gender: newAdmin.gender,
          avatar: newAdmin.avatar || "default-avatar.jpg",
          location: newAdmin.location,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thành công", "Tài khoản Admin mới đã được tạo!");
        setCreateAdminModalVisible(false);
        setNewAdmin({ userName: "", email: "", password: "", age: "", gender: "", avatar: "", location: "" });
      } else {
        Alert.alert("Lỗi", data.message || "Không thể tạo tài khoản Admin!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo tài khoản Admin:", error);
      Alert.alert("Lỗi", "Không thể kết nối đến server!");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("user");

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Không thể đăng xuất!");
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <View style={{ flex: 1, padding: 15 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Trang chủ</Text>
      {players.length === 0 ? (
        <Text style={{ marginTop: 20, fontSize: 16, color: "gray" }}>
          Hiện tại không có người chơi nào
        </Text>
      ) : (
        <FlatList
          data={players}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 10 }}>
              <Text>{item.userName}</Text>
              <Button title="Xem chi tiết" onPress={() => handleViewPlayerDetails(item)} />
            </View>
          )}
        />
      )}
      <Button title="Tạo tài khoản Admin mới" onPress={() => setCreateAdminModalVisible(true)} />
      <Button title="Đăng xuất" onPress={handleLogout} color="red" />

      {/* Modal hiển thị thông tin chi tiết người chơi */}
      <Modal visible={playerDetailModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" }}>
            {selectedPlayer && (
              <>
                <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
                  Thông tin chi tiết người chơi
                </Text>
                <Text>Tên: {selectedPlayer.userName}</Text>
                <Text>Email: {selectedPlayer.email}</Text>
                <Text>Tuổi: {selectedPlayer.age}</Text>
                <Text>Giới tính: {selectedPlayer.gender}</Text>
                <Text>Vị trí: {selectedPlayer.location}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                  <Button title="Xóa" onPress={() => handleDeletePlayer(selectedPlayer.userId)} color="red" />
                  <Button title="Đóng" onPress={() => setPlayerDetailModalVisible(false)} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal tạo tài khoản Admin */}
      <Modal visible={createAdminModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, width: "80%" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>Tạo tài khoản Admin mới</Text>
            <TextInput
              placeholder="Tên người dùng"
              value={newAdmin.userName}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, userName: text })}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Email"
              value={newAdmin.email}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, email: text })}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Mật khẩu"
              value={newAdmin.password}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, password: text })}
              secureTextEntry
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Tuổi"
              value={newAdmin.age}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, age: text })}
              keyboardType="numeric"
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Giới tính"
              value={newAdmin.gender}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, gender: text })}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Avatar (URL, tùy chọn)"
              value={newAdmin.avatar}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, avatar: text })}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <TextInput
              placeholder="Vị trí"
              value={newAdmin.location}
              onChangeText={(text) => setNewAdmin({ ...newAdmin, location: text })}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Button title="Tạo" onPress={handleCreateAdmin} />
              <Button title="Hủy" onPress={() => setCreateAdminModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminScreen;
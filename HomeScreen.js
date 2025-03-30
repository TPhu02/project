import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecodeLib from "jwt-decode";
import { getPlayersBySport } from "../../Services/api"; 

export default function HomeScreen({ navigation }) {
  const [selectedSport, setSelectedSport] = useState(null);
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Kiểm tra token khi màn hình được tải
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); // Sửa key từ "token" thành "userToken"
        if (!token) {
          Alert.alert("Lỗi", "Vui lòng đăng nhập để tiếp tục!");
          navigation.navigate("LoginScreen"); // Đảm bảo tên màn hình khớp với navigation stack
          return;
        }

        // Kiểm tra token bằng jwtDecode
        const decodedToken = jwtDecodeLib.jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token hết hạn
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("user");
          await AsyncStorage.removeItem("role");
          Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại!");
          navigation.navigate("LoginScreen");
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra token:", error);
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem("role");
        Alert.alert("Lỗi", "Không thể xác thực phiên đăng nhập. Vui lòng đăng nhập lại!");
        navigation.navigate("LoginScreen");
      }
    };
    checkToken();
  }, [navigation]);

  // Danh sách các môn thể thao
  const sports = [
    { name: "Bóng đá", icon: "https://cdn-icons-png.flaticon.com/128/1165/1165187.png" },
    { name: "Bóng rổ", icon: "https://cdn-icons-png.flaticon.com/128/10466/10466111.png" },
    { name: "Tennis", icon: "https://cdn-icons-png.flaticon.com/128/523/523686.png" },
    { name: "Cầu lông", icon: "https://cdn-icons-png.flaticon.com/128/1633/1633893.png" },
    { name: "Bóng chuyền", icon: "https://cdn-icons-png.flaticon.com/128/8622/8622554.png" },
    { name: "Thể hình", icon: "https://cdn-icons-png.flaticon.com/128/18810/18810636.png" },
    { name: "Bơi lội", icon: "https://cdn-icons-png.flaticon.com/128/3144/3144982.png" },
  ];

  // Lấy danh sách người chơi theo môn thể thao
  const fetchPlayers = async (sport) => {
    setLoading(true);
    try {
      const data = await getPlayersBySport(sport);
      setPlayers(data);
      setFilteredPlayers(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người chơi:", error);
      Alert.alert("Lỗi", "Không thể tải danh sách người chơi.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn môn thể thao
  const handleSportSelection = async (sport) => {
    setSelectedSport(sport);
    setSearchKeyword("");
    setFilterGender("");
    setFilterLocation("");
    await fetchPlayers(sport);
  };

  // Tìm kiếm người chơi theo từ khóa
  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (!keyword) {
      setFilteredPlayers(players);
      return;
    }
    const filtered = players.filter((player) =>
      player.userName.toLowerCase().includes(keyword.toLowerCase()) ||
      player.location.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredPlayers(filtered);
  };

  // Lọc người chơi theo giới tính và vị trí
  const handleFilter = () => {
    let filtered = [...players];
    if (filterGender) {
      filtered = filtered.filter((player) => player.gender === filterGender);
    }
    if (filterLocation) {
      filtered = filtered.filter((player) =>
        player.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    setFilteredPlayers(filtered);
  };

  // Xem chi tiết người chơi và tương tác
  const renderPlayer = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("PlayerDetail", { playerId: item.userId })
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Image
          source={{ uri: item.avatar || "https://via.placeholder.com/50" }}
          style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }}
        />
        <View>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>{item.userName}</Text>
          <Text>Tuổi: {item.age} - Giới tính: {item.gender}</Text>
          <Text>Vị trí: {item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Danh sách môn thể thao */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 10,
          paddingHorizontal: 15,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderColor: "#ddd",
        }}
      >
        {sports.map((sport, index) => (
          <TouchableOpacity key={index} onPress={() => handleSportSelection(sport.name)}>
            <View style={{ alignItems: "center", marginHorizontal: 15 }}>
              <Image source={{ uri: sport.icon }} style={{ width: 50, height: 50 }} />
              <Text style={{ fontSize: 12, marginTop: 5 }}>{sport.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Thanh tìm kiếm */}
      <View style={{ padding: 15 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: "#ddd",
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            backgroundColor: "white",
          }}
          placeholder="Tìm kiếm người chơi..."
          value={searchKeyword}
          onChangeText={handleSearch}
        />
      </View>

      {/* Bộ lọc */}
      <View style={{ paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between" }}>
        <TextInput
          style={{ height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, width: "45%", backgroundColor: "white" }}
          placeholder="Giới tính (Nam/Nữ)"
          value={filterGender}
          onChangeText={setFilterGender}
          onBlur={handleFilter}
        />
        <TextInput
          style={{ height: 40, borderColor: "#ddd", borderWidth: 1, borderRadius: 5, paddingHorizontal: 10, width: "45%", backgroundColor: "white" }}
          placeholder="Vị trí"
          value={filterLocation}
          onChangeText={setFilterLocation}
          onBlur={handleFilter}
        />
      </View>

      {/* Danh sách người chơi */}
      {selectedSport && (
        <View style={{ flex: 1, marginTop: 15, paddingHorizontal: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
            Người chơi môn {selectedSport}:
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : filteredPlayers.length > 0 ? (
            <FlatList
              data={filteredPlayers}
              keyExtractor={(item) => item.userId.toString()}
              renderItem={renderPlayer}
            />
          ) : (
            <Text style={{ textAlign: "center" }}>
              {searchKeyword || filterGender || filterLocation
                ? "Không tìm thấy người chơi phù hợp."
                : "Không có người chơi nào đăng ký môn này."}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
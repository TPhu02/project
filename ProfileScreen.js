import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from "expo-image-picker";
import * as jwtDecodeLib from "jwt-decode";
import { logoutUser } from "../../Services/api";

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUser = async () => {
        try {
          const token = await AsyncStorage.getItem("userToken");
          if (!token) {
            setUser(null);
            setImage(null);
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("user");
            // navigation.navigate('LoginScreen');
            return;
          }

          // Kiểm tra token bằng jwtDecode
          let decodedToken;
          try {
            decodedToken = jwtDecodeLib.jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
              // Token hết hạn
              throw new Error("Token đã hết hạn");
            }
          } catch (error) {
            console.error("Lỗi khi giải mã token:", error);
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("user");
            setUser(null);
            setImage(null);
            Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại!", [
              { text: "OK", onPress: () => navigation.navigate('LoginScreen') }
            ]);
            return;
          }

          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) {
            let userData = JSON.parse(storedUser);
            setUser(userData);
            setImage(userData.avatar ? `http://192.168.1.4:5084/avatars/${userData.avatar}` : null);
          } else {
            setUser(null);
            setImage(null);
            await AsyncStorage.removeItem("userToken");
            navigation.navigate('LoginScreen');
          }
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu user:", error);
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("user");
          setUser(null);
          setImage(null);
          Alert.alert("Lỗi", "Không thể lấy dữ liệu người dùng. Vui lòng đăng nhập lại!", [
            { text: "OK", onPress: () => navigation.navigate('LoginScreen') }
          ]);
        }
      };
      fetchUser();
    }, [])
  );

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền bị từ chối", "Bạn cần cấp quyền để chọn ảnh!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("Người dùng đã hủy chọn ảnh.");
        return;
      }

      const newImageUri = result.assets[0].uri;
      setImage(newImageUri);

      const uploadedAvatarUrl = await uploadAvatar(newImageUri);
      if (uploadedAvatarUrl && user) {
        await updateAvatar(user.id, uploadedAvatarUrl);
      }
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh.");
    }
  };

  const uploadAvatar = async (imageUri) => {
    if (!imageUri) {
      Alert.alert("Lỗi", "Chưa có ảnh được chọn!");
      return null;
    }

    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return null;
      }

      let formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: imageUri.split('/').pop(),
        type: "image/jpeg",
      });

      let response = await fetch("http://192.168.1.4:5084/api/users/upload-avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        Alert.alert("Lỗi", `Server trả về mã lỗi ${response.status}`);
        return null;
      }

      const responseText = await response.text();
      if (!responseText) {
        Alert.alert("Lỗi", "Server không trả về dữ liệu!");
        return null;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Lỗi khi parse JSON:", parseError);
        Alert.alert("Lỗi", "Dữ liệu server không hợp lệ!");
        return null;
      }

      if (!data.avatarUrl) {
        Alert.alert("Lỗi", "Server không trả về URL ảnh!");
        return null;
      }

      setImage(data.avatarUrl);
      Alert.alert("Thành công", "Avatar đã được cập nhật!");
      return data.avatarUrl;
    } catch (error) {
      console.error("❌ Lỗi upload:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi upload ảnh!");
      return null;
    }
  };

  const updateAvatar = async (userId, avatarUrl) => {
    if (!userId || !avatarUrl) return;

    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        return;
      }

      let response = await fetch("http://192.168.1.4:5084/api/users/update-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          UserId: userId,
          AvatarUrl: avatarUrl,
        }),
      });

      if (response.status === 401) {
        Alert.alert("Phiên đăng nhập đã hết hạn", "Vui lòng đăng nhập lại!");
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("user");
        navigation.navigate("LoginScreen");
        return;
      }

      let data = await response.json();
      if (response.ok) {
        let updatedUser = { ...user, avatar: avatarUrl };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        Alert.alert("Thành công", "Avatar đã được cập nhật trong hồ sơ!");
      } else {
        Alert.alert("Lỗi", data.message || "Không thể cập nhật avatar!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: async () => {
            try {
              await logoutUser();
            } catch (error) {
              console.error("Lỗi khi gọi API đăng xuất:", error);
            } finally {
              await AsyncStorage.removeItem("userToken");
              await AsyncStorage.removeItem("user");
              await AsyncStorage.removeItem("role");
              await AsyncStorage.removeItem("rememberMe");
              await AsyncStorage.removeItem("savedEmail");
              await AsyncStorage.removeItem("savedPassword");
              // Đặt lại trạng thái để hiện giao diện chưa đăng nhập
              setUser(null);
              setImage(null);
              // navigation.reset({
              //   index: 0,
              //   routes: [{ name: "LoginScreen" }],
              // });
            }
          },
        },
      ]
    );
  };

  const handleNavigation = (screen) => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để sử dụng tính năng này!", [
        { text: "Đăng nhập", onPress: () => navigation.navigate('LoginScreen') },
        { text: "Đăng ký", onPress: () => navigation.navigate('Register') },
        { text: "Hủy", style: "cancel" }
      ]);
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={() => {
          console.log("Avatar được nhấn!");
          pickImage();
        }}>
          <Image
            source={{ uri: image || "https://via.placeholder.com/150" }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{user ? user.userName : "Chưa đăng nhập"}</Text>
        {user && <Text style={styles.details}>{user.age} tuổi - {user.gender}</Text>}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('EditProfile')}>
        <Text style={styles.buttonText}>Chỉnh sửa hồ sơ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('SportsList')}>
        <Text style={styles.buttonText}>Xem môn thể thao</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('AddSport')}>
        <Text style={styles.buttonText}>Thêm môn thể thao</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleNavigation('ActivityHistory')}>
        <Text style={styles.buttonText}>Xem lịch sử hoạt động</Text>
      </TouchableOpacity>

      {!user ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', alignItems: 'center', paddingTop: 50 },
  profileContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#007bff' },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  details: { fontSize: 14, color: '#6c757d' },
  button: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginVertical: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { backgroundColor: '#dc3545', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25, marginTop: 20, width: '80%', alignItems: 'center' },
});

export default ProfileScreen;
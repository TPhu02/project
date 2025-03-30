import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateProfile } from "../../Services/api";

const EditProfileScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    userName: "",
    age: "",
    gender: "",
    location: "",
  });
  const [userNameError, setUserNameError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lấy thông tin user từ AsyncStorage khi màn hình được load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setForm({
            userName: userData.userName || "",
            age: userData.age ? userData.age.toString() : "",
            gender: userData.gender || "",
            location: userData.location || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        Alert.alert("Lỗi", "Không thể tải thông tin hồ sơ!");
      }
    };
    fetchUser();
  }, []);

  // Hàm kiểm tra tuổi
  const isValidAge = (age) => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 100;
  };

  // Hàm kiểm tra giới tính
  const isValidGender = (gender) => {
    const validGenders = ["Male", "Female"];
    return validGenders.includes(gender);
  };

  // Hàm xử lý cập nhật hồ sơ
  const handleUpdateProfile = async () => {
    // Reset lỗi trước khi kiểm tra
    setUserNameError("");
    setAgeError("");
    setGenderError("");
    setLocationError("");

    let hasError = false;

    if (!form.userName) {
      setUserNameError("Vui lòng nhập tên đăng nhập!");
      hasError = true;
    }

    if (!form.age) {
      setAgeError("Vui lòng nhập tuổi!");
      hasError = true;
    } else if (!isValidAge(form.age)) {
      setAgeError("Tuổi phải là số và nằm trong khoảng từ 13 đến 100!");
      hasError = true;
    }

    if (!form.gender) {
      setGenderError("Vui lòng nhập giới tính!");
      hasError = true;
    } else if (!isValidGender(form.gender)) {
      setGenderError("Giới tính chỉ được là 'Male' hoặc 'Female'!");
      hasError = true;
    }

    if (!form.location) {
      setLocationError("Vui lòng nhập địa điểm!");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        Alert.alert("Lỗi", "Bạn chưa đăng nhập!");
        setIsLoading(false);
        return;
      }

      const response = await updateProfile({
        userName: form.userName,
        age: parseInt(form.age),
        gender: form.gender,
        location: form.location,
      });

      if (response.error) {
        Alert.alert("Lỗi", response.error);
        setIsLoading(false);
        return;
      }

      // Cập nhật thông tin user trong AsyncStorage
      const updatedUser = {
        ...JSON.parse(await AsyncStorage.getItem("user")),
        userName: form.userName,
        age: parseInt(form.age),
        gender: form.gender,
        location: form.location,
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Thành công", "Hồ sơ đã được cập nhật!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={form.userName}
          onChangeText={(text) => setForm({ ...form, userName: text })}
        />
        {userNameError ? <Text style={styles.errorText}>{userNameError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tuổi"
          keyboardType="numeric"
          value={form.age}
          onChangeText={(text) => setForm({ ...form, age: text })}
        />
        {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Giới tính (Male/Female)"
          value={form.gender}
          onChangeText={(text) => setForm({ ...form, gender: text })}
        />
        {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Địa điểm"
          value={form.location}
          onChangeText={(text) => setForm({ ...form, location: text })}
        />
        {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleUpdateProfile}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Lưu</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { width: "90%", marginBottom: 10 },
  input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10 },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "90%", alignItems: "center" },
  buttonDisabled: { backgroundColor: "#a0c4ff" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backText: { marginTop: 10, color: "#007bff" },
});

export default EditProfileScreen;
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { registerUser } from "../../Services/api";

const RegisterScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    location: "",
  });
  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Thêm nút "Quay lại" trên header
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.headerLeftButton}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.headerLeftText}>Quay lại</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  const isValidAge = (age) => {
    const ageNum = parseInt(age, 10);
    return !isNaN(ageNum) && ageNum >= 13 && ageNum <= 100;
  };

  const isValidGender = (gender) => {
    const validGenders = ["Male", "Female"];
    return validGenders.includes(gender);
  };

  const handleRegister = async () => {
    setUserNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setAgeError("");
    setGenderError("");
    setLocationError("");

    let hasError = false;

    if (!form.userName) {
      setUserNameError("Vui lòng nhập tên đăng nhập!");
      hasError = true;
    }

    if (!form.email) {
      setEmailError("Vui lòng nhập email!");
      hasError = true;
    } else if (!isValidEmail(form.email)) {
      setEmailError("Email không hợp lệ! Vui lòng nhập đúng định dạng email.");
      hasError = true;
    }

    if (!form.password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      hasError = true;
    } else if (!isValidPassword(form.password)) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự!");
      hasError = true;
    }

    if (!form.confirmPassword) {
      setConfirmPasswordError("Vui lòng nhập xác nhận mật khẩu!");
      hasError = true;
    } else if (form.password !== form.confirmPassword) {
      setConfirmPasswordError("Mật khẩu và xác nhận mật khẩu không khớp!");
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
      const response = await registerUser(form);
      if (response.error) {
        if (response.error.includes("Email đã tồn tại")) {
          Alert.alert("Lỗi", "Email đã tồn tại! Vui lòng sử dụng email khác.");
        } else {
          Alert.alert("Lỗi", response.error);
        }
        setIsLoading(false);
        return;
      }

      Alert.alert("Thông báo", response.message);
      setIsLoading(false);
      if (response.message === "Đăng ký thành công!") {
        navigation.navigate("LoginScreen");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>

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
          placeholder="Email"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.showPasswordText}>{showPassword ? "Ẩn" : "Hiện"}</Text>
          </TouchableOpacity>
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Xác nhận mật khẩu"
            secureTextEntry={!showConfirmPassword}
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.showPasswordText}>{showConfirmPassword ? "Ẩn" : "Hiện"}</Text>
          </TouchableOpacity>
        </View>
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
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
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  inputContainer: { width: "90%", marginBottom: 10 },
  input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10 },
  passwordContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10 },
  inputPassword: { flex: 1, height: 50, paddingHorizontal: 10 },
  showPasswordButton: { padding: 10 },
  showPasswordText: { color: "#007bff", fontSize: 14 },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "90%", alignItems: "center" },
  buttonDisabled: { backgroundColor: "#a0c4ff" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loginText: { marginTop: 10, color: "#007bff" },
  headerLeftButton: { paddingLeft: 10 },
  headerLeftText: { color: "#007bff", fontSize: 16 },
});

export default RegisterScreen;
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecodeLib from "jwt-decode";
import { loginUser } from "../../Services/api";

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkRememberMe = async () => {
      try {
        const rememberMeStatus = await AsyncStorage.getItem("rememberMe");
        if (rememberMeStatus === "true") {
          const savedEmail = await AsyncStorage.getItem("savedEmail");
          const savedPassword = await AsyncStorage.getItem("savedPassword");
          if (savedEmail && savedPassword) {
            setForm({ email: savedEmail, password: savedPassword });
            setRememberMe(true);
            handleLogin(savedEmail, savedPassword);
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái Ghi nhớ tôi:", error);
      }
    };
    checkRememberMe();
  }, []);

  const isValidEmail = (email) => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(trimmedEmail);
  };

  const handleLogin = async (email = form.email, password = form.password) => {
    console.log("Bắt đầu handleLogin"); // Debug

    setEmailError("");
    setPasswordError("");

    const trimmedEmail = email.trim();
    console.log("Email:", trimmedEmail); // Debug
    console.log("Password:", password); // Debug

    let hasError = false;
    if (!trimmedEmail) {
      setEmailError("Vui lòng nhập email!");
      hasError = true;
    } else if (!isValidEmail(trimmedEmail)) {
      setEmailError("Email không hợp lệ! Vui lòng nhập đúng định dạng email.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu!");
      hasError = true;
    }

    console.log("hasError:", hasError); // Debug
    if (hasError) return;

    setIsLoading(true);
    console.log("isLoading:", true); // Debug

    try {
      const result = await loginUser(trimmedEmail, password);
      console.log("Kết quả từ loginUser:", result); // Debug

      if (!result) {
        Alert.alert("Lỗi", "Không nhận được phản hồi từ server. Vui lòng thử lại!");
        setIsLoading(false);
        return;
      }

      if (result.error) {
        let errorMessage = "Đăng nhập thất bại!";
        if (result.error.includes("Email hoặc mật khẩu không đúng")) {
          errorMessage = "Email hoặc mật khẩu không đúng!";
        } else if (result.error.includes("Không thể kết nối đến server")) {
          errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!";
        } else if (result.error.includes("Lỗi từ server")) {
          errorMessage = `Lỗi từ server: ${result.error.split(":")[1]?.trim() || result.error}`;
        }
        Alert.alert("Lỗi", errorMessage);
        setIsLoading(false);
        return;
      }

      // Lưu token
      await AsyncStorage.setItem("userToken", result.token);

      // Giải mã token
      let decodedToken;
      try {
        decodedToken = jwtDecodeLib.jwtDecode(result.token);
      } catch (decodeError) {
        console.error("❌ Lỗi giải mã token:", decodeError);
        Alert.alert("Lỗi", "Không thể giải mã token!");
        setIsLoading(false);
        return;
      }

      const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "User";
      await AsyncStorage.setItem("role", role);

      if (result.user) {
        await AsyncStorage.setItem("user", JSON.stringify(result.user));
      }

      if (rememberMe) {
        await AsyncStorage.setItem("rememberMe", "true");
        await AsyncStorage.setItem("savedEmail", trimmedEmail);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("rememberMe");
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }

      Alert.alert("Thành công", "Đăng nhập thành công!");
      setIsLoading(false);

      if (role === "Admin") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Profile", params: { screen: "Admin" } }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Profile" }],
        });
      }
    } catch (error) {
      console.error("❌ Lỗi đăng nhập trong handleLogin:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

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

      <View style={styles.checkboxContainer}>
        <Switch
          value={rememberMe}
          onValueChange={(newValue) => setRememberMe(newValue)}
          trackColor={{ false: "#6c757d", true: "#007bff" }}
          thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
        />
        <Text style={styles.checkboxLabel}>Ghi nhớ tôi</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={() => {
          console.log("Nút Đăng nhập được nhấn"); // Debug
          handleLogin();
        }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
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
  registerText: { marginTop: 10, color: "#007bff" },
  forgotPasswordText: { marginTop: 10, color: "#007bff" },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, width: "90%" },
  checkboxLabel: { marginLeft: 8, fontSize: 16, color: "#6c757d" },
});

export default LoginScreen;
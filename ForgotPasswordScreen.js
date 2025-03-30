import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { forgotPassword } from "../../Services/api"; // Import API forgotPassword

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email!");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ! Vui lòng nhập đúng định dạng email.");
      return;
    }

    try {
      const response = await forgotPassword(email);
      if (response.error) {
        Alert.alert("Lỗi", response.error);
        return;
      }

      Alert.alert("Thành công", response.message, [
        { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
      ]);
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu khôi phục mật khẩu:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khôi phục mật khẩu</Text>

      <Text style={styles.instruction}>
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Gửi yêu cầu</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.backText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  instruction: { fontSize: 16, color: "#6c757d", marginBottom: 20, textAlign: "center" },
  input: { width: "90%", height: 50, borderWidth: 1, borderRadius: 10, marginBottom: 10, paddingHorizontal: 10 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 10, width: "90%", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  backText: { marginTop: 10, color: "#007bff" },
});

export default ForgotPasswordScreen;
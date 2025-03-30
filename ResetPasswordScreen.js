import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";

const ResetPasswordScreen = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = () => {
    // Không triển khai logic, chỉ hiển thị thông báo giả lập
    if (!newPassword || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    Alert.alert("Thông báo", "Chức năng đặt lại mật khẩu chưa được triển khai!", [
      { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      <Text style={styles.instruction}>
        Nhập mật khẩu mới để đặt lại mật khẩu của bạn.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu mới"
        secureTextEntry
        value={newPassword}
        onChangeText={(text) => setNewPassword(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
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

export default ResetPasswordScreen;
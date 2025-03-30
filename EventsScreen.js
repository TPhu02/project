import { View, Text, Button } from "react-native";

export default function EventsScreen({ navigation }) {
  return (
    <View>
      <Text>Trang cá nhân</Text>
      <Button title="Quay lại" onPress={() => navigation.goBack()} />
    </View>
  );
}
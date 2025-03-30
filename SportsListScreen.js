import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getSportsList } from "../../Services/api";

const SportsListScreen = ({ navigation }) => {
  const [sportsList, setSportsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy danh sách môn thể thao khi màn hình được load
  useEffect(() => {
    const fetchSportsList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getSportsList();
        if (response.error) {
          setError(response.error);
          setSportsList([]);
        } else {
          setSportsList(response);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách môn thể thao:", error);
        setError("Có lỗi xảy ra khi tải danh sách môn thể thao!");
        setSportsList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSportsList();
  }, []);

  // Hiển thị mỗi môn thể thao trong danh sách
  const renderSportItem = ({ item }) => (
    <View style={styles.sportItem}>
      <Text style={styles.sportName}>{item.name}</Text>
      {item.description && <Text style={styles.sportDescription}>{item.description}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách môn thể thao</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : sportsList.length === 0 ? (
        <Text style={styles.emptyText}>Không có môn thể thao nào!</Text>
      ) : (
        <FlatList
          data={sportsList}
          renderItem={renderSportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  listContainer: { paddingBottom: 20 },
  sportItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sportName: { fontSize: 18, fontWeight: "bold", color: "#007bff" },
  sportDescription: { fontSize: 14, color: "#6c757d", marginTop: 5 },
  loading: { marginVertical: 20 },
  errorText: { fontSize: 16, color: "red", textAlign: "center", marginVertical: 20 },
  emptyText: { fontSize: 16, color: "#6c757d", textAlign: "center", marginVertical: 20 },
  backText: { fontSize: 16, color: "#007bff", textAlign: "center", marginTop: 20 },
});

export default SportsListScreen;
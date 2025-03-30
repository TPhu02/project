import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MatchesScreen from "./MatchesScreen";

const Tab = createMaterialTopTabNavigator();

const ExploreScreen = ({ navigation }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterSport, setFilterSport] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [filters, setFilters] = useState(null);

  const handleSearch = () => {
    console.log("Tìm kiếm:", searchKeyword);
  };

  const handleFilter = () => {
    const newFilters = {
      sport: filterSport,
      location: filterLocation,
      time: filterTime,
    };
    setFilters(newFilters);
    console.log("Lọc:", newFilters);
  };

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm trận đấu (VD: Bóng rổ Hà Nội)"
        value={searchKeyword}
        onChangeText={setSearchKeyword}
        onSubmitEditing={handleSearch}
      />

      {/* Nút lọc nâng cao */}
      <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(!showFilter)}>
        <Text style={styles.filterButtonText}>Lọc nâng cao</Text>
      </TouchableOpacity>

      {/* Giao diện lọc nâng cao */}
      {showFilter && (
        <View style={styles.filterContainer}>
          <TextInput
            style={styles.filterInput}
            placeholder="Môn thể thao (VD: Bóng rổ)"
            value={filterSport}
            onChangeText={setFilterSport}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Địa điểm (VD: Hà Nội)"
            value={filterLocation}
            onChangeText={setFilterLocation}
          />
          <TextInput
            style={styles.filterInput}
            placeholder="Thời gian (VD: 2025-03-25)"
            value={filterTime}
            onChangeText={setFilterTime}
          />
          <TouchableOpacity style={styles.applyFilterButton} onPress={handleFilter}>
            <Text style={styles.applyFilterButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab con */}
      <Tab.Navigator>
        <Tab.Screen
          name="Trận đấu thường ngày"
          children={() => (
            <MatchesScreen
              matchType="daily"
              navigation={navigation}
              searchKeyword={searchKeyword}
              filters={filters}
            />
          )}
        />
        <Tab.Screen
          name="Đấu giải"
          children={() => (
            <MatchesScreen
              matchType="tournament"
              navigation={navigation}
              searchKeyword={searchKeyword}
              filters={filters}
            />
          )}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  searchInput: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, margin: 10 },
  filterButton: { backgroundColor: "#007bff", padding: 10, borderRadius: 5, margin: 10, alignItems: "center" },
  filterButtonText: { color: "#fff", fontWeight: "bold" },
  filterContainer: { padding: 10, backgroundColor: "#fff", borderRadius: 5, margin: 10 },
  filterInput: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10 },
  applyFilterButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, alignItems: "center" },
  applyFilterButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ExploreScreen;
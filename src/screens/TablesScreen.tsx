import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { tablesApi } from "../api";
import { Header, Loading } from "../components";

export default function TablesScreen() {
  const nav: any = useNavigation();
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [releasingTable, setReleasingTable] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true, suppressErrors = false) => {
    try {
      if (showLoading) setLoading(true);

      // We use tablesApi.all() instead of active() to get BOTH free and occupied tables
      const data: any = await tablesApi.all();

      // Handle different possible response structures
      const list = Array.isArray(data) ? data : data?.tables || [];
      setTables(list);
    } catch (e: any) {
      if (!suppressErrors) Alert.alert("Tables Error", e.message || "Failed to load tables.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load(false, true);
    const interval = setInterval(() => load(false, true), 30000);
    return () => clearInterval(interval);
  }, [load]));

  const confirmRelease = (tableId: string, tableLabel: string) => {
    Alert.alert("Release Table", `Release Table ${tableLabel}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Release",
        style: "destructive",
        onPress: async () => {
          setReleasingTable(tableId);
          try {
            await tablesApi.release(tableId);
            await load(false);
            Alert.alert("Released", `Table ${tableLabel} is now free.`);
          } catch (e: any) {
            Alert.alert("Release Error", e.message || "Failed to release table.");
          } finally {
            setReleasingTable(null);
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.screen}>
        <Header subtitle="Table management" />
        <Loading />
      </View>
    );
  }

  const freeTables = tables.filter(t => t.status !== "occupied").length;
  const occupiedTables = tables.length - freeTables;

  return (
    <View style={styles.screen}>
      <Header subtitle={`${occupiedTables} Occupied • ${freeTables} Free`} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(false); }} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <Text style={styles.heading}>All Tables</Text>
        <Text style={styles.subtext}>Manage all restaurant tables</Text>

        {tables.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="grid-outline" size={48} color="#C0C8D8" />
            <Text style={styles.emptyTitle}>No tables found</Text>
            <Text style={styles.emptyText}>Create some tables in the system first.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {tables.map((t: any, index: number) => {
              const tid = t.table_id || t._id || `t${index}`;
              const tNum = t.table_number || t.table_no || tid;
              const tableId = String(t.table_id || t._id || tNum);
              const isOccupied = t.status === "occupied";
              const occupiedTime = t.occupied_at
                ? new Date(t.occupied_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : null;

              return (
                <View key={tid} style={[styles.card, !isOccupied && styles.cardDisabled]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!isOccupied}
                    onPress={() => nav.navigate("ViewTable", { table: t })}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconWrap, { backgroundColor: isOccupied ? "#FEE2E2" : "#E8FBF5" }]}>
                        <Ionicons name="grid" size={20} color={isOccupied ? "#991B1B" : colors.teal} />
                      </View>
                      <View style={[styles.badge, { backgroundColor: isOccupied ? "#FEE2E2" : "#E8FBF5" }]}>
                        <Text style={[styles.badgeText, { color: isOccupied ? "#991B1B" : "#065F46" }]}>
                          {isOccupied ? "Occupied" : "Free"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.tableNum}>Table {tNum}</Text>

                    <View style={styles.metaRow}>
                      <Ionicons name="people-outline" size={14} color="#7B879A" />
                      <Text style={styles.metaText}>Capacity: {t.capacity || "—"}</Text>
                    </View>

                    {isOccupied && occupiedTime && (
                      <View style={styles.metaRow}>
                        <Ionicons name="time-outline" size={14} color="#7B879A" />
                        <Text style={styles.metaText}>Since {occupiedTime}</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {isOccupied && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      disabled={releasingTable === tableId}
                      style={[styles.releaseButton, releasingTable === tableId && styles.releaseButtonDisabled]}
                      onPress={() => confirmRelease(tableId, String(tNum))}
                    >
                      <Ionicons name="log-out-outline" size={16} color="#fff" />
                      <Text style={styles.releaseButtonText}>
                        {releasingTable === tableId ? "Releasing..." : "Release Table"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  heading: { fontSize: 22, fontWeight: "900", color: "#1A2233", marginBottom: 2 },
  subtext: { fontSize: 13, color: "#7B879A", marginBottom: 18 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E7ECF4",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: { backgroundColor: "#F3F5F8" },
  releaseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.red,
  },
  releaseButtonDisabled: { opacity: 0.6 },
  releaseButtonText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableNum: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1A2233",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#7B879A",
    marginLeft: 6,
    fontWeight: "500",
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E7ECF4",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A2233",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#7B879A",
    marginTop: 6,
  },
});

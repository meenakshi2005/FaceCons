import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { GuestAvatar } from "../components";

export default function ViewTableScreen() {
  const route: any = useRoute();
  const table = route.params?.table;
  const guests = Array.isArray(table?.guests) ? table.guests : [];
  const occupiedAt = table?.occupied_at
    ? new Date(table.occupied_at).toLocaleString()
    : "—";

  if (!table) {
    return (
      <View style={styles.screen}>
        <Text style={styles.emptyTitle}>Table details unavailable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="grid" size={24} color={colors.teal} />
        </View>
        <Text style={styles.title}>Table {table.table_number || "—"}</Text>
        <Text style={styles.tableId}>{table.table_id || ""}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{table.status || "Occupied"}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Capacity</Text>
          <Text style={styles.detailValue}>{table.capacity ?? "—"}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Seated</Text>
          <Text style={styles.detailValue}>{table.seated_count ?? guests.length}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Occupied since</Text>
          <Text style={styles.detailValue}>{occupiedAt}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Guests ({guests.length})</Text>
      {guests.length ? guests.map((guest: any) => (
        <View key={guest.guest_id} style={styles.guestRow}>
          <GuestAvatar guest={guest} size={52} />
          <View style={styles.guestInfo}>
            <Text style={styles.guestName}>{guest.name || "Unnamed guest"}</Text>
            <Text style={styles.guestId}>{guest.guest_id}</Text>
          </View>
        </View>
      )) : (
        <Text style={styles.noGuests}>No guests are listed for this table.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  hero: { backgroundColor: colors.primary, borderRadius: 18, padding: 20, alignItems: "flex-start" },
  heroIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#E8FBF5", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900" },
  tableId: { color: "#D8E1EE", marginTop: 4 },
  statusBadge: { backgroundColor: "#FEE2E2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginTop: 12 },
  statusText: { color: "#991B1B", fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  details: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 14 },
  detailItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 },
  detailLabel: { color: "#7B879A", fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: "700", textAlign: "right", flexShrink: 1, marginLeft: 16 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 22, marginBottom: 8 },
  guestRow: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginTop: 8, flexDirection: "row", alignItems: "center" },
  guestInfo: { marginLeft: 12, flex: 1 },
  guestName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  guestId: { color: "#7B879A", fontSize: 13, marginTop: 3 },
  noGuests: { color: "#7B879A", fontSize: 14, paddingVertical: 12 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "700", margin: 20 },
});
import React, { useEffect, useState, useRef } from "react";
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";
import { tablesApi } from "../api";
import { GuestAvatar, Header, Loading } from "../components";

export default function TableScreen() {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const guest = route.params?.guest;
  const initial = route.params?.table || "";

  const [table, setTable] = useState(initial || "");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(!!initial);

  // Scanner state
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(!initial);
  const scannedRef = useRef(false);

  const load = async (t = table) => {
    if (!t) { setLoading(false); return; }
    try {
      setLoading(true);
      setData(await tablesApi.current(t));
      setTable(t);
    } catch (e: any) {
      Alert.alert("Table Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) load(initial);
  }, []);

  const handleBarCodeScanned = async ({ data: qrData }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setLoading(true);

    try {
      // 1. Scan Occupancy
      const scanRes: any = await tablesApi.scanOccupancy(qrData, guest ? { guestId: guest.guest_id, guest_id: guest.guest_id } : {});
      const tableNo = scanRes?.table_no || scanRes?.table?.table_number || scanRes?.table?.table_id;

      if (!tableNo) throw new Error("Could not determine table number from QR.");

      // 2. Engage (Seat the guest)
      if (guest) {
        try {
          await tablesApi.engage(tableNo, { guest_ids: [guest.guest_id] });
        } catch (engageErr) {
          console.log("Engage error (might be already seated by scanOccupancy):", engageErr);
        }
      }

      setScanning(false);
      Alert.alert("Success", `Table ${tableNo} marked occupied${guest ? " and guest seated." : "."}`);

      // 3. Load table data
      await load(tableNo);
    } catch (e: any) {
      Alert.alert("Limit exceeded", e.message || "Failed to process QR code.");
      setTimeout(() => { scannedRef.current = false; }, 2000); // Allow retry after 2s
      setLoading(false);
    }
  };

  const seat = async () => {
    if (!table || !guest) return;
    try {
      await tablesApi.engage(table, { guest_ids: [guest.guest_id] });
      load();
      Alert.alert("Success", "Guest seated.");
    } catch (e: any) {
      Alert.alert("Seat", e.message);
    }
  };

  const release = async () => {
    try {
      await tablesApi.release(table, guest ? { guest_ids: [guest.guest_id] } : {});
      load();
      Alert.alert("Released", "Table visit closed.");
    } catch (e: any) {
      Alert.alert("Release", e.message);
    }
  };

  if (scanning) {
    if (!permission) return <Loading text="Requesting camera..." />;
    if (!permission.granted) {
      return (
        <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ textAlign: "center", marginBottom: 20 }}>Camera permission is required.</Text>
          <TouchableOpacity onPress={requestPermission} style={s.primary}>
            <Text style={s.primaryText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={s.screen}>
        <Header title="Scan Table QR" onBack={() => navigation.goBack()} />
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scannedRef.current ? undefined : handleBarCodeScanned}
        />
        <View style={s.scanOverlay}>
          <View style={s.scanFrame}>
            <View style={[s.scanCorner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[s.scanCorner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
            <View style={[s.scanCorner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
            <View style={[s.scanCorner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
            {loading && <ActivityIndicator size="large" color={colors.teal} style={{ position: "absolute" }} />}
          </View>
          <Text style={s.scanHint}>Point camera at the table's QR code</Text>
        </View>
      </View>
    );
  }

  if (loading && !data) return <Loading text="Loading table..." />;

  return (
    <View style={s.screen}>
      {/* <Header title={`Table ${table || "—"}`} subtitle={guest ? `Seating ${guest.name || "Guest"}` : ""} onBack={() => navigation.goBack()} /> */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.hero}>
          <Text style={s.title}>Tables {table || "—"}</Text>
          <Text style={s.muted}>{data?.seated || 0} seated • ₹{data?.table_total || 0} total</Text>
        </View>

        {guest && !data?.guests?.some((g: any) => g.guest_id === guest.guest_id) && (
          <TouchableOpacity onPress={seat} style={s.primary}>
            <Text style={s.primaryText}>Seat {guest.name || guest.guest_id} here</Text>
          </TouchableOpacity>
        )}

        {(data?.guests || []).map((g: any) => (
          <View style={s.guest} key={g.guest_id}>
            <GuestAvatar guest={g} size={66} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.name}>{g.name || "Unnamed guest"}</Text>
              <Text style={s.muted}>{g.guest_id}</Text>
              <Text style={s.amount}>₹{g.guest_total || 0}</Text>
            </View>
          </View>
        ))}

        {data?.guests?.length > 0 && (
          <TouchableOpacity onPress={release} style={s.release}>
            <Text style={s.releaseText}>Release Table / Close Visit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { backgroundColor: colors.primary, borderRadius: 22, padding: 20 },
  title: { color: "#fff", fontSize: 28, fontWeight: "900" },
  muted: { color: "#7B879A", marginTop: 4 },
  primary: { backgroundColor: colors.teal, padding: 15, borderRadius: 14, marginVertical: 14, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "900" },
  guest: { backgroundColor: "#fff", borderRadius: 18, padding: 15, marginTop: 12, flexDirection: "row", alignItems: "center" },
  name: { fontSize: 18, fontWeight: "900", color: colors.text },
  amount: { fontSize: 16, fontWeight: "900", color: colors.teal, marginTop: 5 },
  release: { marginTop: 15, borderRadius: 14, padding: 15, alignItems: "center", backgroundColor: colors.red },
  releaseText: { color: "#fff", fontWeight: "900" },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  scanFrame: { width: 230, height: 230, alignItems: "center", justifyContent: "center", position: "relative" },
  scanCorner: { position: "absolute", width: 36, height: 36, borderColor: colors.teal } as any,
  scanHint: { color: "rgba(255,255,255,.8)", fontSize: 14, marginTop: 32, fontWeight: "600", textAlign: "center", paddingHorizontal: 40 },
});

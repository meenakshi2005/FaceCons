import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";
import { employeesApi } from "../api";
import { Loading } from "../components";

export default function EmployeesScreen() {
    const [employees, setEmployees] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [name, setName] = useState("");
    const load = async () => { try { setLoading(true); const d: any = await employeesApi.list(); setEmployees(d.employees || d || []) } catch (e: any) { Alert.alert("Employees", e.message) } finally { setLoading(false) } };
    useEffect(() => { load() }, []);
    const add = async () => { if (!name.trim()) return Alert.alert("Validation", "Enter employee name."); Alert.alert("Photo required", "API requires an employee photo. Use the JSON/photo upload flow from your backend client to register a real employee."); };
    const remove = async (id: string) => { Alert.alert("Delete", "Remove employee?", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: async () => { try { await employeesApi.remove(id); load() } catch (e: any) { Alert.alert("Delete", e.message) } } }]) };
    if (loading) return <Loading text="Loading employees..." />;
    return <ScrollView style={s.screen} contentContainerStyle={{ padding: 16 }}>
        <Text style={s.title}>Employees</Text><Text style={s.muted}>Registered staff are ignored by the guest scanner.</Text>
        <View style={s.add}><TextInput value={name} onChangeText={setName} placeholder="Employee name" style={s.input} /><TouchableOpacity style={s.btn} onPress={add}><Text style={s.btnText}>Add</Text></TouchableOpacity></View>
        {employees.map((e: any) => <View style={s.card} key={e.employee_id || e._id}><View style={s.avatar}><Text>👤</Text></View><View style={{ flex: 1 }}><Text style={s.name}>{e.name || "Unnamed"}</Text><Text style={s.muted}>{e.employee_id || e._id}</Text></View><TouchableOpacity onPress={() => remove(e.employee_id || e._id)}><Text style={s.delete}>Delete</Text></TouchableOpacity></View>)}
    </ScrollView>
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg }, title: { fontSize: 28, fontWeight: "900", color: colors.text, paddingTop:40 }, muted: { fontSize: 13, color: colors.muted, marginTop: 5 }, add: { backgroundColor: "#fff", borderRadius: 18, padding: 12, marginTop: 15, flexDirection: "row", gap: 8 }, input: { flex: 1, height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12 }, btn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" }, btnText: { color: "#fff", fontWeight: "900" }, card: { backgroundColor: "#fff", borderRadius: 18, padding: 14, marginTop: 10, flexDirection: "row", alignItems: "center" }, avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: "#EDF0F5", alignItems: "center", justifyContent: "center" }, name: { fontSize: 16, fontWeight: "900", color: colors.text }, delete: { color: colors.red, fontWeight: "800" } });

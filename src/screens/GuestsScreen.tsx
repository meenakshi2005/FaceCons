import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import {colors} from "../theme";
import {guestsApi, scannerApi} from "../api";
import {Guest} from "../types";
import {ActionButton, GuestAvatar, Header, Loading, StatusPill} from "../components";

type ModalType = "manual"|"details"|"otp"|"merge"|null;
type GuestTab = "all"|"opted_in"|"opted_out"|"pending";

const guestTabs: {value: GuestTab; label: string}[] = [
  {value: "all", label: "All"},
  {value: "opted_in", label: "Opt In"},
  {value: "opted_out", label: "Opt Out"},
  {value: "pending", label: "Pending"},
];

export default function GuestsScreen() {
  const navigation:any = useNavigation();
  const [guests,setGuests] = useState<Guest[]>([]);
  const [tab,setTab] = useState<GuestTab>("all");
  const [query,setQuery] = useState("");
  const [refreshing,setRefreshing] = useState(false);
  const [loading,setLoading] = useState(true);
  const [modal,setModal] = useState<ModalType>(null);
  const [selected,setSelected] = useState<Guest|null>(null);
  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [otp,setOtp] = useState("");
  const [existingId,setExistingId] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data:any = await guestsApi.list();
      setGuests(data.guests || data || []);
    } catch(e:any) { Alert.alert("API Error", e.message); }
    finally {setLoading(false); setRefreshing(false);}
  },[]);

  useEffect(()=>{load()},[load]);

  const filtered = useMemo(() => {
    const q=query.trim().toLowerCase();
    const byStatus = tab === "all" ? guests : guests.filter(g => g.consent_status === tab);
    if(!q) return byStatus;
    return byStatus.filter(g => `${g.name||""} ${g.guest_id||""} ${g.phone||""}`.toLowerCase().includes(q));
  },[guests,query,tab]);

  const guestCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: guests.length,
      opted_in: 0,
      opted_out: 0,
      pending: 0,
    };
    guests.forEach(g => {
      if (counts[g.consent_status] !== undefined) {
        counts[g.consent_status]++;
      }
    });
    return counts;
  }, [guests]);

  const openManual=()=>{setName("");setPhone("");setModal("manual")};

  const submitManual=async()=>{
    if(!name.trim() || phone.length !== 10) return Alert.alert("Validation","Enter name and valid 10-digit phone.");
    try { await guestsApi.manual(name.trim(),phone); setModal(null); load(); }
    catch(e:any){ Alert.alert("Create Guest",e.message); }
  };

  const sendOtp=async()=>{
    if(!selected) return;
    try {
      const res:any=await guestsApi.optIn(selected.guest_id!, {
        ...(phone ? {phone}:{ }),
        ...(name ? {name}:{ })
      });
      setModal("otp");
      Alert.alert("OTP Sent", res?.otp_for_testing ? `Testing OTP: ${res.otp_for_testing}` : "OTP sent to guest.");
    } catch(e:any){Alert.alert("Opt In",e.message)}
  };

  const verify=async()=>{
    if(!selected || otp.length < 4) return;
    try {await guestsApi.verifyOtp(selected.guest_id!,otp);setModal(null);setOtp("");load();Alert.alert("Success","Consent confirmed.");}
    catch(e:any){Alert.alert("Verify OTP",e.message)}
  };

  const optOut=async(g:Guest)=>{
    Alert.alert("Opt Out","Delete this guest photo and face data?",[
      {text:"Cancel",style:"cancel"},
      {text:"Opt Out",style:"destructive",onPress:async()=>{try{await guestsApi.optOut(g.guest_id!);load()}catch(e:any){Alert.alert("Error",e.message)}}}
    ])
  };

  const addDetails=async()=>{
    if(!selected) return;
    if(!name.trim() || phone.length!==10) return Alert.alert("Validation","Enter name and valid phone.");
    try {await guestsApi.addDetails(selected.guest_id!,{name:name.trim(),phone});setModal(null);load();}
    catch(e:any){Alert.alert("Save details",e.message)}
  };

  const merge=async()=>{
    if(!selected || !existingId.trim()) return;
    try {await guestsApi.merge(selected.guest_id!,existingId.trim());setModal(null);load();Alert.alert("Merged","Duplicate guest merged successfully.");}
    catch(e:any){Alert.alert("Merge",e.message)}
  };

  const card=(g:Guest,index:number)=>{
    const id=g.guest_id || g._id || `guest-${index}`;
    return <View style={styles.card} key={id}>
      <View style={styles.row}>
        <GuestAvatar guest={g} size={82}/>
        <View style={{flex:1,marginLeft:14}}>
          <Text style={styles.name}>{g.name || "Unnamed guest"}</Text>
          <Text style={styles.meta}>📱 {g.phone || "No phone"}</Text>
          <Text style={styles.meta}>◷ {g.arrived_at ? new Date(g.arrived_at).toLocaleString() : g.created_at ? new Date(g.created_at).toLocaleString() : "Date not available"}</Text>
          <StatusPill status={g.consent_status}/>
        </View>
        <Text style={styles.id}>#{id}</Text>
      </View>
      <View style={styles.divider}/>
      <View style={styles.actionsRow}>
        <ActionButton label="Opt In" icon="checkmark" color={colors.green} onPress={()=>{setSelected(g);setName(g.name||"");setPhone(g.phone||"");setModal("details")}}/>
        <ActionButton label="Opt Out" icon="ban" color={colors.red} onPress={()=>optOut(g)}/>
        <ActionButton label="History" icon="time-outline" color={colors.primary} outline onPress={()=>navigation.navigate("GuestHistory",{guest:g})}/>
      </View>
      <View style={[styles.actionsRow,{marginTop:8}]}>
        <ActionButton label="Merge" icon="git-merge-outline" color={colors.purple} onPress={()=>{setSelected(g);setExistingId("");setModal("merge")}}/>
        <ActionButton label="Table" icon="grid-outline" color={colors.teal} onPress={()=>navigation.navigate("TableDetails",{guest:g})}/>
      </View>
    </View>
  };

  return <View style={styles.screen}>
    <Header subtitle={`Synced • ${guests.length} guests`} right={
      <TouchableOpacity onPress={async()=>{try{const r:any=await scannerApi.run();Alert.alert("Scanner",r.message||"Scan completed");load()}catch(e:any){Alert.alert("Scan",e.message)}}} style={styles.sync}><Ionicons name="refresh" size={20} color="#fff"/></TouchableOpacity>
    }/>
    <View style={styles.content}>
      <View style={styles.search}><Ionicons name="search" size={22} color="#8D96A6"/><TextInput value={query} onChangeText={setQuery} placeholder="Search guest by name or ID..." placeholderTextColor="#9AA3B2" style={styles.searchInput}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {guestTabs.map(({value,label})=>{
          const active=tab===value;
          const count=guestCounts[value];
          return <TouchableOpacity key={value} onPress={()=>setTab(value)} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={`${label} tab, ${count} guests`} style={[styles.tab,{backgroundColor:active?colors.primary:colors.white,borderColor:active?colors.primary:colors.border}]}>
            <Text style={[styles.tabText,{color:active?"#fff":colors.text}]}>{label} ({count})</Text>
          </TouchableOpacity>
        })}
      </ScrollView>
      {loading ? <Loading text="Loading guests..."/> :
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load()}}/>} contentContainerStyle={{paddingBottom:110}}>
          {filtered.length ? filtered.map(card) : <View style={styles.empty}><Ionicons name="people-outline" size={52} color="#A7B0C0"/><Text style={styles.emptyTitle}>No guests found</Text><Text style={styles.emptyText}>Try another search or add a guest manually.</Text></View>}
        </ScrollView>
      }
    </View>
    <TouchableOpacity onPress={openManual} style={styles.fab}><Ionicons name="add" size={32} color="#fff"/></TouchableOpacity>
    <Modal visible={modal!==null} transparent animationType="slide" onRequestClose={()=>setModal(null)}>
      <View style={styles.overlay}><View style={styles.modal}>
        <View style={styles.modalHead}><Text style={styles.modalTitle}>
          {modal==="manual"?"Add Guest":modal==="details"?"Guest Details":modal==="otp"?"Verify OTP":"Merge Guest"}
        </Text><TouchableOpacity onPress={()=>setModal(null)}><Ionicons name="close" size={24} color={colors.text}/></TouchableOpacity></View>
        {modal==="manual" || modal==="details" ? <>
          <Text style={styles.label}>Name</Text><TextInput value={name} onChangeText={setName} placeholder="Rahul" style={styles.input}/>
          <Text style={styles.label}>Phone</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} placeholder="9876543210" style={styles.input}/>
          <TouchableOpacity style={styles.primaryBtn} onPress={modal==="manual"?submitManual:sendOtp}><Text style={styles.primaryText}>{modal==="manual"?"Create Guest":"Send OTP"}</Text></TouchableOpacity>
          {modal==="details" && <Text style={styles.hint}>For a scanned guest, save name + phone first, then verify OTP to confirm consent.</Text>}
        </> : modal==="otp" ? <>
          <Text style={styles.hint}>Enter the OTP sent to the guest. In development the API may return a testing OTP.</Text>
          <TextInput value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} placeholder="123456" style={[styles.input,{fontSize:24,letterSpacing:8,textAlign:"center"}]}/>
          <TouchableOpacity style={styles.primaryBtn} onPress={verify}><Text style={styles.primaryText}>Verify & Opt In</Text></TouchableOpacity>
        </> : <>
          <Text style={styles.hint}>Only a pending guest can be merged. Enter the existing guest ID to keep.</Text>
          <TextInput value={existingId} onChangeText={setExistingId} placeholder="guest012" style={styles.input}/>
          <TouchableOpacity style={styles.primaryBtn} onPress={merge}><Text style={styles.primaryText}>Merge Guest</Text></TouchableOpacity>
        </>}
      </View></View>
    </Modal>
  </View>
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.bg},content:{flex:1},sync:{width:43,height:43,borderRadius:22,backgroundColor:"rgba(255,255,255,.15)",alignItems:"center",justifyContent:"center"},
 search:{margin:16,marginBottom:10,height:56,borderRadius:29,backgroundColor:"#fff",borderWidth:1,borderColor:colors.border,flexDirection:"row",alignItems:"center",paddingHorizontal:18},
 searchInput:{flex:1,fontSize:16,color:colors.text,marginLeft:8},tabs:{paddingHorizontal:16,gap:9,paddingBottom:12},tab:{paddingHorizontal:19,paddingVertical:11,borderRadius:24,borderWidth:1},tabText:{fontWeight:"800",fontSize:14},
 card:{backgroundColor:"#fff",marginHorizontal:16,marginBottom:14,borderRadius:22,padding:18,borderWidth:1,borderColor:"#DFE4ED",shadowColor:"#000",shadowOpacity:.04,shadowRadius:6,elevation:1},row:{flexDirection:"row",alignItems:"flex-start"},name:{fontSize:22,fontWeight:"900",color:colors.text},meta:{fontSize:13,color:colors.muted,marginTop:5},id:{fontSize:12,color:"#647084",backgroundColor:"#F0F3F7",paddingHorizontal:9,paddingVertical:6,borderRadius:15,fontWeight:"700"},divider:{height:1,backgroundColor:"#E5E8EE",marginVertical:12},actionsRow:{flexDirection:"row",gap:7},empty:{alignItems:"center",padding:55},emptyTitle:{fontSize:20,fontWeight:"800",color:colors.text,marginTop:10},emptyText:{color:colors.muted,textAlign:"center",marginTop:6},
 fab:{position:"absolute",right:22,bottom:22,width:62,height:62,borderRadius:20,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",elevation:8,shadowColor:"#000",shadowOpacity:.2,shadowRadius:8},
 overlay:{flex:1,backgroundColor:"rgba(0,0,0,.45)",justifyContent:"flex-end"},modal:{backgroundColor:"#fff",borderTopLeftRadius:28,borderTopRightRadius:28,padding:22,paddingBottom:34},modalHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18},modalTitle:{fontSize:23,fontWeight:"900",color:colors.text},label:{fontSize:13,fontWeight:"800",color:colors.text,marginBottom:6},input:{height:52,borderWidth:1,borderColor:colors.border,borderRadius:13,paddingHorizontal:14,fontSize:16,color:colors.text,marginBottom:14},primaryBtn:{height:52,borderRadius:14,backgroundColor:colors.primary,alignItems:"center",justifyContent:"center",marginTop:4},primaryText:{color:"#fff",fontSize:16,fontWeight:"900"},hint:{color:colors.muted,fontSize:13,lineHeight:19,marginTop:10,marginBottom:10}
});

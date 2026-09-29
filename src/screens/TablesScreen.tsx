import React,{useCallback,useEffect,useState} from "react";
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {colors} from "../theme";
import {tablesApi} from "../api";
import {GuestAvatar, Header, Loading} from "../components";

export default function TablesScreen(){
 const nav:any=useNavigation(); const [tables,setTables]=useState<any[]>([]); const [arrivals,setArrivals]=useState<any[]>([]); const [loading,setLoading]=useState(true); const [refreshing,setRefreshing]=useState(false); const [table,setTable]=useState("");
 const load=useCallback(async()=>{try{setLoading(true);const [a,b]=await Promise.all([tablesApi.active(),tablesApi.arrivals(60,50)]);setTables(a.tables||[]);setArrivals(b.arrivals||[])}catch(e:any){Alert.alert("Tables",e.message)}finally{setLoading(false);setRefreshing(false)}},[]);
 useEffect(()=>{load()},[load]);
 const seat=async(g:any)=>{if(!table.trim())return Alert.alert("Table","Enter table number first.");try{await tablesApi.engage(table.trim(),{guest_id:g.guest_id});setTable("");load();Alert.alert("Seated",`${g.name||g.guest_id} seated at table ${table}`)}catch(e:any){Alert.alert("Seat guest",e.message)}};
 if(loading)return <View style={s.screen}><Header subtitle="Waiter & table management"/><Loading/></View>;
 return <View style={s.screen}><Header subtitle={`${tables.length} active tables • ${arrivals.length} arrivals`}/>
 <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true);load()}}/>} contentContainerStyle={{padding:16,paddingBottom:30}}>
   <View style={s.box}><Text style={s.heading}>New arrivals</Text><Text style={s.muted}>Gate-camera guests waiting to be seated.</Text>
    <View style={s.inline}><TextInput value={table} onChangeText={setTable} keyboardType="default" placeholder="Table no." style={s.input}/><Text style={s.tip}>Enter a table number, then tap Seat.</Text></View>
    {arrivals.length===0?<Text style={s.empty}>No waiting arrivals.</Text>:arrivals.map((g:any,i)=><View style={s.arrival} key={g.guest_id||i}><GuestAvatar guest={g} size={62}/><View style={{flex:1,marginLeft:10}}><Text style={s.guestName}>{g.name||"Unnamed guest"}</Text><Text style={s.muted}>{g.guest_id} • {g.consent_status}</Text></View><TouchableOpacity onPress={()=>seat(g)} style={s.seat}><Text style={s.seatText}>Seat</Text></TouchableOpacity></View>)}
   </View>
   <Text style={s.heading2}>Active tables</Text>
   {tables.length===0?<View style={s.box}><Text style={s.empty}>No guests are seated right now.</Text></View>:tables.map((t:any)=><TouchableOpacity key={String(t.table_no)} style={s.tableCard} onPress={()=>nav.navigate("TableDetails",{table:t.table_no})}><View><Text style={s.tableNo}>Table {t.table_no}</Text><Text style={s.muted}>{(t.guests||[]).length} guest(s)</Text></View><Text style={s.open}>Open ›</Text></TouchableOpacity>)}
 </ScrollView></View>
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.bg},box:{backgroundColor:"#fff",borderRadius:20,padding:16,marginBottom:15,borderWidth:1,borderColor:colors.border},heading:{fontSize:20,fontWeight:"900",color:colors.text},heading2:{fontSize:20,fontWeight:"900",color:colors.text,marginBottom:10},muted:{fontSize:13,color:colors.muted,marginTop:4},inline:{flexDirection:"row",alignItems:"center",gap:10,marginVertical:12},input:{width:110,height:45,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingHorizontal:12},tip:{flex:1,color:colors.muted,fontSize:12},arrival:{flexDirection:"row",alignItems:"center",borderTopWidth:1,borderTopColor:colors.border,paddingTop:12,marginTop:10},guestName:{fontWeight:"900",fontSize:16,color:colors.text},seat:{backgroundColor:colors.teal,paddingHorizontal:17,paddingVertical:11,borderRadius:12},seatText:{color:"#fff",fontWeight:"900"},empty:{paddingVertical:20,color:colors.muted,textAlign:"center"},tableCard:{backgroundColor:"#fff",borderRadius:17,padding:17,marginBottom:10,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},tableNo:{fontSize:18,fontWeight:"900",color:colors.text},open:{color:colors.primary,fontWeight:"900"}});

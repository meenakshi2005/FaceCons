import React,{useEffect,useState} from "react";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useRoute} from "@react-navigation/native";
import {colors} from "../theme";
import {ordersApi,tablesApi} from "../api";
import {GuestAvatar,Loading} from "../components";

export default function TableScreen(){
 const route:any=useRoute(); const guest=route.params?.guest; const initial=route.params?.table||""; const [table,setTable]=useState(initial||""); const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true);
 const load=async(t=table)=>{if(!t){setLoading(false);return}try{setLoading(true);setData(await tablesApi.current(t))}catch(e:any){Alert.alert("Table",e.message)}finally{setLoading(false)}};
 useEffect(()=>{if(initial)load(initial);else setLoading(false)},[]);
 const seat=async()=>{if(!table||!guest)return;try{await tablesApi.engage(table,{guest_id:guest.guest_id});load();Alert.alert("Success","Guest seated.")}catch(e:any){Alert.alert("Seat",e.message)}};
 const release=async()=>{try{await tablesApi.release(table,guest?{guest_id:guest.guest_id}:{});load();Alert.alert("Released","Table visit closed.")}catch(e:any){Alert.alert("Release",e.message)}};
 if(loading)return <Loading text="Loading table..."/>;
 return <ScrollView style={s.screen} contentContainerStyle={{padding:16}}>
   <View style={s.hero}><Text style={s.title}>Table {table||"—"}</Text><Text style={s.muted}>{data?.seated||0} seated • ₹{data?.table_total||0} total</Text></View>
   {guest&&!data?.guests?.some((g:any)=>g.guest_id===guest.guest_id)&&<TouchableOpacity onPress={seat} style={s.primary}><Text style={s.primaryText}>Seat {guest.name||guest.guest_id} here</Text></TouchableOpacity>}
   {(data?.guests||[]).map((g:any)=><View style={s.guest} key={g.guest_id}><GuestAvatar guest={g} size={66}/><View style={{flex:1,marginLeft:12}}><Text style={s.name}>{g.name||"Unnamed guest"}</Text><Text style={s.muted}>{g.guest_id}</Text><Text style={s.amount}>₹{g.guest_total||0}</Text></View></View>)}
   {data?.guests?.length>0&&<TouchableOpacity onPress={release} style={s.release}><Text style={s.releaseText}>Release Table / Close Visit</Text></TouchableOpacity>}
 </ScrollView>
}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.bg},hero:{backgroundColor:colors.primary,borderRadius:22,padding:20},title:{color:"#fff",fontSize:28,fontWeight:"900"},muted:{color:"#7B879A",marginTop:4},heroText:{color:"#DCD8FF"},primary:{backgroundColor:colors.teal,padding:15,borderRadius:14,marginVertical:14,alignItems:"center"},primaryText:{color:"#fff",fontWeight:"900"},guest:{backgroundColor:"#fff",borderRadius:18,padding:15,marginTop:12,flexDirection:"row",alignItems:"center"},name:{fontSize:18,fontWeight:"900",color:colors.text},amount:{fontSize:16,fontWeight:"900",color:colors.teal,marginTop:5},release:{marginTop:15,borderRadius:14,padding:15,alignItems:"center",backgroundColor:colors.red},releaseText:{color:"#fff",fontWeight:"900"}});

import React, {useEffect, useState} from "react";
import {Alert, ScrollView, StyleSheet, Text, View} from "react-native";
import {useRoute} from "@react-navigation/native";
import {colors} from "../theme";
import {guestsApi} from "../api";
import {GuestAvatar, Loading, StatusPill} from "../components";

export default function GuestHistoryScreen(){
  const route:any=useRoute(); const guest=route.params?.guest;
  const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{(async()=>{try{setData(await guestsApi.visits(guest.guest_id||guest._id,"?days=30"))}catch(e:any){Alert.alert("History",e.message)}finally{setLoading(false)}})()},[]);
  if(loading)return <Loading text="Loading guest history..."/>;
  return <ScrollView style={s.screen} contentContainerStyle={{padding:16}}>
    <View style={s.profile}><GuestAvatar guest={guest} size={92}/><View style={{flex:1,marginLeft:14}}><Text style={s.name}>{guest.name||"Unnamed guest"}</Text><Text style={s.meta}>{guest.phone||"No phone"}</Text><StatusPill status={guest.consent_status}/></View></View>
    {data?.summary && <View style={s.stats}><Stat label="Visits" value={data.summary.total_visits}/><Stat label="Orders" value={data.summary.total_orders}/><Stat label="Spent" value={`₹${data.summary.total_spent||0}`}/></View>}
    <Text style={s.heading}>Visit History</Text>
    {(data?.visits||[]).map((v:any,i:number)=><View style={s.visit} key={v.visit_id||i}>
      <View style={s.visitTop}><Text style={s.table}>Table {v.table_no}</Text><Text style={s.date}>{v.started_at?new Date(v.started_at).toLocaleString():""}</Text></View>
      <Text style={s.meta}>Waiter: {v.waiter||"—"} • {v.status||"closed"}</Text>
      {(v.orders||[]).map((o:any,j:number)=><View key={j} style={s.order}><Text style={s.orderTitle}>Order {o.order_id?.slice(-6)||j+1}</Text><Text style={s.meta}>{(o.items||[]).map((x:any)=>`${x.name} ×${x.qty}`).join(", ")||"No items"}</Text><Text style={s.amount}>₹{o.bill_amount||0}</Text></View>)}
    </View>)}
  </ScrollView>
}
function Stat({label,value}:any){return <View style={s.stat}><Text style={s.statVal}>{value}</Text><Text style={s.meta}>{label}</Text></View>}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.bg},profile:{backgroundColor:"#fff",borderRadius:20,padding:18,flexDirection:"row",alignItems:"center"},name:{fontSize:22,fontWeight:"900",color:colors.text},meta:{color:colors.muted,fontSize:13,marginTop:4},stats:{backgroundColor:"#fff",borderRadius:20,marginTop:12,padding:16,flexDirection:"row",justifyContent:"space-around"},stat:{alignItems:"center"},statVal:{fontSize:21,fontWeight:"900",color:colors.primary},heading:{fontSize:20,fontWeight:"900",color:colors.text,marginVertical:15},visit:{backgroundColor:"#fff",borderRadius:18,padding:16,marginBottom:12},visitTop:{flexDirection:"row",justifyContent:"space-between"},table:{fontSize:17,fontWeight:"900",color:colors.text},date:{fontSize:12,color:colors.muted},order:{borderTopWidth:1,borderTopColor:colors.border,marginTop:12,paddingTop:10,flexDirection:"row",alignItems:"center"},orderTitle:{width:90,fontWeight:"800",color:colors.text},amount:{marginLeft:"auto",fontWeight:"900",color:colors.teal}});

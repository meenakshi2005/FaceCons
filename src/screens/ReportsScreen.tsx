import React,{useEffect,useState} from "react";
import {Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {colors} from "../theme";
import {tablesApi} from "../api";
import {Loading} from "../components";

export default function ReportsScreen(){
 const [data,setData]=useState<any>(null);const [loading,setLoading]=useState(true);
 const load=async()=>{try{setLoading(true);setData(await tablesApi.reportAll("?date=today"))}catch(e:any){Alert.alert("Reports",e.message)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 if(loading)return <View style={s.screen}><Loading text="Loading reports..."/></View>;
 const summary=data?.summary||{};
 return <ScrollView style={s.screen} contentContainerStyle={{padding:16}} refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>}>
   <Text style={s.title}>Today’s Report</Text>
   <View style={s.grid}><Metric label="Revenue" value={`₹${summary.revenue||0}`}/><Metric label="Orders" value={summary.orders||0}/><Metric label="Guests" value={summary.unique_guests||0}/><Metric label="Visits" value={summary.visits||0}/></View>
   <Text style={s.heading}>Tables</Text>
   {(data?.tables||[]).map((t:any)=><View style={s.card} key={String(t.table_no)}><View><Text style={s.table}>Table {t.table_no}</Text><Text style={s.muted}>{t.unique_guests} guests • {t.visits} visits</Text></View><Text style={s.revenue}>₹{t.revenue||0}</Text></View>)}
   {(data?.unmapped_orders||[]).length>0&&<><Text style={s.heading}>Unmapped POS Orders</Text>{data.unmapped_orders.map((o:any,i:number)=><View style={s.card} key={i}><Text style={s.table}>Table {o.table_no}</Text><Text style={s.muted}>Order {o.order_id}</Text><Text style={s.revenue}>₹{o.bill_amount||0}</Text></View>)}</>}
 </ScrollView>
}
function Metric({label,value}:any){return <View style={s.metric}><Text style={s.metricValue}>{value}</Text><Text style={s.muted}>{label}</Text></View>}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.bg},title:{fontSize:28,fontWeight:"900",color:colors.text,marginBottom:14 , paddingTop:30},grid:{flexDirection:"row",flexWrap:"wrap",gap:10},metric:{backgroundColor:"#fff",borderRadius:18,padding:16,width:"48%",minHeight:100,justifyContent:"center"},metricValue:{fontSize:24,fontWeight:"900",color:colors.primary},muted:{fontSize:12,color:colors.muted,marginTop:4},heading:{fontSize:20,fontWeight:"900",color:colors.text,marginVertical:15},card:{backgroundColor:"#fff",borderRadius:17,padding:16,marginBottom:10,flexDirection:"row",justifyContent:"space-between"},table:{fontSize:17,fontWeight:"900",color:colors.text},revenue:{fontSize:17,fontWeight:"900",color:colors.teal}});

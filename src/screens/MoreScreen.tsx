import React,{useState} from "react";
import {Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {colors} from "../theme";
import {devApi,posApi,scannerApi} from "../api";

export default function MoreScreen(){
 const [busy,setBusy]=useState(false);
 const run=async(label:string,fn:any)=>{try{setBusy(true);const d=await fn();Alert.alert(label,JSON.stringify(d,null,2).slice(0,1800))}catch(e:any){Alert.alert(label,e.message)}finally{setBusy(false)}};
 return <ScrollView style={s.screen} contentContainerStyle={{padding:16}}>
  <Text style={s.title}>Tools & Settings</Text>
  <Text style={s.muted}>Base API: ngrok development server</Text>
  <View style={s.card}>
   <Tool title="Health Check" onPress={()=>run("Health",scannerApi.health)}/>
   <Tool title="Run Camera Scan" onPress={()=>run("Scanner",scannerApi.run)}/>
   <Tool title="Sync POS Orders" onPress={()=>run("POS Sync",posApi.sync)}/>
   <Tool title="Seed Dummy Data" onPress={()=>run("Seed Dummy",()=>devApi.seed({days:10,tables:5,per_day:5}))}/>
   <Tool title="Remove Dummy Data" danger onPress={()=>run("Remove Dummy",devApi.clear)}/>
  </View>
  <View style={s.note}><Text style={s.noteTitle}>API configuration</Text><Text style={s.muted}>The app is configured with the supplied ngrok Base URL. If ngrok changes, update src/api.ts.</Text></View>
 </ScrollView>
}
function Tool({title,onPress,danger}:any){return <TouchableOpacity disabled={false} onPress={onPress} style={[s.tool,{backgroundColor:danger?"#FFF0F0":"#fff"}]}><Text style={[s.toolText,{color:danger?colors.red:colors.text}]}>{title}</Text><Text style={{color:colors.primary,fontWeight:"900"}}>›</Text></TouchableOpacity>}
const s=StyleSheet.create({screen:{flex:1,backgroundColor:colors.bg},title:{fontSize:28,fontWeight:"900",color:colors.text},muted:{color:colors.muted,fontSize:13,marginTop:6},card:{marginTop:18,borderRadius:20,overflow:"hidden"},tool:{padding:18,borderBottomWidth:1,borderBottomColor:colors.border,flexDirection:"row",justifyContent:"space-between"},toolText:{fontWeight:"800",fontSize:16},note:{backgroundColor:"#fff",borderRadius:18,padding:17,marginTop:18},noteTitle:{fontSize:17,fontWeight:"900",color:colors.text}});

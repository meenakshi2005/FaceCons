import React from "react";
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {colors} from "./theme";
import {photoUrl} from "./api";
import {Guest} from "./types";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function Header({title = "Face Consent Manager", subtitle, right}: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.shield}><Ionicons name="shield-checkmark" size={27} color="#D8F2FF"/></View>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function StatusPill({status}: {status?: string}) {
  const pending = status === "pending";
  const optedIn = status === "opted_in";
  return <View style={[styles.status, pending ? styles.pending : optedIn ? styles.in : styles.out]}>
    <Text style={[styles.statusText, {color: pending ? colors.pendingText : colors.white}]}>
      {pending ? "PENDING" : optedIn ? "OPTED IN" : "OPTED OUT"}
    </Text>
  </View>;
}

interface GuestAvatarProps {
  guest: Guest;
  size?: number;
  cacheKey?: number | string;
}

export function GuestAvatar({guest, size = 82, cacheKey}: GuestAvatarProps) {
  const id = guest.guest_id || guest._id;
  const url = id ? photoUrl(id, cacheKey || guest.photo_updated_at) : null;
  return id && guest.photo_url !== null && url ? (
    <Image source={{uri: url}} style={{width:size, height:size, borderRadius:12, backgroundColor:"#E8ECF3"}}/>
  ) : (
    <View style={[styles.avatar, {width:size, height:size, borderRadius:12}]}><Ionicons name="person" size={size * .43} color="#8B95A7"/></View>
  );
}

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap | any; 
  color: string;
  onPress?: () => void;
  outline?: boolean;
  disabled?: boolean;
}

export function ActionButton({label, icon, color, onPress, outline=false, disabled=false}: ActionButtonProps) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} activeOpacity={0.75} style={[styles.action, {backgroundColor: outline ? colors.blueSoft : color, borderColor: outline ? "#C7D1F0" : color, opacity: disabled ? .5 : 1}]}>
    <Ionicons name={icon} size={15} color={outline ? colors.primaryDark : "#fff"}/>
    <Text style={[styles.actionText, {color: outline ? colors.primaryDark : "#fff"}]}>{label}</Text>
  </TouchableOpacity>
}

interface LoadingProps {
  text?: string;
}

export function Loading({text="Loading..."}: LoadingProps) {
  return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary}/><Text style={styles.muted}>{text}</Text></View>
}

const styles = StyleSheet.create({
  header:{backgroundColor:colors.primary, paddingHorizontal:18, paddingTop:60, paddingBottom:16, borderBottomLeftRadius:28, borderBottomRightRadius:28},
  headerTop:{flexDirection:"row", alignItems:"center", gap:10},
  shield:{width:48,height:48,borderRadius:16,backgroundColor:"rgba(255,255,255,.14)",alignItems:"center",justifyContent:"center"},
  title:{fontSize:23,fontWeight:"800",color:"#fff"},
  subtitle:{fontSize:13,color:"#DCD8FF",marginTop:4},
  status:{paddingHorizontal:10,paddingVertical:5,borderRadius:16,alignSelf:"flex-start",marginTop:7,borderWidth:1,borderColor:"#E6D36A"},
  pending:{backgroundColor:colors.pendingBg},
  in:{backgroundColor:colors.green,borderColor:colors.green},
  out:{backgroundColor:colors.red,borderColor:colors.red},
  statusText:{fontSize:12,fontWeight:"900"},
  avatar:{backgroundColor:"#E8ECF3",alignItems:"center",justifyContent:"center"},
  action:{height:36,borderRadius:10,borderWidth:1,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:5,flex:1,paddingHorizontal:6},
  actionText:{fontWeight:"700",fontSize:12.5},
  loading:{padding:50,alignItems:"center",gap:12},
  muted:{color:colors.muted,fontSize:13}
});

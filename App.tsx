import React, {useEffect, useState} from "react";
import {ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {Ionicons} from "@expo/vector-icons";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import {colors} from "./src/theme";
import GuestsScreen from "./src/screens/GuestsScreen";
import TablesScreen from "./src/screens/TablesScreen";
import ReportsScreen from "./src/screens/ReportsScreen";
import EmployeesScreen from "./src/screens/EmployeesScreen";
import MoreScreen from "./src/screens/MoreScreen";
import GuestHistoryScreen from "./src/screens/GuestHistoryScreen";
import TableScreen from "./src/screens/TableScreen";
import ViewTableScreen from "./src/screens/ViewTableScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      id="RootTabs"
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {height: 68, paddingBottom: 9, paddingTop: 7, borderTopColor: colors.border},
        tabBarLabelStyle: {fontSize: 11, fontWeight: "700"},
        tabBarIcon: ({color, size}) => {
          const map: any = {Guests: "people", Tables: "grid", Reports: "bar-chart", Employees: "person", More: "menu"};
          return <Ionicons name={map[route.name] || "ellipse"} size={size} color={color}/>;
        }
      })}
    >
      <Tab.Screen name="Guests" component={GuestsScreen}/>
      <Tab.Screen name="Tables" component={TablesScreen}/>
      <Tab.Screen name="Reports" component={ReportsScreen}/>
      <Tab.Screen name="Employees" component={EmployeesScreen}/>
      <Tab.Screen name="More" component={MoreScreen}/>
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator id="AppStack">
      <Stack.Screen name="HomeTabs" component={Tabs} options={{headerShown: false}}/>
      <Stack.Screen name="GuestHistory" component={GuestHistoryScreen} options={{title: "Guest History"}}/>
      <Stack.Screen name="TableDetails" component={TableScreen} options={{title: "Table"}}/>
      <Stack.Screen name="ViewTable" component={ViewTableScreen} options={{title: "View Table"}}/>
    </Stack.Navigator>
  );
}

export default function App() {
  return <SafeAreaProvider><NavigationContainer><AppStack/></NavigationContainer></SafeAreaProvider>;
}

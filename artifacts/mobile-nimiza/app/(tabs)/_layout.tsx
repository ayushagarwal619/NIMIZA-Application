import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NIMIZA from "@/constants/nimiza-colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="characters">
        <Icon sf={{ default: "person.3", selected: "person.3.fill" }} />
        <Label>Friends</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="adventures">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Adventures</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <Icon sf={{ default: "star", selected: "star.fill" }} />
        <Label>Progress</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NIMIZA.purple,
        tabBarInactiveTintColor: NIMIZA.textMuted,
        tabBarLabelStyle: {
          fontFamily: "Nunito_800ExtraBold",
          fontSize: 11,
        },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : NIMIZA.white,
          borderTopWidth: 2,
          borderTopColor: NIMIZA.purpleSoft,
          elevation: 0,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={95} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: NIMIZA.white }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="house.fill" tintColor={color} size={size} />
            ) : (
              <Ionicons name="home" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="characters"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="person.3.fill" tintColor={color} size={size} />
            ) : (
              <Ionicons name="people" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="adventures"
        options={{
          title: "Adventures",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="book.fill" tintColor={color} size={size} />
            ) : (
              <Ionicons name="book" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="star.fill" tintColor={color} size={size} />
            ) : (
              <Ionicons name="star" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}

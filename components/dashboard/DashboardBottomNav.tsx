import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import HomeIcon from "../icons/HomeIcon";
import PathIcon from "../icons/PathIcon";
import JourneyIcon from "../icons/JourneyIcon";
import ProfileIcon from "../icons/ProfileIcon";

const navItems = [
  {
    route: "Home",
    label: "Home",
    Icon: HomeIcon,
  },
  {
    route: "Paths",
    label: "Paths",
    Icon: PathIcon,
  },
  {
    route: "Journey",
    label: "My Journey",
    Icon: JourneyIcon,
  },
  {
    route: "Profile",
    label: "Profile",
    Icon: ProfileIcon,
  },
] as const;

export default function DashboardBottomNav({
  state,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const routeIndex = state.routes.findIndex(
          (route) => route.name === item.route
        );

        const isActive = state.index === routeIndex;

        const Icon = item.Icon;

        return (
          <Pressable
            key={item.route}
            style={styles.item}
            onPress={() => {
              navigation.navigate(item.route);
            }}
          >
            <View style={styles.icon}>
              <Icon
  color={isActive ? "#305C76" : "#535353"}
  size={32}
/>
            </View>

            <Text
              style={[
                styles.label,
                {
                  color: isActive ? "#305C76" : "#535353",
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 8,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    paddingBottom: 12,
  },

  item: {
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  icon: {
    width: 32,
    height: 32,
    marginBottom: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
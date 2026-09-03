import React from "react";
import availableImage from "../../assets/available.svg";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

import CategoryCard from "./CategoryCard";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { CATEGORIES } from "../../lib/constants";
import type { PathsStackParamList } from "../../navigation/AppNavigator";

export default function PathsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<PathsStackParamList>>();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Formation Paths</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.intro}>
          <Text style={styles.sectionTitle}>Available Categories</Text>

          <Text style={styles.description}>
            Start your journey by exploring themes around life and purpose.
          </Text>
        </View>

        <View style={styles.categories}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              image={availableImage}
              amount="7"
              available={true}
              onPress={() =>
                navigation.navigate("CategoryPaths", {
                  categoryTitle: category.title,
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  content: {
    paddingBottom: 120,
  },

  header: {
    height: 90,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  backArrow: {
    fontSize: 40,
    lineHeight: 40,
    color: "#305C76",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#2A5975",
  },

  headerSpacer: {
    width: 40,
  },

  intro: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#2A5975",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 28,
    marginBottom: 20,
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    paddingRight: 32,
    letterSpacing: 0.13,
  },

  categories: {
    paddingTop: 20,
    paddingHorizontal: 24,
    gap: 20,
  },
});
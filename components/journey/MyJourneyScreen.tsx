
import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { CalendarDays } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { JourneyStackParamList } from "../../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function MyJourneyScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<JourneyStackParamList>>();

  const homeState = useQuery(api.paths.getHomeState);
  const livePath = useQuery(api.paths.getLivePath);

  // Loading
  if (homeState === undefined || livePath === undefined) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.heading}>My Journey</Text>

        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#305C76" />
          <Text style={styles.loadingText}>
            Loading your journeys…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No active path
  const hasActivePath =
    homeState.state === "active" ||
    homeState.state === "complete";

  if (!hasActivePath || !livePath) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.heading}>My Journey</Text>

        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            No path selected
          </Text>

          <Text style={styles.emptySubtitle}>
            Sorry you do not have an active path selected.
          </Text>

          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate("Paths")
            }
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.emptyButtonText}>
              Go to Paths
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Real path data from Convex
  const path = {
    id: livePath._id as unknown as string,
    title: livePath.title,
    description: livePath.description,
    durationDays: livePath.totalDays,
    thumbnail: require("../../assets/sailboat.png"),
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.heading}>My Journey</Text>

      <View style={styles.list}>
        <Pressable
          onPress={() =>
            navigation.navigate("JourneyDetail", {
              id: path.id,
            })
          }
          style={({ pressed }) => [
            styles.card,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardContent}>
            {/* Text */}
            <View style={styles.textContent}>
              {/* Duration */}
              <View style={styles.durationRow}>
                <CalendarDays
                  size={12}
                  color="#335E78"
                  strokeWidth={2}
                />

                <Text style={styles.duration}>
                  {path.durationDays} days
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>
                {path.title}
              </Text>

              {/* Description */}
              <Text style={styles.description}>
                {path.description}
              </Text>
            </View>

            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={path.thumbnail}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </View>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    paddingHorizontal: 21,
    paddingTop: 20,
  },

  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: "#184159",
    marginBottom: 20,
  },

  loading: {
    marginTop: 40,
    alignItems: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "600",
    color: "#184159",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
  },

  emptyButton: {
    width: 275,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyButtonText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  list: {
    gap: 12,
  },

  card: {
    width: "100%",
    minHeight: 103,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    overflow: "hidden",
  },

  cardPressed: {
    transform: [{ scale: 0.99 }],
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  textContent: {
    flex: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  duration: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    color: "#335E78",
  },

  title: {
    fontSize: 16,
    lineHeight: 15,
    fontWeight: "600",
    color: "#535353",
    marginTop: 24,
  },

  description: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    color: "#535353",
    marginTop: 8,
    maxWidth: 205,
  },

  thumbnailContainer: {
    width: 85,
    height: 85,
    margin: 9,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },
});


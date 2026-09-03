import { ScrollView, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useNavigation } from "@react-navigation/native";

import { api } from "../convex/_generated/api";
import DashboardHeader from "./dashboard/DashboardHeader";
import ActivePathCard from "./dashboard/ActivePathCard";
import SpotlightSection from "./dashboard/SpotlightSection";
import RecommendedSection from "./dashboard/RecommendedSection";

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();

  // Queries — match web Dashboard.tsx:18-20
  const me = useQuery(api.users.me);
  const homeState = useQuery(api.paths.getHomeState);
  const discoveryPaths = useQuery(api.discovery.getPathsDiscoveryScreen);

  // Header — same fallback as web Dashboard.tsx:25
  const firstName = me?.firstName || "there";

  // Active card derived state — matches web Dashboard.tsx:28-35
  const isHomeLoading = homeState === undefined;
  const isDiscoveryLoading = discoveryPaths === undefined;

  let cardState: "active" | "complete" | "none" = "none";
  let currentDay = 0;
  let totalDays = 0;
  let progressPercentage = 0;
  let pathId: string | undefined;
  let sessionId: string | undefined;

  if (homeState) {
    if (homeState.state === "active") {
      cardState = "active";
      currentDay = homeState.currentDay ?? 0;
      totalDays = homeState.totalDays ?? 0;
      // Same calc as web Dashboard.tsx:30: completedDays.length / totalDays * 100
      progressPercentage = Math.round(
        (homeState.completedDays.length / (homeState.totalDays || 1)) * 100
      );
      pathId = homeState.pathId as unknown as string;
      sessionId = homeState.sessionId as unknown as string | undefined;
    } else if (homeState.state === "complete") {
      cardState = "complete";
      progressPercentage = 100;
      pathId = homeState.pathId as unknown as string;
    } else {
      // "no_path" or "unauthenticated"
      cardState = "none";
      progressPercentage = 0;
    }
  }

  const handleActivePress = () => {
  if (!homeState) return;

  if (homeState.state === "active") {
    if (sessionId) {
      navigation.navigate("Journey", {
        screen: "JourneySession",
        params: {
          id: pathId!,
          sessionId: sessionId,
        },
      });
    } else {
      navigation.navigate("Journey", {
        screen: "JourneyDetail",
        params: { id: pathId! },
      });
    }
  } else if (homeState.state === "complete") {
    navigation.navigate("Journey", {
      screen: "JourneyDetail",
      params: { id: pathId! },
    });
  } else {
    navigation.navigate("Paths");
  }
};

  // Recommended count — matches web Dashboard.tsx:202-205: filter category Fear & Anxiety
  const formationPathCount = discoveryPaths
    ? discoveryPaths.filter((p) => p.category === "Fear & Anxiety").length
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DashboardHeader firstName={firstName} isAuthenticated={isAuthenticated && !authLoading} />

      {/* Active path — loading/empty/error preserved within existing layout */}
      {isHomeLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#305C76" />
          <Text style={styles.loadingText}>Loading your journey…</Text>
        </View>
      ) : (
        <ActivePathCard
          state={cardState}
          currentDay={currentDay}
          totalDays={totalDays}
          progressPercentage={progressPercentage}
          onPress={handleActivePress}
        />
      )}

      <SpotlightSection />

      {/* Recommended — loading state preserves Spotlight → Recommended spacing */}
      {isDiscoveryLoading ? (
        <View style={styles.loadingRecommended}>
          <ActivityIndicator size="small" color="#305C76" />
          <Text style={styles.loadingText}>Loading recommendations…</Text>
        </View>
      ) : (
        <RecommendedSection formationPathCount={formationPathCount} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  content: {
    paddingBottom: 80,
  },
  loadingCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    minHeight: 260,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  loadingRecommended: {
    marginBottom: 96,
    marginHorizontal: 24,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
});

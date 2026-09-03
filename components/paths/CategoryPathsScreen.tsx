
import React, { useState } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { ArrowLeft, Search } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

import FormationPathCard from "./FormationPathCard";
import type { PathsStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<PathsStackParamList, "CategoryPaths">;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Fear & Anxiety":
    "Grow in understanding God's character through these curated paths focused on Fear and Anxiety.",
  "Loss & Grief": "Navigate loss with the hope of God's presence.",
  "Identity & Worth": "Discover your identity in Christ.",
  "Faith & Doubt": "Wrestle with doubt and deepen faith.",
  "Pressure & Endurance": "Find strength under pressure.",
  "Relationships & Community": "Grow in community and love.",
};

const IMAGE_MAP: Record<string, any> = {
  "Trust in Uncertainty": require("../../assets/sailboat.png"),
  "When Anxiety Won't Stop": require("../../assets/book-communion.png"),
  "Fear of Failure": require("../../assets/dove.png"),
  "When the Worst Happens": require("../../assets/book-with-leaf.png"),
  "Afraid of What People Think": require("../../assets/crown-with-torch.png"),
  "When You Don't Feel Safe": require("../../assets/sailboat.png"),
};

function getImage(title: string) {
  return IMAGE_MAP[title] ?? require("../../assets/sailboat.png");
}

export default function CategoryPathsScreen({ navigation, route }: Props) {
  const { categoryTitle } = route.params;
  const discovery = useQuery(api.discovery.getPathsDiscoveryScreen);
  const recordTap = useMutation(api.discovery.recordTap);

  const [tappedMap, setTappedMap] = useState<Record<string, boolean>>({});
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loadingTap, setLoadingTap] = useState<string | null>(null);
  const [confirmationId, setConfirmationId] = useState<string | null>(null);

  const description =
    CATEGORY_DESCRIPTIONS[categoryTitle] ?? "Explore this journey.";

  if (discovery === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#305C76" />
        <Text style={styles.loadingText}>Loading paths…</Text>
      </View>
    );
  }

  const categoryPaths = discovery.filter((p) => p.category === categoryTitle);
  const livePaths = categoryPaths.filter((p) => p.isLive);
  const comingSoonPaths = categoryPaths.filter((p) => !p.isLive);

  const handleComingSoonTap = async (
    pathId: string,
    totalTaps: number,
    userHasTapped: boolean
  ) => {
    const alreadyTapped = tappedMap[pathId] ?? userHasTapped;

    if (alreadyTapped || loadingTap) return;

    setLoadingTap(pathId);

    setTappedMap((m) => ({ ...m, [pathId]: true }));
    setCountMap((m) => ({
      ...m,
      [pathId]: (m[pathId] ?? totalTaps) + 1,
    }));

    try {
      await recordTap({ pathId: pathId as any });
      setConfirmationId(pathId);
      setTimeout(() => setConfirmationId(null), 3500);
    } catch {
      setTappedMap((m) => ({ ...m, [pathId]: false }));
      setCountMap((m) => ({ ...m, [pathId]: totalTaps }));
    } finally {
      setLoadingTap(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color="#305C76" strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* Category */}
      <View style={styles.category}>
        <Text style={styles.title}>{categoryTitle}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={16} color="#305C76" />

          <TextInput
            style={styles.searchInput}
            placeholder="Search Topics..."
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Paths */}
      <View style={styles.paths}>
        {categoryPaths.length === 0 ? (
          <Text style={styles.emptyText}>No paths in this category.</Text>
        ) : (
          <>
            {livePaths.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>Available Now</Text>

                {livePaths.map((p) => (
  <View key={p.pathId} style={styles.liveWrapper}>
  <FormationPathCard
    title={p.title}
    description={p.description}
    duration="7 days"
    image={getImage(p.title)}
    onPress={() => {
      console.log("TRUST PATH PRESSED:", p.pathId);

      navigation.getParent()?.navigate("Journey", {
        screen: "JourneyDetail",
        params: { id: p.pathId },
      });
    }}
  />

  <View
    style={styles.availableBadge}
    pointerEvents="none"
  >
    <View style={styles.availableDot} />
    <Text style={styles.availableText}>
      Available Now
    </Text>
  </View>
</View>
))}


              </>
            )}

            {comingSoonPaths.length > 0 && (
              <Text style={styles.sectionHeaderComingSoon}>
                Coming Soon — Tap to express interest
              </Text>
            )}

            {comingSoonPaths.map((p) => {
              const userHasTapped =
                tappedMap[p.pathId as string] ?? p.userHasTapped;

              const totalTaps =
                countMap[p.pathId as string] ?? p.totalTaps;

              const isTapped = userHasTapped;

              return (
                <Pressable
                  key={p.pathId}
                  onPress={() =>
                    handleComingSoonTap(
                      p.pathId as string,
                      p.totalTaps,
                      p.userHasTapped
                    )
                  }
                  disabled={
                    isTapped || loadingTap === (p.pathId as string)
                  }
                  style={({ pressed }) => [
                    styles.comingSoonCard,
                    isTapped && styles.comingSoonCardTapped,
                    pressed && !isTapped && styles.comingSoonPressed,
                  ]}
                >
                  <View style={styles.comingSoonContent}>
                    <View style={styles.comingSoonLeft}>
                      <Text style={styles.comingSoonEyebrow}>
                        Coming Soon — Tap to Express Interest
                      </Text>

                      <Text style={styles.comingSoonTitle}>
                        {p.title}
                      </Text>

                      <Text style={styles.comingSoonDescription}>
                        {p.description}
                      </Text>

                      <View style={styles.comingSoonMeta}>
                        <Text style={styles.comingSoonCount}>
                          {totalTaps > 0
                            ? `${totalTaps.toLocaleString()} ${
                                totalTaps === 1
                                  ? "person is"
                                  : "people are"
                              } waiting`
                            : "Be the first to express interest"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.comingSoonThumb}>
                      <Image
                        source={getImage(p.title)}
                        style={styles.thumbImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  {confirmationId === (p.pathId as string) && (
                    <View style={styles.confirmation}>
                      <Text style={styles.confirmationText}>
                        We've noted your interest. You'll be notified.
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  content: {
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },

  header: {
    height: 90,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  category: {
    paddingHorizontal: 24,
    marginTop: 28,
  },

  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "600",
    color: "#2A5975",
    marginBottom: 20,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    paddingRight: 32,
    letterSpacing: 0.13,
  },

  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },

  searchBox: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    paddingVertical: 0,
  },

  paths: {
    paddingHorizontal: 24,
    marginTop: 28,
    gap: 20,
  },

  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2A5975",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 4,
  },

  sectionHeaderComingSoon: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 4,
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    padding: 16,
  },

  liveWrapper: {
    position: "relative",
  },

  livePressed: {
  opacity: 0.97,
  transform: [{ scale: 0.99 }],
},

  availableBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#335E78",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  availableText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  comingSoonCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 4,
    padding: 14,
    overflow: "hidden",
  },

  comingSoonCardTapped: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },

  comingSoonPressed: {
    transform: [{ scale: 0.99 }],
  },

  comingSoonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  comingSoonLeft: {
    flex: 1,
    paddingRight: 12,
    gap: 6,
  },

  comingSoonEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B3B3B3",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    lineHeight: 12,
  },

  comingSoonTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.15,
  },

  comingSoonDescription: {
    fontSize: 11,
    lineHeight: 14,
    color: "#64748B",
    paddingRight: 8,
    opacity: 0.9,
  },

  comingSoonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },

  comingSoonCount: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    color: "#335E78",
  },

  comingSoonThumb: {
    width: 86,
    height: 86,
    borderRadius: 8,
    overflow: "hidden",
    opacity: 0.9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  thumbImage: {
    width: 73,
    height: 73,
  },

  confirmation: {
    marginTop: 12,
    backgroundColor: "#335E78",
    borderRadius: 6,
    padding: 8,
  },

  confirmationText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});


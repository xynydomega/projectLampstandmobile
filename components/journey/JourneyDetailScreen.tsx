import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { JourneyStackParamList } from "../../navigation/AppNavigator";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type Props = NativeStackScreenProps<
  JourneyStackParamList,
  "JourneyDetail"
>;

function AsteriskActive() {
  return <Text style={styles.activeAsterisk}>✣</Text>;
}

function AsteriskLocked() {
  return <Text style={styles.lockedAsterisk}>✣</Text>;
}

function AsteriskDone() {
  return <Text style={styles.doneAsterisk}>✓</Text>;
}

function PlayActive() {
  return (
    <View style={styles.playActive}>
      <Text style={styles.playActiveText}>▶</Text>
    </View>
  );
}

function PlayLocked() {
  return (
    <View style={styles.playLocked}>
      <Text style={styles.playLockedText}>▶</Text>
    </View>
  );
}

function CheckDone() {
  return (
    <View style={styles.checkDone}>
      <Text style={styles.checkDoneText}>✓</Text>
    </View>
  );
}

export default function JourneyDetailScreen({
  navigation,
  route,
}: Props) {
  /*
   * JourneyDetail receives the PATH ID.
   */
  const pathId = route.params.id as string;

  const overview = useQuery(
    api.paths.getPathOverview,
    pathId ? { pathId: pathId as any } : "skip"
  );

  const startPath = useMutation(api.paths.startPath);

  useEffect(() => {
    if (!pathId || !overview) return;

    if (!overview.userPathId) {
      startPath({ pathId: pathId as any }).catch(() => {
        // Expected when the path is already active.
      });
    }
  }, [pathId, overview, startPath]);

  const [mountedAt] = useState(() => Date.now());

  /*
   * Loading
   */
  if (overview === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#335E78"
        />
      </View>
    );
  }

  /*
   * No path
   */
  if (!overview) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Path not found.
        </Text>
      </View>
    );
  }

  const availableSession = overview.sessions.find(
    (session) => session.status === "available"
  );

  const lastCompletedSession = [...overview.sessions]
    .reverse()
    .find(
      (session) => session.status === "completed"
    );

  const firstSession = overview.sessions[0];

  const continueSession =
    availableSession ??
    lastCompletedSession ??
    firstSession;

  const isReviewing =
    !availableSession && !!lastCompletedSession;

  const activeSession = overview.sessions.find(
    (session) => session.status === "available"
  );

  const currentDay = activeSession
    ? activeSession.dayNumber
    : overview.sessions.every(
        (session) => session.status === "completed"
      )
    ? overview.sessions.length
    : lastCompletedSession
    ? lastCompletedSession.dayNumber + 1
    : 1;

  const baseTime =
    mountedAt -
    (Math.min(
      currentDay,
      overview.sessions.length
    ) -
      1) *
      86400000;

  /*
   * Navigate using SESSION ID.
   */
  const handleContinue = () => {
    if (!continueSession) return;

  navigation.navigate("JourneySession", {
  id: pathId,
  sessionId: continueSession.sessionId,
});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}

        <View style={styles.hero}>
          <View style={styles.backRow}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft
                size={24}
                color="#335E78"
              />
            </Pressable>
          </View>

          <View style={styles.thumbnailContainer}>
            <Image
              source={require("../../assets/sailboat.png")}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>

          <View style={styles.heroText}>
            <Text style={styles.title}>
              {overview.title}
            </Text>

            <Text style={styles.description}>
              Learn to rest in God's unchanging character
              even when the path ahead is unclear or
              unsettling.
            </Text>
          </View>
        </View>

        {/* CONTINUE BUTTON */}

        <View style={styles.continueWrapper}>
          <Pressable
            onPress={handleContinue}
            style={styles.continueButton}
          >
            <Text style={styles.continueText}>
              {isReviewing
                ? "Review Session"
                : "Continue Reading"}
            </Text>

            <Text style={styles.continueIcon}>
              ▶▶
            </Text>
          </Pressable>
        </View>

        {/* READING SCHEDULE */}

        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>
            Reading Schedule
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scheduleRow}
          >
            {overview.sessions.map((session) => {
              const isActive =
                session.status === "available";

              const date = new Date(
                baseTime +
                  (session.dayNumber - 1) *
                    86400000
              );

              const dateNum = date.getDate();

              const dayAbbr =
                date.toLocaleDateString("en-US", {
                  weekday: "short",
                });

              return (
                <View
                  key={session.sessionId}
                  style={[
                    styles.scheduleCard,
                    isActive
                      ? styles.scheduleActive
                      : styles.scheduleInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.scheduleDay,
                      isActive
                        ? styles.scheduleDayActive
                        : styles.scheduleDayInactive,
                    ]}
                  >
                    {dayAbbr}
                  </Text>

                  <Text
                    style={[
                      styles.scheduleNumber,
                      isActive
                        ? styles.scheduleNumberActive
                        : styles.scheduleNumberInactive,
                    ]}
                  >
                    {dateNum}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* OVERVIEW */}

        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>
            Overview
          </Text>

          <Text style={styles.overviewText}>
            This {overview.totalDays}-day path is designed
            to help you rely on God's steady presence and
            character when life feels unclear or
            unpredictable.
          </Text>
        </View>

        {/* SESSIONS */}

        <View style={styles.sessionsSection}>
          <Text style={styles.sectionTitle}>
            Sessions
          </Text>

          <View style={styles.sessionsList}>
            {overview.sessions.map(
              (session, index) => {
                const isDone =
                  session.status === "completed";

                const isAvailable =
                  session.status === "available";

                const isLocked =
                  session.status === "locked";

                const rowContent = (
                  <View style={styles.sessionRow}>
                    <View style={styles.sessionLeft}>
                      <View style={styles.sessionStatus}>
                        {isDone ? (
                          <AsteriskDone />
                        ) : isAvailable ? (
                          <AsteriskActive />
                        ) : (
                          <AsteriskLocked />
                        )}
                      </View>

                      <View style={styles.sessionText}>
                        <Text
                          style={styles.sessionNumber}
                        >
                          Session {session.dayNumber}
                        </Text>

                        <Text
                          style={[
                            styles.sessionTitle,
                            isLocked &&
                              styles.sessionTitleLocked,
                          ]}
                        >
                          {session.title}
                        </Text>

                        {isDone && (
                          <Text
                            style={styles.completedText}
                          >
                            Completed
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.sessionRight}>
                      {isDone ? (
                        <CheckDone />
                      ) : isAvailable ? (
                        <PlayActive />
                      ) : (
                        <PlayLocked />
                      )}
                    </View>
                  </View>
                );

                

                return (
                  <View key={session.sessionId}>
                    {/* 
                     * MATCHES WEB:
                     * Available and completed sessions are clickable.
                     * Locked sessions are NOT clickable.
                     */}
                    {!isLocked ? (
                      <Pressable
                        onPress={() => {
                          navigation.navigate("JourneySession", {
  id: pathId,
  sessionId: session.sessionId,
});
                          
                        }}
                      >
                        {rowContent}
                      </Pressable>
                    ) : (
                      rowContent
                    )}

                    {index <
                      overview.sessions.length - 1 && (
                      <View
                        style={styles.divider}
                      />
                    )}
                  </View>
                );
              }
            )}
          </View>
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

  scrollContent: {
    paddingBottom: 120,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },

  hero: {
    backgroundColor: "rgba(51, 94, 120, 0.15)",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 20,
    paddingBottom: 32,
    overflow: "hidden",
  },

  backRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  thumbnailContainer: {
    width: 186,
    height: 206,
    alignSelf: "center",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },

  heroText: {
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 12,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
    color: "#184159",
    textAlign: "center",
  },

  description: {
    marginTop: 4,
    maxWidth: 205,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    color: "#535353",
    textAlign: "center",
  },

  continueWrapper: {
    alignItems: "center",
    marginTop: -20,
  },

  continueButton: {
    width: 275,
    height: 42,
    borderRadius: 8,
    backgroundColor: "#335E78",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },

  continueIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 15,
    color: "#535353",
  },

  scheduleSection: {
    marginTop: 24,
    paddingLeft: 19,
  },

  scheduleRow: {
    paddingTop: 19,
    paddingRight: 19,
    gap: 8,
  },

  scheduleCard: {
    width: 53,
    height: 59,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  scheduleActive: {
    backgroundColor: "#D9D9D9",
  },

  scheduleInactive: {
    backgroundColor: "#335E78",
  },

  scheduleDay: {
    fontSize: 10,
    fontWeight: "400",
  },

  scheduleDayActive: {
    color: "#888888",
  },

  scheduleDayInactive: {
    color: "#FFFFFF",
  },

  scheduleNumber: {
    fontSize: 16,
    fontWeight: "500",
  },

  scheduleNumberActive: {
    color: "#888888",
  },

  scheduleNumberInactive: {
    color: "#FFFFFF",
  },

  overviewSection: {
    paddingHorizontal: 19,
    marginTop: 24,
  },

  overviewText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    color: "#535353",
  },

  sessionsSection: {
    paddingHorizontal: 19,
    marginTop: 24,
  },

  sessionsList: {
    marginTop: 16,
  },

  sessionRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 24,
    paddingVertical: 4,
  },

  sessionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
  },

  sessionStatus: {
    width: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  activeAsterisk: {
    fontSize: 18,
    lineHeight: 18,
    color: "#335E78",
  },

  lockedAsterisk: {
    fontSize: 18,
    lineHeight: 18,
    color: "#B3B3B3",
  },

  doneAsterisk: {
    fontSize: 16,
    lineHeight: 18,
    color: "#335E78",
    fontWeight: "700",
  },

  sessionText: {
    flex: 1,
    gap: 2,
  },

  sessionNumber: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "400",
    color: "#535353",
  },

  sessionTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
    color: "#1E1E1E",
  },

  sessionTitleLocked: {
    color: "#B3B3B3",
  },

  completedText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "400",
    color: "#2A7A5A",
  },

  sessionRight: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  playActive: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
  },

  playActiveText: {
    color: "#FFFFFF",
    fontSize: 8,
    marginLeft: 1,
  },

  playLocked: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
  },

  playLockedText: {
    color: "#B3B3B3",
    fontSize: 8,
    marginLeft: 1,
  },

  checkDone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E8F4F0",
    alignItems: "center",
    justifyContent: "center",
  },

  checkDoneText: {
    color: "#2A7A5A",
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    borderTopWidth: 0.5,
    borderTopColor: "#E8E8E8",
    marginTop: 15,
  },
});
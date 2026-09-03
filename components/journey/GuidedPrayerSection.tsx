import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigation } from "@react-navigation/native";

type Props = {
  id: string;
  sessionId: string;
  dayNumber: number;
  scrollToSection: (index: number) => void;
  isActive: boolean;
  content: {
    title: string;
    prayerText: string;
  };
};

export default function GuidedPrayerSection({
  id,
  sessionId,
  dayNumber,
  scrollToSection,
  isActive,
  content,
}: Props) {
  const navigation = useNavigation<any>();

  const scrollRef = useRef<ScrollView>(null);

  const completeSession = useMutation(api.paths.completeSession);

  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] =
    useState(false);

  useEffect(() => {
    if (isActive) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }
  }, [isActive]);

  const handleComplete = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      const result = await completeSession({
        sessionId: sessionId as any,
      });

      setShowCompletionMessage(true);

      setTimeout(() => {
        setShowCompletionMessage(false);

        if (result.pathComplete) {
          navigation.navigate("JourneyFeedback", {
            id,
          });
        } else {
          navigation.navigate("JourneyDetail", {
            id,
          });
        }

        setIsCompleting(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to complete session:", error);
      setIsCompleting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Completion message */}
      {showCompletionMessage && (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>
            Day {dayNumber} Completed
          </Text>
        </View>
      )}

      {/* Scrollable content */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={() =>
            navigation.navigate("JourneyDetail", {
              id,
            })
          }
          style={styles.backButton}
        >
          <ArrowLeft
            size={24}
            color="#335E78"
            strokeWidth={2}
          />
        </Pressable>

        {/* Section label */}
        <View style={styles.labelRow}>
          <BookOpen
            size={12}
            color="#92ADBE"
            strokeWidth={2}
          />

          <Text style={styles.label}>
            GUIDED PRAYER
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {content.title}
        </Text>

        {/* Prayer box */}
        <View style={styles.prayerBox}>
          <View style={styles.prayerHeader}>
            <Sparkles
              size={22}
              color="#335E78"
              strokeWidth={2}
            />

            <Text style={styles.prayerLabel}>
              Guided Prayer
            </Text>
          </View>

          <Text style={styles.prayerText}>
            {content.prayerText}
          </Text>
        </View>
      </ScrollView>

      {/* Fixed footer */}
      <View style={styles.footer}>
        {/* Navigation row */}
        <View style={styles.navigationRow}>
          {/* Previous */}
          <Pressable
            onPress={() => scrollToSection(3)}
            style={styles.navigationButton}
          >
            <ArrowLeft
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>

          {/* Dots */}
          <View style={styles.dots}>
            <Pressable onPress={() => scrollToSection(0)}>
              <View style={styles.inactiveDot} />
            </Pressable>

            <Pressable onPress={() => scrollToSection(1)}>
              <View style={styles.inactiveDot} />
            </Pressable>

            <Pressable onPress={() => scrollToSection(2)}>
              <View style={styles.inactiveDot} />
            </Pressable>

            <Pressable onPress={() => scrollToSection(3)}>
              <View style={styles.inactiveDot} />
            </Pressable>

            <View style={styles.activeDot} />
          </View>

          {/* Spacer */}
          <View style={styles.navigationButton} />
        </View>

        {/* Complete session */}
        <Pressable
          onPress={handleComplete}
          disabled={isCompleting}
          style={({ pressed }) => [
            styles.completeButton,
            pressed && styles.buttonPressed,
            isCompleting && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.completeText}>
            {isCompleting
              ? "Completing..."
              : "Complete Session"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    color: "#92ADBE",
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 26,
    color: "#184159",
    marginBottom: 24,
  },

  prayerBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#335E78",
    backgroundColor: "rgba(51, 94, 120, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 16,
    overflow: "hidden",
  },

  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  prayerLabel: {
    fontSize: 11,
    fontWeight: "500",
    fontStyle: "italic",
    lineHeight: 15,
    color: "#335E78",
  },

  prayerText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: "#535353",
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 23,
    backgroundColor: "#FDFDFD",
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
     marginBottom: 27,
    gap: 20,
  },

  navigationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  navigationButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B3B3B3",
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#335E78",
  },

  completeButton: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    backgroundColor: "#335E78",
    justifyContent: "center",
    alignItems: "center",
  },

  completeText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  completionMessage: {
    position: "absolute",
    top: 55,
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: "#335E78",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },

  completionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
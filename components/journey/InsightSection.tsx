
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { ArrowLeft, ArrowRight, Sparkles, BookOpen } from "lucide-react-native";

type InsightContent = {
  title: string;
  coreInsight: string;
  paragraphs: string[];
};

type Props = {
  content: InsightContent;
  scrollToSection: (index: number) => void;
  isActive: boolean;
};

export default function InsightSection({
  content,
  scrollToSection,
}: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={styles.backContainer}>
          <Pressable
            onPress={() => scrollToSection(1)}
            style={styles.backButton}
          >
            <ArrowLeft
              size={22}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Section label */}
        <View style={styles.labelRow}>
          <BookOpen
            size={12}
            color="#92ADBE"
            strokeWidth={2}
          />

          <Text style={styles.label}>
            CHARACTER OF GOD INSIGHT
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {content.title}
        </Text>

        {/* Core Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightLabelRow}>
            <Sparkles
              size={25}
              color="#335E78"
              strokeWidth={1.8}
            />

            <Text style={styles.insightLabel}>
              Core Insight
            </Text>
          </View>

          <Text style={styles.coreInsight}>
            {content.coreInsight}
          </Text>
        </View>

        {/* Paragraphs */}
        <View style={styles.paragraphs}>
          {content.paragraphs.map((paragraph, index) => (
            <Text
              key={index}
              style={styles.paragraph}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Previous */}
        <Pressable
          onPress={() => scrollToSection(1)}
          style={styles.leftArrow}
        >
          <ArrowLeft
            size={24}
            color="#335E78"
            strokeWidth={2}
          />
        </Pressable>

        {/* Dots */}
        <View style={styles.dots}>
          <Pressable
            onPress={() => scrollToSection(0)}
            hitSlop={8}
          >
            <View style={styles.inactiveDot} />
          </Pressable>

          <Pressable
            onPress={() => scrollToSection(1)}
            hitSlop={8}
          >
            <View style={styles.inactiveDot} />
          </Pressable>

          <View style={styles.activeDot} />

          <Pressable
            onPress={() => scrollToSection(3)}
            hitSlop={8}
          >
            <View style={styles.inactiveDot} />
          </Pressable>

          <Pressable
            onPress={() => scrollToSection(4)}
            hitSlop={8}
          >
            <View style={styles.inactiveDot} />
          </Pressable>
        </View>

        {/* Next */}
        <Pressable
          onPress={() => scrollToSection(3)}
          style={styles.rightArrow}
        >
          <ArrowRight
            size={24}
            color="#335E78"
            strokeWidth={2}
          />
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

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 100,
  },

  backContainer: {
    marginBottom: 24,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },

  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: "#92ADBE",
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: "#184159",
    marginBottom: 20,
  },

  insightCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#335E78",
    backgroundColor: "rgba(51, 94, 120, 0.1)",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 16,
    marginBottom: 24,
    overflow: "hidden",
  },

  insightLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },

  insightLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#335E78",
  },

  coreInsight: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: "#184159",
  },

  paragraphs: {
    gap: 18,
  },

  paragraph: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "400",
    color: "#535353",
  },

  footer: {
    height: 80,
    paddingHorizontal: 21,
    paddingVertical: 25,
    backgroundColor: "#FDFDFD",
    borderTopWidth: 1,
    borderTopColor: "#EEF1F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 27,
  },

  leftArrow: {
    position: "absolute",
    left: 21,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  rightArrow: {
    position: "absolute",
    right: 21,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#335E78",
  },

  inactiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B3B3B3",
  },
});


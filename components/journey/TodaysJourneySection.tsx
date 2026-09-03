
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

type TodaysJourneyContent = {
  title: string;
  description: string;
  scriptureText: string;
  scriptureReference: string;
  paragraphs: string[];
  thumbnailSrc: any;
};

type Props = {
  id: string;
  content: TodaysJourneyContent;
  scrollToSection: (index: number) => void;
  isActive: boolean;
};

export default function TodaysJourneySection({
  id,
  content,
  scrollToSection,
  isActive,
}: Props) {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);

  // Match web behavior:
  // reset this section's internal scroll position whenever it becomes active.
  useEffect(() => {
    if (isActive) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {/* Scrollable Content Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={styles.backRow}>
          <Pressable
            onPress={() =>
              navigation.navigate("JourneyDetail", {
                id,
              })
            }
            style={styles.backButton}
            hitSlop={8}
          >
            <ArrowLeft
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Hero image */}
        <View style={styles.heroContainer}>
          <Image
            source={content.thumbnailSrc}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Section label */}
        <View style={styles.sectionLabel}>
          <BookOpen
            size={12}
            color="#7BA1B6"
            strokeWidth={2}
          />

          <Text style={styles.sectionLabelText}>
            TODAY'S JOURNEY
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {content.title}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          {content.description}
        </Text>

        {/* Core Scripture */}
        <View style={styles.scriptureCard}>
          <View style={styles.scriptureAccent} />

          <View style={styles.scriptureContent}>
            <Text style={styles.scriptureHeading}>
              CORE SCRIPTURE
            </Text>

            <Text style={styles.scriptureText}>
              {content.scriptureText}
            </Text>

            <Text style={styles.scriptureReference}>
              {content.scriptureReference}
            </Text>
          </View>
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

      {/* Fixed Footer Navigation */}
      <View style={[styles.footer, { marginBottom: 27 }]}>
        {/* Five section dots */}
        <View style={styles.dots}>
          {/* Today's Journey — active */}
          <View style={[styles.dot, styles.activeDot]} />

          {/* Context */}
          <Pressable
            onPress={() => scrollToSection(1)}
            hitSlop={8}
          >
            <View style={[styles.dot, styles.inactiveDot]} />
          </Pressable>

          {/* Insight */}
          <Pressable
            onPress={() => scrollToSection(2)}
            hitSlop={8}
          >
            <View style={[styles.dot, styles.inactiveDot]} />
          </Pressable>

          {/* Personal Application */}
          <Pressable
            onPress={() => scrollToSection(3)}
            hitSlop={8}
          >
            <View style={[styles.dot, styles.inactiveDot]} />
          </Pressable>

          {/* Guided Prayer */}
          <Pressable
            onPress={() => scrollToSection(4)}
            hitSlop={8}
          >
            <View style={[styles.dot, styles.inactiveDot]} />
          </Pressable>
        </View>

        {/* Right Arrow */}
        <Pressable
          onPress={() => scrollToSection(1)}
          style={styles.nextButton}
          hitSlop={8}
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

  scroll: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 21,
    paddingTop: 24,
    paddingBottom: 40,
  },

  backRow: {
    marginBottom: 24,
  },

  backButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#F3F7FA",
    alignItems: "center",
    justifyContent: "center",
  },

  heroContainer: {
    width: "100%",
    height: 166,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 18,
    backgroundColor: "#1E1E1E",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },

  sectionLabelText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
    letterSpacing: 0.5,
    color: "#7BA1B6",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 33,
    color: "#184159",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    color: "#535353",
    marginBottom: 24,
  },

  scriptureCard: {
    flexDirection: "row",
    borderRadius: 6,
    backgroundColor: "#F3F7FA",
    overflow: "hidden",
    marginBottom: 24,
  },

  scriptureAccent: {
    width: 4,
    backgroundColor: "#7BA1B6",
  },

  scriptureContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },

  scriptureHeading: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    letterSpacing: 0.5,
    color: "#184159",
    marginBottom: 9,
  },

  scriptureText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: "#535353",
    marginBottom: 6,
  },

  scriptureReference: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 15,
    color: "#305C76",
  },

  paragraphs: {
    gap: 24,
  },

  paragraph: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22,
    color: "#535353",
  },

  footer: {
    height: 76,
    paddingHorizontal: 21,
    backgroundColor: "#FDFDFD",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  activeDot: {
    backgroundColor: "#335E78",
  },

  inactiveDot: {
    backgroundColor: "#B3B3B3",
  },

  nextButton: {
    position: "absolute",
    right: 21,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
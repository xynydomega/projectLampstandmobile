import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

type ApplicationContent = {
  title: string;
  questions: string[];
};

type Props = {
  scrollToSection: (index: number) => void;
  isActive: boolean;
  content: ApplicationContent;
};

export default function ApplicationSection({
  scrollToSection,
  isActive,
  content,
}: Props) {
  const [answers, setAnswers] = useState<string[]>(
    content.questions.map(() => "")
  );

  useEffect(() => {
    setAnswers(content.questions.map(() => ""));
  }, [content.questions]);

  const updateAnswer = (index: number, value: string) => {
    setAnswers((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  };

  return (
    <View style={styles.container}>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <View style={styles.backContainer}>
          <Pressable
            onPress={() => scrollToSection(0)}
            style={styles.backButton}
            hitSlop={8}
          >
            <ArrowLeft
              size={22}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Label */}
        <View style={styles.labelRow}>
          <Text style={styles.labelIcon}>✦</Text>

          <Text style={styles.label}>
            PERSONAL APPLICATION
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {content.title}
        </Text>

        {/* Questions */}
        <View style={styles.questions}>
          {content.questions.map((question, index) => (
            <View
              key={index}
              style={styles.questionContainer}
            >
              <Text style={styles.question}>
                {question}
              </Text>

              <TextInput
                value={answers[index] ?? ""}
                onChangeText={(value) =>
                  updateAnswer(index, value)
                }
                placeholder="Your thoughts.."
                placeholderTextColor="rgba(179, 179, 179, 0.73)"
                multiline
                textAlignVertical="top"
                style={styles.input}
              />

              <Text style={styles.optional}>
                Write your thoughts (optional)
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Fixed bottom footer */}
      <View style={styles.footer}>

        {/* Navigation row */}
        <View style={styles.navigationRow}>

          {/* Previous */}
          <Pressable
            onPress={() => scrollToSection(2)}
            style={styles.arrowButton}
            hitSlop={8}
            accessibilityLabel="Go to Insight"
          >
            <ArrowLeft
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>

          {/* Navigation bubbles */}
          <View style={styles.dots}>

            {/* Today's Journey */}
            <Pressable
              onPress={() => scrollToSection(0)}
              hitSlop={8}
              accessibilityLabel="Go to Today's Journey"
            >
              <View style={styles.inactiveDot} />
            </Pressable>

            {/* Context */}
            <Pressable
              onPress={() => scrollToSection(1)}
              hitSlop={8}
              accessibilityLabel="Go to Context"
            >
              <View style={styles.inactiveDot} />
            </Pressable>

            {/* Insight */}
            <Pressable
              onPress={() => scrollToSection(2)}
              hitSlop={8}
              accessibilityLabel="Go to Insight"
            >
              <View style={styles.inactiveDot} />
            </Pressable>

            {/* Personal Application */}
            <View style={styles.activeDot} />

            {/* Guided Prayer */}
            <Pressable
              onPress={() => scrollToSection(4)}
              hitSlop={8}
              accessibilityLabel="Go to Guided Prayer"
            >
              <View style={styles.inactiveDot} />
            </Pressable>

          </View>

          {/* Next */}
          <Pressable
            onPress={() => scrollToSection(4)}
            style={styles.arrowButton}
            hitSlop={8}
            accessibilityLabel="Go to Guided Prayer"
          >
            <ArrowRight
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>

        </View>

        {/* Continue to Prayer */}
        <Pressable
          onPress={() => scrollToSection(4)}
          style={styles.continueButton}
          accessibilityRole="button"
          accessibilityLabel="Continue to Prayer"
        >
          <Text style={styles.continueText}>
            Continue to Prayer
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
    position: "relative",
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,

    // Space for the fixed footer
    paddingBottom: 180,
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

  labelIcon: {
    fontSize: 11,
    color: "#92ADBE",
  },

  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    color: "#92ADBE",
  },

  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    color: "#184159",
    marginBottom: 24,
  },

  questions: {
    gap: 20,
  },

  questionContainer: {
    gap: 8,
  },

  question: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "#184159",
    marginBottom: 4,
  },

  input: {
    height: 63,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(51, 94, 120, 0.3)",
    fontSize: 12,
    lineHeight: 18,
    color: "#535353",
  },

  optional: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: "italic",
    fontWeight: "400",
    color: "#828282",
  },

  /*
   * Footer is now anchored to the bottom
   * of the ApplicationSection page.
   */
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 20,
    paddingTop: 23,
    paddingBottom: 23,
    marginBottom: 27,

    backgroundColor: "#FDFDFD",
    borderTopWidth: 1,
    borderTopColor: "#EEF1F3",

    gap: 20,

    zIndex: 10,
    elevation: 10,
  },

  navigationRow: {
    width: "100%",
    height: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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

  continueButton: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    backgroundColor: "#335E78",

    alignItems: "center",
    justifyContent: "center",

    flexShrink: 0,
  },

  continueText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
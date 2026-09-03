import React, { useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { JourneyStackParamList } from "../../navigation/AppNavigator";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

import TodaysJourneySection from "./TodaysJourneySection";
import ContextSection from "./ContextSection";
import InsightSection from "./InsightSection";
import ApplicationSection from "./ApplicationSection";
import GuidedPrayerSection from "./GuidedPrayerSection";

const { width, height } = Dimensions.get("window");

type Props = NativeStackScreenProps<
  JourneyStackParamList,
  "JourneySession"
>;

export default function JourneySessionScreen({
  route,
}: Props) {
  const { id, sessionId } = route.params;

  console.log("JOURNEY SESSION ID:", sessionId);

  const session = useQuery(
    api.paths.getSessionContent,
    sessionId
      ? { sessionId: sessionId as any }
      : "skip"
  );

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToSection = (index: number) => {
    scrollRef.current?.scrollTo({
      x: width * index,
      animated: true,
    });

    setActiveIndex(index);
  };

  const handleScroll = (event: any) => {
    const offsetX =
      event.nativeEvent.contentOffset.x;

    const index = Math.round(offsetX / width);

    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  if (!sessionId || session === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#335E78"
        />
      </View>
    );
  }

  if (session === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Session not found.
        </Text>
      </View>
    );
  }

  const todaysJourneyContent = {
    title: session.title,
    description: session.applicationText ?? "",
    scriptureText: session.scriptureVerse ?? "",
    scriptureReference:
      session.scriptureReference ?? "",
    paragraphs: [] as string[],
    thumbnailSrc: require("../../assets/sailboat.png"),
  };

  const contextContent = {
    title: "Historical & Biblical Background",
    paragraphs: session.scriptureContext
      ? [session.scriptureContext]
      : ["Context coming soon."],
  };

  const insightContent = {
    title: "What this Reveals About God",
    coreInsight: session.insightText
      ? session.insightText.split(".")[0] + "."
      : "God is Compassionate & Gracious",
    paragraphs: session.insightText
      ? [session.insightText]
      : ["Insight coming soon."],
  };

  const applicationContent = {
    title: "Formation Questions",
    questions:
      session.reflectionQuestions ?? [
        "What area of your life feels most uncertain right now?",
        "How do you usually respond when you don't have control?",
        "What would it look like to trust God in this situation?",
      ],
  };

  const guidedPrayerContent = {
    title: "Talk to God",
    prayerText: session.guidedPrayer ?? "",
  };

  const dayNumber =
    typeof (session as any).dayNumber === "number"
      ? (session as any).dayNumber
      : 1;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.horizontalContent}
      >
        <View style={styles.page}>
          <TodaysJourneySection
  id={id}
            scrollToSection={scrollToSection}
            isActive={activeIndex === 0}
            content={todaysJourneyContent}
          />
        </View>

        <View style={styles.page}>
          <ContextSection
            scrollToSection={scrollToSection}
            isActive={activeIndex === 1}
            content={contextContent}
          />
        </View>

        <View style={styles.page}>
          <InsightSection
            scrollToSection={scrollToSection}
            isActive={activeIndex === 2}
            content={insightContent}
          />
        </View>

        <View style={styles.page}>
          <ApplicationSection
            scrollToSection={scrollToSection}
            isActive={activeIndex === 3}
            content={applicationContent}
          />
        </View>

        <View style={styles.page}>
  <GuidedPrayerSection
    id={id}
    sessionId={sessionId}
    dayNumber={dayNumber}
    scrollToSection={scrollToSection}
    isActive={activeIndex === 4}
    content={guidedPrayerContent}
  />
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

  horizontalScroll: {
    flex: 1,
  },

  horizontalContent: {
    height,
  },

  page: {
    width,
    height,
    flexShrink: 0,
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
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
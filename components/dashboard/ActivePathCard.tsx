import { View, Text, Pressable, StyleSheet, Image } from "react-native";

type ActivePathCardProps = {
  state?: "active" | "complete" | "none";
  currentDay?: number;
  totalDays?: number;
  progressPercentage?: number;
  onPress?: () => void;
};

export default function ActivePathCard({
  state = "none",
  currentDay = 0,
  totalDays = 0,
  progressPercentage = 0,
  onPress,
}: ActivePathCardProps) {
  const statusText =
    state === "active"
      ? "ACTIVE PATH"
      : state === "complete"
        ? "COMPLETED PATH"
        : "NO ACTIVE PATH";

  const dayText =
    state === "active"
      ? `Day ${currentDay} of ${totalDays}`
      : state === "complete"
        ? "Finished"
        : "";

  const description =
    state === "active"
      ? "You're making great progress this week"
      : state === "complete"
        ? "You have completed this journey."
        : "Please select a path to get started.";

  const buttonText =
    state === "active"
      ? "Continue"
      : state === "complete"
        ? "Review Journey"
        : "Go to Paths";

  return (
    <View style={styles.container}>
      <View style={styles.imageArea}>
        {/* Sailboat image will be connected here */}
        
        <Image
          source={require("../../assets/sailboat.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.status}>{statusText}</Text>

            <Text style={styles.day}>
              {dayText}
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progress,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>

          <Text style={styles.description}>
            {description}
          </Text>

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>
              {buttonText}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },

  imageArea: {
    minHeight: 260,
    borderRadius: 12,
    backgroundColor: "#9BB8C5",
    overflow: "hidden",
    justifyContent: "flex-end",
  },

  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  status: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2A5975",
    backgroundColor: "#E3F0F8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  day: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2A5975",
  },

  progressBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 12,
  },

  progress: {
    height: "100%",
    backgroundColor: "#305C76",
    borderRadius: 999,
  },

  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },

  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#305C76",
    borderRadius: 8,
    alignItems: "center",
  },

  buttonPressed: {
    backgroundColor: "#1E4B65",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
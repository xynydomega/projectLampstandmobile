import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { CalendarIcon } from "lucide-react-native";

interface FormationPathCardProps {
  title: string;
  description: string;
  duration: string;
  image: ImageSourcePropType;
  onPress?: () => void;
}

export default function FormationPathCard({
  title,
  description,
  duration,
  image,
  onPress,
}: FormationPathCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.left}>
          <View style={styles.durationRow}>
            <CalendarIcon width={14} height={14} />   

            <Text style={styles.duration}>
              {duration}
            </Text>
          </View>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 2,
    padding: 14,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  cardPressed: {
    transform: [{ scale: 0.99 }],
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    paddingRight: 16,
    gap: 10,
  },

  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  calendar: {
    fontSize: 12,
    color: "#4A6B82",
    marginRight: 6,
  },

  duration: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4A6B82",
    letterSpacing: 0.5,
    lineHeight: 14,
  },

  title: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: 0.15,
  },

  description: {
    fontSize: 11,
    lineHeight: 14,
    color: "#64748B",
    paddingRight: 8,
    opacity: 0.9,
  },

  imageContainer: {
    width: 86,
    height: 86,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  image: {
    width: 73,
    height: 73,
  },
});
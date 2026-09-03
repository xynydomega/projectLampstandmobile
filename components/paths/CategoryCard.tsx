import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import type { SvgProps } from "react-native-svg";

interface CategoryCardProps {
  title: string;
  image: React.FC<SvgProps>;
  available: boolean;
  amount: string;
  onPress?: () => void;
}

export default function CategoryCard({
  title,
  image: ImageComponent,
  available,
  amount,
  onPress,
}: CategoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.main}>
        <View style={styles.left}>
          <ImageComponent
  width={72}
  height={72}
  opacity={0.8}
/>

          <View style={styles.info}>
            <Text style={styles.title}>
              {title}
            </Text>

            <Text style={styles.amount}>
              {amount} formation{"\n"}paths
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onPress}
          disabled={!available}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            View paths
          </Text>
        </Pressable>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {available
            ? "NOW AVAILABLE - START YOUR JOURNEY"
            : "COMING SOON - CHECK BACK LATER"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 4,
    overflow: "hidden",
  },

  main: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#222222",
    marginRight: 16,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "700",
    color: "#1B3B5A",
  },

  amount: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    color: "#64748B",
  },

  button: {
  paddingHorizontal: 20,
  paddingVertical: 10,
  backgroundColor: "#305C76",
  borderRadius: 4,
},

  buttonPressed: {
    transform: [{ scale: 0.95 }],
  },

  buttonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "500",
},

  statusContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingVertical: 8,
    paddingHorizontal: 24,
  },

  statusText: {
    fontSize: 11,
    color: "#1B3B5A",
    letterSpacing: 0.88,
    textTransform: "uppercase",
  },
});
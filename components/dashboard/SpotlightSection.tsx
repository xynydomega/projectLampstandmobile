import { View, Text, ScrollView, Image, StyleSheet } from "react-native";

export default function SpotlightSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Spotlight</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Image
            source={require("../../assets/spotlight1.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.card}>
          <Image
            source={require("../../assets/spotlight2.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 16,
    marginLeft: 24,
  },

  scrollContent: {
    paddingLeft: 24,
    paddingRight: 12,
    gap: 16,
  },

  card: {
    width: 256,
    height: 144,
    borderRadius: 12,
    backgroundColor: "#345D77",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },
});
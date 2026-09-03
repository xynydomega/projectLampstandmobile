import { View, Text, ScrollView, Image, StyleSheet } from "react-native";

type RecommendedSectionProps = {
  formationPathCount?: number;
};

export default function RecommendedSection({
  formationPathCount = 0,
}: RecommendedSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recommended For You</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.item}>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/book-with-leaf.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.name}>Fear & Anxiety</Text>

          <Text style={styles.count}>
            {formationPathCount} Formation Paths
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 96,
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
  },

  item: {
    width: 200,
  },

  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#D4DDE4",
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    padding: 12,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },

  count: {
    fontSize: 13,
    color: "#94A3B8",
  },
});
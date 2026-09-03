import { View, Text, StyleSheet } from "react-native";

type DashboardHeaderProps = {
  firstName?: string;
  isAuthenticated?: boolean;
};

export default function DashboardHeader({
  firstName = "there",
  isAuthenticated = true,
}: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>
          Hi, {firstName}
        </Text>

        {isAuthenticated ? (
          <Text style={styles.subtitle}>
            Welcome Back
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            Please sign in to continue
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },

  greeting: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
});
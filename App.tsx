import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { ConvexAuthProvider, useConvexAuth } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { convex } from "./convexClient";
import { secureStorage } from "./secureStorage";
import { api } from "./convex/_generated/api";
import AuthScreen from "./components/auth/AuthScreen";
import OnboardingScreen from "./components/onboarding/OnboardingScreen";
import AppNavigator from "./navigation/AppNavigator";

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const me = useQuery(
    api.users.me,
    isAuthenticated ? {} : "skip"
  );

  const isMeLoading = isAuthenticated && me === undefined;

  if (authLoading || isMeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#335E78" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthScreen />
      </NavigationContainer>
    );
  }

  // Authenticated but onboarding not complete -> show onboarding
  if (me && !me.hasCompletedOnboarding) {
    return (
      <OnboardingScreen
        initialFirstName={me.firstName ?? ""}
        initialLastName={me.lastName ?? ""}
        initialPhoneNumber={me.phoneNumber ?? ""}
      />
    );
  }

  // Authenticated + onboarding complete (or me === null edge case) -> main app
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FDFDFD",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function App() {
  return (
    <ConvexAuthProvider client={convex} storage={secureStorage}>
      <AppContent />
    </ConvexAuthProvider>
  );
}
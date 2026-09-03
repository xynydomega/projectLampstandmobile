
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../components/DashboardScreen";

import ProfileScreen from "../components/profile/ProfileScreen";
import PersonalInformationScreen from "../components/profile/PersonalInformationScreen";

import PathsScreen from "../components/paths/PathsScreen";
import CategoryPathsScreen from "../components/paths/CategoryPathsScreen";

import MyJourneyScreen from "../components/journey/MyJourneyScreen";
import JourneyDetailScreen from "../components/journey/JourneyDetailScreen";
import JourneySessionScreen from "../components/journey/JourneySessionScreen";

import DashboardBottomNav from "../components/dashboard/DashboardBottomNav";

/* =========================================================
   ROOT TABS
========================================================= */

export type RootTabParamList = {
  Home: undefined;
  Paths: undefined;
  Journey: undefined;
  Profile: undefined;
};

/* =========================================================
   PATHS STACK
========================================================= */

export type PathsStackParamList = {
  Categories: undefined;
  CategoryPaths: {
    categoryTitle: string;
  };
};

/* =========================================================
   JOURNEY STACK
========================================================= */

export type JourneyStackParamList = {
  MyJourney: undefined;
  JourneyDetail: {
    id: string;
  };
JourneySession: {
  id: string;
  sessionId: string;
};
};

/* =========================================================
   PROFILE STACK
========================================================= */

export type ProfileStackParamList = {
  ProfileHome: undefined;
  PersonalInformation: undefined;
};

/* =========================================================
   NAVIGATORS
========================================================= */

const Tab = createBottomTabNavigator<RootTabParamList>();

const PathsStack =
  createNativeStackNavigator<PathsStackParamList>();

const JourneyStack =
  createNativeStackNavigator<JourneyStackParamList>();

const ProfileStack =
  createNativeStackNavigator<ProfileStackParamList>();

/* =========================================================
   PATHS NAVIGATOR
========================================================= */

function PathsNavigator() {
  return (
    <PathsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <PathsStack.Screen
        name="Categories"
        component={PathsScreen}
      />

      <PathsStack.Screen
        name="CategoryPaths"
        component={CategoryPathsScreen}
      />
    </PathsStack.Navigator>
  );
}

/* =========================================================
   JOURNEY NAVIGATOR
========================================================= */

function JourneyNavigator() {
  return (
    <JourneyStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <JourneyStack.Screen
        name="MyJourney"
        component={MyJourneyScreen}
      />

      <JourneyStack.Screen
        name="JourneyDetail"
        component={JourneyDetailScreen}
      />

      <JourneyStack.Screen
  name="JourneySession"
  component={JourneySessionScreen}
/>
    </JourneyStack.Navigator>
  );
}

/* =========================================================
   PROFILE NAVIGATOR
========================================================= */

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
      />

      <ProfileStack.Screen
        name="PersonalInformation"
        component={PersonalInformationScreen}
      />
    </ProfileStack.Navigator>
  );
}

/* =========================================================
   MAIN NAVIGATOR
========================================================= */

export default function AppNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => (
        <DashboardBottomNav {...props} />
      )}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Paths"
        component={PathsNavigator}
      />

      <Tab.Screen
        name="Journey"
        component={JourneyNavigator}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
      />
    </Tab.Navigator>
  );
}



import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Phone,
  Compass,
  Globe,
  AlertTriangle,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../navigation/AppNavigator";
import { useQuery, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

type Props = NativeStackScreenProps<ProfileStackParamList, "ProfileHome">;

const SPIRITUAL_SEASON_LABELS: Record<string, string> = {
  uncertain_future: "Facing an Uncertain Future",
  pressure_stress: "Under Pressure & Stress",
  struggling_to_trust: "Struggling to Trust",
  waiting: "Waiting in Season",
  distant_from_god: "Feeling Distant from God",
  none: "None / Fresh Start",
};

export default function ProfileScreen({ navigation }: Props) {
  const { signOut } = useAuthActions();

  const me = useQuery(api.users.me);
  const activeSubscription = useQuery(api.donations.getActiveSubscription);
  const cancelSub = useAction(api.donations.cancelSubscription);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isLoading = me === undefined;

  // Same fallbacks as web profile
  const firstName = me?.firstName || "";
  const lastName = me?.lastName || "";

  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : "Lampstand Pilgrim";

  const email = me?.email || "No email linked";
  const phoneNumber = me?.phoneNumber || "Not provided";
  const region = (me as any)?.region || "Not specified";

  const spiritualSeason = me?.spiritualSeason
    ? SPIRITUAL_SEASON_LABELS[me.spiritualSeason] || me.spiritualSeason
    : "Not chosen";

  // Same avatar logic as web
  const avatarUrl =
    me?.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=335E78&color=fff&size=128`;

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    setIsSigningOut(true);

    try {
      await signOut();
      // App.tsx switches to AuthScreen after authentication changes
    } catch (e) {
      console.error("Failed to sign out", e);
      setIsSigningOut(false);

      Alert.alert(
        "Error",
        "Failed to sign out. Please try again."
      );
    }
  };

  const handleCancelSubscription = () => {
    if (!activeSubscription?.subscriptionId || isCancelling) {
      return;
    }

    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your monthly support subscription?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);

            try {
              await cancelSub({
                subscriptionId: activeSubscription.subscriptionId,
              });

              Alert.alert(
                "Cancelled",
                "Your subscription has been successfully cancelled."
              );
            } catch (e) {
              console.error(
                "Failed to cancel subscription:",
                e
              );

              Alert.alert(
                "Error",
                "Could not cancel your subscription. Please try again later."
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft
              size={26}
              color="#305C76"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.heading}>
          <Text style={styles.title}>Profile</Text>

          <Text style={styles.subtitle}>
            Manage your Lampstand Profile from here.
          </Text>
        </View>

        {/* User Card */}
        {isLoading ? (
          <View
            style={[
              styles.userCard,
              styles.loadingCard,
            ]}
          >
            <ActivityIndicator
              size="small"
              color="#335E78"
            />

            <Text style={styles.loadingText}>
              Loading profile...
            </Text>
          </View>
        ) : (
          <View style={styles.userCard}>
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
            />

            <View style={styles.userInfo}>
              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {fullName}
              </Text>

              <View style={styles.emailRow}>
                <Mail
                  size={14}
                  color="#94A3B8"
                  strokeWidth={2}
                />

                <Text
                  style={styles.email}
                  numberOfLines={1}
                >
                  {email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Menu */}
        <View style={styles.menuSection}>
          <Pressable
            onPress={() =>
              navigation.navigate("PersonalInformation")
            }
            style={styles.menuItem}
          >
            <View>
              <Text style={styles.menuTitle}>
                Personal Information
              </Text>

              <Text style={styles.menuDescription}>
                Edit your personal details.
              </Text>
            </View>

            <ChevronRight
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>

          <Pressable
            onPress={() => setShowLogoutModal(true)}
            style={styles.menuItem}
            disabled={isSigningOut}
          >
            <View>
              <Text style={styles.menuTitle}>
                Log Out
              </Text>

              <Text style={styles.menuDescription}>
                Sign out of your account.
              </Text>
            </View>

            <ChevronRight
              size={24}
              color="#335E78"
              strokeWidth={2}
            />
          </Pressable>
        </View>

        {/* Journey Details */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            YOUR JOURNEY DETAILS
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Compass
                  size={20}
                  color="#2A5975"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  SPIRITUAL SEASON
                </Text>

                <Text style={styles.detailValue}>
                  {spiritualSeason}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Phone
                  size={20}
                  color="#2A5975"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  PHONE NUMBER
                </Text>

                <Text style={styles.detailValueNormal}>
                  {phoneNumber}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Globe
                  size={20}
                  color="#2A5975"
                  strokeWidth={2}
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  REGION
                </Text>

                <Text style={styles.detailValueNormal}>
                  {region}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Support */}
        {activeSubscription && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              ACTIVE SUPPORT
            </Text>

            <View style={styles.supportCard}>
              <View style={styles.supportHeader}>
                <View>
                  <Text style={styles.supportTitle}>
                    Monthly Donation
                  </Text>

                  <Text style={styles.supportSubtitle}>
                    Thank you for your ongoing support!
                  </Text>
                </View>

                <Text style={styles.amount}>
                  {activeSubscription.displayAmountLabel}
                </Text>
              </View>

              {/* Payment Failure */}
              {activeSubscription.failureReason && (
                <View style={styles.warning}>
                  <AlertTriangle
                    size={20}
                    color="#DC2626"
                    strokeWidth={2}
                  />

                  <Text style={styles.warningText}>
                    <Text style={styles.warningTitle}>
                      Payment Failed{"\n"}
                    </Text>
                    Your last payment attempt failed.
                    Please update your payment method to
                    keep your support active.
                  </Text>
                </View>
              )}

              {/* Cancel Subscription */}
              <Pressable
                onPress={handleCancelSubscription}
                disabled={isCancelling}
                style={[
                  styles.cancelButton,
                  isCancelling && styles.cancelButtonDisabled,
                ]}
              >
                {isCancelling ? (
                  <ActivityIndicator
                    size="small"
                    color="#DC2626"
                  />
                ) : (
                  <Text style={styles.cancelText}>
                    Cancel Subscription
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Log Out
            </Text>

            <Text style={styles.modalMessage}>
              {isSigningOut
                ? "Logging out..."
                : "Are you sure you want to log out?"}
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() =>
                  setShowLogoutModal(false)
                }
                disabled={isSigningOut}
                style={styles.cancelModalButton}
              >
                <Text style={styles.cancelModalText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmLogout}
                disabled={isSigningOut}
                style={[
                  styles.logoutButton,
                  isSigningOut &&
                    styles.logoutButtonDisabled,
                ]}
              >
                {isSigningOut ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.logoutText}>
                    Log Out
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 110,
  },

  header: {
    paddingHorizontal: 21,
    paddingTop: 24,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  heading: {
    marginTop: 30,
    paddingHorizontal: 32,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    color: "#2A5975",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 21,
    color: "#535353",
  },

  userCard: {
    marginHorizontal: 21,
    marginTop: 28,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
  },

  loadingCard: {
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    marginLeft: 12,
    fontSize: 13,
    color: "#64748B",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#335E78",
    borderWidth: 2,
    borderColor: "#DCE3E8",
  },

  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2A5975",
  },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 6,
  },

  email: {
    flex: 1,
    fontSize: 13,
    color: "#64748B",
  },

  menuSection: {
    marginTop: 28,
    marginHorizontal: 21,
    borderBottomWidth: 1,
    borderBottomColor: "#535353",
  },

  menuItem: {
    minHeight: 82,
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuTitle: {
    fontSize: 18,
    color: "#535353",
  },

  menuDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#535353",
  },

  section: {
    marginHorizontal: 21,
    marginTop: 30,
  },

  sectionLabel: {
    marginBottom: 10,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    color: "#94A3B8",
  },

  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },

  detailRow: {
    minHeight: 76,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 9,
    backgroundColor: "#E3F0F8",
    alignItems: "center",
    justifyContent: "center",
  },

  detailContent: {
    flex: 1,
    marginLeft: 14,
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: "#2A5975",
  },

  detailValueNormal: {
    marginTop: 3,
    fontSize: 14,
    color: "#475569",
  },

  supportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E3F0F8",
    padding: 20,
  },

  supportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  supportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2A5975",
  },

  supportSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },

  amount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2A5975",
  },

  warning: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: "#B91C1C",
  },

  warningTitle: {
    fontWeight: "600",
  },

  cancelButton: {
    marginTop: 14,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonDisabled: {
    opacity: 0.6,
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DC2626",
  },

  bottomSpace: {
    height: 30,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#184159",
  },

  modalMessage: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#535353",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },

  cancelModalButton: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelModalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  logoutButton: {
    flex: 1,
    height: 44,
    borderRadius: 9,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});


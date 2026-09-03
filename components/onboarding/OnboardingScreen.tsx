import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// ── Options mirroring web app/onboarding/page.tsx ──

const SEASONS = [
  { value: "struggling_to_trust", label: "Struggling to trust God" },
] as const;

const COMING_SOON_SEASONS = [
  { value: "uncertain_future", label: "Feeling uncertain about the future" },
  { value: "pressure_stress", label: "Living under pressure or stress" },
  { value: "waiting", label: "Waiting for something that hasn't come" },
  { value: "distant_from_god", label: "Feeling distant from God" },
  { value: "none", label: "None of these feel quite right" },
] as const;

const DAILY_SESSION_TIMES = [
  { value: "early_morning", label: "Early Morning", subtitle: "Before the day begins" },
  { value: "afternoon", label: "Afternoon", subtitle: "A midday pause" },
  { value: "evening", label: "Evening", subtitle: "When things slow down" },
  { value: "before_bed", label: "Before Bed", subtitle: "A quiet close to the day" },
] as const;

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "Whatsapp" },
  { value: "both", label: "Both" },
] as const;

function RadioIndicator({ selected }: { selected: boolean }) {
  if (selected) {
    return (
      <View style={styles.radioSelected}>
        <Text style={styles.radioCheck}>✓</Text>
      </View>
    );
  }
  return <View style={styles.radioUnselected} />;
}

type Props = {
  initialFirstName?: string;
  initialLastName?: string;
  initialPhoneNumber?: string;
  onComplete?: () => void;
};

export default function OnboardingScreen({
  initialFirstName = "",
  initialLastName = "",
  initialPhoneNumber = "",
  onComplete,
}: Props) {
  const updateProfile = useMutation(api.users.updateProfile);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [step, setStep] = useState<"profile" | "onboarding">("profile");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);

  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [dailySessionTime, setDailySessionTime] = useState<string | null>("early_morning");
  const [contactMethod, setContactMethod] = useState<string | null>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFirstName) setFirstName(initialFirstName);
    if (initialLastName) setLastName(initialLastName);
    if (initialPhoneNumber) setPhoneNumber(initialPhoneNumber);
  }, [initialFirstName, initialLastName, initialPhoneNumber]);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setStep("onboarding");
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!selectedSeason || !dailySessionTime || !contactMethod) return;
    setError(null);
    setIsLoading(true);
    try {
      await completeOnboarding({
        spiritualSeason: selectedSeason,
        studyTimePreference: dailySessionTime ?? undefined,
        contactPreference: contactMethod ?? undefined,
        phoneNumber:
          (contactMethod === "whatsapp" || contactMethod === "both") && phoneNumber.trim()
            ? phoneNumber.trim()
            : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      });
      onComplete?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const showPhoneField = contactMethod === "whatsapp" || contactMethod === "both";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Logo */}
      <View style={styles.logo}>
        <Text style={styles.logoText}>L</Text>
      </View>

      {step === "profile" ? (
        <>
          <View style={styles.heading}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Please fill in the information below to create your account</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter First Name"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              editable={!isLoading}
              style={styles.input}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter Last Name"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              editable={!isLoading}
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Pressable
            onPress={handleSaveProfile}
            disabled={!firstName.trim() || !lastName.trim() || isLoading}
            style={[
              styles.primaryButton,
              (!firstName.trim() || !lastName.trim() || isLoading) && styles.primaryButtonDisabled,
            ]}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Continue</Text>}
          </Pressable>
        </>
      ) : (
        <>
          {/* Section A: Spiritual Season */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Where are you right now?</Text>
            <Text style={styles.sectionSubtitle}>Choose the season that feels most true for you today.</Text>
          </View>

          <View style={styles.optionsList}>
            {SEASONS.map((season) => {
              const isSelected = selectedSeason === season.value;
              return (
                <Pressable
                  key={season.value}
                  onPress={() => setSelectedSeason(season.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <Text style={styles.optionLabel}>{season.label}</Text>
                  <RadioIndicator selected={isSelected} />
                </Pressable>
              );
            })}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Coming Soon</Text>
              <View style={styles.dividerLine} />
            </View>

            {COMING_SOON_SEASONS.map((season) => (
              <View key={season.value} style={[styles.optionCard, styles.optionDisabled]}>
                <Text style={styles.optionLabelDisabled}>{season.label}</Text>
                <Text style={styles.soonText}>soon</Text>
              </View>
            ))}
          </View>

          {/* Section B: Daily session time */}
          <View style={[styles.section, { marginTop: 28 }]}>
            <Text style={styles.sectionTitle}>When would you like to do your daily session?</Text>
            <Text style={styles.sectionSubtitle}>We&apos;ll send you a gentle reminder at this time each day.</Text>
          </View>

          <View style={styles.optionsList}>
            {DAILY_SESSION_TIMES.map((option) => {
              const isSelected = dailySessionTime === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setDailySessionTime(option.value)}
                  style={[styles.optionCardTall, isSelected && styles.optionCardSelected]}
                >
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  </View>
                  <RadioIndicator selected={isSelected} />
                </Pressable>
              );
            })}
          </View>

          {/* Section C: Contact method */}
          <View style={[styles.section, { marginTop: 28 }]}>
            <Text style={styles.sectionTitle}>How would you like us to keep in touch?</Text>
            <Text style={styles.sectionSubtitle}>We only reach out when it matters — never spam.</Text>
          </View>

          <View style={styles.optionsList}>
            {CONTACT_METHODS.map((option) => {
              const isSelected = contactMethod === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setContactMethod(option.value)}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <RadioIndicator selected={isSelected} />
                </Pressable>
              );
            })}
          </View>

          {showPhoneField && (
            <View style={styles.phoneField}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                value={phoneNumber}
                onChangeText={(v) => setPhoneNumber(v.replace(/[^0-9+\s-]/g, ""))}
                placeholder="+234 800 000 0000"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                editable={!isLoading}
                style={styles.input}
              />
            </View>
          )}

          {error ? <Text style={styles.errorCenter}>{error}</Text> : null}

          <Pressable
            onPress={handleCompleteOnboarding}
            disabled={
              !selectedSeason ||
              !dailySessionTime ||
              !contactMethod ||
              (showPhoneField && !phoneNumber.trim()) ||
              isLoading
            }
            style={[
              styles.primaryButton,
              (!selectedSeason ||
                !dailySessionTime ||
                !contactMethod ||
                (showPhoneField && !phoneNumber.trim()) ||
                isLoading) &&
                styles.primaryButtonDisabled,
              { marginTop: 24 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Start My Journey</Text>
            )}
          </Pressable>

          <Pressable onPress={() => setStep("profile")} disabled={isLoading} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to profile</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#335E78",
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#535353",
  },
  form: {
    marginTop: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#335E78",
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#DCE3E8",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#535353",
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    color: "#DC2626",
  },
  errorCenter: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 13,
    color: "#DC2626",
  },
  primaryButton: {
    height: 52,
    borderRadius: 9,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#335E78",
    lineHeight: 20,
  },
  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#535353",
    lineHeight: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#B3B3B3",
    backgroundColor: "#FCFCFC",
  },
  optionCardTall: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#B3B3B3",
    backgroundColor: "#FCFCFC",
  },
  optionCardSelected: {
    borderColor: "#335E78",
    backgroundColor: "#EEF4F8",
  },
  optionTextCol: {
    gap: 2,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#335E78",
  },
  optionLabelDisabled: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999999",
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#535353",
  },
  optionDisabled: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
    opacity: 0.7,
  },
  soonText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#BBBBBB",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#999999",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneField: {
    marginTop: 16,
  },
  radioSelected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCheck: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 13,
    textAlign: "center",
  },
  radioUnselected: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#B3B3B3",
    backgroundColor: "transparent",
  },
  backLink: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#335E78",
  },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, User, Phone, Save } from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export default function PersonalInformationScreen({ navigation }: Props) {
  const me = useQuery(api.users.me);
  const updateProfile = useMutation(api.users.updateProfile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (me) {
      setFirstName(me.firstName ?? "");
      setLastName(me.lastName ?? "");
      setPhone(me.phoneNumber ?? "");
    }
  }, [me]);

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Missing Information", "Please complete your first name and last name.");
      return;
    }

    Alert.alert("Save Changes", "Are you sure you want to save these changes?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Save",
        onPress: async () => {
          setIsSaving(true);
          try {
            await updateProfile({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phoneNumber: phone.trim() || undefined,
            });
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : "Could not save. Please try again.");
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  if (me === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#335E78" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color="#305C76" strokeWidth={2} />
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Personal Information</Text>

          <Text style={styles.subtitle}>Edit your personal details</Text>
        </View>

        {/* First Name */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <User size={16} color="#335E78" strokeWidth={2} />

            <Text style={styles.label}>First Name</Text>
          </View>

          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            editable={!isSaving}
          />
        </View>

        {/* Last Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Last Name</Text>

          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            placeholderTextColor="#A0A0A0"
            style={styles.input}
            editable={!isSaving}
          />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Phone size={16} color="#335E78" strokeWidth={2} />

            <Text style={styles.label}>Phone Number</Text>
          </View>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="08012345678"
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            style={styles.input}
            editable={!isSaving}
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        >
          {isSaving ? <ActivityIndicator color="#fff" /> : <Save size={19} color="#FFFFFF" strokeWidth={2} />}

          <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    paddingTop: 48,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  titleContainer: {
    marginTop: 28,
    marginBottom: 32,
  },

  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
    color: "#2A5975",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    lineHeight: 21,
    color: "#535353",
  },

  field: {
    marginBottom: 22,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#335E78",
    marginBottom: 8,
  },

  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DCE3E8",
    backgroundColor: "#FFFFFF",
    fontSize: 15,
    color: "#535353",
  },

  saveButton: {
    height: 48,
    marginTop: 40,
    borderRadius: 8,
    backgroundColor: "#335E78",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
});

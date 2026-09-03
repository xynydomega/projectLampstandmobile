import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";

type AuthScreenProps = {
  onAuthenticated?: () => void;
};

export default function AuthScreen({
  onAuthenticated,
}: AuthScreenProps) {
  const { signIn } = useAuthActions();

  const [email, setEmail] = useState("");
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [code, setCode] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleSendCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError("Enter your email address.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
        await signIn("resend-otp", {
        email: trimmedEmail,
        flow: "signIn",
      });

      setEmail(trimmedEmail);
      setCode(["", "", "", ""]);
      setCurrentStep(2);
    } catch (err) {
      console.error("Failed to send OTP:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not send verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (
    index: number,
    value: string
  ) => {
    if (value && !/^[0-9]+$/.test(value)) {
      return;
    }

    const newCode = [...code];

    newCode[index] = value.slice(-1);

    setCode(newCode);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (
      newCode.every((digit) => digit !== "") &&
      !isLoading
    ) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyPress = (
    index: number,
    key: string
  ) => {
    if (
      key === "Backspace" &&
      !code[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (
    value = code.join("")
  ) => {
    if (value.length !== 4) {
      setError(
        "Enter the 4-digit verification code."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Your email address is missing."
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await signIn("resend-otp", {
        email: email.trim().toLowerCase(),
        code: value,
      });

      onAuthenticated?.();
    } catch (err) {
      console.error(
        "OTP verification failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code."
      );

      setCode(["", "", "", ""]);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError(
        "Your email address is missing."
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await signIn("resend-otp", {
        email: email.trim().toLowerCase(),
        flow: "signIn",
      });

      setCode(["", "", "", ""]);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } catch (err) {
      console.error(
        "Failed to resend OTP:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not resend the verification code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>
            L
          </Text>
        </View>

        {currentStep === 1 ? (
          <>
            <View style={styles.heading}>
              <Text style={styles.title}>
                Welcome to Lampstand!
              </Text>

              <Text style={styles.subtitle}>
                Your formation journey starts here.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>
                Email Address
              </Text>

              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError("");
                }}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                style={styles.input}
              />

              {error ? (
                <Text style={styles.error}>
                  {error}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={handleSendCode}
              disabled={isLoading}
              style={[
                styles.primaryButton,
                isLoading &&
                  styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading
                  ? "Sending..."
                  : "Continue"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.heading}>
              <Text style={styles.title}>
                Verification Code
              </Text>

              <Text style={styles.subtitle}>
                Enter the 4-digit code we sent to{" "}
                {email || "your email"}
              </Text>
            </View>

            <View style={styles.otpContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] =
                      ref;
                  }}
                  value={digit}
                  onChangeText={(value) =>
                    handleCodeChange(
                      index,
                      value
                    )
                  }
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(
                      index,
                      nativeEvent.key
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!isLoading}
                  style={styles.otpInput}
                  textAlign="center"
                />
              ))}
            </View>

            {error ? (
              <Text style={styles.errorCenter}>
                {error}
              </Text>
            ) : null}

            <View style={styles.resend}>
              <Text style={styles.resendText}>
                Didn't receive a code?
              </Text>

              <Pressable
                onPress={handleResend}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.resendButton,
                    isLoading &&
                      styles.resendButtonDisabled,
                  ]}
                >
                  {isLoading
                    ? "Sending..."
                    : "Resend code"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => handleVerify()}
              disabled={
                isLoading ||
                code.some((digit) => !digit)
              }
              style={[
                styles.primaryButton,
                (isLoading ||
                  code.some(
                    (digit) => !digit
                  )) &&
                  styles.primaryButtonDisabled,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading
                  ? "Verifying..."
                  : "Continue"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setCurrentStep(1);
                setCode(["", "", "", ""]);
                setError("");
              }}
              disabled={isLoading}
              style={styles.changeEmail}
            >
              <Text style={styles.changeEmailText}>
                Change email
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 55,
    paddingBottom: 40,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#335E78",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 45,
  },

  logoText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  heading: {
    marginBottom: 38,
  },

  title: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "700",
    color: "#335E78",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 17,
    lineHeight: 24,
    color: "#535353",
  },

  form: {
    marginBottom: 22,
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
    marginTop: 8,
    fontSize: 13,
    color: "#DC2626",
  },

  errorCenter: {
    marginTop: 14,
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
    marginTop: 8,
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 10,
  },

  otpInput: {
    width: 58,
    height: 62,
    borderBottomWidth: 3,
    borderBottomColor: "#535353",
    fontSize: 28,
    fontWeight: "700",
    color: "#335E78",
  },

  resend: {
    alignItems: "center",
    marginTop: 65,
    marginBottom: 35,
  },

  resendText: {
    fontSize: 14,
    color: "#535353",
  },

  resendButton: {
    marginTop: 7,
    fontSize: 15,
    fontWeight: "700",
    color: "#335E78",
  },

  resendButtonDisabled: {
    opacity: 0.5,
  },

  changeEmail: {
    alignItems: "center",
    marginTop: 20,
  },

  changeEmailText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#335E78",
  },
});

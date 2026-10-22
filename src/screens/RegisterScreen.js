import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CustomInput } from '../components/CustomInput';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (emailVal, passVal, confirmPassVal) => {
    const errs = {};
    const emailTrim = (emailVal || '').trim();

    // Email validation
    if (!emailTrim) {
      errs.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        errs.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!passVal) {
      errs.password = 'Password is required';
    } else if (passVal.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassVal) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (confirmPassVal !== passVal) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (submitted) {
      const nextErrors = { ...errors };
      const trim = val.trim();
      if (!trim) {
        nextErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trim)) {
        nextErrors.email = 'Please enter a valid email address';
      } else {
        delete nextErrors.email;
      }
      setErrors(nextErrors);
    }
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (submitted) {
      const nextErrors = { ...errors };
      if (!val) {
        nextErrors.password = 'Password is required';
      } else if (val.length < 6) {
        nextErrors.password = 'Password must be at least 6 characters';
      } else {
        delete nextErrors.password;
      }

      // Check confirm password match again if already typed
      if (confirmPassword) {
        if (confirmPassword !== val) {
          nextErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete nextErrors.confirmPassword;
        }
      }

      setErrors(nextErrors);
    }
  };

  const handleConfirmPasswordChange = (val) => {
    setConfirmPassword(val);
    if (submitted) {
      const nextErrors = { ...errors };
      if (!val) {
        nextErrors.confirmPassword = 'Confirm password is required';
      } else if (val !== password) {
        nextErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete nextErrors.confirmPassword;
      }
      setErrors(nextErrors);
    }
  };

  const handleRegister = async () => {
    setSubmitted(true);
    setAuthError('');
    setSuccessMessage('');
    const validationErrors = validate(email, password, confirmPassword);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      setSuccessMessage('Registration successful');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSubmitted(false);
      setErrors({});
    } catch (err) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-add-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join BookShelf to organize your collection</Text>
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View style={{ marginBottom: 16 }}>
              <View testID="form-success" style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
              <CustomButton
                title="Go to Login"
                variant="outline"
                onPress={() => navigation.navigate('Login')}
                style={{ marginTop: 8 }}
              />
            </View>
          ) : null}

          {/* Auth Error Message */}
          {authError ? (
            <View testID="error-auth" style={styles.authErrorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={styles.authErrorText}>{authError}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formCard}>
            <CustomInput
              label="Email"
              placeholder="e.g. reader@example.com"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              testID="register-email"
            />

            <CustomInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              error={errors.password}
              testID="register-password"
            />

            <CustomInput
              label="Confirm Password"
              placeholder="Re-type your password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry
              error={errors.confirmPassword}
              testID="register-confirm-password"
            />

            <CustomButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
              testID="register-submit"
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  authErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  authErrorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#2D231E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

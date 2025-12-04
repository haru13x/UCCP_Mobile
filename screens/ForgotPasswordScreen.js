import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
  Pressable,
  Keyboard,
} from 'react-native';
import { Card, Button, TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { UseMethod } from '../composable/useMethod';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Set new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await UseMethod('post', 'forgot-password', { email });

      if (res && res.status === 200) {
        Alert.alert('OTP Sent', 'An OTP has been sent to your email address. Please check your inbox.');
        setStep(2);
      } else {
        setError(res?.data?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Error: ' + (err.response?.data?.message || err.message || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await UseMethod('post', 'verify-otp', { email, otp });

      if (res && res.status === 200) {
        Alert.alert('OTP Verified', 'OTP verified successfully! Please set your new password.');
        setStep(3);
      } else {
        setError(res?.data?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await UseMethod('post', 'reset-password', { 
        email, 
        otp, 
        new_password: newPassword 
      });

      if (res && res.status === 200) {
        Alert.alert(
          'Success', 
          'Password reset successful! You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        setError(res?.data?.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    setError(null);
    handleSendOtp();
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Forgot Password?';
      case 2: return 'Enter OTP';
      case 3: return 'Set New Password';
      default: return 'Forgot Password?';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return 'Enter your email address to receive an OTP';
      case 2: return `Enter the 6-digit OTP sent to ${email}`;
      case 3: return 'Create a new secure password';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          <View style={styles.brand}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/uccp_logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
          </View>

          <Card style={styles.card} elevation={8}>
            {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

            {step === 1 && (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  left={<PaperTextInput.Icon icon="email-outline" />}
                  style={styles.paperInput}
                />

                <Button
                  mode="contained"
                  onPress={handleSendOtp}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                  buttonColor="#1877F2"
                  contentStyle={{ paddingVertical: 8 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Send OTP
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="Enter OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  left={<PaperTextInput.Icon icon="shield-key-outline" />}
                  style={styles.paperInput}
                />

                <Button
                  mode="contained"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                  buttonColor="#1877F2"
                  contentStyle={{ paddingVertical: 8 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Verify OTP
                </Button>

                <Button
                  mode="text"
                  onPress={handleResendOtp}
                  disabled={loading}
                  style={styles.linkButton}
                  textColor="#1877F2"
                  labelStyle={{ fontWeight: '600' }}
                >
                  Resend OTP
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                <PaperTextInput
                  mode="outlined"
                  label="New Password"
                  secureTextEntry
                  autoCapitalize="none"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setError(null);
                  }}
                  left={<PaperTextInput.Icon icon="lock-outline" />}
                  style={styles.paperInput}
                />

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  style={styles.actionButton}
                  buttonColor="#1877F2"
                  contentStyle={{ paddingVertical: 8 }}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Reset Password
                </Button>
              </>
            )}

          
          </Card>
        </ScrollView>
      </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImg: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  paperInput: {
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  actionButton: {
    marginTop: 6,
    borderRadius: 10,
    elevation: 0,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  linkButton: {
    marginTop: 10,
  },
});

export default ForgotPasswordScreen;
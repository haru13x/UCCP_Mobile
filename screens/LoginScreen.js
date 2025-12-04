import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Pressable,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Button, TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { UseMethod } from '../composable/useMethod';

const { width, height } = Dimensions.get('window');

const slugify = (input) => {
  if (!input) return '';
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = isEmailValid && password?.length >= 2 && !loading;

  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = { email, password };
      const res = await UseMethod('post', 'login', payload);

      // Handle error responses from API helper
      if (!res || res.status < 200 || res.status >= 300) {
        const message = res?.data?.message || 'Invalid email or password';
        throw new Error(message);
      }

      const apiToken = res?.data?.api_token || res?.data?.token || '';
      const user = res?.data?.user || res?.data?.data?.user || res?.data?.data || null;

      const rolePerms = user?.role?.role_permissions || [];
      const permissions = rolePerms
        .map((rp) => rp?.permission?.slug || slugify(rp?.permission?.name))
        .filter(Boolean);

      if (!apiToken || !user) {
        throw new Error('Invalid login response: missing token or user.');
      }

      await login(user, apiToken, permissions);
      // After login, the app switches to the authenticated stack automatically.
    } catch (e) {
      console.error('Login error', e);
      const message = e?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Dismiss keyboard when tapping outside inputs */}
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              enableOnAndroid={true}
              nestedScrollEnabled={true}
              contentInsetAdjustmentBehavior="automatic"
            >
              {/* Header Section */}
              <View style={styles.headerSection}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../assets/uccp_logo.png')}
                    style={styles.logoImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>UCCP Events</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Form Section over background */}
              <View style={styles.formSection}>
                <View style={styles.formCard}>
                  {error ? (
                    <HelperText type="error" visible={!!error} style={styles.errorText}>
                      {error}
                    </HelperText>
                  ) : null}

                  <PaperTextInput
                    mode="outlined"
                    label="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    left={<PaperTextInput.Icon icon="email-outline" />}
                    style={styles.input}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#667eea"
                    onFocus={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                    ref={emailRef}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onBlur={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                  theme={{
                    colors: {
                      background: '#ffffff',
                      surface: '#ffffff',
                    }
                  }}
                />

                  {!isEmailValid && email?.length > 0 ? (
                    <HelperText type="error" visible={!isEmailValid}>
                      Please enter a valid email address
                    </HelperText>
                  ) : null}

                  <PaperTextInput
                    mode="outlined"
                    label="Password"
                    secureTextEntry={!passwordVisible}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                    left={<PaperTextInput.Icon icon="lock-outline" />}
                    right={<PaperTextInput.Icon icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'} onPress={() => setPasswordVisible((v) => !v)} />}
                    style={styles.input}
                    outlineColor="#E5E7EB"
                    activeOutlineColor="#667eea"
                    onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    ref={passwordRef}
                  returnKeyType="done"
                  onSubmitEditing={() => { Keyboard.dismiss(); handleLogin(); }}
                  onBlur={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
                  theme={{
                    colors: {
                      background: '#ffffff',
                      surface: '#ffffff',
                    }
                  }}
                />

                  <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={!canSubmit}
                    style={styles.loginButton}
                    buttonColor="#1877F2"
                    contentStyle={styles.loginButtonContent}
                    labelStyle={styles.loginButtonLabel}
                  >
                    Log In
                  </Button>

                  {/* Forgot password below inputs, right-aligned */}
                  <View style={styles.forgotRow}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('ForgotPassword')}
                      style={styles.forgotButton}
                    >
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Create new account as a prominent button */}
                  <Button
                    mode="contained"
                    onPress={() => navigation.navigate('RequestUser')}
                    style={styles.createButton}
                    buttonColor="#42B72A"
                    contentStyle={styles.createButtonContent}
                    labelStyle={styles.createButtonLabel}
                  >
                    Request new account
                  </Button>

                  <Text style={styles.footnote}>
                    By continuing, you agree to our Terms & Privacy Policy
                  </Text>
            </View>
          </View>
        </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  heroHeader: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 24,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 40,
  },
  heroContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 140,
  },
  heroBg: {
    height: 180,
  },
  heroBgImage: {
    transform: [{ scale: 1.02 }],
  },
  heroOverlay: {
    flex: 1,
    padding: 16,
  },
  
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoCircle: {
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
  formSection: {
    flex: 1,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    marginTop: 6,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 0,
    shadowColor: '#1877F2',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 5,
  },
  loginButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 6,
  },
  forgotButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  forgotText: {
    color: '#1877F2',
    fontSize: 13,
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  createButton: {
    alignSelf: 'center',
    minWidth: '70%',
    borderRadius: 10,
    elevation: 0,
    shadowColor: '#42B72A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  createButtonContent: {
    paddingVertical: 2,
  },
  createButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footnote: {
    marginTop: 10,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 11,
  },
});

export default LoginScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/icon.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
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
              theme={{
                colors: {
                  background: '#ffffff',
                  surface: '#ffffff',
                }
              }}
            />

            <PaperTextInput
              mode="outlined"
              label="Password"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              left={<PaperTextInput.Icon icon="lock-outline" />}
              style={styles.input}
              outlineColor="#E5E7EB"
              activeOutlineColor="#667eea"
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
              disabled={loading}
              style={styles.loginButton}
              buttonColor="#667eea"
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
            >
              Sign In
            </Button>

            <View style={styles.linkSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('RequestUser')}
                style={styles.linkButton}
              >
                <Text style={styles.linkText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 48,
    paddingTop: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoImg: {
    width: 50,
    height: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 12,
    elevation: 0,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 12,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  linkButton: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  linkText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoginScreen;

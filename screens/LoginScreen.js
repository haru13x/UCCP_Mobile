import React, { useState } from 'react';
import {
  View,
  Text,
  // TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Card, Button, TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { UseMethod } from '../composable/useMethod';

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.brand}>
        <Image source={require('../assets/login.png')} style={styles.logoImg} />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <Card style={styles.card}>
        {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

        <PaperTextInput
          mode="outlined"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          left={<PaperTextInput.Icon icon="email-outline" />}
          style={styles.paperInput}
        />

        <PaperTextInput
          mode="outlined"
          label="Password"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
          left={<PaperTextInput.Icon icon="lock-outline" />}
          style={styles.paperInput}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          buttonColor="#4c669f"
        >
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('RequestUser')}
          style={styles.linkButton}
          textColor="#4c669f"
        >
          Request New Account
        </Button>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f9fc',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImg: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  paperInput: {
    marginBottom: 12,
  },
  loginButton: {
    marginTop: 4,
  },
  linkButton: {
    marginTop: 8,
  },
  error: {
    color: '#dc3545',
    marginBottom: 12,
  },
});

export default LoginScreen;

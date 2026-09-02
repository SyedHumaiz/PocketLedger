import { StatusBar } from 'expo-status-bar';
import { Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'; import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/auth/auth-store';
import { AppButton, Card, FormInput, StateMessage } from '../src/ui/components';
import { colors, screen, spacing } from '../src/ui/theme';

export default function AuthScreen(): React.ReactElement {
  const { user, isLoading, isAuthenticated, error, login, register } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState('');
  const [formError, setFormError] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false); const busy = useRef(false);
  const submit = async () => { if (busy.current) return; const validation = mode === 'register' && !name.trim() ? 'Enter your name.' : !email.trim() ? 'Enter your email.' : password.length < 6 ? 'Password must be at least 6 characters.' : null; if (validation) { setFormError(validation); return; } setFormError(null); busy.current = true; setSubmitting(true); try { if (mode === 'login') await login({ email, password }); else await register({ name: name.trim(), email, password }); } catch {} finally { busy.current = false; setSubmitting(false); } };
  if (isLoading) return <SafeAreaView style={screen}><StateMessage kind="loading">Restoring your session…</StateMessage></SafeAreaView>;
  if (isAuthenticated && user) return <Redirect href="/home" />;
  return <SafeAreaView style={screen}><KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <Text style={styles.title}>PocketLedger</Text><Text style={styles.subtitle}>{mode === 'login' ? 'Welcome back.' : 'Start keeping your spending clear.'}</Text>
    <Card><View style={styles.form}>{mode === 'register' && <FormInput label="Name" placeholder="Your name" value={name} onChangeText={setName} />}<FormInput label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} /><FormInput label="Password" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />{(formError || error) && <Text accessibilityRole="alert" style={styles.error}>{formError || error}</Text>}<AppButton label={submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'} disabled={submitting} onPress={() => void submit()} /><Text style={styles.switch}>{mode === 'login' ? 'New to PocketLedger?' : 'Already have an account?'}</Text><AppButton label={mode === 'login' ? 'Create an account' : 'Log in'} variant="secondary" disabled={submitting} onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setFormError(null); }} /></View></Card>
  </KeyboardAvoidingView><StatusBar style="light" /></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', gap: spacing.md }, title: { color: colors.text, fontSize: 34, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 16 }, form: { gap: spacing.sm }, error: { color: colors.danger }, switch: { color: colors.muted, textAlign: 'center', marginTop: spacing.sm } });

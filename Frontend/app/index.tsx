import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuthStore } from '../src/auth/auth-store';

export default function HomeScreen(): React.ReactElement {
  const { user, isLoading, isAuthenticated, error, login, register, logout } = useAuthStore();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
  if(isLoading)return <View style={styles.container}><Text>Restoring session…</Text></View>;
  if(isAuthenticated&&user)return <View style={styles.container}><Text style={styles.title}>PocketLedger</Text><Text>{user.name}</Text><Text>{user.email}</Text><Button title="View expenses" onPress={()=>router.push('/expenses')}/><Button title="Log out" onPress={()=>void logout()}/><StatusBar style="auto"/></View>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PocketLedger</Text>
      <TextInput style={styles.input} placeholder="Name (for registration)" value={name} onChangeText={setName}/><TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail}/><TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>{error&&<Text>{error}</Text>}<Button title="Log in" onPress={()=>void login({email,password})}/><Button title="Register" onPress={()=>void register({name,email,password})}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#172033',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#526075',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  input:{borderWidth:1,borderColor:'#ccd3df',padding:12,width:'100%',marginTop:8,borderRadius:6},
});

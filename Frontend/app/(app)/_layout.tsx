import { Redirect, Tabs } from 'expo-router';
import { useAuthStore } from '../../src/auth/auth-store';
import { colors } from '../../src/ui/theme';

export default function AppLayout():React.ReactElement { const {isAuthenticated,isLoading}=useAuthStore(); if(isLoading)return <></>; if(!isAuthenticated)return <Redirect href="/"/>; return <Tabs screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text,tabBarStyle:{backgroundColor:colors.surface,borderTopColor:colors.border},tabBarActiveTintColor:colors.accent,tabBarInactiveTintColor:colors.muted}}><Tabs.Screen name="home" options={{title:'Home'}}/><Tabs.Screen name="expenses" options={{title:'Expenses',headerShown:false}}/><Tabs.Screen name="budgets" options={{title:'Budgets',headerShown:false}}/><Tabs.Screen name="categories" options={{title:'Categories'}}/><Tabs.Screen name="settings" options={{title:'Settings'}}/></Tabs>; }

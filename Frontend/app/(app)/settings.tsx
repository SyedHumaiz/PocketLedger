import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../src/auth/auth-store';
import { getDatabase } from '../../src/db/database';
import { listSyncOperations } from '../../src/db/sync-queue-repository';
import { pendingSyncCount } from '../../src/features/dashboard/dashboard-logic';
import { AppButton, Card } from '../../src/ui/components';
import { colors, screen, spacing } from '../../src/ui/theme';
export default function SettingsScreen():React.ReactElement {const user=useAuthStore(s=>s.user);const logout=useAuthStore(s=>s.logout);const net=NetInfo.useNetInfo();const [pending,setPending]=useState(0);useFocusEffect(useCallback(()=>{void (async()=>{try{setPending(pendingSyncCount(await listSyncOperations(await getDatabase())));}catch{setPending(0);}})();},[]));const online=net.isConnected!==false&&net.isInternetReachable!==false;return <SafeAreaView style={screen}><View style={styles.content}><Text style={styles.title}>Account</Text><Card><Text style={styles.name}>{user?.name}</Text><Text style={styles.muted}>{user?.email}</Text></Card><Text style={styles.title}>Connection</Text><Card><Text style={styles.status}>{online?'Online':'Offline'}</Text><Text style={styles.muted}>{pending} pending sync operation{pending===1?'':'s'}</Text></Card><View style={styles.bottom}><AppButton label="Log out" variant="danger" onPress={()=>void logout()}/></View></View></SafeAreaView>;}
const styles=StyleSheet.create({content:{paddingVertical:spacing.md,gap:spacing.sm},title:{color:colors.text,fontSize:18,fontWeight:'800',marginTop:spacing.sm},name:{color:colors.text,fontSize:17,fontWeight:'800'},muted:{color:colors.muted,marginTop:4},status:{color:colors.accent,fontWeight:'800'},bottom:{marginTop:spacing.lg}});

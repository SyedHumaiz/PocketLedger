import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createGroup } from '../../../src/api/group-service';
import { AppButton, Card } from '../../../src/ui/components';
import { colors, radius, screen, spacing } from '../../../src/ui/theme';
export default function NewGroupScreen():React.ReactElement {const net=NetInfo.useNetInfo();const offline=net.isConnected===false||net.isInternetReachable===false;const [name,setName]=useState('');const [error,setError]=useState<string|null>(null);const save=async()=>{const value=name.trim();if(!value){setError('Enter a group name.');return;}try{await createGroup(value);router.back();}catch(cause){setError(cause instanceof Error?cause.message:'Unable to create group.');}};return <SafeAreaView style={screen}><View style={styles.content}>{offline&&<Text style={styles.error}>You’re offline. Groups require an internet connection.</Text>}<Card><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Weekend trip" placeholderTextColor={colors.muted} maxLength={100}/>{error&&<Text style={styles.error}>{error}</Text>}<AppButton label="Create group" disabled={offline} onPress={()=>void save()}/></Card></View></SafeAreaView>;}
const styles=StyleSheet.create({content:{paddingVertical:spacing.md},input:{backgroundColor:colors.background,borderColor:colors.border,borderWidth:1,borderRadius:radius.sm,color:colors.text,padding:13,marginBottom:spacing.sm},error:{color:colors.danger,marginBottom:spacing.sm}});

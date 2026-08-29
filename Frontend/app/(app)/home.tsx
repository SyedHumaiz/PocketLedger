import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '../../src/auth/auth-store';
import { listLocalBudgets } from '../../src/db/budget-repository';
import { getDatabase } from '../../src/db/database';
import { listActiveExpenses } from '../../src/db/expense-repository';
import type { LocalBudgetRecord, LocalExpenseRecord } from '../../src/db/types';
import { budgetSummary } from '../../src/features/budgets/budget-logic';
import { formatAmount } from '../../src/features/expenses/expense-presenter';
import { AppButton, Card, StateMessage } from '../../src/ui/components';
import { colors, screen, spacing } from '../../src/ui/theme';
export default function DashboardScreen():React.ReactElement {
  const user=useAuthStore(s=>s.user); const now=new Date();
  const [expenses,setExpenses]=useState<LocalExpenseRecord[]>([]); const [budgets,setBudgets]=useState<LocalBudgetRecord[]>([]); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{if(!user)return;setLoading(true);try{const db=await getDatabase();const [e,b]=await Promise.all([listActiveExpenses(db,user.id),listLocalBudgets(db,user.id)]);setExpenses(e);setBudgets(b);}finally{setLoading(false);}},[user]);
  useFocusEffect(useCallback(()=>{void load();},[load]));
  const summary=budgetSummary(budgets,expenses,now.getMonth()+1,now.getFullYear());
  return <SafeAreaView style={screen}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.greeting}>Hello, {user?.name??'there'}</Text><Text style={styles.muted}>Here’s your spending this month.</Text>
    {loading?<StateMessage kind="loading">Loading your local ledger…</StateMessage>:<><Card><Text style={styles.label}>TOTAL SPENT</Text><Text style={styles.total}>{formatAmount(summary.spentMinor,'USD')}</Text></Card><Card><Text style={styles.label}>CURRENT-MONTH BUDGET</Text><Text style={styles.budget}>{formatAmount(summary.spentMinor,'USD')} of {formatAmount(summary.totalBudgetMinor,'USD')}</Text><View style={styles.track}><View style={[styles.bar,{width:`${Math.min(summary.progress,100)}%`},summary.overBudget&&styles.over]}/></View><Text style={[styles.muted,summary.overBudget&&styles.overText]}>{summary.overBudget?`${formatAmount(Math.abs(summary.remainingMinor),'USD')} over budget`:`${formatAmount(summary.remainingMinor,'USD')} remaining`} · {summary.progress}%</Text></Card></>}
    <View style={styles.actions}><View style={styles.flex}><AppButton label="Add expense" onPress={()=>router.push('/expenses/new')}/></View><View style={styles.flex}><AppButton label="Budgets" variant="secondary" onPress={()=>router.push('../budgets')}/></View></View>
    <View style={styles.flex}><AppButton label="Categories" variant="secondary" onPress={()=>router.push('/categories')}/></View>
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({content:{paddingVertical:spacing.md,gap:spacing.md},greeting:{color:colors.text,fontSize:28,fontWeight:'800'},label:{color:colors.accent,fontSize:12,fontWeight:'800'},total:{color:colors.text,fontSize:34,fontWeight:'800'},budget:{color:colors.text,fontSize:18,fontWeight:'800',marginVertical:spacing.xs},muted:{color:colors.muted,fontSize:13},actions:{flexDirection:'row',gap:spacing.sm},flex:{flex:1},track:{height:8,backgroundColor:colors.border,borderRadius:8,overflow:'hidden',marginBottom:spacing.sm},bar:{height:'100%',backgroundColor:colors.accent},over:{backgroundColor:colors.danger},overText:{color:colors.danger}});

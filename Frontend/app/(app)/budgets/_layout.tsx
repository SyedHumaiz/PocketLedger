import { Stack } from 'expo-router';
import { colors } from '../../../src/ui/theme';
export default function BudgetsLayout():React.ReactElement{return <Stack screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text,contentStyle:{backgroundColor:colors.background}}}><Stack.Screen name="index" options={{title:'Budgets'}}/><Stack.Screen name="new" options={{title:'New budget'}}/><Stack.Screen name="[id]" options={{title:'Edit budget'}}/></Stack>;}

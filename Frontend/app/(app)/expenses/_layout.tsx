import { Stack } from 'expo-router';
import { colors } from '../../../src/ui/theme';
export default function ExpensesLayout():React.ReactElement{return <Stack screenOptions={{headerStyle:{backgroundColor:colors.surface},headerTintColor:colors.text,contentStyle:{backgroundColor:colors.background}}}><Stack.Screen name="index" options={{title:'Expenses'}}/><Stack.Screen name="new" options={{title:'New expense'}}/><Stack.Screen name="[id]" options={{title:'Edit expense'}}/></Stack>;}

import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { createCategory, deleteCategory, updateCategory } from '../../src/api/category-service';
import { mapCategoryResponse } from '../../src/api/category-mapping';
import { useAuthStore } from '../../src/auth/auth-store';
import { listLocalCategories, removeLocalCategory, upsertLocalCategories } from '../../src/db/category-repository';
import { getDatabase } from '../../src/db/database';
import type { LocalCategoryRecord } from '../../src/db/types';
import { categoryMutationError } from '../../src/features/categories/category-errors';
import { validateCategoryName } from '../../src/features/categories/category-form';
import { AppButton, Card, FormInput, IconAction, OfflineNotice, StateMessage } from '../../src/ui/components';
import { colors, radius, screen, spacing } from '../../src/ui/theme';

export default function CategoriesScreen(): React.ReactElement {
  const user = useAuthStore(s => s.user); const net = NetInfo.useNetInfo(); const offline = net.isConnected === false || net.isInternetReachable === false;
  const [items, setItems] = useState<LocalCategoryRecord[]>([]); const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [modal, setModal] = useState(false); const [editing, setEditing] = useState<LocalCategoryRecord | null>(null); const [name, setName] = useState(''); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { if (!user) return; setState('loading'); try { setItems(await listLocalCategories(await getDatabase(), user.id)); setState('ready'); } catch { setState('error'); } }, [user]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const open = (item?: LocalCategoryRecord) => { setEditing(item ?? null); setName(item?.name ?? ''); setError(null); setModal(true); };
  const save = async () => { if (!user) return; const valid = validateCategoryName(name); if (valid.error) { setError(valid.error); return; } setSaving(true); try { const result = editing ? await updateCategory(editing.id, valid.value) : await createCategory(valid.value); await upsertLocalCategories(await getDatabase(), user.id, [mapCategoryResponse(result, user.id)]); setModal(false); await load(); } catch (cause) { setError(categoryMutationError(cause)); } finally { setSaving(false); } };
  const remove = (item: LocalCategoryRecord) => Alert.alert('Delete category?', `Delete “${item.name}”? Categories used by expenses cannot be deleted.`, [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive', onPress: () => void (async () => { try { await deleteCategory(item.id); if (user) await removeLocalCategory(await getDatabase(), user.id, item.id); await load(); } catch (cause) { setError(categoryMutationError(cause)); } })() }]);
  return <SafeAreaView style={screen}><FlatList data={state === 'ready' ? items : []} keyExtractor={item => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<View style={styles.head}>{offline && <OfflineNotice />}{error && !modal && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<AppButton label="Add category" disabled={offline} onPress={() => open()} />{offline && <Text style={styles.hint}>Connect to add, edit, or delete categories.</Text>}</View>}
    ListEmptyComponent={state === 'loading' ? <StateMessage kind="loading">Loading cached categories…</StateMessage> : state === 'error' ? <StateMessage kind="error">Unable to load cached categories.</StateMessage> : offline ? <StateMessage kind="offline">No cached categories are available while offline.</StateMessage> : <StateMessage>No categories yet. Add one to organize expenses.</StateMessage>}
    ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />} renderItem={({ item }) => <Card><View style={styles.row}><Text style={styles.name}>{item.name}</Text><View style={styles.controls}><IconAction icon="pencil" label={`Edit ${item.name}`} disabled={offline} onPress={() => open(item)} /><IconAction icon="trash-outline" label={`Delete ${item.name}`} tone="danger" disabled={offline} onPress={() => remove(item)} /></View></View></Card>} />
    <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}><View style={styles.backdrop}><View style={styles.modal}><Text style={styles.modalTitle}>{editing ? 'Edit category' : 'New category'}</Text><FormInput autoFocus label="Category name" value={name} onChangeText={setName} placeholder="e.g. Groceries" maxLength={100} />{error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<View style={styles.actions}><View style={styles.flex}><AppButton label="Cancel" variant="secondary" onPress={() => setModal(false)} /></View><View style={styles.flex}><AppButton label={saving ? 'Saving…' : 'Save'} disabled={saving} onPress={() => void save()} /></View></View></View></View></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ content: { paddingVertical: spacing.md }, head: { gap: spacing.sm, marginBottom: spacing.md }, hint: { color: colors.muted, fontSize: 13 }, error: { color: colors.danger }, row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }, name: { color: colors.text, fontSize: 16, fontWeight: '700' }, controls: { flexDirection: 'row', gap: spacing.xs }, backdrop: { backgroundColor: '#000a', flex: 1, justifyContent: 'center', padding: spacing.lg }, modal: { backgroundColor: colors.surface, borderRadius: radius.lg, gap: spacing.md, padding: spacing.lg }, modalTitle: { color: colors.text, fontSize: 20, fontWeight: '800' }, actions: { flexDirection: 'row', gap: spacing.sm }, flex: { flex: 1 } });


import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { getDewormingsByPuppyId, insertDeworming, updateDeworming, deleteDeworming } from '../db';

type Row = { id: number | null; date: Date; medicine: string };

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DewormingScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { puppyId } = route.params as { puppyId: number };

  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitleAlign: 'center',
      headerRight: () => <View style={{ width: 44 }} />,
      headerLeft: () => (
        <View style={{ width: 44, paddingLeft: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              height: 32,
              width: 32,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
      title: 'Deworming',
    });
  }, [navigation]);

  const [rows, setRows] = useState<Row[]>([]);
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [removedIds, setRemovedIds] = useState<number[]>([]); // <- IDs to delete on save

  // Load from DB
  useEffect(() => {
    (async () => {
      try {
        const existing = await getDewormingsByPuppyId(puppyId);
        if (existing.length) {
          setRows(
            existing.map((r) => ({
              id: r.id,
              date: new Date(r.date),
              medicine: r.medicine ?? '',
            }))
          );
        } else {
          const today = new Date();
          setRows([
            { id: null, date: today, medicine: '' },
            { id: null, date: today, medicine: '' },
          ]);
        }
        setRemovedIds([]);
      } catch {
        Alert.alert('Error', 'Cannot load deworming data');
      }
    })();
  }, [puppyId]);

  const addRow = () => {
    setRows((prev) => [...prev, { id: null, date: new Date(), medicine: '' }]);
  };

  const onSave = async () => {
    try {
      // 1) Delete removed rows from DB
      if (removedIds.length) {
        await Promise.all(removedIds.map((id) => deleteDeworming(id)));
      }

      // 2) Upsert others
      for (const r of rows) {
        if (r.id == null) {
          await insertDeworming(puppyId, toYmd(r.date), r.medicine);
        } else {
          await updateDeworming(r.id, { date: toYmd(r.date), medicine: r.medicine });
        }
      }

      // 3) Reload to reflect DB state
      const fresh = await getDewormingsByPuppyId(puppyId);
      setRows(fresh.map((r) => ({ id: r.id, date: new Date(r.date), medicine: r.medicine ?? '' })));
      setRemovedIds([]);
      Alert.alert('Saved', 'Deworming data saved successfully');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Cannot save deworming data');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Medicine</Text>
      </View>

      {rows.map((row, idx) => (
        <View key={(row.id ?? -1) + '-' + idx} style={styles.row}>
          <TouchableOpacity
            style={styles.dateBox}
            onPress={() => {
              setShowPicker(row.id ?? -(idx + 1));
            }}
          >
            <Text style={styles.dateText}>{toYmd(row.date)}</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.medicineBox}
            placeholder="Enter medicine"
            placeholderTextColor="#888"
            value={row.medicine}
            onChangeText={(txt) =>
              setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, medicine: txt } : r)))
            }
          />

          <TouchableOpacity
            onPress={() => {
              if (row.id != null) setRemovedIds((prev) => [...prev, row.id!]);
              setRows((prev) => prev.filter((_, i) => i !== idx));
            }}
            style={styles.trashBtn}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
          </TouchableOpacity>

          {showPicker === (row.id ?? -(idx + 1)) && (
            <DateTimePicker
              value={row.date}
              mode="date"
              display="default"
              onChange={(e, d) => {
                if (d) {
                  setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, date: d } : r)));
                }
                setShowPicker(null);
              }}
            />
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={addRow}>
        <Text style={styles.addBtnText}>+ Add Row</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  dateBox: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: { color: '#fff' },
  medicineBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    color: '#fff',
  },
  addBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: 'row',
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashBtn: { marginLeft: 8, padding: 8 },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

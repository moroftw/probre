// src/screens/VetRecordFormScreen.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogs, insertVetRecord } from '../db';
import type { Dog, VetRecord, VetType } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'VetRecordForm'>;
const TYPES: VetType[] = ['VACCINATION', 'DEWORMING', 'EXAM', 'SURGERY', 'OTHER'];

export default function VetRecordFormScreen({ route, navigation }: Props) {
  const presetDogId = (route.params as any)?.dogId as number | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [dogId, setDogId] = useState<number | undefined>(presetDogId);
  const [type, setType] = useState<VetType>('EXAM');
  const [title, setTitle] = useState('');

  const [date, setDate] = useState('');              // YYYY-MM-DD
  const [nextDue, setNextDue] = useState('');        // YYYY-MM-DD (optional)

  const [notes, setNotes] = useState('');

  // date pickers (ca în Add Mating)
  const [showDatePicker, setShowDatePicker] = useState<null | 'date' | 'next'>(null);

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 20;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Veterinary Record',
      headerTitleAlign: 'center',
      headerBackVisible: false,
      headerRight: () => <View style={{ width: 44 }} />,
      headerLeft: () => (
        <View style={{ width: 44, paddingLeft: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackBtn}
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });

    (async () => {
      const list = await getDogs();
      setDogs(list);
      if (!presetDogId && list.length > 0) setDogId(list[0].id);
    })();
  }, [navigation, presetDogId]);

  const valid = useMemo(() => !!dogId && !!title.trim() && !!date, [dogId, title, date]);

  const onSave = async () => {
    if (!valid) { Alert.alert('Required fields missing'); return; }
    const payload: VetRecord = {
      dogId: dogId!,
      type,
      title: title.trim(),
      date,
      nextDueDate: nextDue,
      notes,
    };
    try {
      await insertVetRecord(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Cannot save');
    }
  };

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const da = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const Chip = ({ label, sel, onSel }: { label: string; sel: boolean; onSel: () => void }) => (
    <TouchableOpacity onPress={onSel} style={[styles.chip, sel && styles.chipActive]}>
      <Text style={[styles.chipTxt, sel && styles.chipTxtActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
        {/* selector Dog doar dacă nu vii deja din DogMenu */}
        {!presetDogId && (
          <>
            <Text style={styles.label}>Dog *</Text>
            <View style={styles.row}>
              {dogs.map((d) => (
                <Chip key={d.id} label={d.name} sel={dogId === d.id} onSel={() => setDogId(d.id!)} />
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Type *</Text>
        <View style={styles.row}>
          {TYPES.map((t) => (
            <Chip key={t} label={t} sel={type === t} onSel={() => setType(t)} />
          ))}
        </View>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Rabies vaccine"
          placeholderTextColor={colors.subtext}
        />

        <Text style={styles.label}>Date *</Text>
        {/* Casetă gri care deschide calendarul — identică vizual cu Add Mating */}
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker('date')}>
          <Text style={{ color: date ? colors.text : colors.subtext }}>
            {date || 'YYYY-MM-DD'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Next due date</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker('next')}>
          <Text style={{ color: nextDue ? colors.text : colors.subtext }}>
            {nextDue || 'YYYY-MM-DD (optional)'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={
              showDatePicker === 'date'
                ? (date ? new Date(date) : new Date())
                : (nextDue ? new Date(nextDue) : new Date())
            }
            mode="date"
            display="default"
            onChange={(_, picked) => {
              setShowDatePicker(null);
              if (!picked) return;
              const v = formatYYYYMMDD(picked);
              if (showDatePicker === 'date') setDate(v);
              else setNextDue(v);
            }}
          />
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, { height: 90 }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="observations"
          placeholderTextColor={colors.subtext}
          multiline
        />

        {/* SAVE în pagină, identic cu MatingForm */}
        <TouchableOpacity
          onPress={onSave}
          disabled={!valid}
          style={[styles.saveBtn, !valid && { opacity: 0.6 }]}
        >
          <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveTxt}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Săgeata back — identică cu MatingForm
  headerBackBtn: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  container: { padding: 16, gap: 12 },

  // Etichete — dimensiuni/culoare ca pe MatingForm
  label: {
    fontWeight: '700',
    marginTop: 6,
    color: colors.subtext,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // Input-like gri
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
  },

  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },

  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { color: '#333' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  // Save — identic cu Add Mating
  saveBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

// src/screens/GeneticsFormScreen.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogs, insertGeneticTest } from '../db';
import type { Dog, GeneticTest } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GeneticsForm'>;

export default function GeneticsFormScreen({ route, navigation }: Props) {
  const presetDogId = (route.params as any)?.dogId as number | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [dogId, setDogId] = useState<number | undefined>(presetDogId);
  const [testName, setTestName] = useState('');
  const [result, setResult] = useState('');
  const [lab, setLab] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 20;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Genetic Test',
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

  const valid = !!dogId && !!testName.trim();

  const onSave = async () => {
    if (!valid) { Alert.alert('Dog & test name required'); return; }
    const payload: GeneticTest = {
      dogId: dogId!, testName: testName.trim(), result, lab, date, notes,
    };
    try {
      await insertGeneticTest(payload);
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

  const Chip = ({ d }: { d: Dog }) => (
    <TouchableOpacity
      key={d.id}
      onPress={() => setDogId(d.id!)}
      style={[styles.chip, dogId === d.id && styles.chipActive]}
    >
      <Text style={[styles.chipTxt, dogId === d.id && styles.chipTxtActive]} numberOfLines={1}>
        {d.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
        {!presetDogId && (
          <>
            <Text style={styles.label}>Dog *</Text>
            <View style={styles.row}>{dogs.map((d) => <Chip key={d.id} d={d} />)}</View>
          </>
        )}

        <Text style={styles.label}>Test name *</Text>
        <TextInput
          style={styles.input}
          value={testName}
          onChangeText={setTestName}
          placeholder="e.g., MDR1"
          placeholderTextColor={colors.subtext}
        />

        <Text style={styles.label}>Result</Text>
        <TextInput
          style={styles.input}
          value={result}
          onChangeText={setResult}
          placeholder="Clear / Carrier / Affected"
          placeholderTextColor={colors.subtext}
        />

        <Text style={styles.label}>Lab</Text>
        <TextInput
          style={styles.input}
          value={lab}
          onChangeText={setLab}
          placeholder="e.g., Embark"
          placeholderTextColor={colors.subtext}
        />

        <Text style={styles.label}>Date</Text>
        {/* Caseta gri care deschide calendarul – ca în Add Mating */}
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={{ color: date ? colors.text : colors.subtext }}>
            {date || 'YYYY-MM-DD'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display="default"
            onChange={(_, picked) => {
              setShowDatePicker(false);
              if (picked) setDate(formatYYYYMMDD(picked));
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

        {/* Save în pagină, identic vizual cu MatingForm */}
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
  // Săgeata back — identică
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

  // Etichete ca pe Add Mating
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
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTxt: { color: '#333' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  // Save — identic
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

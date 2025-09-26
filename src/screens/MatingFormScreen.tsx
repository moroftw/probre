
import { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDogs, insertMating, updateMating, deleteMating } from '../db';
import type { Dog, Mating } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'MatingForm'>;

export default function MatingFormScreen({ route, navigation }: Props) {
  const editing = route.params?.mating as Mating | undefined;

  const [dogs, setDogs] = useState<Dog[]>([]);
  const males = dogs.filter(d => d.sex === 'M');
  const females = dogs.filter(d => d.sex === 'F');
  const [maleId, setMaleId] = useState<number | undefined>(editing?.maleDogId);
  const [femaleId, setFemaleId] = useState<number | undefined>(editing?.femaleDogId);
  const [date, setDate] = useState(editing?.date ?? new Date().toISOString().slice(0, 10));
  const [showPicker, setShowPicker] = useState(false);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Header identical style to AddPuppyScreen
    navigation.setOptions({
      headerBackVisible: false,
      headerTitleAlign: 'center',
      headerRight: () => <View style={{ width: 44 }} />,
      headerLeft: () => (
        <View style={{ width: 44, paddingLeft: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBackBtn}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
      title: editing ? 'Edit Mating' : 'Add Mating',
    });
  }, [navigation, editing]);

  useEffect(() => {
    (async () => setDogs(await getDogs()))();
  }, []);

  const valid = useMemo(() => !!maleId && !!femaleId && !!date, [maleId, femaleId, date]);

  const onSave = async () => {
    if (!valid) return;
    const payload: Mating = { maleDogId: maleId!, femaleDogId: femaleId!, date };
    try {
      editing?.id ? await updateMating(editing.id, payload) : await insertMating(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Cannot save');
    }
  };

  const onDelete = () => {
    if (!editing?.id) return;
    Alert.alert('Delete mating', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMating(editing.id!);
          navigation.goBack();
        },
      },
    ]);
  };

  const Chip = ({
    id,
    sel,
    label,
    sex,
    onSel,
  }: {
    id: number;
    sel: boolean;
    label: string;
    sex: 'male' | 'female';
    onSel: (id: number) => void;
  }) => (
    <TouchableOpacity
      onPress={() => onSel(id)}
      style={[
        styles.chip,
        sel && {
          backgroundColor: sex === 'female' ? colors.female : colors.primary,
          borderColor: sex === 'female' ? colors.female : colors.primary,
        },
      ]}
    >
      <Text style={[styles.chipTxt, sel && styles.chipTxtActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Text style={styles.label}>Male *</Text>
        <View style={styles.row}>
          {males.map(d => (
            <Chip
              key={d.id}
              id={d.id}
              label={d.name}
              sel={maleId === d.id}
              onSel={setMaleId}
              sex="male"
            />
          ))}
        </View>

        <Text style={styles.label}>Female *</Text>
        <View style={styles.row}>
          {females.map(d => (
            <Chip
              key={d.id}
              id={d.id}
              label={d.name}
              sel={femaleId === d.id}
              onSel={setFemaleId}
              sex="female"
            />
          ))}
        </View>

        <Text style={styles.label}>Date *</Text>
        {/* Same dimensions as AddPuppyScreen's input (Nickname) */}
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.inputLike}>
          <Text style={styles.inputLikeText}>{date}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            mode="date"
            value={new Date(date)}
            onChange={(_, d) => {
              setShowPicker(false);
              d && setDate(d.toISOString().slice(0, 10));
            }}
          />
        )}

        {/* Save button with icon, identical look to AddPuppyScreen */}
        <TouchableOpacity
          onPress={onSave}
          disabled={!valid}
          style={[styles.saveBtn, !valid && { opacity: 0.6 }]}
        >
          <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveTxt}>Save</Text>
        </TouchableOpacity>

        {editing?.id ? (
          <TouchableOpacity onPress={onDelete} style={styles.delBtn}>
            <Text style={styles.delTxt}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Back button identical to AddPuppyScreen
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
  label: { fontWeight: '700', marginTop: 6, color: colors.subtext, fontSize: 12, letterSpacing: 0.3 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  chipTxt: { color: '#333' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  // Date box identical dimensions to AddPuppy's TextInput
  inputLike: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignSelf: 'stretch',
  },
  inputLikeText: {
    color: colors.text,
  },

  // Save like AddPuppy: height 52, rounded 14, icon + text centered
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

  delBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: '#b00020',
  },
  delTxt: { color: '#b00020', fontWeight: '600' },
});

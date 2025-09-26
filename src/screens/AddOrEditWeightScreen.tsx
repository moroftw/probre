import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import {
  insertPuppyWeight,
  updatePuppyWeight,
  deletePuppyWeight,
} from '../db';

export default function AddOrEditWeightScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { weight, puppyId } = route.params;

  const [date, setDate] = useState(new Date(weight?.dateTime || Date.now()));
  const [weightKg, setWeightKg] = useState(weight?.weightKg?.toString() || '');
  const [weightGrams, setWeightGrams] = useState(
    weight?.weightGrams?.toString() || ''
  );
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const isEditing = !!weight;

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (selectedDate: Date) => {
    hideDatePicker();
    setDate(selectedDate);
  };

  const onSave = async () => {
    const kg = parseFloat(weightKg || '0');
    const gr = parseInt(weightGrams || '0', 10);

    const isKgValid = !isNaN(kg) && kg >= 0;
    const isGrValid = !isNaN(gr) && gr >= 0;

    if (!isKgValid && !isGrValid) {
      Alert.alert('Invalid weight');
      return;
    }

    const payload = {
      dateTime: date.toISOString(),
      weightKg: kg,
      weightGrams: gr,
    };

    try {
      if (isEditing) {
        await updatePuppyWeight(weight.id, payload);
      } else {
        await insertPuppyWeight({ ...payload, puppyId });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error saving weight');
    }
  };

  // Header like MatingDetailsScreen (back arrow left, spacer right, centered title)
  useEffect(() => {
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
    });
  }, [navigation]);

  const onDelete = async () => {
    Alert.alert('Delete weight?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePuppyWeight(weight.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date & Time</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateBtn}>
        <Text style={styles.dateTxt}>{date.toLocaleString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        date={date}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      <Text style={styles.label}>Kilograms (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={weightKg}
        onChangeText={setWeightKg}
        placeholder="e.g. 2.5" placeholderTextColor={colors.subtext}
      />

      <Text style={styles.label}>Grams (g)</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={weightGrams}
        onChangeText={setWeightGrams}
        placeholder="e.g. 300" placeholderTextColor={colors.subtext}
      />

      <TouchableOpacity onPress={onSave} style={styles.saveBtn}>
        <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.saveTxt}>Save</Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity onPress={onDelete} style={styles.removeBtn}>
          <Ionicons name="trash" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.removeBtnText}>Remove Weight</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  removeBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ef444466',
    backgroundColor: '#ef44441a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  removeBtnText: { color: '#ef4444', fontWeight: '800' },

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
  dateTxt: { color: colors.text },

  saveBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: colors.primary, // same accent (mov) as in app theme
  },
  saveTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  container: {
    padding: 16,
    gap: 14,
    flex: 1,
    backgroundColor: colors.bg,
  },
  label: {
    fontWeight: '700',
    color: colors.subtext,
    letterSpacing: 0.3,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
  },
  dateBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

});
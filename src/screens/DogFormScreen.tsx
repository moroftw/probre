// src/screens/DogFormScreen.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pickAndSaveDogImage } from '../utils/pickImage';
import { insertDog, updateDog } from '../db';
import type { Dog, Sex } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius } from '../theme';
import { Provider, Portal, Modal, Searchbar, Text as PaperText } from 'react-native-paper';
import breedsData from '../assets/data/breeds.json';

type Props = NativeStackScreenProps<RootStackParamList, 'DogForm'>;

export default function DogFormScreen({ route, navigation }: Props) {
  const editingDog = (route.params?.dog as Dog) || null;

  const [name, setName] = useState(editingDog?.registeredName ?? '');
  const [nickname, setNickname] = useState(editingDog?.name ?? '');
  const [sex, setSex] = useState<Sex>(editingDog?.sex ?? 'M');
  const [breed, setBreed] = useState(editingDog?.breed ?? '');
  const [birthdate, setBirthdate] = useState<string>(editingDog?.birthdate ?? '');
  const [color, setColor] = useState(editingDog?.color ?? '');
  const [microchip, setMicrochip] = useState(editingDog?.microchip ?? '');
  const [notes, setNotes] = useState(editingDog?.notes ?? '');
  const [imageUri, setImageUri] = useState(editingDog?.imageUri ?? '');

  // Modale breed & color (rimân la fel)
  const [breedSearch, setBreedSearch] = useState('');
  const [colorSearch, setColorSearch] = useState('');
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [colorModalVisible, setColorModalVisible] = useState(false);

  // Date picker în stil Add Mating
  const [showDatePicker, setShowDatePicker] = useState(false);

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 20;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: editingDog ? 'Edit Dog' : 'Add Dog',
      headerTitleAlign: 'center',
      headerBackVisible: false,
      headerRight: () => <View style={{ width: 44 }} />,
      headerLeft: () => (
        <View style={{ width: 44, paddingLeft: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
            style={styles.headerBackBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, editingDog]);

  const pickImage = async () => {
    try {
      const localUri = await pickAndSaveDogImage();
      if (localUri) setImageUri(localUri);
    } catch {
      Alert.alert('Error', 'Cannot pick image');
    }
  };

  const onSave = async () => {
    if (!nickname.trim()) { Alert.alert('Nickname required'); return; }

    const payload: Dog = {
      name: nickname.trim(),
      sex,
      breed,
      birthdate,
      color,
      microchip,
      notes,
      imageUri,
      registeredName: name.trim(),
    };

    try {
      editingDog?.id ? await updateDog(editingDog.id, payload) : await insertDog(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Cannot save');
    }
  };

  const breedOptions = Object.keys(breedsData).filter(b =>
    b.toLowerCase().includes(breedSearch.toLowerCase())
  );
  const colorOptions = breedsData[breed] || [];
  const filteredColors = colorOptions.filter(c =>
    c.toLowerCase().includes(colorSearch.toLowerCase())
  );

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const da = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
          {/* FOTO pătrată */}
          <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <Text style={{ color: colors.primary }}>Add photo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Dog's official name"
            placeholderTextColor={colors.subtext}
          />

          <Text style={styles.label}>Nickname *</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="e.g., Asha"
            placeholderTextColor={colors.subtext}
          />

          <Text style={styles.label}>Sex *</Text>
          <View style={styles.row}>
            <TouchableOpacity
              onPress={() => setSex('M')}
              style={[styles.chip, sex === 'M' && styles.chipActive(colors.primary)]}
            >
              <Text style={[styles.chipTxt, sex === 'M' && styles.chipTxtActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSex('F')}
              style={[styles.chip, sex === 'F' && styles.chipActive(colors.female)]}
            >
              <Text style={[styles.chipTxt, sex === 'F' && styles.chipTxtActive]}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Breed</Text>
          <TouchableOpacity style={styles.input} onPress={() => setBreedModalVisible(true)}>
            <Text style={{ color: breed ? colors.text : colors.subtext }}>
              {breed || 'Select a breed'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Birthdate</Text>
          {/* EXACT ca „Date” din Add Mating: casetă gri care deschide calendarul */}
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: birthdate ? colors.text : colors.subtext }}>
              {birthdate || 'YYYY-MM-DD'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate ? new Date(birthdate) : new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setBirthdate(formatYYYYMMDD(date));
              }}
            />
          )}

          <Text style={styles.label}>Color</Text>
          <TouchableOpacity style={styles.input} onPress={() => setColorModalVisible(true)}>
            <Text style={{ color: color ? colors.text : colors.subtext }}>
              {color || 'Select a color'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.label}>Microchip</Text>
          <TextInput
            style={styles.input}
            value={microchip}
            onChangeText={setMicrochip}
            placeholder="e.g., 642..."
            placeholderTextColor={colors.subtext}
          />

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
            disabled={!nickname.trim()}
            style={[styles.saveBtn, !nickname.trim() && { opacity: 0.6 }]}
          >
            <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.saveTxt}>Save</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Breed Modal */}
      <Portal>
        <Modal
          visible={breedModalVisible}
          onDismiss={() => setBreedModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Searchbar placeholder="Search breed..." value={breedSearch} onChangeText={setBreedSearch} />
          <ScrollView style={{ maxHeight: 250 }}>
            {breedOptions.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => { setBreed(item); setBreedModalVisible(false); setBreedSearch(''); }}
              >
                <PaperText style={styles.option}>{item}</PaperText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {/* Color Modal */}
      <Portal>
        <Modal
          visible={colorModalVisible}
          onDismiss={() => setColorModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Searchbar placeholder="Search color..." value={colorSearch} onChangeText={setColorSearch} />
          <ScrollView style={{ maxHeight: 250 }}>
            {filteredColors.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => { setColor(item); setColorModalVisible(false); setColorSearch(''); }}
              >
                <PaperText style={styles.option}>{item}</PaperText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  // header back — identic cu Add Mating
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

  // labels — dimensiuni/culoare ca pe Add Mating
  label: {
    fontWeight: '700',
    marginTop: 6,
    color: colors.subtext,
    fontSize: 12,
    letterSpacing: 0.3,
  },

  // input-like gri
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
  },

  row: { flexDirection: 'row', gap: 10 },

  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  chipActive: (bg: string) => ({
    backgroundColor: bg,
    borderColor: bg,
  }),
  chipTxt: { color: '#333' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  // FOTO pătrată
  imageBtn: {
    alignSelf: 'flex-start',
    width: 120,
    height: 120,
    borderRadius: radius, // mic, nu cerc
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  image: { width: '100%', height: '100%' },

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

  // modale (rămân light ca înainte; dacă vrei, le facem și pe dark)
  modal: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
    color: '#222',
  },
});

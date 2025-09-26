import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { insertPuppy } from '../db';
import { colors, radius } from '../theme';
import type { Sex } from '../types';
import { pickAndSaveDogImage } from '../utils/pickImage';

export default function AddPuppyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { matingId } = route.params as { matingId: number };

  const [nickname, setNickname] = useState('');
  const [sex, setSex] = useState<Sex>('M');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Header back button (custom) + centered title
  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitleAlign: 'center',
      headerRight: () => <View style={{ width: 44 }} />,
      headerLeft: () => (
        <View style={{ width: 44, paddingLeft: 8 }}>
          <TouchableOpacity
            onPress={() => (navigation as any).goBack()}
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
  const padBottom = Math.max(insets.bottom, 10) + 74;

  const pickImage = async () => {
    try {
      const localUri = await pickAndSaveDogImage();
      if (localUri) {
        setImageUri(localUri);
      }
    } catch {
      Alert.alert('Error', 'Cannot pick image');
    }
  };

  const onSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('Nickname required');
      return;
    }

    try {
      await insertPuppy({
        name: nickname.trim(),
        sex,
        image: imageUri || null,
        matingId,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not save puppy');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}>
        <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.photoPlaceholder}>Add photo</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nickname *</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="e.g., Spike" placeholderTextColor={colors.subtext}
        />

        <Text style={styles.label}>Sex *</Text>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => setSex('M')}
            style={[styles.chip, sex === 'M' && styles.chipActive(colors.primary)]}
          >
            <Text style={[styles.chipTxt, sex === 'M' && { color: '#fff' }]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSex('F')}
            style={[styles.chip, sex === 'F' && styles.chipActive(colors.female)]}
          >
            <Text style={[styles.chipTxt, sex === 'F' && { color: '#fff' }]}>Female</Text>
          </TouchableOpacity>
        </View>
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
  );
}

const styles = StyleSheet.create({
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

  container: { padding: 16, gap: 12 },
  label: { fontWeight: '700', marginTop: 6, color: colors.subtext, fontSize: 12, letterSpacing: 0.3 },
  input: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    borderWidth: 1, borderColor: '#bbb',
    borderRadius: 20, paddingVertical: 8,
    paddingHorizontal: 12, backgroundColor: '#fff',
  },
  chipActive: (bg: string) => ({
    backgroundColor: bg, borderColor: bg,
  }),
  chipTxt: { color: '#333' },
  imageBtn: {
    alignSelf: 'flex-start',
    width: 110, height: 110,
    borderRadius: radius,
    borderWidth: 1, borderColor: '#ddd',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  image: { width: '100%', height: '100%' },
  photoPlaceholder: { color: colors.primary },
});

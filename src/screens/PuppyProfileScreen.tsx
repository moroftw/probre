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
import { pickAndSaveDogImage } from '../utils/pickImage';
import { getPuppyById, updatePuppy, getDb } from '../db';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function PuppyFormScreen({ route, navigation }) {
  const { puppyId } = route.params;

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [sex, setSex] = useState('M');
  const [imageUri, setImageUri] = useState('');

  const insets = useSafeAreaInsets();
  const padBottom = Math.max(insets.bottom, 10) + 40;

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
      title: nickname || 'Puppy',
    });

    (async () => {
      const p = await getPuppyById(puppyId);
      if (p) {
        setFullName(p.fullName ?? '');
        setNickname(p.name ?? '');
        setSex(p.sex ?? 'M');
        setImageUri(p.image ?? '');
      }
    })();
  }, [puppyId]);

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
      Alert.alert('Nickname is required');
      return;
    }

    const payload = {
      name: nickname.trim(),
      fullName: fullName.trim(),
      sex,
      image: imageUri,
    };

    try {
      await updatePuppy(puppyId, payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Cannot save');
    }
  };


  const onRemovePuppy = async () => {
    Alert.alert('Remove Puppy', 'Are you sure you want to remove this puppy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            const db = await getDb();
            await db.runAsync('DELETE FROM puppies WHERE id=?', [puppyId]);
            navigation.goBack();
          } catch {
            Alert.alert('Error', 'Cannot remove puppy');
          }
        } 
      },
    ]);
  };
  const goToWeightChart = () => {
    navigation.navigate('PuppyWeightChart', { puppyId });
  };

  const goToDeworming = () => {
    navigation.navigate('Deworming', { puppyId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: padBottom }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={pickImage} style={styles.imageBtn}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={{ color: colors.primary }}>Add photo</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Optional full name"
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
            style={[styles.chip, sex === 'M' && styles.male]}
          >
            <Text style={[styles.chipTxt, sex === 'M' && styles.chipTxtActive]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSex('F')}
            style={[styles.chip, sex === 'F' && styles.female]}
          >
            <Text style={[styles.chipTxt, sex === 'F' && styles.chipTxtActive]}>Female</Text>
          </TouchableOpacity>
        </View>

        {/* Butoane mari în stil global */}
        <TouchableOpacity style={styles.actionBtn} onPress={goToWeightChart}>
          <Ionicons name="bar-chart-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>View Weights</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={goToDeworming}>
          <Ionicons name="medkit-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
          <Text style={styles.actionBtnText}>Deworming</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onSave}>
          <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.actionBtnText, { color: '#fff' }]}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeBtn} onPress={onRemovePuppy}>
          <Ionicons name="trash" size={18} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.removeBtnText}>Remove Puppy</Text>
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
  container: { padding: 16, gap: 10 },
  label: { fontWeight: '600', marginTop: 6, color: '#fff' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#fff',
  },
  row: { flexDirection: 'row', gap: 10 },
  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipTxt: { color: '#ccc' },
  chipTxtActive: { color: '#fff', fontWeight: '600' },
  male: { backgroundColor: '#2196f3', borderColor: '#2196f3' },
  female: { backgroundColor: '#e91e63', borderColor: '#e91e63' },
  imageBtn: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  actionBtn: {
  marginTop: 10,
  height: 48,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: colors.border,
  backgroundColor: 'rgba(255,255,255,0.06)',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
  },
  removeBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ef444466',
    backgroundColor: '#ef44441a',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  removeBtnText: { color: '#ef4444', fontWeight: '800' },
  actionBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
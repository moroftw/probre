import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getDogById, deleteDog } from '../db';
import type { Dog } from '../types';
import { colors, radius, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DogMenu'>;

export default function DogMenuScreen({ route, navigation }: Props) {
  const dogId = (route.params as any).dogId as number;

  const [dog, setDog] = useState<Dog | null>(null);

  useEffect(() => {
    (async () => {
      const d = await getDogById(dogId);
      if (d) {
        setDog(d);
        navigation.setOptions({ title: d.name });
      }
    })();
  }, [dogId, navigation]);

  // Back arrow like other screens (keeps title centered)
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

  const confirmDelete = () =>
    Alert.alert('Delete dog', `Remove “${dog?.name}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDog(dogId);
          navigation.goBack();
        } },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Breeding profile */}
      <TouchableOpacity
        style={styles.btnGrey}
        onPress={() => navigation.navigate('DogForm', { dog })}
      >
        <MaterialCommunityIcons name="dog" size={20} color={'#fff'} />
        <Text style={styles.btnText}>Breeding Profile</Text>
      </TouchableOpacity>

      {/* Genetics list */}
      <TouchableOpacity
        style={styles.btnGrey}
        onPress={() => navigation.navigate('GeneticsList', { dogId, dogName: dog?.name })}
      >
        <MaterialCommunityIcons name="dna" size={20} color={'#fff'} />
        <Text style={styles.btnText}>Genetics</Text>
      </TouchableOpacity>

      {/* Veterinary list */}
      <TouchableOpacity
        style={styles.btnGrey}
        onPress={() =>
          navigation.navigate('VetRecordsList', { dogId, dogName: dog?.name })
        }
      >
        <MaterialCommunityIcons name="stethoscope" size={20} color={'#fff'} />
        <Text style={styles.btnText}>Veterinary</Text>
      </TouchableOpacity>

      {/* Delete dog */}
      <TouchableOpacity style={styles.removeBtn} onPress={confirmDelete}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
        <Text style={styles.removeBtnText}>Remove Dog</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerBackBtn: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.06)' },
  btnGrey: { height: 52, borderRadius: 14, backgroundColor: '#1B1F2C', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  btnText: { color: '#fff', fontWeight: '800' },
  removeBtn: { height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#ef444466', backgroundColor: '#ef44441a', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  removeBtnText: { color: '#ef4444', fontWeight: '800' },

  container: { padding: 16, gap: 14 },
  card: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: '#1B1F2C',
    borderRadius: radius,
    padding: 16,
    ...shadow,
  },
  deleteCard: { borderWidth: 1, borderColor: '#b00020' },
  textBox: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  cardDesc: { color: '#555' },
});

// src/screens/DogsGridScreen.tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { getDogs } from '../db';
import { colors } from '../theme';

type Dog = {
  id: string | number;
  name: string;
  sex: 'M' | 'F';
  breed?: string | null;
  imageUri?: string | null;
  photoUri?: string | null;
  image?: string | null;
  img?: string | null;
};

type Nav = any;

const { width: W } = Dimensions.get('window');
const NUM = 2;
const GAP = 14;
const PAD = 14;
const SIZE = Math.floor((W - PAD * 2 - GAP * (NUM - 1)) / NUM);
const IMG_H = Math.round(SIZE * 0.75);

const sexColor = (sex: 'M' | 'F') => (sex === 'M' ? colors.male : colors.female);

export default function DogsGridScreen() {
  const navigation = useNavigation<Nav>();
  const [dogs, setDogs] = useState<Dog[]>([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          const list = await getDogs();
          if (mounted) setDogs(list ?? []);
        } catch (e) {
          console.warn('Failed to load dogs', e);
          if (mounted) setDogs([]);
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const dataWithAdd = useMemo(() => [...dogs, { id: '__add__' }] as any[], [dogs]);

  const goDogMenu = (dogId: string | number) => navigation.navigate('DogMenu', { dogId });
  const goQuickAdd = () => navigation.navigate('QuickAddDog');

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === '__add__') {
      return (
        <View style={styles.cardWrap}>
          <Pressable
            onPress={goQuickAdd}
            style={({ pressed }) => [styles.card, styles.cardAdd, pressed && { opacity: 0.88 }]}
          >
            <View style={styles.addCircle}>
              <MaterialCommunityIcons name="plus" size={30} color={colors.text} />
            </View>
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        </View>
      );
    }

    const dog: Dog = item;
    const badgeColor = sexColor(dog.sex);
    const uri = dog.imageUri ?? dog.photoUri ?? dog.image ?? dog.img ?? null;

    return (
      <View style={styles.cardWrap}>
        <Pressable
          onPress={() => goDogMenu(dog.id)}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.94 }]}
        >
          <View style={styles.thumbWrap}>
            {uri ? (
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <MaterialCommunityIcons name="image-off" size={36} color="#ffffffaa" />
              </View>
            )}

            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <MaterialCommunityIcons
                name={dog.sex === 'M' ? 'gender-male' : 'gender-female'}
                size={14}
                color="#fff"
              />
              <Text style={styles.badgeText}>{dog.sex}</Text>
            </View>
          </View>

          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.name}>
              {dog.name || 'Unnamed'}
            </Text>
            <Text numberOfLines={1} style={styles.meta}>
              {dog.breed || 'Unknown'}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* status bar transparent; fundalul e din container → edge-to-edge uniform */}
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* paw background discret */}
      <View style={styles.pawsLayer} pointerEvents="none">
        <MaterialCommunityIcons name="paw" size={76} color="rgba(255,255,255,0.05)" style={[styles.paw, { top: 50, left: 22 }]} />
        <MaterialCommunityIcons name="paw" size={62} color="rgba(255,255,255,0.045)" style={[styles.paw, { bottom: 140, right: 32, transform: [{ rotate: '18deg' }] }]} />
      </View>

      <FlatList
        key={NUM}
        data={dataWithAdd}
        keyExtractor={(it: any, i) => (it.id ? String(it.id) : `idx-${i}`)}
        renderItem={renderItem}
        numColumns={NUM}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ padding: PAD, paddingBottom: PAD + 24 }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="dog" size={42} color={colors.subtext} />
            <Text style={[styles.meta, { marginTop: 8 }]}>
              No dogs yet. Tap “Add” to create one.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pawsLayer: { ...StyleSheet.absoluteFillObject },
  paw: { position: 'absolute' },

  cardWrap: {
    width: SIZE,
    height: IMG_H + 60,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },

  // ADD card
  cardAdd: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  addCircle: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: colors.border,
  },
  addLabel: { fontSize: 13.5, letterSpacing: 0.3, color: colors.subtext, fontWeight: '700' },

  // IMAGINE
  thumbWrap: { height: IMG_H, backgroundColor: 'rgba(255,255,255,0.05)' },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // SEX BADGE
  badge: {
    position: 'absolute', top: 10, right: 10,
    borderRadius: 999, paddingHorizontal: 9, height: 24,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // INFO
  info: { paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  meta: { color: colors.subtext, fontSize: 12.5 },

  empty: { marginTop: 60, alignItems: 'center' },
});

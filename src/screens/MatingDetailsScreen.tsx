import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

import {
  getMatingById,
  getPuppiesByMatingId,
  updateMatingDates,
  deleteMating,
  getDogById,
} from '../db';
import { colors } from '../theme';
import { isFullValid } from '../utils/dateMask';

const entwicklungsplanText = `1. Woche (Tag 1–7): Befruchtung & Einnistung
•	?? Was passiert im Körper der Hündin?
Die Hündin wurde gedeckt. Die Spermien wandern durch die Gebärmutterhörner zu den Eileitern, wo die Eizellen befruchtet werden.
•	?? Welpenentwicklung:
Die befruchteten Eizellen beginnen sich zu teilen und wandern in Richtung Gebärmutter.
•	?? Hinweis:
Äußerlich keine Veränderungen sichtbar. Die Hündin kann etwas müde sein.
________________________________________
2. Woche (Tag 8–14): Zellteilung & Wanderung
•	?? Was passiert im Körper der Hündin?
Die Embryonen wandern weiter in die Gebärmutterhörner.
•	?? Welpenentwicklung:
Stetige Zellteilung. Am Ende dieser Woche erreichen die Embryonen die Gebärmutter.
•	?? Hinweis:
Hündin kann leicht verändertes Verhalten zeigen, z. B. mehr anhänglich oder ruhiger.
________________________________________
3. Woche (Tag 15–21): Einnistung
•	?? Was passiert im Körper der Hündin?
Die Embryonen nisten sich in der Gebärmutterschleimhaut ein.
•	?? Welpenentwicklung:
Bildung von Plazenta, Embryonen sind ca. 1 cm groß.
•	?? Hinweis:
Übelkeit möglich, leichter Ausfluss; eventuell Futterverweigerung.
________________________________________
4. Woche (Tag 22–28): Beginn der Organbildung
•	?? Was passiert im Körper der Hündin?
Trächtigkeit kann per Ultraschall festgestellt werden.
•	?? Welpenentwicklung:
Augen, Wirbelsäule, Nervensystem und Organe beginnen sich zu entwickeln. Herzschlag erkennbar.
•	?? Größe: ca. 1,5–2 cm.
•	?? Hinweis:
Gewichtszunahme beginnt, evtl. empfindlich im Bauchbereich.
________________________________________
5. Woche (Tag 29–35): Wachstumsphase
•	?? Was passiert im Körper der Hündin?
Zitzen werden größer und dunkler. Bauchumfang beginnt sich zu vergrößern.
•	?? Welpenentwicklung:
Bildung von Krallen, Schnauze, Gliedmaßen – Föten sehen nun wie kleine Hunde aus.
•	?? Größe: ca. 3 cm.
•	?? Hinweis:
Erhöhter Energiebedarf – evtl. Futter umstellen (auf Welpenfutter).
________________________________________
6. Woche (Tag 36–42): Ausbildung der Fellstruktur
•	?? Was passiert im Körper der Hündin?
Die Hündin wird runder, ruhiger und sucht oft Nähe.
•	?? Welpenentwicklung:
Fell und Hautpigmentierung entwickeln sich, Knochen härten sich.
•	?? Hinweis:
Hündin sollte nicht mehr springen oder stark belastet werden.
________________________________________
7. Woche (Tag 43–49): letzte Organreifung
•	?? Was passiert im Körper der Hündin?
Vorbereitung auf Geburt – Milchleisten schwellen an.
•	?? Welpenentwicklung:
Lunge und andere lebenswichtige Organe reifen. Bewegungen sind evtl. fühlbar.
•	?? Hinweis:
Nestbauverhalten kann beginnen.
________________________________________
8. Woche (Tag 50–56): Endentwicklung
•	?? Was passiert im Körper der Hündin?
Hündin sucht vermehrt Ruhe, kann unruhig werden, beginnt aktives Nestbauen.
•	?? Welpenentwicklung:
Welpen sind fast vollständig entwickelt. Sie können sich im Bauch drehen.
•	?? Hinweis:
Temperaturkontrolle beginnen (rektal) – Temperaturabfall kündigt Geburt an.
________________________________________
9. Woche (Tag 57–63): Geburt
•	?? Was passiert im Körper der Hündin?
Geburt steht bevor. Hündin wird unruhig, hechelt, scharrt – erste Wehen treten ein.
•	?? Welpenentwicklung:
Welpen sind geburtsbereit.
•	?? Hinweis:
Temperatur sinkt 12–24h vor Geburt auf ca. 37 °C oder darunter.
________________________________________
Die durchschnittliche Trächtigkeit bei Hunden dauert ca. 63 Tage (9 Wochen).`;

/** --- sizing: 3 pe rând --- */
const { width } = Dimensions.get('window');
const PAD = 16;
const GAP = 12;
const COLS = 3;
const ITEM = Math.floor((width - PAD * 2 - GAP * (COLS - 1)) / COLS);

export default function MatingDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { matingId } = route.params as { matingId: number };

  const [mating, setMating] = useState<any>(null);
  const [puppies, setPuppies] = useState<any[]>([]);
  const [showPlan, setShowPlan] = useState(false);

  const [maleImg, setMaleImg] = useState<string | null>(null);
  const [femaleImg, setFemaleImg] = useState<string | null>(null);

  const [matingDate, setMatingDate] = useState('');
  const [bornDate, setBornDate] = useState('');
  const [editedBornDate, setEditedBornDate] = useState('');
  const [showSave, setShowSave] = useState(false);

  // ——— iOS picker inline (modal)
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [iosTempDate, setIosTempDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const load = async () => {
      const m = await getMatingById(matingId);
      const pups = await getPuppiesByMatingId(matingId);

      setMating(m);
      setPuppies(pups ?? []);
      setMatingDate(m?.date ?? '');
      setBornDate(m?.bornDate ?? '');
      setEditedBornDate(m?.bornDate ?? '');
      setShowSave(false);

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
        headerTitle: () => (
          <Text numberOfLines={1} style={[styles.headerTitle, { textAlign: 'center' }]}>
            {(m?.male_name ?? 'Male')} <Text style={styles.headerAnd}>and</Text>{' '}
            {(m?.female_name ?? 'Female')}
          </Text>
        ),
        contentStyle: { paddingTop: 0 },
      });

      const maleId = m?.male_id ?? m?.maleDogId ?? m?.sire_id ?? m?.sireId ?? null;
      const femaleId = m?.female_id ?? m?.femaleDogId ?? m?.dam_id ?? m?.damId ?? null;

      try {
        if (maleId) {
          const maleDog = await getDogById(maleId);
          const uri =
            maleDog?.imageUri ??
            maleDog?.photoUri ??
            maleDog?.image ??
            maleDog?.img ??
            null;
          setMaleImg(uri);
        }
        if (femaleId) {
          const femaleDog = await getDogById(femaleId);
          const uri =
            femaleDog?.imageUri ??
            femaleDog?.photoUri ??
            femaleDog?.image ??
            femaleDog?.img ??
            null;
          setFemaleImg(uri);
        }
      } catch (e) {
        console.warn('Parents image fetch failed', e);
      }
    };

    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, matingId]);

  const sortedPuppies = useMemo(
    () => [...puppies].sort((a, b) => a.id - b.id),
    [puppies]
  );

  const handleSaveBornDate = async () => {
    if (!isFullValid(editedBornDate)) return;
    await updateMatingDates(matingId, matingDate, editedBornDate);
    setBornDate(editedBornDate);
    setShowSave(false);
    if (Platform.OS === 'ios') setIosPickerOpen(false);
  };

  const handleRemoveMating = async () => {
    await deleteMating(matingId);
    navigation.goBack();
  };

  // ——— helper pt format YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // ——— deschide picker Born Date (Android dialog / iOS modal)
  const openBornPicker = () => {
    const baseStr = editedBornDate || bornDate || matingDate;
    let baseDate = new Date();
    if (baseStr && /^\d{4}-\d{2}-\d{2}$/.test(baseStr)) {
      const [yy, mm, dd] = baseStr.split('-').map((n) => parseInt(n, 10));
      baseDate = new Date(yy, mm - 1, dd);
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: baseDate,
        mode: 'date',
        onChange: (_, date) => {
          if (!date) return;
          const ymd = formatYMD(date);
          setEditedBornDate(ymd);
          setShowSave(isFullValid(ymd) && ymd !== bornDate);
        },
      });
    } else {
      setIosTempDate(baseDate);
      setIosPickerOpen(true);
    }
  };

  if (!mating) return null;

  const parentImg = (uri?: string | null) =>
    uri ? (
      <Image source={{ uri }} style={styles.parentImg} resizeMode="cover" />
    ) : (
      <View style={styles.parentFallback}>
        <Ionicons name="paw" size={24} color={colors.subtext} />
      </View>
    );

  return (
    <>
      {/* ? DOAR TOP — NU și BOTTOM (banda verde globala se ocupa de jos) */}
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'transparent', paddingTop: 0, marginTop: 0 }}
        edges={[]}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.parentCard}>
              {parentImg(maleImg)}
              <View style={[styles.sexChip, { backgroundColor: colors.primary }]}>
                <Ionicons name="male" size={12} color="#fff" />
                <Text style={styles.sexChipText}>M</Text>
              </View>
            </View>

            <Ionicons
              name="heart"
              size={22}
              color={colors.female}
              style={{ marginHorizontal: 8 }}
            />

            <View style={styles.parentCard}>
              {parentImg(femaleImg)}
              <View style={[styles.sexChip, { backgroundColor: colors.female }]}>
                <Ionicons name="female" size={12} color="#fff" />
                <Text style={styles.sexChipText}>F</Text>
              </View>
            </View>
          </View>

          {/* DATES */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={18} color={colors.subtext} />
              <Text style={styles.cardHeaderText}>DATES</Text>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>MATING DATE</Text>
              <TextInput
                placeholder="YYYY-MM-DD"
                value={matingDate}
                editable={false}
                style={[styles.input, styles.inputDisabled]}
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>BORN DATE</Text>
              <View style={styles.inputRow}>
                {/* ——— Born Date: deschide calendarul pe tap, nu tastatură */}
                <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.9} onPress={openBornPicker}>
                  <View pointerEvents="none">
                    <TextInput
                      placeholder="YYYY-MM-DD"
                      value={editedBornDate}
                      editable={false}
                      style={[styles.input, { flex: 1 }]}
                      placeholderTextColor={colors.subtext}
                    />
                  </View>
                </TouchableOpacity>

                {showSave && (
                  <TouchableOpacity
                    onPress={handleSaveBornDate}
                    style={styles.saveChip}
                    accessibilityLabel="Save born date"
                  >
                    <Ionicons name="save-outline" size={16} color="#fff" />
                    <Text style={styles.saveChipText}>Save</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* PLAN */}
          <TouchableOpacity
            style={styles.bigAction}
            onPress={() => setShowPlan(true)}
          >
            <Ionicons name="book" size={18} color={colors.text} />
            <Text style={styles.bigActionText}>Plan</Text>
          </TouchableOpacity>

          {/* WEIGHTS */}
          <TouchableOpacity
            style={styles.bigAction}
            onPress={() =>
              navigation.navigate('AllPuppyWeightChart', { matingId })
            }
          >
            <Ionicons name="stats-chart" size={18} color={colors.text} />
            <Text style={styles.bigActionText}>Weights</Text>
          </TouchableOpacity>

          {/* REMOVE */}
          <TouchableOpacity
            style={[
              styles.bigAction,
              { backgroundColor: '#ef44441a', borderColor: '#ef444466' },
            ]}
            onPress={handleRemoveMating}
          >
            <Ionicons name="trash" size={18} color="#ef4444" />
            <Text style={[styles.bigActionText, { color: '#ef4444' }]}>
              Remove Mating
            </Text>
          </TouchableOpacity>

          {/* PUPPIES */}
          <Text style={styles.sectionTitle}>Your Puppies</Text>
          <View style={styles.gridWrap}>
            {sortedPuppies.map((puppy) => {
              const isF = puppy.sex === 'F';
              const accent = isF ? colors.female : colors.primary;
              const uri =
                puppy.image ??
                puppy.imageUri ??
                puppy.photoUri ??
                puppy.img ??
                puppy.uri ??
                puppy.url ??
                null;
              const letter = puppy.name?.[0]?.toUpperCase?.() || '?';

              return (
                <TouchableOpacity
                  key={puppy.id}
                  onPress={() =>
                    navigation.navigate('PuppyProfile', { puppyId: puppy.id })
                  }
                  style={styles.pupCard}
                >
                  <View style={styles.thumbWrap}>
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={styles.thumb}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.thumbPlaceholder}>
                        <Ionicons
                          name="image"
                          size={30}
                          color={colors.subtext}
                        />
                        <Text
                          style={[styles.fallbackText, { color: accent }]}
                        >
                          {letter}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.badge, { backgroundColor: accent }]}>
                      <Ionicons
                        name={isF ? 'female' : 'male'}
                        size={12}
                        color="#fff"
                      />
                      <Text style={styles.badgeText}>
                        {isF ? 'F' : 'M'}
                      </Text>
                    </View>
                  </View>
                  <Text numberOfLines={1} style={styles.pupName}>
                    {puppy.name || 'Unnamed'}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              onPress={() => navigation.navigate('AddPuppy', { matingId })}
              style={styles.pupCard}
            >
              <View
                style={[
                  styles.thumbWrap,
                  { alignItems: 'center', justifyContent: 'center' },
                ]}
              >
                <View style={styles.addCircle}>
                  <Ionicons name="add" size={24} color={colors.text} />
                </View>
              </View>
              <Text style={[styles.pupName, { color: colors.subtext }]}>
                Add Puppy
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* ——— iOS: modal cu picker inline + buton Save mini */}
      {Platform.OS === 'ios' && iosPickerOpen && (
        <Modal visible transparent animationType="fade">
          <View style={styles.iosBackdrop}>
            <View style={styles.iosCard}>
              <DateTimePicker
                value={iosTempDate || new Date()}
                mode="date"
                display="inline"
                onChange={(_, date) => {
                  if (!date) return;
                  const ymd = formatYMD(date);
                  setEditedBornDate(ymd);
                  setShowSave(isFullValid(ymd) && ymd !== bornDate);
                }}
              />

              <TouchableOpacity
                onPress={handleSaveBornDate}
                style={[styles.saveChip, { alignSelf: 'center', marginTop: 12 }]}
              >
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.saveChipText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIosPickerOpen(false)} style={{ marginTop: 8, alignSelf: 'center' }}>
                <Text style={{ color: colors.subtext, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* PLAN MODAL full screen + fundal complet pâna sub bara de jos */}
      <Modal
        visible={showPlan}
        animationType="slide"
        onRequestClose={() => setShowPlan(false)}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
          <StatusBar style="light" translucent={false} backgroundColor={colors.bg} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Entwicklungsplan</Text>
            <TouchableOpacity onPress={() => setShowPlan(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: colors.bg }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalText}>{entwicklungsplanText}</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

/* ========= styles ========= */
const styles = StyleSheet.create({
  container: { padding: PAD, backgroundColor: 'transparent' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    width: '100%',
  },
  headerAnd: { color: colors.subtext, fontWeight: '800' },

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

  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  parentCard: { flex: 1, position: 'relative' },
  parentImg: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  parentFallback: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sexChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sexChipText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginTop: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardHeaderText: {
    color: colors.subtext,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 12,
  },
  fieldBlock: { gap: 6 },
  label: {
    color: colors.subtext,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputDisabled: { opacity: 0.7 },

  // ——— Save mic: aceleași DIMENSIUNI, iconiță dischetă, culori/feel ca bara mare Save
  saveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    height: 40,            // aceleași dimensiuni ca înainte
    borderRadius: 999,     // păstrat ca în codul tău
    gap: 6,
  },
  saveChipText: { color: '#fff', fontWeight: '800' },

  bigAction: {
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
  bigActionText: { color: colors.text, fontWeight: '800' },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  pupCard: { width: ITEM, marginBottom: GAP, alignItems: 'center' },
  thumbWrap: {
    width: ITEM,
    height: ITEM,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { marginTop: 6, fontSize: 20, fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  pupName: { marginTop: 6, color: colors.text, fontSize: 13, fontWeight: '700' },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
  },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  modalText: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 12 },

  // ——— stiluri pentru modalul iOS
  iosBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  iosCard: {
    width: '100%',
    borderRadius: 14,
    padding: 16,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

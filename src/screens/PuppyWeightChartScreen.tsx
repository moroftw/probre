import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getDb, getPuppyById, getPuppyWeights } from '../db';
import { colors } from '../theme';

const screenW = Dimensions.get('window').width;

export default function PuppyWeightChartScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { puppyId } = route.params;

  const [weights, setWeights] = useState<any[]>([]);
  const [puppyName, setPuppyName] = useState<string>('');

  const loadWeights = async () => {
    const data = await getPuppyWeights(puppyId);
    const sorted = [...data].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
    setWeights(sorted);
  };

  const loadPuppyName = async () => {
    const puppy = await getPuppyById(puppyId);
    if (puppy?.name) {
      navigation.setOptions({ title: `${puppy.name}'s weight` });
      setPuppyName(puppy.name);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadWeights();
      loadPuppyName();
    }

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
  }, [isFocused, navigation]);

  const chartData = () => {
    if (weights.length === 0) {
      return {
        labels: ['Birth', '1d', '2d', '3d'],
        datasets: [{ data: [0, 0, 0, 0] }],
      };
    }

    const baseDate = new Date(weights[0].dateTime);

    const labels = weights.map((entry) => {
      const days = Math.round(
        (new Date(entry.dateTime).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return days === 0 ? 'Birth' : `${days}d`;
    });

    const data = weights.map(
      (w) => (w.weightKg || 0) * 1000 + (w.weightGrams || 0)
    );

    return {
      labels,
      datasets: [{ data }],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: () => '#000',
    labelColor: () => '#666',
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#444' },
  };

  const onEdit = (item: any) => {
    navigation.navigate('AddOrEditWeight', { weight: item, puppyId });
  };

  const onAdd = () => {
    navigation.navigate('AddOrEditWeight', { puppyId });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={weights}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No weights added</Text>}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.chartCard}>
              <LineChart
                data={chartData()}
                width={screenW - 32}
                height={260}
                yAxisSuffix="g"
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </View>

            <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Add Weight</Text>
            </TouchableOpacity>
</View>
        }
        renderItem={({ item }) => {
          const date = new Date(item.dateTime);
          const kg = item.weightKg || 0;
          const g = item.weightGrams || 0;

          let label = '';
          if (kg > 0 && g > 0) label = `${kg} kg ${g} g`;
          else if (kg > 0) label = `${kg} kg`;
          else label = `${g} g`;

          const dateStr = `${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${date.toLocaleDateString('en-GB')}`;

          return (
            <TouchableOpacity style={styles.item} onPress={() => onEdit(item)}>
              <Text style={styles.itemText}>{label}</Text>
              <Text style={styles.itemSub}>{dateStr}</Text>
            </TouchableOpacity>
          );
        }}
      />
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
  container: { flex: 1, backgroundColor: colors.bg },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  headerWrap: { marginBottom: 16, alignItems: 'center' },

  chartCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  chart: { borderRadius: 12, alignSelf: 'center' },

  // buton secundar – gri ca în Edit Puppy
  addBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  addBtnText: { color: colors.text, fontWeight: '800', fontSize: 15 },

  item: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  itemText: { color: colors.text, fontWeight: '700', marginBottom: 4 },
  itemSub: { color: '#9aa0a6', fontSize: 12 },

  empty: { textAlign: 'center', color: '#9aa0a6', marginTop: 20 },
});

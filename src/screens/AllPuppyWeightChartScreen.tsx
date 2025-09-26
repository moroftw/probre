
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getPuppiesByMatingId, getPuppyWeights } from '../db';
import { colors } from '../theme'; // pentru textul alb în legendă

const screenWidth = Dimensions.get('window').width;

export default function AllPuppyWeightChartScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { matingId } = route.params as { matingId: number };

  const [puppies, setPuppies] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [lineColors, setLineColors] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

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
      title: 'All Puppies Weights',
    });
  }, [navigation]);

  useEffect(() => {
    const load = async () => {
      const pups = await getPuppiesByMatingId(matingId);

      const newLineColors: Record<number, string> = {};
      pups.forEach((p, index) => {
        newLineColors[p.id] = generateColor(index);
      });
      setLineColors(newLineColors);

      const datasets: any[] = [];
      const allLabels = new Set<number>();
      const validPuppies: any[] = [];

      for (const pup of pups) {
        const weights = await getPuppyWeights(pup.id);
        if (!weights.length) continue;

        validPuppies.push(pup);

        const baseDate = new Date(weights[0].dateTime);

        const dataPoints = weights.map((w) => {
          const grams = w.weightKg * 1000 + (w.weightGrams || 0);
          const days = Math.round((new Date(w.dateTime).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
          allLabels.add(days);
          return { x: days, y: grams };
        });

        const sortedPoints = dataPoints.sort((a, b) => a.x - b.x);
        const values = sortedPoints.map((pt) => pt.y);

        datasets.push({
          data: values,
          color: () => newLineColors[pup.id],
          strokeWidth: 2,
          withDots: true,
        });
      }

      const sortedLabelNumbers = Array.from(allLabels).sort((a, b) => a - b);
      const labels = sortedLabelNumbers.map((d) => (d === 0 ? 'Birth' : `${d}d`));

      if (datasets.length > 0) {
        setChartData({
          labels,
          datasets,
          legend: [], // ținem legenda separată, jos
        });
      } else {
        setChartData(null);
      }

      setPuppies(validPuppies);
      setLoading(false);
    };

    load();
  }, [matingId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {chartData && chartData.datasets.length > 0 ? (
        <>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={260}
            bezier
            yAxisSuffix="g"
            chartConfig={{
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => '#000',
              labelColor: () => '#888',
              propsForDots: {
                r: '3',
                strokeWidth: '1',
                stroke: '#000',
              },
            }}
            style={styles.chart}
          />

          {/* Legenda */}
          <View style={styles.legend}>
            {puppies.map((pup) => (
              <View key={pup.id} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: lineColors[pup.id] }]} />
                <Text style={styles.legendText}>{pup.name}</Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>No weight data available yet.</Text>
      )}
    </ScrollView>
  );
}

function generateColor(index: number) {
  const palette = [
    '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
    '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080',
  ];
  return palette[index % palette.length];
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
  container: {
    padding: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  legend: {
    marginTop: 16,
    width: '100%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  legendText: {
    color: colors.text,
    fontWeight: '700',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

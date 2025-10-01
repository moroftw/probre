// App.tsx — floating (transparent) Dogs/Matings + SafeArea verde global
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import {
  NavigationContainer,
  Theme,
  useNavigation,
  CommonActions,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { navTheme, paperTheme, colors } from './src/theme';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View } from 'react-native';

import DogsGridScreen from './src/screens/DogsGridScreen';
import DogMenuScreen from './src/screens/DogMenuScreen';
import QuickAddDogScreen from './src/screens/QuickAddDogScreen';
import MatingsScreen from './src/screens/MatingsScreen';
import MatingFormScreen from './src/screens/MatingFormScreen';
import DogFormScreen from './src/screens/DogFormScreen';
import GeneticsFormScreen from './src/screens/GeneticsFormScreen';
import VetRecordFormScreen from './src/screens/VetRecordFormScreen';
import GeneticsListScreen from './src/screens/GeneticsListScreen';
import VetRecordsListScreen from './src/screens/VetRecordsListScreen';
import MatingDetailsScreen from './src/screens/MatingDetailsScreen';
import AddPuppyScreen from './src/screens/AddPuppyScreen';
import PuppyProfileScreen from './src/screens/PuppyProfileScreen';
import PuppyWeightChartScreen from './src/screens/PuppyWeightChartScreen';
import AddOrEditWeightScreen from './src/screens/AddOrEditWeightScreen';
import { initDb } from './src/db';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import DewormingScreen from './src/screens/DewormingScreen';

const DEBUG_SAFE = true;
const DEBUG_GREEN = '#00C853';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();

const DarkNav: Theme = {
  ...navTheme,
  colors: {
    ...navTheme.colors,
    background: colors.bg,
    card: colors.bg,
    text: colors.text,
  },
};

/** — Header global reutilizabil (nativ Stack) — */
function AppHeader({
  navigation,
  route,
  back,
  options,
}: {
  navigation: any;
  route: any;
  back: any;
  options: any;
}) {
  const insets = useSafeAreaInsets();

  // Titlul: daca e Root (Tabs), luam subruta activa (Dogs/Matings); altfel folosim options.title / route.name.
  let title = options?.title ?? route?.name ?? '';
  if (route?.name === 'Root') {
    const rn = getFocusedRouteNameFromRoute(route) ?? 'Dogs';
    title = rn;
  }

  return (
    <View
      style={{
        paddingTop: 6,
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Sageata back mica — stil identic cu headerBackBtn din screens */}
        <View style={{ position: 'absolute', left: 12 }}>
          {back ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go back"
              style={{
                height: 32,
                width: 32,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Titlu centrat */}
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

/** — Butoane plutitoare complet transparente — */
function FloatingTabs() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const OFFSET = 6;

  const goDogs = () =>
    navigation.dispatch(CommonActions.navigate({ name: 'Root', params: { screen: 'Dogs' } }));
  const goMatings = () =>
    navigation.dispatch(CommonActions.navigate({ name: 'Root', params: { screen: 'Matings' } }));

  return (
    <View
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: insets.bottom + OFFSET,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'transparent',
      }}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={goDogs}
        activeOpacity={0.7}
        style={{
          backgroundColor: 'transparent',
          borderRadius: 24,
          paddingHorizontal: 10,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <Ionicons name="paw" size={18} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.primary, fontWeight: '700' }}>Dogs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goMatings}
        activeOpacity={0.7}
        style={{
          backgroundColor: 'transparent',
          borderRadius: 24,
          paddingHorizontal: 10,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <Ionicons name="heart" size={18} color={colors.female} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.female, fontWeight: '700' }}>Matings</Text>
      </TouchableOpacity>
    </View>
  );
}

/** — Tabs fara tab bar — */
function Tabs({ navigation, route }: any) {
  // Important: pentru ca headerul sa poata afi?a corect titlul pe Root, setam dinamic options.title
  const focused = getFocusedRouteNameFromRoute(route) ?? 'Dogs';
  // set Options pe navigatorul parinte (Stack) — titlul pentru Root
  useEffect(() => {
    navigation.setOptions?.({ title: focused });
  }, [focused, navigation]);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
        <Tab.Screen name="Dogs" component={DogsGridScreen} />
        <Tab.Screen name="Matings" component={MatingsScreen} />
      </Tab.Navigator>
      <FloatingTabs />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    initDb();
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync(DEBUG_SAFE ? DEBUG_GREEN : colors.bg);
        await NavigationBar.setButtonStyleAsync('light');
        await NavigationBar.setBehaviorAsync('inset-swipe');
      } catch {}
    })();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: DEBUG_SAFE ? DEBUG_GREEN : colors.bg }}
          edges={['top']}
        >
          <StatusBar
            style="light"
            translucent={false}
            backgroundColor={DEBUG_SAFE ? DEBUG_GREEN : colors.bg}
          />
          <NavigationContainer theme={DarkNav}>
            <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <View style={{ flex: 1 }}>
                <Stack.Navigator
                  screenOptions={{
                    // ?? Header nativ PORNIT + custom global
                    headerShown: true,
                    header: (props) => <AppHeader {...props} />,
                    contentStyle: { backgroundColor: colors.bg },
                  }}
                >
                  {/* Root (Tabs) — titlu dinamic setat din Tabs */}
                  <Stack.Screen
                    name="Root"
                    component={Tabs}
                    options={{ title: 'Dogs' }}
                  />

                  {/* Restul screen-urilor (nu le atingem) */}
                  <Stack.Screen name="DogMenu" component={DogMenuScreen} />
                  <Stack.Screen name="QuickAddDog" component={QuickAddDogScreen} />
                  <Stack.Screen name="MatingForm" component={MatingFormScreen} />
                  <Stack.Screen name="DogForm" component={DogFormScreen} />
                  <Stack.Screen name="GeneticsForm" component={GeneticsFormScreen} />
                  <Stack.Screen name="VetRecordForm" component={VetRecordFormScreen} />
                  <Stack.Screen name="GeneticsList" component={GeneticsListScreen} />
                  <Stack.Screen name="VetRecordsList" component={VetRecordsListScreen} />
                  <Stack.Screen name="MatingDetails" component={MatingDetailsScreen} />
                  <Stack.Screen name="AddPuppy" component={AddPuppyScreen} />
                  <Stack.Screen name="PuppyProfile" component={PuppyProfileScreen} />
                  <Stack.Screen name="PuppyWeightChart" component={PuppyWeightChartScreen} />
                  <Stack.Screen name="AddOrEditWeight" component={AddOrEditWeightScreen} />
                  <Stack.Screen
                    name="AllPuppyWeightChart"
                    component={require('./src/screens/AllPuppyWeightChartScreen').default}
                  />
                  <Stack.Screen name="Deworming" component={DewormingScreen} />
                </Stack.Navigator>

                {DEBUG_SAFE && (
                  <SafeAreaView
                    pointerEvents="none"
                    edges={['bottom']}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: DEBUG_GREEN,
                    }}
                  />
                )}
              </View>
            </GestureHandlerRootView>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

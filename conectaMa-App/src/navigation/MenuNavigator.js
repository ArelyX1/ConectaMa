import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // ✅ Cambiado a @expo/vector-icons
import { useUser } from '../context/UserContext';

// Screens
import MainMenuStack from '../screens/MainMenuScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MainMenuServicioStack from '../screens/MainMenuServicioScreen';
import FeedScreen from '../screens/FeedScreen';

// Screen names
const homeName = 'Inicio';
const profileName = 'Perfil';
const feedName = 'Feed';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { user } = useUser();

  const HomeComponent = user?.enServicio ? MainMenuServicioStack : MainMenuStack;

  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const rn = route.name;

          if (rn === homeName) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (rn === profileName) {
            iconName = focused ? 'person' : 'person-outline';
          } else if (rn === feedName) {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#43A89B',
        tabBarInactiveTintColor: 'grey',
        tabBarStyle: [
          {
            display: 'flex',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            justifyContent: 'center',
          },
          null,
        ],
      })}
    >
      <Tab.Screen name={homeName} component={HomeComponent} options={{ headerShown: false }} />
      <Tab.Screen name={feedName} component={FeedScreen} options={{ headerShown: false }} />
      <Tab.Screen name={profileName} component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
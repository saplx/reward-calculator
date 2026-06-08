import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Settings, Calendar, BarChart3 } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MonthlyScreen from '../screens/MonthlyScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        },
        headerTitleStyle: { fontWeight: '600', fontSize: 18, color: '#111827' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Главная', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Календарь', tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} /> }} />
      <Tab.Screen name="Monthly" component={MonthlyScreen} options={{ title: 'Месяц', tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки', tabBarIcon: ({ color, size }) => <Settings size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}
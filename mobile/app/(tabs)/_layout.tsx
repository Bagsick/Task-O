import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'

import { palette } from '../../src/theme'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: '#7c8aa5',
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          borderTopColor: '#dce4ef',
          borderTopWidth: 1,
          borderRadius: 16,
          height: 74,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          elevation: 10,
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 14,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            dashboard: 'grid-outline',
            tasks: 'checkbox-outline',
            projects: 'folder-open-outline',
            calendar: 'calendar-outline',
            notifications: 'notifications-outline',
            settings: 'settings-outline',
          }
          const iconName = map[route.name] || 'ellipse-outline'
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  )
}
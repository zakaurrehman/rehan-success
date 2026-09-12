import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Tabs } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme, family } from '@/theme'

type TabDef = { name: string; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap; center?: boolean }

const TABS: TabDef[] = [
  { name: 'research', label: 'Research', icon: 'document-text-outline', iconActive: 'document-text' },
  { name: 'community', label: 'Community', icon: 'people-outline', iconActive: 'people' },
  { name: 'signals', label: 'Desk', icon: 'flash-outline', iconActive: 'flash', center: true },
  { name: 'classroom', label: 'Learn', icon: 'school-outline', iconActive: 'school' },
  { name: 'profile', label: 'Account', icon: 'person-circle-outline', iconActive: 'person-circle' },
]

type BarProps = {
  state: { index: number; routes: { key: string; name: string }[] }
  navigation: { navigate: (name: string) => void; emit: (e: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean } }
}

function TabBar({ state, navigation }: BarProps) {
  const insets = useSafeAreaInsets()
  const { c, shadow } = useTheme()
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-end',
          backgroundColor: c.card,
          borderTopWidth: 1,
          borderTopColor: c.border,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        shadow.sm,
      ]}
    >
      {TABS.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.name)
        const active = !!route && state.routes[state.index]?.name === tab.name
        const onPress = () => {
          if (!route) return navigation.navigate(tab.name)
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!event.defaultPrevented && !active) navigation.navigate(tab.name)
        }

        if (tab.center) {
          return (
            <Pressable key={tab.name} onPress={onPress} style={{ flex: 1, alignItems: 'center', marginTop: -22 }} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel="Signal desk">
              <View
                style={[
                  { width: 58, height: 58, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: c.card },
                  shadow.primary,
                ]}
              >
                <Ionicons name="flash" size={26} color={c.primaryFg} />
              </View>
              <Text style={{ marginTop: 3, fontSize: 11, fontFamily: family.bodyBold, color: active ? c.primary : c.muted }}>{tab.label}</Text>
            </Pressable>
          )
        }

        return (
          <Pressable key={tab.name} onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3, minHeight: 48 }} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={tab.label}>
            <View style={{ paddingHorizontal: 14, paddingVertical: 3, borderRadius: 999, backgroundColor: active ? c.primaryTint2 : 'transparent' }}>
              <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? c.primary : c.dim} />
            </View>
            <Text style={{ fontSize: 11, fontFamily: active ? family.bodyBold : family.bodyMedium, color: active ? c.primary : c.dim }}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="signals"
      tabBar={(props) => <TabBar {...(props as unknown as BarProps)} />}
      // Tab pages render their own large headers.
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="research" options={{ title: 'Research' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="signals" options={{ title: 'Desk' }} />
      <Tabs.Screen name="classroom" options={{ title: 'Learn' }} />
      <Tabs.Screen name="profile" options={{ title: 'Account' }} />
    </Tabs>
  )
}

import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Label>Explore</Label>
        <Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Label>Notifications</Label>
        <Icon sf="bell.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="user">
        <Label>Profile</Label>
        <Icon sf="person.fill" />
      </NativeTabs.Trigger>
      
      {/* Hidden screens */}
      <NativeTabs.Screen name="channel" options={{ href: null }} />
      <NativeTabs.Screen name="conversation" options={{ href: null }} />
      <NativeTabs.Screen name="search" options={{ href: null }} />
    </NativeTabs>
  );
}

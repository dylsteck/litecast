import { Tabs } from 'expo-router';
import { useTheme } from 'tamagui';
import {
  ACTIVE_TINT_COLOR,
  HEADER_EDGE_SPACE_TOKEN,
  MyPageHeaderRight,
  getCastTabBarIconOptions,
  getChatTabBarIconOptions,
  getCrewTabBarIconOptions,
  getHomeTabIconOptions,
  getMyPageTabBarIconOptions,
} from 'ui';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      sceneContainerStyle={{
        backgroundColor: '#fff',
      }}
      screenOptions={{
        headerRightContainerStyle: { paddingRight: HEADER_EDGE_SPACE_TOKEN },
        headerTitleAlign: 'left',
        tabBarActiveTintColor: ACTIVE_TINT_COLOR,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#fff',
          display: 'none',
          paddingTop: 15,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          ...getHomeTabIconOptions(),
          title: ''
        }}
      />
      {/*
      <Tabs.Screen
        name="cast"
        options={{
         ...getCastTabBarIconOptions(),
          title: '',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          ...getChatTabBarIconOptions(),
          title: ''
        }}
      />
      <Tabs.Screen
        name="myPage"
        options={{
          headerRight: MyPageHeaderRight,
          // ...getMyPageTabBarIconOptions(),
          tabBarIcon: null,
          title: ''
        }}
      /> */}
    </Tabs>
  );
}
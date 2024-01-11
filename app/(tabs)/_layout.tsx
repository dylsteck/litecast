import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';

import Colors from '../../constants/Colors';
import { NeynarProvider } from '../../providers/NeynarProvider';
import HomeHeaderLeft from '../../components/HomeHeaderLeft';
import HomeHeaderRight from '../../components/HomeHeaderRight';

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NeynarProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopColor: '#fff',
            display: 'none',
            shadowOpacity: 0,
          },
          headerStyle: {
            backgroundColor: 'white'
          }
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            headerLeft: () => <HomeHeaderLeft />,
            headerRight: () => <HomeHeaderRight />,
            headerRightContainerStyle: {
              position: 'relative', 
              minWidth: '60%',
              width: 'auto',
            }
          }}
        />
        <Tabs.Screen
          name="channel"
          options={{
            title: '',
            headerLeft: () => <HomeHeaderLeft />,
            headerRight: () => <HomeHeaderRight />,
            headerRightContainerStyle: {
              position: 'relative', 
              minWidth: '60%',
              width: 'auto',
            }
          }}
        />
        <Tabs.Screen
          name="conversation"
          options={{
            title: '',
          }}
        />
      </Tabs>
    </NeynarProvider>
  );
}

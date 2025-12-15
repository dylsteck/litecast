import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface TabPillsProps<T extends string> {
  tabs: { id: T; label: string }[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function TabPills<T extends string>({ tabs, activeTab, onTabChange }: TabPillsProps<T>) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.tab, activeTab === tab.id && styles.activeTab]}>
              <Text style={[styles.text, activeTab === tab.id && styles.activeText]}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  content: {
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 100,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#000',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeText: {
    color: '#FFF',
    fontWeight: '700',
  },
});


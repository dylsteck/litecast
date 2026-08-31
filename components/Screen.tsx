import React from 'react';
import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SystemColors } from '../constants/Colors';

export function Screen({
  children,
  edges = ['top'],
}: {
  children: React.ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}) {
  const { width } = useWindowDimensions();
  const showGuardrails = Platform.OS === 'web' && width > 768;

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={styles.wrapper}>
        {showGuardrails ? (
          <>
            <View style={styles.guardrailLeft} />
            <View style={styles.guardrailRight} />
          </>
        ) : null}
        <View style={styles.column}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

export function FeedState({
  error,
  loading,
  onRetry,
  emptyTitle,
  emptySubtitle,
  isEmpty,
}: {
  error?: Error | null;
  loading?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptySubtitle?: string;
  isEmpty?: boolean;
}) {
  if (error) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>Unable to load</Text>
        <Text style={styles.stateBody}>{error.message}</Text>
        {onRetry ? (
          <TouchableOpacity onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.state}>
        <ActivityIndicator color={SystemColors.secondaryLabel} />
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateTitle}>{emptyTitle ?? 'Nothing here yet'}</Text>
        {emptySubtitle ? <Text style={styles.stateBody}>{emptySubtitle}</Text> : null}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SystemColors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: { flex: 1, position: 'relative' },
  column: {
    flex: 1,
    backgroundColor: SystemColors.background,
    ...Platform.select({
      web: { maxWidth: 600, alignSelf: 'center', width: '100%' },
    }),
  },
  guardrailLeft: Platform.select({
    web: {
      position: 'absolute',
      left: 'calc(50% - 300px)' as unknown as number,
      top: 0,
      bottom: 0,
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
      zIndex: 1,
    },
    default: {},
  }),
  guardrailRight: Platform.select({
    web: {
      position: 'absolute',
      right: 'calc(50% - 300px)' as unknown as number,
      top: 0,
      bottom: 0,
      width: StyleSheet.hairlineWidth,
      backgroundColor: SystemColors.separator,
      zIndex: 1,
    },
    default: {},
  }),
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: SystemColors.label,
    marginBottom: 8,
  },
  stateBody: {
    fontSize: 15,
    color: SystemColors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 21,
  },
  retry: {
    marginTop: 20,
    backgroundColor: SystemColors.label,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: SystemColors.background, fontWeight: '600' },
});

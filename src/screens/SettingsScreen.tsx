import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Settings
      </Text>

      <Text style={styles.description}>
        Application settings will be added here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8F7FF',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#191B23',
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    color: '#737785',
  },
});
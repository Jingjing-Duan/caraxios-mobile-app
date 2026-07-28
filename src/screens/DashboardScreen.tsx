import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { getVehicles } from '../services/vehicleService';

export default function DashboardScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();

      setVehicles(data.items ?? data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVehicles = vehicles.length;

  const availableVehicles = vehicles.filter(
    vehicle => vehicle.status === 'available'
  ).length;

  const soldVehicles = vehicles.filter(
    vehicle => vehicle.status === 'sold'
  ).length;

  const draftVehicles = vehicles.filter(
    vehicle => vehicle.status === 'draft'
  ).length;

    const inactiveVehicles = vehicles.filter(
    vehicle => vehicle.status === 'inactive'
  ).length;

  if (loading) {
    return <Text>Loading dashboard...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CarAxios Dashboard</Text>

    <View style={styles.statsContainer}>

    <Pressable
        onPress={() => navigation.navigate('AIAssistant')}
    >
        <Text>AI Vehicle Assistant</Text>
    </Pressable>

    <Pressable
        style={styles.card}
        onPress={() =>
        navigation.navigate('Inventory', {
            statusFilter: 'all',
        })
        }
    >
        <Text style={styles.cardNumber}>{totalVehicles}</Text>
        <Text style={styles.cardLabel}>Total Inventory</Text>
    </Pressable>

    <Pressable
        style={styles.card}
        onPress={() =>
        navigation.navigate('Inventory', {
            statusFilter: 'available',
        })
        }
    >
        <Text style={styles.cardNumber}>{availableVehicles}</Text>
        <Text style={styles.cardLabel}>Available</Text>
    </Pressable>

    <Pressable
        style={styles.card}
        onPress={() =>
        navigation.navigate('Inventory', {
            statusFilter: 'sold',
        })
        }
    >
        <Text style={styles.cardNumber}>{soldVehicles}</Text>
        <Text style={styles.cardLabel}>Sold</Text>
    </Pressable>

    </View>

{/*
      <View style={styles.card}>
        <Text style={styles.cardNumber}>{draftVehicles}</Text>
        <Text style={styles.cardLabel}>Draft</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardNumber}>{inactiveVehicles}</Text>
        <Text style={styles.cardLabel}>Inactive</Text>
      </View>
*/}
      <View style={styles.actions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.buttonWrapper}>
          <Button
            title="View Inventory"
            onPress={() => navigation.navigate('Inventory')}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title="Add Vehicle"
            onPress={() => navigation.navigate('CreateVehicle')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  statsContainer: {
    gap: 12,
    marginBottom: 30,
  },

  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },

  cardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  cardLabel: {
    fontSize: 16,
    color: '#666',
  },

  actions: {
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },

  buttonWrapper: {
    marginBottom: 14,
  },
});
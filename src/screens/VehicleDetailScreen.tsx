import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
} from 'react-native';

import { getVehicleById } from '../services/vehicleService';

export default function VehicleDetailScreen({
  route,
  navigation,
}: any) {

  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useFocusEffect(
  useCallback(() => {
    loadVehicle();
  }, [vehicleId])
);

const loadVehicle = async () => {
  try {
    setLoading(true);

    const data = await getVehicleById(vehicleId);

    setVehicle(data);
  } catch (error: any) {
    setError(
      error.message || 'Unable to load vehicle.'
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <Text>Loading vehicle...</Text>;
  }

  if (error || !vehicle) {
    return <Text>{error || 'Vehicle not found.'}</Text>;
  }

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        {vehicle.year} {vehicle.make} {vehicle.model}
      </Text>

      <Text style={styles.price}>
        ${vehicle.askPrice?.toLocaleString()} CAD
      </Text>

      <Text>
        Mileage: {vehicle.mileage?.toLocaleString()} km
      </Text>

      <Text>
        VIN: {vehicle.vin || 'Not provided'}
      </Text>

      <Text>
        Status: {vehicle.status}
      </Text>

      <Text>
        Color: {vehicle.color || 'Not provided'}
      </Text>

      <Text>
        Body Type: {vehicle.bodyType || 'Not provided'}
      </Text>

      <Text>
        Drivetrain: {vehicle.drivetrain || 'Not provided'}
      </Text>

      <Button
        title="Edit Vehicle"
        onPress={() =>
          navigation.navigate('EditVehicle', {
            vehicleId: vehicle.id,
          })
        }
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    imagePlaceholder: {
        height: 220,
        borderRadius: 16,
        backgroundColor: '#e5e5e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageText: {
        fontSize: 18,
        color: '#666',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
    },
    section: {
        marginBottom: 18,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
    },
    description: {
        fontSize: 17,
        lineHeight: 24,
    },
});
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  getVehicleById,
  updateVehicle,
} from '../services/vehicleService';

export default function EditVehicleScreen({
  route,
  navigation,
}: any) {
  const { vehicleId } = route.params;

  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [askPrice, setAskPrice] = useState('');
  const [mileage, setMileage] = useState('');
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      setLoadError('');

      const vehicle = await getVehicleById(vehicleId);

      setYear(String(vehicle.year ?? ''));
      setMake(vehicle.make ?? '');
      setModel(vehicle.model ?? '');
      setAskPrice(String(vehicle.askPrice ?? ''));
      setMileage(String(vehicle.mileage ?? ''));
      setVin(vehicle.vin ?? '');
      setDescription(vehicle.description ?? '');
    } catch (error: any) {
      setLoadError(
        error.message || 'Unable to load vehicle.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!year.trim()) {
      newErrors.year = 'Year is required.';
    } else if (isNaN(Number(year))) {
      newErrors.year = 'Year must be a number.';
    }

    if (!make.trim()) {
      newErrors.make = 'Make is required.';
    }

    if (!model.trim()) {
      newErrors.model = 'Model is required.';
    }

    if (!askPrice.trim()) {
      newErrors.askPrice = 'Ask price is required.';
    } else if (
      isNaN(Number(askPrice)) ||
      Number(askPrice) <= 0
    ) {
      newErrors.askPrice =
        'Ask price must be greater than 0.';
    }

    if (
      mileage.trim() &&
      (
        isNaN(Number(mileage)) ||
        Number(mileage) < 0
      )
    ) {
      newErrors.mileage =
        'Mileage must be 0 or greater.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

const handleUpdate = async () => {
  if (!validateForm()) {
    return;
  }

  const updatedVehicle = {
    year: Number(year),
    make: make.trim(),
    model: model.trim(),
    askPrice: Number(askPrice),
    mileage: mileage.trim() ? Number(mileage) : 0,
    vin: vin.trim() || null,
    description: description.trim() || null,
  };

  try {
    setSaving(true);

    await updateVehicle(vehicleId, updatedVehicle);

    console.log('Vehicle updated successfully');

    navigation.goBack();
  } catch (error: any) {
    Alert.alert(
      'Update Failed',
      error.message || 'Unable to update the vehicle.'
    );
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading vehicle...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          {loadError}
        </Text>

        <Button
          title="Try Again"
          onPress={loadVehicle}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>
        Edit Vehicle
      </Text>

      <TextInput
        style={styles.input}
        placeholder="VIN"
        value={vin}
        onChangeText={setVin}
        autoCapitalize="characters"
      />

      <TextInput
        style={[
          styles.input,
          errors.year
            ? styles.inputError
            : null,
        ]}
        placeholder="Year"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      {errors.year ? (
        <Text style={styles.errorText}>
          {errors.year}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          errors.make
            ? styles.inputError
            : null,
        ]}
        placeholder="Make"
        value={make}
        onChangeText={setMake}
      />

      {errors.make ? (
        <Text style={styles.errorText}>
          {errors.make}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          errors.model
            ? styles.inputError
            : null,
        ]}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />

      {errors.model ? (
        <Text style={styles.errorText}>
          {errors.model}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          errors.askPrice
            ? styles.inputError
            : null,
        ]}
        placeholder="Ask Price"
        value={askPrice}
        onChangeText={setAskPrice}
        keyboardType="numeric"
      />

      {errors.askPrice ? (
        <Text style={styles.errorText}>
          {errors.askPrice}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          errors.mileage
            ? styles.inputError
            : null,
        ]}
        placeholder="Mileage"
        value={mileage}
        onChangeText={setMileage}
        keyboardType="numeric"
      />

      {errors.mileage ? (
        <Text style={styles.errorText}>
          {errors.mileage}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          styles.textArea,
        ]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button
        title={
          saving
            ? 'Updating...'
            : 'Update Vehicle'
        }
        onPress={handleUpdate}
        disabled={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  inputError: {
    borderColor: 'red',
  },

  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: -8,
    marginBottom: 10,
  },
});
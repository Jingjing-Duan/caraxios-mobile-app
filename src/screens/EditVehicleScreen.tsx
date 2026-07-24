import React, { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { vehicles } from '../mocks/vehicles';

export default function EditVehicleScreen() {
    const existingVehicle = vehicles[0];

    const [year, setYear] = useState(String(existingVehicle.year));
    const [make, setMake] = useState(existingVehicle.make);
    const [model, setModel] = useState(existingVehicle.model);
    const [askPrice, setAskPrice] = useState(String(existingVehicle.askPrice));
    const [mileage, setMileage] = useState(String(existingVehicle.mileage));
    const [vin, setVin] = useState(existingVehicle.vin ?? '');
    const [description, setDescription] = useState(existingVehicle.description ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        } else if (Number(askPrice) <= 0) {
            newErrors.askPrice = 'Ask price must be greater than 0.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
        };

const handleUpdate = () => {
  if (!validateForm()) {
    return;
  }

    const updatedVehicle = {
        ...existingVehicle,
        year: Number(year),
        make: make.trim(),
        model: model.trim(),
        askPrice: Number(askPrice),
        mileage: Number(mileage),
        vin: vin.trim(),
        description: description.trim(),
    };

    console.log('Vehicle updated:', updatedVehicle);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Vehicle</Text>

            <TextInput style={styles.input} placeholder="VIN" value={vin} onChangeText={setVin} />
            <TextInput
            style={[
                styles.input,
                errors.year ? styles.inputError : null,
            ]}
            placeholder="Year"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            />

            {errors.year && (
            <Text style={styles.errorText}>
                {errors.year}
            </Text>
            )}
            <TextInput
            style={[
                styles.input,
                errors.make ? styles.inputError : null,
            ]}
            placeholder="Make"
            value={make}
            onChangeText={setMake}
            />

            {errors.make && (
            <Text style={styles.errorText}>
                {errors.make}
            </Text>
            )}
            <TextInput
            style={[
                styles.input,
                errors.model ? styles.inputError : null,
            ]}
            placeholder="Model"
            value={model}
            onChangeText={setModel}
            />

            {errors.model && (
            <Text style={styles.errorText}>
                {errors.model}
            </Text>
            )}
            <TextInput
            style={[
                styles.input,
                errors.askPrice ? styles.inputError : null,
            ]}
            placeholder="Ask Price"
            value={askPrice}
            onChangeText={setAskPrice}
            keyboardType="numeric"
            />

            {errors.askPrice && (
            <Text style={styles.errorText}>
                {errors.askPrice}
            </Text>
            )}

            <TextInput style={styles.input} placeholder="Mileage" value={mileage} onChangeText={setMileage} keyboardType="numeric" />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <Button title="Update Vehicle" onPress={handleUpdate} />
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
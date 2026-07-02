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

    const handleUpdate = () => {
        const updatedVehicle = {
            ...existingVehicle,
            year: Number(year),
            make,
            model,
            askPrice: Number(askPrice),
            mileage: Number(mileage),
            vin,
            description,
        };

        console.log('Vehicle updated:', updatedVehicle);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Edit Vehicle</Text>

            <TextInput style={styles.input} placeholder="VIN" value={vin} onChangeText={setVin} />
            <TextInput style={styles.input} placeholder="Year" value={year} onChangeText={setYear} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Make" value={make} onChangeText={setMake} />
            <TextInput style={styles.input} placeholder="Model" value={model} onChangeText={setModel} />
            <TextInput style={styles.input} placeholder="Ask Price" value={askPrice} onChangeText={setAskPrice} keyboardType="numeric" />
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
});
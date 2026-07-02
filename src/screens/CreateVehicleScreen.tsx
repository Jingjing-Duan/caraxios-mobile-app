import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

export default function CreateVehicleScreen() {
    const [year, setYear] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [askPrice, setAskPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [vin, setVin] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        const vehicle = {
            year: Number(year),
            make,
            model,
            askPrice: Number(askPrice),
            mileage: Number(mileage),
            vin,
            description,
            status: 'available',
        };

        console.log('Vehicle to save:', vehicle);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add Vehicle</Text>

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

            <Button title="Save Vehicle" onPress={handleSave} />
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
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import InventoryListScreen from './src/screens/InventoryListScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import CreateVehicleScreen from './src/screens/CreateVehicleScreen';
import EditVehicleScreen from './src/screens/EditVehicleScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Dashboard">
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Inventory" component={InventoryListScreen} />
                <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
                <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} />
                <Stack.Screen name="EditVehicle" component={EditVehicleScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
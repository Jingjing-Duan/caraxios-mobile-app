import React from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';

import {
    NavigationContainer,
} from '@react-navigation/native';

import {
    createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
    createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from './src/screens/DashboardScreen';
import InventoryListScreen from './src/screens/InventoryListScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import CreateVehicleScreen from './src/screens/CreateVehicleScreen';
import EditVehicleScreen from './src/screens/EditVehicleScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Main bottom navigation
 *
 * These screens always display the bottom tab bar:
 * - Dashboard
 * - Inventory
 * - AI Assistant
 */
function MainTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
                headerShown: false,

                tabBarActiveTintColor: '#174EA6',
                tabBarInactiveTintColor: '#858A99',

                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    height: 76,
                    paddingTop: 8,
                    paddingBottom: 10,

                    backgroundColor: '#FFFFFF',

                    borderTopWidth: 1,
                    borderTopColor: '#E8EAF1',

                    elevation: 14,

                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                },

                tabBarItemStyle: {
                    paddingVertical: 2,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },

                tabBarIcon: ({
                    focused,
                    color,
                }) => {
                    let iconName:
                        keyof typeof Ionicons.glyphMap =
                        'grid-outline';

                    if (route.name === 'Dashboard') {
                        iconName = focused
                            ? 'grid'
                            : 'grid-outline';
                    }

                    if (route.name === 'Inventory') {
                        iconName = focused
                            ? 'car-sport'
                            : 'car-sport-outline';
                    }

                    if (route.name === 'AIAssistant') {
                        iconName = focused
                            ? 'sparkles'
                            : 'sparkles-outline';
                    }

                    return (
                        <View
                            style={[
                                styles.iconContainer,
                                focused &&
                                    styles.activeIconContainer,
                            ]}
                        >
                            <Ionicons
                                name={iconName}
                                size={22}
                                color={color}
                            />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: 'Dashboard',
                }}
            />

            <Tab.Screen
                name="Inventory"
                component={InventoryListScreen}
                options={{
                    title: 'Inventory',
                }}
            />

            <Tab.Screen
                name="AIAssistant"
                component={AIAssistantScreen}
                options={{
                    title: 'AI Assistant',
                }}
            />
        </Tab.Navigator>
    );
}

/**
 * Root navigation
 *
 * MainTabs:
 * - Dashboard
 * - Inventory
 * - AI Assistant
 *
 * Stack screens:
 * - Vehicle Detail
 * - Create Vehicle
 * - Edit Vehicle
 */
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="MainTabs"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: {
                        backgroundColor: '#F7F8FC',
                    },
                }}
            >
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                />

                <Stack.Screen
                    name="VehicleDetail"
                    component={VehicleDetailScreen}
                />

                <Stack.Screen
                    name="CreateVehicle"
                    component={CreateVehicleScreen}
                />

                <Stack.Screen
                    name="EditVehicle"
                    component={EditVehicleScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        width: 42,
        height: 30,

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 15,
    },

    activeIconContainer: {
        backgroundColor: '#E7EEFC',
    },
});
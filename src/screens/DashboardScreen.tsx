import React, { useCallback, useMemo, useState } from 'react';
import { getVehicleImageUrl } from '../utils/imageUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getVehicles } from '../services/vehicleService';

type VehicleImage = {
  id?: string;
  url?: string;
  imageUrl?: string;
  image_url?: string;
  uri?: string;
  isPrimary?: boolean;
  is_primary?: boolean;
  displayOrder?: number;
  display_order?: number;
};

type Vehicle = {
  id?: number;
  vehicle_id?: number;

  year?: number | string;
  make?: string;
  model?: string;
  trim?: string;
  vin?: string;

  price?: number | string;
  askPrice?: number | string;
  ask_price?: number | string;

  status?: string;

  image_url?: string;
  primary_image_url?: string;

  primaryImage?: VehicleImage;
  primary_image?: VehicleImage;

  images?: Array<string | VehicleImage>;

  createdAt?: string;
  created_at?: string;
};

const COLORS = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  primary: '#0040A1',
  primaryContainer: '#0056D2',
  primarySoft: '#DAE2FF',
  secondary: '#505F76',
  secondaryContainer: '#D0E1FB',
  text: '#191B23',
  textMuted: '#5F636F',
  border: '#E1E2EC',
  softSurface: '#F2F3FE',
  soldSurface: '#E7E7F2',
};

export default function DashboardScreen({ navigation }: any) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadVehicles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage('');

      const data = await getVehicles();
      const vehicleList = Array.isArray(data) ? data : data.items ?? [];

      setVehicles(vehicleList);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setErrorMessage('Unable to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * Reload the dashboard whenever the user returns to this screen.
   * This keeps the counts updated after creating or editing a vehicle.
   */
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  const totalVehicles = vehicles.length;

  const availableVehicles = vehicles.filter(
    vehicle => vehicle.status?.toLowerCase() === 'available'
  ).length;

  const soldVehicles = vehicles.filter(
    vehicle => vehicle.status?.toLowerCase() === 'sold'
  ).length;

  const recentlyAddedVehicles = useMemo(() => {
    return [...vehicles]
      .sort((firstVehicle, secondVehicle) => {
        const firstCreatedAt =
          firstVehicle.createdAt ??
          firstVehicle.created_at;

        const secondCreatedAt =
          secondVehicle.createdAt ??
          secondVehicle.created_at;

        if (firstCreatedAt && secondCreatedAt) {
          return (
            new Date(secondCreatedAt).getTime() -
            new Date(firstCreatedAt).getTime()
          );
        }

        const firstId =
          firstVehicle.id ?? firstVehicle.vehicle_id ?? 0;
        const secondId =
          secondVehicle.id ?? secondVehicle.vehicle_id ?? 0;

        return secondId - firstId;
      })
      .slice(0, 5);
  }, [vehicles]);

  const getVehicleId = (vehicle: Vehicle) =>
    vehicle.id ?? vehicle.vehicle_id;

  const getVehicleTitle = (vehicle: Vehicle) => {
    return [
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim,
    ]
      .filter(Boolean)
      .join(' ');
  };



  const formatPrice = (price?: number | string) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return 'Price unavailable';
    }

    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  const formatVin = (vin?: string) => {
    if (!vin) {
      return 'VIN unavailable';
    }

    if (vin.length <= 9) {
      return vin;
    }

    return `${vin.slice(0, 5)}...${vin.slice(-4)}`;
  };

  const openInventory = (statusFilter: string) => {
    navigation.navigate('Inventory', {
      statusFilter,
    });
  };

  const openVehicleDetails = (vehicle: Vehicle) => {
    const vehicleId = getVehicleId(vehicle);

    if (!vehicleId) {
      return;
    }

    navigation.navigate('VehicleDetail', {
      vehicleId,
    });
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
  <SafeAreaView
    style={styles.screen}
    edges={['top']}
  >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="car-sport"
                size={23}
                color={COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.brandName}>CarAxios</Text>
              <Text style={styles.headerSubtitle}>
                Inventory Dashboard
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.textMuted}
            />
          </Pressable>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#BA1A1A"
            />

            <Text style={styles.errorText}>{errorMessage}</Text>

            <Pressable onPress={() => loadVehicles(true)}>
              <Text style={styles.retryText}>
                {refreshing ? 'Loading...' : 'Retry'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard
            label="Total Inventory"
            value={totalVehicles}
            description="All dealership vehicles"
            icon="analytics-outline"
            iconColor="#0B4DB3"
            onPress={() => openInventory('all')}
          />

          <StatCard
            label="Available Vehicles"
            value={availableVehicles}
            description="Ready for sale"
            icon="checkmark-circle-outline"
            iconColor="#6d977b"
            onPress={() => openInventory('available')}
          />

          <StatCard
            label="Sold Vehicles"
            value={soldVehicles}
            description="Completed vehicle sales"
            icon="pricetag-outline"
            iconColor="#596273"
            onPress={() => openInventory('sold')}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickActionsContainer}>
            <QuickAction
              label="Scan VIN"
              icon="scan-outline"
              backgroundColor={COLORS.secondaryContainer}
              textColor="#38485D"
              onPress={() =>
                navigation.navigate('CreateVehicle', {
                  focusVin: true,
                })
              }
            />

            <QuickAction
              label="Add Vehicle"
              icon="add-circle-outline"
              backgroundColor={COLORS.primaryContainer}
              textColor="#FFFFFF"
              onPress={() => navigation.navigate('CreateVehicle')}
            />

            <QuickAction
              label="AI Assistant"
              icon="sparkles-outline"
              backgroundColor={COLORS.soldSurface}
              textColor={COLORS.textMuted}
              onPress={() => navigation.navigate('AIAssistant')}
            />
          </View>
        </View>

        {/* Recently Added */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Added</Text>

            <Pressable onPress={() => openInventory('all')}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          </View>

          {recentlyAddedVehicles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="car-outline"
                size={38}
                color={COLORS.textMuted}
              />

              <Text style={styles.emptyTitle}>
                No vehicles added yet
              </Text>

              <Text style={styles.emptyDescription}>
                Add your first vehicle to start building the inventory.
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => navigation.navigate('CreateVehicle')}
              >
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Vehicle</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {recentlyAddedVehicles.map((vehicle, index) => {
                const vehicleId = getVehicleId(vehicle);
                const imageUri = getVehicleImageUrl(vehicle);
                const status =
                  vehicle.status?.toLowerCase() ?? 'unknown';

                return (
                  <Pressable
                    key={vehicleId ?? `vehicle-${index}`}
                    style={({ pressed }) => [
                      styles.vehicleCard,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => openVehicleDetails(vehicle)}
                  >
                    <View style={styles.vehicleImageContainer}>
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.vehicleImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.vehicleImagePlaceholder}>
                          <Ionicons
                            name="car-sport-outline"
                            size={48}
                            color={COLORS.textMuted}
                          />

                          <Text style={styles.placeholderText}>
                            No image
                          </Text>
                        </View>
                      )}

                      <View
                        style={[
                          styles.statusBadge,
                          status === 'available' &&
                            styles.availableBadge,
                          status === 'sold' && styles.soldBadge,
                          status === 'draft' && styles.draftBadge,
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>
                          {status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vehicleCardContent}>
                      <Text
                        style={styles.vehicleTitle}
                        numberOfLines={1}
                      >
                        {getVehicleTitle(vehicle) ||
                          'Unnamed Vehicle'}
                      </Text>

                      <View style={styles.vehicleDetailsRow}>
                        <Text
                          style={styles.vehicleVin}
                          numberOfLines={1}
                        >
                          VIN: {formatVin(vehicle.vin)}
                        </Text>

                        <Text style={styles.vehiclePrice}>
                          {formatPrice(
                            vehicle.askPrice ??
                            vehicle.ask_price ??
                            vehicle.price
                          )}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
};

function StatCard({
  label,
  value,
  description,
  icon,
  iconColor,
  onPress,
}: StatCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.statCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.statCardHeader}>
        <Text style={styles.statLabel}>{label}</Text>

        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={23} color={iconColor} />
        </View>
      </View>

      <View>
        <Text style={[styles.statNumber, { color: iconColor }]}>
          {value}
        </Text>

        <Text style={styles.statDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

type QuickActionProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  textColor: string;
  onPress: () => void;
};

function QuickAction({
  label,
  icon,
  backgroundColor,
  textColor,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.quickAction,
        { backgroundColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={28} color={textColor} />
      <Text style={[styles.quickActionText, { color: textColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textMuted,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primarySoft,
    borderWidth: 2,
    borderColor: '#B2C5FF',
  },

  brandName: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.primary,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softSurface,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 14,
    marginBottom: 18,
    borderRadius: 14,
    backgroundColor: '#FFDAD6',
  },

  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#93000A',
  },

  retryText: {
    fontWeight: '700',
    color: '#93000A',
  },

  statsContainer: {
    gap: 14,
  },

  statCard: {
    height: 150,
    padding: 22,
    borderRadius: 24,
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: '#F0F0F5',

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },

  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  statIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softSurface,
  },

  statNumber: {
    fontSize: 34,
    fontWeight: '700',
  },

  statDescription: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionTitle: {
    marginBottom: 15,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },

  viewAllText: {
    marginBottom: 15,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  quickAction: {
    flex: 1,
    minHeight: 105,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 8,
    borderRadius: 20,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  quickActionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },

  recentList: {
    gap: 16,
    paddingRight: 20,
  },

  vehicleCard: {
    width: 282,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  vehicleImageContainer: {
    height: 172,
    backgroundColor: COLORS.softSurface,
  },

  vehicleImage: {
    width: '100%',
    height: '100%',
  },

  vehicleImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  placeholderText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.soldSurface,
  },

  availableBadge: {
    backgroundColor: '#D8F3DC',
  },

  soldBadge: {
    backgroundColor: '#E1E2EC',
  },

  draftBadge: {
    backgroundColor: '#FFF0C2',
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },

  vehicleCardContent: {
    padding: 16,
  },

  vehicleTitle: {
    marginBottom: 8,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },

  vehicleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  vehicleVin: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  vehiclePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyContainer: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
  },

  emptyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
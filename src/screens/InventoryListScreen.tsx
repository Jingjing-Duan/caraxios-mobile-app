import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getVehicleImageUrl } from '../utils/imageUtils';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getVehicles } from '../services/vehicleService';

type VehicleImage = {
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

  colour?: string;
  color?: string;

  interior_colour?: string;
  interior_color?: string;

  vin?: string;

  price?: number | string;
  askPrice?: number | string;

  mileage?: number | string;

  status?: string;

  image_url?: string;
  primary_image_url?: string;

  primaryImage?: {
    url?: string;
    isPrimary?: boolean;
  };

  primary_image?: {
    url?: string;
    isPrimary?: boolean;
  };

  images?: Array<string | VehicleImage>;
};

const COLORS = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  primary: '#0040A1',
  primaryContainer: '#0056D2',
  primarySoft: '#DAE2FF',
  secondaryContainer: '#D0E1FB',
  text: '#191B23',
  textMuted: '#424654',
  outline: '#737785',
  outlineVariant: '#C3C6D6',
  surfaceLow: '#F2F3FE',
  soldBackground: '#E7E7F2',
  availableBackground: '#D8F3DC',
  availableText: '#18794E',
  draftBackground: '#E7E7F2',
  draftText: '#5F636F',
  inactiveBackground: '#FFE5D9',
  inactiveText: '#9C3D10',
};

export default function InventoryListScreen({
  navigation,
  route,
}: any) {
  const [searchText, setSearchText] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusFilter =
    route.params?.statusFilter?.toLowerCase() ?? 'all';


  const aiVehicles = route.params?.aiVehicles as Vehicle[] | undefined;
  const sourceVehicles = aiVehicles ?? vehicles;  
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getVehicles();

      console.log('Vehicles from backend:', data);

      const vehicleList = Array.isArray(data)
        ? data
        : data.items ?? [];

      setVehicles(vehicleList);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  useEffect(() => {
    if (aiVehicles) {
      navigation.setOptions({
        title: 'Search Results',
      });

      return;
    }

    let title = 'All Inventory';

    if (statusFilter === 'available') {
      title = 'Available Vehicles';
    } else if (statusFilter === 'sold') {
      title = 'Sold Vehicles';
    } else if (statusFilter === 'draft') {
      title = 'Draft Vehicles';
    } else if (statusFilter === 'inactive') {
      title = 'Inactive Vehicles';
    }

    navigation.setOptions({ title });
  }, [navigation, statusFilter, aiVehicles]);

  const filteredVehicles = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return sourceVehicles.filter(vehicle => {
      const searchableText = [
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
        vehicle.vin,
        vehicle.colour,
        vehicle.color,
      ]
        .filter(value => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        keyword.length === 0 ||
        searchableText.includes(keyword);

      const vehicleStatus =
        vehicle.status?.toLowerCase() ?? '';

      const matchesStatus =
        statusFilter === 'all' ||
        vehicleStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sourceVehicles, searchText, statusFilter]);

  const getVehicleId = (vehicle: Vehicle) => {
    return vehicle.id ?? vehicle.vehicle_id;
  };

  const getVehicleTitle = (vehicle: Vehicle) => {
    return [vehicle.year, vehicle.make, vehicle.model]
      .filter(Boolean)
      .join(' ');
  };

  const getVehicleSubtitle = (vehicle: Vehicle) => {
    const colour =
      vehicle.colour ??
      vehicle.color ??
      vehicle.interior_colour ??
      vehicle.interior_color;

    return [vehicle.trim, colour]
      .filter(Boolean)
      .join(' • ');
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

  const formatMileage = (mileage?: number | string) => {
    const numericMileage = Number(mileage);

    if (!Number.isFinite(numericMileage)) {
      return null;
    }

    return `${new Intl.NumberFormat('en-CA').format(
      numericMileage
    )} km`;
  };

  const openVehicleDetail = (vehicle: Vehicle) => {
    const vehicleId = getVehicleId(vehicle);

    if (!vehicleId) {
      console.warn('Vehicle ID is missing:', vehicle);
      return;
    }

    navigation.navigate('VehicleDetail', {
      vehicleId,
    });
  };

    const renderVehicle = ({ item }: { item: Vehicle }) => {
    const imageUri = getVehicleImageUrl(item);
    const status = item.status?.toLowerCase() ?? 'unknown';
    const mileage = formatMileage(item.mileage);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.vehicleCard,
          pressed && styles.cardPressed,
        ]}
        onPress={() => openVehicleDetail(item)}
      >
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.vehicleImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="car-sport-outline"
                size={58}
                color={COLORS.outline}
              />

              <Text style={styles.imagePlaceholderText}>
                No vehicle image
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
              status === 'inactive' &&
                styles.inactiveBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                status === 'available' &&
                  styles.availableStatusText,
                status === 'sold' &&
                  styles.soldStatusText,
                status === 'draft' &&
                  styles.draftStatusText,
                status === 'inactive' &&
                  styles.inactiveStatusText,
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <View style={styles.vehicleNameContainer}>
              <Text
                style={styles.vehicleTitle}
                numberOfLines={1}
              >
                {getVehicleTitle(item) || 'Unnamed Vehicle'}
              </Text>

              {getVehicleSubtitle(item) ? (
                <Text
                  style={styles.vehicleSubtitle}
                  numberOfLines={1}
                >
                  {getVehicleSubtitle(item)}
                </Text>
              ) : null}
            </View>

            <Text style={styles.vehiclePrice}>
              {formatPrice(item.askPrice ?? item.price)}
            </Text>
          </View>

          <View style={styles.cardBottomRow}>
            <View style={styles.vehicleMeta}>
              {mileage ? (
                <>
                  <Ionicons
                    name="speedometer-outline"
                    size={16}
                    color={COLORS.textMuted}
                  />

                  <Text style={styles.metaText}>
                    {mileage}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="barcode-outline"
                    size={16}
                    color={COLORS.textMuted}
                  />

                  <Text
                    style={styles.metaText}
                    numberOfLines={1}
                  >
                    {item.vin
                      ? `VIN: ${item.vin}`
                      : 'VIN unavailable'}
                  </Text>
                </>
              )}
            </View>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={COLORS.outline}
            />
          </View>
        </View>
      </Pressable>
    );
  };

if (loading && !aiVehicles) {
      return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading vehicles...
        </Text>
      </View>
    );
  }

 if (error && !aiVehicles) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color="#BA1A1A"
        />

        <Text style={styles.errorText}>{error}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={loadVehicles}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <FlatList
          data={filteredVehicles}
          keyExtractor={(item, index) =>
            String(getVehicleId(item) ?? `vehicle-${index}`)
          }
          renderItem={renderVehicle}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            filteredVehicles.length === 0 &&
              styles.emptyListContent,
          ]}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search-outline"
                    size={21}
                    color={COLORS.outline}
                  />

                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search inventory"
                    placeholderTextColor="#9A9DA8"
                    value={searchText}
                    onChangeText={setSearchText}
                    returnKeyType="search"
                  />

                  {searchText.length > 0 ? (
                    <Pressable
                      style={styles.clearButton}
                      onPress={() => setSearchText('')}
                    >
                      <Ionicons
                        name="close-circle"
                        size={21}
                        color={COLORS.outline}
                      />
                    </Pressable>
                  ) : null}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.filterButton,
                    statusFilter !== 'all' &&
                      styles.filterButtonActive,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() =>
                    navigation.navigate('Inventory', {
                      statusFilter: 'all',
                    })
                  }
                >
                  <Ionicons
                    name="options-outline"
                    size={23}
                    color={
                      statusFilter !== 'all'
                        ? '#FFFFFF'
                        : COLORS.primary
                    }
                  />
                </Pressable>
              </View>

              <View style={styles.resultSummary}>
                <Text style={styles.resultCount}>
                  {filteredVehicles.length}{' '}
                  {filteredVehicles.length === 1
                    ? 'vehicle'
                    : 'vehicles'}
                </Text>

                {statusFilter !== 'all' ? (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>
                      {statusFilter}
                    </Text>

                    <Pressable
                      onPress={() =>
                        navigation.navigate('Inventory', {
                          statusFilter: 'all',
                        })
                      }
                    >
                      <Ionicons
                        name="close"
                        size={15}
                        color={COLORS.primary}
                      />
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="car-outline"
                  size={48}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No vehicles found
              </Text>

              <Text style={styles.emptyDescription}>
                Try changing your search or inventory filter.
              </Text>

              {searchText.length > 0 ||
              statusFilter !== 'all' ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.resetButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setSearchText('');

                    navigation.navigate('Inventory', {
                      statusFilter: 'all',
                    });
                  }}
                >
                  <Text style={styles.resetButtonText}>
                    Reset Filters
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
        />

        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={() =>
            navigation.navigate('CreateVehicle')
          }
        >
          <Ionicons name="add" size={31} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textMuted,
  },

  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#93000A',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 110,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  headerContent: {
    marginBottom: 18,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchContainer: {
    flex: 1,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: COLORS.surface,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    outlineStyle: 'none',
  } as any,

  clearButton: {
    padding: 4,
  },

  filterButton: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primaryContainer,
  },

  resultSummary: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  resultCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },

  activeFilterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },

  vehicleCard: {
    marginBottom: 18,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: COLORS.surface,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: COLORS.surfaceLow,
  },

  vehicleImage: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  imagePlaceholderText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.soldBackground,
  },

  availableBadge: {
    backgroundColor: COLORS.availableBackground,
  },

  soldBadge: {
    backgroundColor: COLORS.soldBackground,
  },

  draftBadge: {
    backgroundColor: COLORS.draftBackground,
  },

  inactiveBadge: {
    backgroundColor: COLORS.inactiveBackground,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },

  availableStatusText: {
    color: COLORS.availableText,
  },

  soldStatusText: {
    color: COLORS.textMuted,
  },

  draftStatusText: {
    color: COLORS.draftText,
  },

  inactiveStatusText: {
    color: COLORS.inactiveText,
  },

  cardContent: {
    padding: 20,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },

  vehicleNameContainer: {
    flex: 1,
  },

  vehicleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  vehicleSubtitle: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  vehiclePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F5',
  },

  vehicleMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  metaText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 43,
    backgroundColor: COLORS.primarySoft,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  emptyDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textMuted,
  },

  resetButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
  },

  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  addButton: {
    position: 'absolute',
    right: 22,
    bottom: 24,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,

    shadowColor: '#0040A1',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },

  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },

  buttonPressed: {
    opacity: 0.75,
  },
});
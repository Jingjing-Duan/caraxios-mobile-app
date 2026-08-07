import React, {
  useCallback,
  useRef,
  useState,
} from 'react';

import { normalizeImageUrl } from '../utils/imageUtils';

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getVehicleById, getVehicleImages, } from '../services/vehicleService';

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
  askPrice?: number | string;
  ask_price?: number | string;
  price?: number | string;
  originalPrice?: number | string;
  original_price?: number | string;
  mileage?: number | string;
  vin?: string;
  status?: string;
  color?: string;
  colour?: string;
  exteriorColor?: string;
  exterior_color?: string;
  interiorColor?: string;
  interior_color?: string;
  bodyType?: string;
  body_type?: string;
  engineInfo?: string;
  engine_info?: string;
  engine?: string;
  engine_type?: string;
  transmission?: string;
  transmissionInfo?: string;
  transmission_info?: string;
  drivetrain?: string;
  driveTrain?: string;
  drive_train?: string;
  image_url?: string;
  primary_image_url?: string;
  images?: Array<string | VehicleImage>;
};

const SCREEN_WIDTH = Dimensions.get('window').width;

const COLORS = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  primary: '#0040A1',
  primaryContainer: '#0056D2',
  primarySoft: '#DAE2FF',
  text: '#191B23',
  textMuted: '#424654',
  outline: '#737785',
  border: '#C3C6D6',
  softSurface: '#F2F3FE',
  error: '#BA1A1A',
  availableBackground: '#D8F3DC',
  availableText: '#18794E',
  soldBackground: '#E7E7F2',
  soldText: '#5F636F',
  draftBackground: '#FFF0C2',
  draftText: '#8A5A00',
  inactiveBackground: '#FFE5D9',
  inactiveText: '#9C3D10',
};

export default function VehicleDetailScreen({
  route,
  navigation,
}: any) {
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavourite, setIsFavourite] = useState(false);
  const [vehicleImages, setVehicleImages] =
    useState<VehicleImage[]>([]);
  const galleryRef = useRef<FlatList<string>>(null);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      setError('');

      const [vehicleData, imageData] = await Promise.all([
        getVehicleById(vehicleId),
        getVehicleImages(vehicleId),
      ]);

      console.log('Vehicle detail:', vehicleData);
      console.log('Vehicle images:', imageData);

      setVehicle(
        vehicleData.item ??
        vehicleData.vehicle ??
        vehicleData
      );

      const images =
        imageData.items ??
        imageData.images ??
        imageData;

      setVehicleImages(
        Array.isArray(images) ? images : []
      );

      setActiveImageIndex(0);
    } catch (error: any) {
      setError(
        error.message || 'Unable to load vehicle.'
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicle();
    }, [vehicleId])
  );

  const getVehicleId = () => {
    return vehicle?.id ?? vehicle?.vehicle_id ?? vehicleId;
  };

  const buildImageUrls = () => {
  return [...vehicleImages]
    .sort(
      (a, b) =>
        (a.displayOrder ?? a.display_order ?? 0) -
        (b.displayOrder ?? b.display_order ?? 0)
    )
    .map(image => {
      const rawUrl =
        typeof image === 'string'
          ? image
          : image.url ??
            image.imageUrl ??
            image.image_url;

      return normalizeImageUrl(rawUrl);
    })
    .filter((url): url is string => Boolean(url));
  };

  const getPrice = () => {
    return (
      vehicle?.askPrice ??
      vehicle?.ask_price ??
      vehicle?.price
    );
  };

  const getOriginalPrice = () => {
    return (
      vehicle?.originalPrice ??
      vehicle?.original_price
    );
  };

  const getExteriorColor = () => {
    return (
      vehicle?.exteriorColor ??
      vehicle?.exterior_color ??
      vehicle?.color ??
      vehicle?.colour
    );
  };

  const getInteriorColor = () => {
    return (
      vehicle?.interiorColor ??
      vehicle?.interior_color
    );
  };

  const getBodyType = () => {
    return vehicle?.bodyType ?? vehicle?.body_type;
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
      return 'Not provided';
    }

    return `${new Intl.NumberFormat('en-CA').format(
      numericMileage
    )} km`;
  };

  const formatVin = (vin?: string) => {
    if (!vin) {
      return 'Not provided';
    }

    if (vin.length <= 8) {
      return vin;
    }

    return `...${vin.slice(-8)}`;
  };

  const handleImageScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );

    setActiveImageIndex(index);
  };

  const handleShare = async () => {
    if (!vehicle) {
      return;
    }

    const title = [
      vehicle.year,
      vehicle.make,
      vehicle.model,
      vehicle.trim,
    ]
      .filter(Boolean)
      .join(' ');

    try {
      await Share.share({
        message: `${title}\n${formatPrice(
          getPrice()
        )}\nVIN: ${vehicle.vin ?? 'Not provided'}`,
      });
    } catch (error) {
      console.error('Unable to share vehicle:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Vehicle',
      'Delete is not connected to the backend yet.',
      [
        {
          text: 'OK',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading vehicle...
        </Text>
      </View>
    );
  }

  if (error || !vehicle) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.error}
        />

        <Text style={styles.errorText}>
          {error || 'Vehicle not found.'}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.pressed,
          ]}
          onPress={loadVehicle}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  const images = buildImageUrls();

  const status =
    vehicle.status?.toLowerCase() ?? 'unknown';

  const vehicleTitle = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.trim,
  ]
    .filter(Boolean)
    .join(' ');

  const categoryText = [
    getBodyType(),
    vehicle.drivetrain,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textMuted}
              />
            </Pressable>

            <Text style={styles.brandName}>CarAxios</Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-social-outline"
                size={23}
                color={COLORS.textMuted}
              />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                setIsFavourite(current => !current)
              }
            >
              <Ionicons
                name={
                  isFavourite
                    ? 'heart'
                    : 'heart-outline'
                }
                size={24}
                color={
                  isFavourite
                    ? COLORS.error
                    : COLORS.textMuted
                }
              />
            </Pressable>
          </View>
        </View>

        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          {images.length > 0 ? (
            <FlatList
              ref={galleryRef}
              data={images}
              keyExtractor={(item, index) =>
                `${item}-${index}`
              }
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.galleryImage}
                  resizeMode="contain"
                />
              )}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="car-sport-outline"
                size={70}
                color={COLORS.outline}
              />

              <Text style={styles.imagePlaceholderText}>
                No vehicle images
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

          {images.length > 1 ? (
            <View style={styles.indicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={`indicator-${index}`}
                  style={[
                    styles.imageIndicator,
                    index === activeImageIndex &&
                    styles.activeImageIndicator,
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        {/* Vehicle Identity */}
        <View style={styles.identitySection}>
          {categoryText ? (
            <Text style={styles.categoryText}>
              {categoryText}
            </Text>
          ) : null}

          <Text style={styles.vehicleTitle}>
            {vehicleTitle || 'Unnamed Vehicle'}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatPrice(getPrice())}
            </Text>

            {getOriginalPrice() ? (
              <Text style={styles.originalPrice}>
                {formatPrice(getOriginalPrice())}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Key Specifications */}
        <View style={styles.specificationSection}>
          <Text style={styles.sectionTitle}>
            Key Specifications
          </Text>

          <View style={styles.specGrid}>
            <SpecificationCard
              label="Mileage"
              value={formatMileage(vehicle.mileage)}
              icon="speedometer-outline"
            />

            <SpecificationCard
              label="Engine"
              value={
                  vehicle.engineInfo ??
                  vehicle.engine_info ??
                  vehicle.engine ??
                  'Not provided'
                }
              icon="settings-outline"
            />

            <SpecificationCard
              label="Transmission"
              value={
                vehicle.transmission ??
                vehicle.transmissionInfo ??
                vehicle.transmission_info ??
                'Not provided'
              }
              icon="git-compare-outline"
            />

            <SpecificationCard
              label="Ext. Color"
              value={
                getExteriorColor() || 'Not provided'
              }
              icon="color-palette-outline"
            />

            <SpecificationCard
              label="Int. Color"
              value={
                getInteriorColor() || 'Not provided'
              }
              icon="color-fill-outline"
            />

            <SpecificationCard
              label="VIN"
              value={formatVin(vehicle.vin)}
              icon="finger-print-outline"
            />

            <SpecificationCard
              label="Body Type"
              value={getBodyType() || 'Not provided'}
              icon="car-outline"
            />

            <SpecificationCard
              label="Drivetrain"
              value={
                vehicle.drivetrain ??
                vehicle.driveTrain ??
                vehicle.drive_train ??
                'Not provided'
              }
              icon="cog-outline"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.editButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            navigation.navigate('EditVehicle', {
              vehicleId: getVehicleId(),
            })
          }
        >
          <Ionicons
            name="create"
            size={21}
            color="#FFFFFF"
          />

          <Text style={styles.editButtonText}>
            Edit Vehicle
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDelete}
        >
          <Ionicons
            name="trash-outline"
            size={23}
            color={COLORS.error}
          />
        </Pressable>
      </View>
    </View>
  );
}

type SpecificationCardProps = {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

function SpecificationCard({
  label,
  value,
  icon,
}: SpecificationCardProps) {
  return (
    <View style={styles.specCard}>
      <Text style={styles.specLabel}>{label}</Text>

      <View style={styles.specValueRow}>
        <Ionicons
          name={icon}
          size={20}
          color={COLORS.primary}
        />

        <Text
          style={styles.specValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 110,
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
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.error,
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

  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECF4',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  brandName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  galleryContainer: {
    position: 'relative',
    width: '100%',
    height: 310,
    backgroundColor: COLORS.softSurface,
  },

  galleryImage: {
    width: SCREEN_WIDTH,
    height: 310,
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  imagePlaceholderText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },

  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 14,
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
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },

  availableStatusText: {
    color: COLORS.availableText,
  },

  soldStatusText: {
    color: COLORS.soldText,
  },

  draftStatusText: {
    color: COLORS.draftText,
  },

  inactiveStatusText: {
    color: COLORS.inactiveText,
  },

  indicatorContainer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },

  imageIndicator: {
    width: 7,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  activeImageIndicator: {
    width: 28,
    backgroundColor: '#FFFFFF',
  },

  identitySection: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },

  vehicleTitle: {
    marginTop: 7,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    color: COLORS.text,
  },

  priceRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },

  price: {
    fontSize: 29,
    fontWeight: '700',
    color: COLORS.primary,
  },

  originalPrice: {
    fontSize: 15,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  specificationSection: {
    paddingHorizontal: 20,
    marginTop: 34,
  },

  sectionTitle: {
    marginBottom: 18,
    fontSize: 21,
    fontWeight: '600',
    color: COLORS.text,
  },

  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },

  specCard: {
    width: '48%',
    minHeight: 112,
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.softSurface,
  },

  specLabel: {
    marginBottom: 9,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  specValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  specValue: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.text,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,

    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },

  editButton: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,
  },

  editButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  deleteButton: {
    width: 58,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F2C6C6',
    backgroundColor: '#FFF8F7',
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
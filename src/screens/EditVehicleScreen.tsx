import React, {
  useEffect,
  useState,
} from 'react';

import { normalizeImageUrl } from '../utils/imageUtils';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardTypeOptions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';

import {
  getVehicleById,
  getVehicleImages,
  updateVehicle,
  uploadVehicleImages,
  deleteVehicleImage,
  reorderVehicleImages,
} from '../services/vehicleService';

type VehicleImage = {
  id?: string | number;
  uri: string;
  isPrimary: boolean;
  isLocal: boolean;
  fileName?: string;
  mimeType?: string;
};

type FormErrors = Record<string, string>;

const COLORS = {
  background: '#FAF8FF',
  surface: '#FFFFFF',
  surfaceLow: '#F2F3FE',
  primary: '#0040A1',
  primaryContainer: '#0056D2',
  primarySoft: '#DAE2FF',
  text: '#191B23',
  textMuted: '#424654',
  outline: '#737785',
  border: '#C3C6D6',
  error: '#BA1A1A',
  errorSoft: '#FFDAD6',
  success: '#18794E',
};

export default function EditVehicleScreen({
  route,
  navigation,
}: any) {
  const { vehicleId } = route.params;

  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [engine, setEngine] = useState('');

  const [askPrice, setAskPrice] =
    useState('');

  const [mileage, setMileage] =
    useState('');

  const [vin, setVin] = useState('');

  const [
    exteriorColor,
    setExteriorColor,
  ] = useState('');

  const [
    interiorColor,
    setInteriorColor,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [status, setStatus] =
    useState('available');

  const [images, setImages] = useState<
    VehicleImage[]
  >([]);

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [loadError, setLoadError] =
    useState('');

  useEffect(() => {
    loadVehicle();
  }, [vehicleId]);

const normalizeImages = (
  vehicle: any
): VehicleImage[] => {
  const normalizedImages: VehicleImage[] = [];

  const sourceImages =
    vehicle.images ??
    vehicle.vehicle_images ??
    [];

  if (Array.isArray(sourceImages)) {
    sourceImages.forEach(
      (image: any, index: number) => {
        const rawUri =
          typeof image === 'string'
            ? image
            : image.url ??
              image.uri ??
              image.image_url ??
              image.imageUrl;

        const uri = normalizeImageUrl(rawUri);

        if (!uri) {
          return;
        }

        normalizedImages.push({
          uri,
          id:
            typeof image === 'object'
              ? image.id
              : undefined,
          isPrimary:
            typeof image === 'object'
              ? Boolean(
                  image.isPrimary ??
                    image.is_primary ??
                    image.primary
                )
              : index === 0,
          isLocal: false,
        });
      }
    );
  }

  const primaryImageUrl =
    vehicle.primary_image_url ??
    vehicle.primaryImageUrl ??
    vehicle.image_url ??
    vehicle.imageUrl;

  const normalizedPrimaryImageUrl =
    normalizeImageUrl(primaryImageUrl);

  if (
    normalizedPrimaryImageUrl &&
    !normalizedImages.some(
      image =>
        image.uri === normalizedPrimaryImageUrl
    )
  ) {
    normalizedImages.unshift({
      uri: normalizedPrimaryImageUrl,
      isPrimary: true,
      isLocal: false,
    });
  }

  if (
    normalizedImages.length > 0 &&
    !normalizedImages.some(
      image => image.isPrimary
    )
  ) {
    normalizedImages[0] = {
      ...normalizedImages[0],
      isPrimary: true,
    };
  }

  return normalizedImages;
};

const loadVehicle = async () => {
  try {
    setLoading(true);
    setLoadError('');

    const [vehicleResponse, imageResponse] =
      await Promise.all([
        getVehicleById(vehicleId),
        getVehicleImages(vehicleId),
      ]);

    const vehicle =
      vehicleResponse.item ??
      vehicleResponse.vehicle ??
      vehicleResponse;

    const imageList =
      imageResponse.items ??
      imageResponse.images ??
      imageResponse;

    console.log(
      'Vehicle loaded for editing:',
      vehicle
    );

    console.log(
      'Vehicle images loaded for editing:',
      imageList
    );

    setYear(String(vehicle.year ?? ''));
    setMake(vehicle.make ?? '');
    setModel(vehicle.model ?? '');
    setTrim(vehicle.trim ?? '');

    setBodyType(
      vehicle.bodyType ??
        vehicle.body_type ??
        ''
    );

    setEngine(
      vehicle.engineInfo ??
      vehicle.engine_info ??
      vehicle.engine ??
      vehicle.engine_type ??
      ''
    );

    setAskPrice(
      String(
        vehicle.askPrice ??
          vehicle.ask_price ??
          vehicle.price ??
          ''
      )
    );

    setMileage(
      vehicle.mileage === null ||
        vehicle.mileage === undefined
        ? ''
        : String(vehicle.mileage)
    );

    setVin(vehicle.vin ?? '');

    setExteriorColor(
      vehicle.exteriorColor ??
        vehicle.exterior_color ??
        vehicle.color ??
        ''
    );

    setInteriorColor(
      vehicle.interiorColor ??
        vehicle.interior_color ??
        ''
    );

    setDescription(
      vehicle.description ?? ''
    );

    setStatus(
      vehicle.status ?? 'available'
    );

    setImages(
      normalizeImages({
        ...vehicle,
        images: Array.isArray(imageList)
          ? imageList
          : [],
      })
    );
  } catch (error: any) {
    console.error(
      'Unable to load vehicle:',
      error
    );

    setLoadError(
      error.message ||
        'Unable to load vehicle.'
    );
  } finally {
    setLoading(false);
  }
};

  const pickImages = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrors(current => ({
        ...current,
        images:
          'Photo library permission is required.',
      }));

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync(
        {
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 0.8,
        }
      );

    if (result.canceled) {
      return;
    }

  const selectedImages: VehicleImage[] =
    result.assets.map((asset, index) => ({
      uri: asset.uri,
      fileName:
        asset.fileName ??
        `vehicle-image-${Date.now()}-${index}.jpg`,
      mimeType:
        asset.mimeType ?? 'image/jpeg',

      isPrimary:
        images.length === 0 && index === 0,

      isLocal: true,
    }));

    setImages(current => [
      ...current,
      ...selectedImages,
    ]);

    setErrors(current => ({
      ...current,
      images: '',
    }));
  };

  const setPrimaryImage = (
    index: number
  ) => {
    setImages(current =>
      current.map(
        (image, imageIndex) => ({
          ...image,
          isPrimary:
            imageIndex === index,
        })
      )
    );
  };

const removeImage = async (index: number) => {
  const imageToRemove = images[index];

  try {
    if (!imageToRemove.isLocal && imageToRemove.id) {
      await deleteVehicleImage(
        vehicleId,
        imageToRemove.id
      );
    }

    setImages(current => {
      const updatedImages = current.filter(
        (_, imageIndex) => imageIndex !== index
      );

      if (
        updatedImages.length > 0 &&
        !updatedImages.some(image => image.isPrimary)
      ) {
        updatedImages[0] = {
          ...updatedImages[0],
          isPrimary: true,
        };
      }

      return updatedImages;
    });
  } catch (error: any) {
    Alert.alert(
      'Delete Failed',
      error.message || 'Unable to delete the image.'
    );
  }
};

  const validateForm = () => {
    const newErrors: FormErrors = {};

    const numericYear = Number(year);
    const currentYear =
      new Date().getFullYear();

    if (!year.trim()) {
      newErrors.year =
        'Year is required.';
    } else if (
      !Number.isInteger(numericYear)
    ) {
      newErrors.year =
        'Year must be a whole number.';
    } else if (
      numericYear < 1886 ||
      numericYear > currentYear + 1
    ) {
      newErrors.year =
        'Enter a valid vehicle year.';
    }

    if (!make.trim()) {
      newErrors.make =
        'Make is required.';
    }

    if (!model.trim()) {
      newErrors.model =
        'Model is required.';
    }

    const numericPrice =
      Number(askPrice);

    if (!askPrice.trim()) {
      newErrors.askPrice =
        'Listing price is required.';
    } else if (
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      newErrors.askPrice =
        'Listing price must be greater than 0.';
    }

    if (
      mileage.trim() &&
      (!Number.isFinite(
        Number(mileage)
      ) ||
        Number(mileage) < 0)
    ) {
      newErrors.mileage =
        'Mileage cannot be negative.';
    }

    if (
      vin.trim() &&
      vin.trim().length !== 17
    ) {
      newErrors.vin =
        'VIN should contain 17 characters.';
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );
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

    mileage: mileage.trim()
      ? Number(mileage)
      : 0,

    vin: vin.trim()
      ? vin.trim().toUpperCase()
      : null,

    description:
      description.trim() || null,

    status,

    trim: trim.trim() || null,

    bodyType:
      bodyType.trim() || null,

    engineInfo:
      engine.trim() || null,

    color:
      exteriorColor.trim() || null,

    interiorColor:
      interiorColor.trim() || null,
  };

  try {
    setSaving(true);

    setErrors(current => ({
      ...current,
      general: '',
    }));

    // 1. Update vehicle information
    await updateVehicle(
      vehicleId,
      updatedVehicle
    );

    // 2. Upload newly selected local images
    const newImages = images.filter(
      image => image.isLocal
    );

    let uploadedImages: any[] = [];

    if (newImages.length > 0) {
      const uploadResponse =
        await uploadVehicleImages(
          vehicleId,
          newImages
        );

      const uploadedResult =
        uploadResponse.items ??
        uploadResponse.images ??
        uploadResponse;

      uploadedImages = Array.isArray(uploadedResult)
        ? uploadedResult
        : [];
    }

    // 3. Replace local images with the uploaded image IDs
    let uploadedIndex = 0;

    const syncedImages = images.map(image => {
      if (!image.isLocal) {
        return image;
      }

      const uploadedImage =
        uploadedImages[uploadedIndex];

      uploadedIndex += 1;

      return {
        ...image,
        id:
          uploadedImage?.id ??
          uploadedImage?.imageId ??
          uploadedImage?.image_id,
        uri:
          uploadedImage?.url ??
          uploadedImage?.imageUrl ??
          uploadedImage?.image_url ??
          image.uri,
        isLocal: false,
      };
    });

    // 4. Build the final image order
    const orderedImageIds = syncedImages
      .map(image => image.id)
      .filter(
        (
          id
        ): id is string | number =>
          id !== undefined &&
          id !== null
      );

    // 5. Find the selected primary image
    const primaryImage =
      syncedImages.find(
        image => image.isPrimary
      );

    // 6. Save image order and primary image
    if (
      orderedImageIds.length > 0 &&
      primaryImage?.id
    ) {
      await reorderVehicleImages(
        vehicleId,
        orderedImageIds,
        primaryImage.id
      );
    }

    console.log(
      'Vehicle and images updated successfully'
    );

    navigation.goBack();
  } catch (error: any) {
    console.error(
      'Update vehicle failed:',
      error
    );

    setErrors(current => ({
      ...current,
      general:
        error.message ||
        'Unable to update the vehicle.',
    }));
  } finally {
    setSaving(false);
  }
};

  const handleDiscard = () => {
    Alert.alert(
      'Discard Changes?',
      'Your unsaved changes will be lost.',
      [
        {
          text: 'Keep Editing',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () =>
            navigation.goBack(),
        },
      ]
    );
  };

  const renderImageItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<VehicleImage>) => {
    const index = getIndex();

    if (index === undefined) {
      return null;
    }

    return (
      <Pressable
        onLongPress={drag}
        disabled={isActive}
        style={[
          styles.imageCard,
          item.isPrimary &&
            styles.primaryImageCard,
          isActive &&
            styles.draggingImageCard,
        ]}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.vehicleImage}
          resizeMode="cover"
        />

        {item.isPrimary ? (
          <View
            style={styles.primaryBadge}
          >
            <Ionicons
              name="star"
              size={13}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryBadgeText
              }
            >
              Primary
            </Text>
          </View>
        ) : null}

        <Pressable
          style={
            styles.removeImageButton
          }
          onPress={() =>
            removeImage(index)
          }
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={COLORS.error}
          />
        </Pressable>

        <View
          style={styles.imageCardFooter}
        >
          <Pressable
            style={
              styles.primarySelector
            }
            onPress={() =>
              setPrimaryImage(index)
            }
          >
            <View
              style={[
                styles.radioOuter,
                item.isPrimary &&
                  styles.radioOuterSelected,
              ]}
            >
              {item.isPrimary ? (
                <View
                  style={
                    styles.radioInner
                  }
                />
              ) : null}
            </View>

            <Text
              style={
                styles.primarySelectorText
              }
            >
              Primary
            </Text>
          </Pressable>

          <Ionicons
            name="reorder-three-outline"
            size={20}
            color={COLORS.outline}
          />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Loading vehicle...
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <View
          style={styles.loadErrorIcon}
        >
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={COLORS.error}
          />
        </View>

        <Text
          style={styles.loadErrorTitle}
        >
          Unable to load vehicle
        </Text>

        <Text
          style={
            styles.loadErrorDescription
          }
        >
          {loadError}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadVehicle}
        >
          <Ionicons
            name="refresh-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.retryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={
                styles.headerIconButton
              }
              onPress={handleDiscard}
            >
              <Ionicons
                name="close"
                size={25}
                color={COLORS.textMuted}
              />
            </Pressable>

            <View>
              <Text
                style={styles.headerTitle}
              >
                Edit Vehicle
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                Inventory #{vehicleId}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleDiscard}
          >
            <Text
              style={styles.cancelText}
            >
              Cancel
            </Text>
          </Pressable>
        </View>

        <View
          style={styles.progressSection}
        >
          <View
            style={styles.progressLabels}
          >
            <Text
              style={styles.progressTitle}
            >
              Vehicle Update
            </Text>

            <Text
              style={styles.progressValue}
            >
              Existing Inventory
            </Text>
          </View>

          <View
            style={styles.progressTrack}
          >
            <View
              style={styles.progressFill}
            />
          </View>
        </View>

        <FormSection
          title="Vehicle Identification"
          icon="finger-print-outline"
        >
          <FormField
            label="VIN"
            value={vin}
            onChangeText={value => {
              setVin(
                value
                  .toUpperCase()
                  .replace(/\s/g, '')
              );

              setErrors(current => ({
                ...current,
                vin: '',
              }));
            }}
            placeholder="Enter 17-digit VIN"
            error={errors.vin}
            maxLength={17}
            autoCapitalize="characters"
          />

          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textMuted}
            />

            <Text
              style={styles.infoText}
            >
              Check the VIN carefully before
              updating the vehicle.
            </Text>
          </View>
        </FormSection>

        <FormSection
          title="Vehicle Specifications"
          icon="car-sport-outline"
        >
          <View
            style={styles.twoColumnRow}
          >
            <FormField
              label="Year"
              value={year}
              onChangeText={setYear}
              placeholder="2024"
              keyboardType="numeric"
              error={errors.year}
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Make"
              value={make}
              onChangeText={setMake}
              placeholder="Toyota"
              error={errors.make}
              containerStyle={
                styles.halfField
              }
            />
          </View>

          <View
            style={styles.twoColumnRow}
          >
            <FormField
              label="Model"
              value={model}
              onChangeText={setModel}
              placeholder="RAV4"
              error={errors.model}
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Trim"
              value={trim}
              onChangeText={setTrim}
              placeholder="XLE"
              containerStyle={
                styles.halfField
              }
            />
          </View>

          <View
            style={styles.twoColumnRow}
          >
            <FormField
              label="Body Type"
              value={bodyType}
              onChangeText={setBodyType}
              placeholder="SUV"
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Engine"
              value={engine}
              onChangeText={setEngine}
              placeholder="2.5L I4"
              containerStyle={
                styles.halfField
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Vehicle Media"
          icon="images-outline"
          rightAction={
            <Pressable
              style={
                styles.sectionAction
              }
              onPress={pickImages}
            >
              <Ionicons
                name="camera-outline"
                size={19}
                color={COLORS.primary}
              />

              <Text
                style={
                  styles.sectionActionText
                }
              >
                Add Photos
              </Text>
            </Pressable>
          }
        >
          {images.length > 0 ? (
            <>
              <DraggableFlatList
                data={images}
                horizontal
                keyExtractor={(
                  item,
                  index
                ) =>
                  item.id
                    ? String(item.id)
                    : `${item.uri}-${index}`
                }
                renderItem={
                  renderImageItem
                }
                onDragEnd={({ data }) =>
                  setImages(data)
                }
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.imageListContent
                }
              />

              <Text
                style={
                  styles.imageHelpText
                }
              >
                Long press and drag to reorder
                photos. Select one photo as
                primary.
              </Text>
            </>
          ) : (
            <Pressable
              style={
                styles.uploadPlaceholder
              }
              onPress={pickImages}
            >
              <View
                style={styles.uploadIcon}
              >
                <Ionicons
                  name="cloud-upload-outline"
                  size={31}
                  color={COLORS.primary}
                />
              </View>

              <Text
                style={styles.uploadTitle}
              >
                Add vehicle photos
              </Text>

              <Text
                style={
                  styles.uploadDescription
                }
              >
                Select multiple images and
                choose one as the primary image.
              </Text>
            </Pressable>
          )}

          {errors.images ? (
            <Text
              style={styles.errorText}
            >
              {errors.images}
            </Text>
          ) : null}
        </FormSection>

        <FormSection
          title="Pricing & Condition"
          icon="cash-outline"
        >
          <View
            style={styles.twoColumnRow}
          >
            <FormField
              label="Listing Price (CAD)"
              value={askPrice}
              onChangeText={setAskPrice}
              placeholder="0"
              keyboardType="numeric"
              error={errors.askPrice}
              containerStyle={
                styles.halfField
              }
              leadingText="$"
            />

            <FormField
              label="Mileage (km)"
              value={mileage}
              onChangeText={setMileage}
              placeholder="0"
              keyboardType="numeric"
              error={errors.mileage}
              containerStyle={
                styles.halfField
              }
            />
          </View>

          <Text
            style={styles.fieldLabel}
          >
            Status
          </Text>

          <View
            style={styles.statusOptions}
          >
            <StatusOption
              label="Available"
              value="available"
              selectedValue={status}
              onSelect={setStatus}
            />

            <StatusOption
              label="Sold"
              value="sold"
              selectedValue={status}
              onSelect={setStatus}
            />

            <StatusOption
              label="Pending"
              value="pending"
              selectedValue={status}
              onSelect={setStatus}
            />
          </View>
        </FormSection>

        <FormSection
          title="Visual Details"
          icon="color-palette-outline"
        >
          <View
            style={styles.twoColumnRow}
          >
            <FormField
              label="Exterior Color"
              value={exteriorColor}
              onChangeText={
                setExteriorColor
              }
              placeholder="Deep Blue"
              containerStyle={
                styles.halfField
              }
            />

            <FormField
              label="Interior Color"
              value={interiorColor}
              onChangeText={
                setInteriorColor
              }
              placeholder="Black"
              containerStyle={
                styles.halfField
              }
            />
          </View>
        </FormSection>

        <FormSection
          title="Description"
          icon="document-text-outline"
        >
          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
            ]}
            placeholder="Add condition, features, history, or other details..."
            placeholderTextColor="#9296A1"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
        </FormSection>

        {errors.general ? (
          <View
            style={styles.generalError}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.error}
            />

            <Text
              style={
                styles.generalErrorText
              }
            >
              {errors.general}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={({ pressed }) => [
            styles.discardButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDiscard}
          disabled={saving}
        >
          <Ionicons
            name="close-outline"
            size={21}
            color={COLORS.primary}
          />

          <Text
            style={
              styles.discardButtonText
            }
          >
            Discard
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.updateButton,
            pressed && styles.pressed,
            saving &&
              styles.disabledButton,
          ]}
          onPress={handleUpdate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Ionicons
              name="save-outline"
              size={22}
              color="#FFFFFF"
            />
          )}

          <Text
            style={
              styles.updateButtonText
            }
          >
            {saving
              ? 'Updating...'
              : 'Update Vehicle'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

type FormSectionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
};

function FormSection({
  title,
  icon,
  children,
  rightAction,
}: FormSectionProps) {
  return (
    <View style={styles.formSection}>
      <View
        style={
          styles.formSectionHeader
        }
      >
        <View
          style={styles.sectionHeadingRow}
        >
          <View
            style={styles.sectionIcon}
          >
            <Ionicons
              name={icon}
              size={21}
              color={COLORS.primary}
            />
          </View>

          <Text
            style={styles.sectionTitle}
          >
            {title}
          </Text>
        </View>

        {rightAction}
      </View>

      {children}
    </View>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (
    value: string
  ) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  containerStyle?: object;
  leadingText?: string;
  maxLength?: number;
  autoCapitalize?:
    | 'none'
    | 'sentences'
    | 'words'
    | 'characters';
};

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  containerStyle,
  leadingText,
  maxLength,
  autoCapitalize,
}: FormFieldProps) {
  return (
    <View
      style={[
        styles.fieldContainer,
        containerStyle,
      ]}
    >
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        {leadingText ? (
          <Text
            style={styles.leadingText}
          >
            {leadingText}
          </Text>
        ) : null}

        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9296A1"
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={
            autoCapitalize
          }
        />
      </View>

      {error ? (
        <Text
          style={styles.fieldError}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type StatusOptionProps = {
  label: string;
  value: string;
  selectedValue: string;
  onSelect: (value: string) => void;
};

function StatusOption({
  label,
  value,
  selectedValue,
  onSelect,
}: StatusOptionProps) {
  const selected =
    selectedValue === value;

  return (
    <Pressable
      style={[
        styles.statusOption,
        selected &&
          styles.statusOptionSelected,
      ]}
      onPress={() => onSelect(value)}
    >
      <View
        style={[
          styles.statusRadio,
          selected &&
            styles.statusRadioSelected,
        ]}
      >
        {selected ? (
          <View
            style={
              styles.statusRadioInner
            }
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.statusOptionText,
          selected &&
            styles.statusOptionTextSelected,
        ]}
      >
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 125,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: COLORS.textMuted,
  },

  loadErrorIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: COLORS.errorSoft,
  },

  loadErrorTitle: {
    marginTop: 17,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  loadErrorDescription: {
    maxWidth: 320,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },

  retryButton: {
    minWidth: 140,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    borderRadius: 15,
    backgroundColor: COLORS.primaryContainer,
  },

  retryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  header: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAF2',
    backgroundColor: COLORS.surface,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: COLORS.outline,
  },

  cancelText: {
    padding: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  progressSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  progressTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },

  progressValue: {
    fontSize: 12,
    color: COLORS.outline,
  },

  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#E4E5EE',
  },

  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  formSection: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 9,
    elevation: 2,
  },

  formSectionHeader: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 6,
  },

  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },

  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  fieldContainer: {
    marginBottom: 15,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  inputContainer: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  fieldInput: {
    flex: 1,
    minHeight: 49,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },

  leadingText: {
    paddingLeft: 14,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 15,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },

  descriptionInput: {
    minHeight: 120,
    paddingTop: 14,
  },

  inputError: {
    borderColor: COLORS.error,
  },

  fieldError: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.error,
  },

  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.error,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },

  uploadPlaceholder: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLow,
  },

  uploadIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: COLORS.primarySoft,
  },

  uploadTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  uploadDescription: {
    marginTop: 6,
    maxWidth: 280,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },

  imageListContent: {
    paddingVertical: 5,
    paddingRight: 12,
  },

  imageCard: {
    width: 180,
    marginRight: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 17,
    backgroundColor: COLORS.surface,
  },

  primaryImageCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  draggingImageCard: {
    opacity: 0.72,
    transform: [{ scale: 1.02 }],
  },

  vehicleImage: {
    width: '100%',
    height: 116,
    backgroundColor: COLORS.surfaceLow,
  },

  primaryBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.primaryContainer,
  },

  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor:
      'rgba(255,255,255,0.92)',
  },

  imageCardFooter: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  primarySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  primarySelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  radioOuter: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 10,
  },

  radioOuterSelected: {
    borderColor: COLORS.primary,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  imageHelpText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },

  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#D7D9E3',
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  statusOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },

  statusRadio: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.outline,
    borderRadius: 9,
  },

  statusRadioSelected: {
    borderColor: COLORS.primary,
  },

  statusRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  statusOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  statusOptionTextSelected: {
    color: COLORS.primary,
  },

  generalError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: COLORS.errorSoft,
  },

  generalErrorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#93000A',
  },

  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E9F0',
    backgroundColor:
      'rgba(255,255,255,0.97)',
  },

  discardButton: {
    height: 57,
    flex: 0.38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
  },

  discardButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  updateButton: {
    height: 57,
    flex: 0.62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 18,
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 6,
  },

  updateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.65,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.985 }],
  },
});
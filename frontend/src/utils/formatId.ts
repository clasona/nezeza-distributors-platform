import { Types } from 'mongoose';

/**
 * Extracts the timestamp in milliseconds from a MongoDB ObjectId.
 * 
 * MongoDB's ObjectId consists of:
 * - A 4-byte timestamp
 * - A 5-byte random value
 * - A 3-byte incrementing counter
 * 
 * This function retrieves the 4-byte timestamp component, converting it to milliseconds.
 * 
 * @param id - The ObjectId, provided as a string, ObjectId instance, or null/undefined.
 * @returns The timestamp in milliseconds, or null if the input is invalid.
 */
export const formatIdByTimestamp = (
  id: Types.ObjectId | string | number | undefined | null
): number | null  => {
  if (!id) {
    return null; // Handle null or undefined IDs
  }

  try {
    let objectId: Types.ObjectId;

    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) {
        return null; // Handle invalid string IDs
      }
      objectId = new Types.ObjectId(id);
    } else if (id instanceof Types.ObjectId) {
      objectId = id;
    } else {
      return null;
    }
    // Return the timestamp in milliseconds
    return objectId.getTimestamp().getTime();
  } catch (error) {
    console.error('Error formatting ObjectId:', error);
    return null; // Handle potential errors during conversion
  }
};


/**
 * Shortens a MongoDB ObjectId for display purposes.
 * The first 8 characters include part of the timestamp and part of the random value, ensuring a reasonable balance of uniqueness and brevity.
 * While collisions are very unlikely with the first 8 characters, if you need absolute uniqueness, use the full ObjectId.
 * @param id - The ObjectId, provided as a string or ObjectId instance.
 * @returns A shortened version of the ObjectId (first 8 characters) or null for invalid input.
 */
export const formatIdByShortening = (
  id: Types.ObjectId | number | string | undefined | null
): string | null => {
  if (!id) {
    return null; // Return null for undefined or null input
  }

  try {
    let objectId: Types.ObjectId;

    // Convert string IDs to ObjectId, ensuring validity
    if (typeof id === 'string') {
      if (!Types.ObjectId.isValid(id)) {
        return null; // Invalid string IDs
      }
      objectId = new Types.ObjectId(id);
    } else if (id instanceof Types.ObjectId) {
      objectId = id; // Use ObjectId as is
    } else {
      return null; // Unsupported type
    }

    // Return the first 8 characters of the ObjectId
    return objectId.toString().substring(0, 8);
  } catch (error) {
    console.error('Error shortening ObjectId:', error);
    return null; // Handle unexpected errors gracefully
  }
};

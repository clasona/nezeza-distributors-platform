// Form schema type that matches the store application form
export type StoreApplicationFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  citizenshipCountry: string;
  dob: string;
  residenceStreet: string;
  residenceStreet2?: string;
  residenceCity: string;
  residenceState: string;
  residenceCountry: string;
  residenceZipCode: string;
  storeType: string;
  storeRegistrationNumber: string;
  storeName: string;
  storeCategory: string;
  storeDescription: string;
  storeEmail: string;
  storePhone: string;
  storeLogo?: string;
  storeAddressName?: string; // Hidden field for address validation
  storeStreet: string;
  storeStreet2?: string;
  storeCity: string;
  storeState: string;
  storeCountry: string;
  storeZipCode: string;
};

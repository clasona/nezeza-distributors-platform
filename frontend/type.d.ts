// defining different custom data types

// export interface ProductProps {
//   id: number;
//   title: string;
//   price: number;
//   description: string;
//   category: string;
//   image: string;
// }

export interface ProductProps {
  // we can add as many keys as we want from the product
  _id: number;
  title: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  // storeId: number;
  image: string;
}

export interface OrderProps {
  // we can add as many keys as we want from the orders
  _id: number;
  fulfillmentStatus: string;
  orderItems: ProductProps[];
  quantity: number;
  totalTax: number;
  totalShipping: number;
  // orderDate
  paymentMethod: string;
}

//passed into redux stat for add to cart
export interface StoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
}

export interface stateProps { 
  productData: [];
  favoriteData: [];
  userInfo: [];
  userInfo: null | string;
  next: any;
  //add orderData
}

export interface Address{
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
export interface PrimaryContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryOfCitizenship: string;
  countryOfBirth: string;
  dateOfBirth: string;
  residenceAddress: Address;
  isBeneficialOwner: boolean;
  isLegalRepresentative: boolean;
}

// Define the business information structure
export interface BusinessInfo {
  registrationNumber: string;
  sellerType: string;
  businessName: string;
  businessType: string;
  businessPhone: string;
  businessAddress: Address;
}

// Define the billing information structure
export interface BillingInfo {
  routingNumber: string;
  accountNumber: string;
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
}

// Define the overall form data structure
export interface StoreSetupFormData {
  primaryContact: PrimaryContactInfo;
  businessInfo: BusinessInfo;
  billingInfo: BillingInfo;
}

// Type for sections in the form
export type StoreSetupFormDataSection = 'primaryContact' | 'businessInfo' | 'billingInfo';
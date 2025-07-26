// defining different custom data types

export interface ProductProps {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  tags: string[]; // Array of tags for search and categorization
  image?: string;
  images: string[]; // Optional if the product has multiple images
  colors: string[]; // Array of color hex codes
  featured: boolean;
  weight: number;
  height: number;
  width: number;
  length: number;
  freeShipping: boolean;
  availability: boolean;
  rating: number;
  numOfReviews: number;
  storeId: StoreProps;
  createdAt: string;
  updatedAt: string;
  reviews: ReviewProps[]; // Define a ReviewProps interface for better structure
}

//reviews
export interface ReviewProps {
  _id: string;
  rating: number;
  comment: string;
  user: UserProps;
  reviewableType: string;
  reviewableId: string;
  createdAt: string;
  updatedAt: string;
}

export type NewReviewProps = Omit<
  ReviewProps,
  '_id' | 'createdAt' | 'updatedAt' | 'user'
>;

// for the buyer
export interface OrderItemsProps {
  // we can add as many keys as we want from the product
  _id?: string;
  title: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
  // storeId: number;
  image: string;
  product: ProductProps;
  sellerStoreId: StoreProps;
  sellerStoreAddress: AddressProps;
  addedToInventory: boolean;
  status:
    | 'Active'
    | 'Cancelled'
    | 'Returned'
    | 'Partially Cancelled'
    | 'Partially Returned';
  cancelledQuantity: number;
  taxRate?: number; // Tax rate as decimal (e.g., 0.08 for 8%)
  taxAmount?: number; // Calculated tax amount for this item
}

// for buyers
export interface OrderProps {
  _id: string;
  fulfillmentStatus: string;
  orderItems: OrderItemsProps[];
  quantity: number;
  totalAmount: number;
  totalTax: number;
  totalShipping: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  shippingAddress: AddressProps;
  archived: boolean;
}

/// for sellers
export interface SubOrderProps {
  _id: string;
  fulfillmentStatus: string;
  products: ProductProps[];
  quantity: number;
  totalAmount: number;
  totalTax: number;
  totalShipping: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  buyerId: string;
  // buyerId: UserProps;
  // buyerStoreId: StoreProps;
  // sellerStoreId: string;
}

export interface PaymentProps {
  paymentIntentId: string;
  // customerSessionClientId:string
}

export interface InventoryProps {
  _id: number;
  title: string;
  description: string;
  image: string;
  owner: number;
  buyerStoreId: number;
  productId: number;
  quantity: number;
  price: number;
  freeShipping: boolean;
  availability: boolean;
  rating: number;
  numOfReviews: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

//passed into redux stat for add to cart
export interface StoreProduct {
  _id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  quantity: number;
}

export interface StoreProps {
  _id: string;
  storeType: string;
  registrationNumber: number;
  name: string;
  category: string;
  description: string;
  email: string;
  phone: string;
  ownerId: number;
  // storeLogo: File;
  address?: AddressProps;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// When creating a new store, omit these since MongoDB will generate them
export type NewStoreProps = Omit<
  StoreProps,
  '_id' | 'ownerId' | 'createdAt' | 'updatedAt'
>;

// Interface for creating a new store application (no _id)
export interface CreateStoreApplicationProps {
  status: string;
  primaryContactInfo: Partial<UserProps>;
  storeInfo: NewStoreProps;
  verificationDocs: VerificationDocsProps;
  // createdAt: string;
  // updatedAt: string;
}

// export interface StoreApplicationProps {
//   _id: string;
//   status: string;
//   primaryContactInfo: Partial<UserProps>;
//   storeInfo: NewStoreProps;
//   verificationDocs: VerificationDocsProps;
//   createdAt: string;
//   updatedAt: string;
// }

// Interface for displaying or working with existing store applications (_id required)
export interface StoreApplicationProps extends CreateStoreApplicationProps {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocsProps {
  primaryContactIdentityDocument: any;
  businessDocument: any;
}

export interface UserProps {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  image: string;
  password: string;
  isVerified: boolean;
  verifiedAt: string;
  storeId: string;
  citizenshipCountry?: string;
  // birthCountry?: string;
  dob?: string;
  address?: AddressProps;
}

export interface stateProps {
  productData: [];
  favoriteData: [];
  userInfo: [];
  // userInfo: null | string;
  storeInfo: StoreProps; //TODO: change this type to StoreProps
  next: any;
  //add orderData
}

export interface AddressProps {
  _id?: number;
  fullName?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email?: string; // Optional if email is not required
}

export interface PrimaryContactProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryOfCitizenship: string;
  countryOfBirth: string;
  dateOfBirth: string;
  residenceAddress: AddressProps;
  // isBeneficialOwner: boolean;
  // isLegalRepresentative: boolean;
}

// Define the billing information structure
export interface BillingInfoProps {
  routingNumber: string;
  accountNumber: string;
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: number;
  billingAddress: string;
}

// Define the overall form data structure
export interface StoreSetupFormData {
  primaryContact: PrimaryContactInfo;
  storeInfo: StoreInfo;
  billingInfo: BillingInfo;
}

export interface NotificationProps {
  _id: string;
  read: bookean;
  priority: string;
  title: string;
  body: string;
  senderId: Userprops;
  receipientId: Userprops;
  // type: string;
  createdAt: string;
}

export interface CustomTokenProps {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: { name: string }[];
    storeId?: {
      _id: string;
      name: string;
      storeType: string;
      email: string;
      description: string;
      ownerId: string;
      address: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
    image?: string;
  };
}

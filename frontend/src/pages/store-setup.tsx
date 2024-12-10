import React, { useEffect, useState } from 'react';
import {
  PrimaryContactInfo,
  StoreSetupFormData,
  StoreSetupFormDataSection,
} from '../../type.d';
import countries from './countries.json';
import states from './states.json';

// type StoreFormDataSection = 'primaryContact' | 'businessInfo' | 'billingInfo';

type FormData = {
  primaryContactInfo: PrimaryContactInfo;
  // businessInfo: BusinessInfo;
  // billingInfo: BillingInfo;
};
const StoreSetupPage = ({
  user,
}: {
  user: { firstName: string; lastName: string; email: string };
}) => {
  //get this info from userInfo
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<StoreSetupFormData>({
    primaryContact: {
      //return these from previous register page
      // firstName: user.firstName,
      // lastName: user.lastName,
      // email: user.email,
      firstName: 'Yves',
      lastName: 'Sem G',
      email: 'test@gmail.com',
      phone: '',
      countryOfCitizenship: '',
      countryOfBirth: '',
      dateOfBirth: '',
      residenceAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      isBeneficialOwner: false,
      isLegalRepresentative: false,
    },
    businessInfo: {
      sellerType: '',
      registrationNumber: '',
      businessName: '',
      businessType: '',

      businessPhone: '',
      businessAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
    billingInfo: {
      routingNumber: '',
      accountNumber: '',
      cardholderName: '',
      cardNumber: '',
      expirationDate: '',
      cvv: '',
    },
  });

  const sections = [
    'Primary Contact Info',
    'Business Info',
    'Billing Info',
    'Verification Docs',
    'Review & Submit',
  ];
  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmAccountNumber(value);

    // Check if the confirmed account number matches the original account number
    if (value !== formData.billingInfo.accountNumber) {
      setErrorMessage("Account numbers don't match");
    } else {
      setErrorMessage(''); // Clear the error message if they match
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handleInputChange = (
    section: StoreSetupFormDataSection,
    field: string,
    value: any,
    nestedField?: string //optional field to update nested object
  ) => {
    console.log(section, field, value, nestedField);
    setFormData((prev: StoreSetupFormData) => ({
      ...prev, //All previous formData state (prev) is copied over.
      // [section]: {
      //   ...prev[section], //Only the specified section is updated.
      //   [field]: nestedField
      //     ? {
      //         ...(prev[section] as PrimaryContactInfo),
      //         [nestedField]: value,
      //       }[field]
      //     : value, //Within the updated section, only the specific field is changed to the new value.
      // },
      [section]: {
        ...prev[section],
        ...(nestedField
          ? {
              [nestedField]: value,
            }
          : { [field]: value }),
      },
    }));
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h2 className='text-3xl text-nezeza_dark_blue font-bold text-center mb-4'>
        Nezeza Store Setup
      </h2>
      <p className='text-center mb-4 text-gray-500'>
        Please fill in information as it appears on your official ID and
        registered business documents.
      </p>

      {/* Progress Bar */}
      <div className='flex justify-between items-center mb-6 '>
        {sections.map((section, index) => (
          <div
            key={index}
            className={`flex-1 text-center cursor-default hover:bg-nezeza_yellow hover:text-white ${
              index <= currentSection
                ? 'text-nezeza_dark_blue'
                : 'text-gray-400'
            }`}
            onClick={() => setCurrentSection(index)}
          >
            <span className='font-semibold'>{section}</span>
            {index < sections.length - 1 && <span className='mx-2'>→</span>}
          </div>
        ))}
      </div>

      {/* Section Forms */}
      <div className='bg-gray-100 min-h-screen flex flex-col items-center py-4'>
        <div className='w-full bg-nezeza_light_blue max-w-2xl p-4'>
          <div className='bg-white shadow-lg rounded-lg p-6 mb-6'>
            <h2 className='text-lg text-nezeza_yellow font-semibold mb-4'>
              {sections[currentSection]}
            </h2>
            <div className='grid gap-3'>
              {/* Primary Contact Section */}
              {currentSection === 0 && (
                <>
                  {/* First Name */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-24'>
                      First Name
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      value={formData.primaryContact.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'firstName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Last Name */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-24'>
                      Last Name
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      value={formData.primaryContact.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'lastName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Email */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm  w-24'>Email</label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='email'
                      value={formData.primaryContact.email}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'email',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div className='flex  items-center'>
                    <label className='text-gray-600 text-sm  w-24'>Phone</label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text' //TODO: make it phone nbr and verify it
                      value={formData.primaryContact.phone}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'phone',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Country of Citizenship */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm  w-24'>
                      Country of Citizenship
                    </label>
                    <select
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      value={formData.primaryContact.countryOfCitizenship}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'countryOfCitizenship',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value=''>Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Country of Birth */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm  w-24'>
                      Country of Birth
                    </label>
                    <select
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      value={formData.primaryContact.countryOfBirth}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'countryOfBirth',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value=''>Select a country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Date of Birth */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm  w-24'>
                      Date of Birth
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='date'
                      value={formData.primaryContact.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'dateOfBirth',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Residence Address */}
                  <div className='flex flex-col space-y-4'>
                    <label className='text-gray-600 text-md font-semibold'>
                      Residence Address
                    </label>

                    {/* Street Address */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Street Address
                      </label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='e.g., 123 Main St'
                        value={formData.primaryContact.residenceAddress.street}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContact',
                            'residenceAddress',
                            e.target.value,
                            'street'
                          )
                        }
                        required
                      />
                    </div>

                    {/* City */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>City</label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='City'
                        value={formData.primaryContact.residenceAddress.city}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContact', //TODO: change this to add residenceAddress to a nested object
                            'city',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    {/* State */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        State
                      </label>
                      <select
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        value={formData.primaryContact.residenceAddress.state}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContact',
                            'state',
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value=''>Select a state</option>
                        {states.map((state) => (
                          <option key={state.abbreviation} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Country (Dropdown) */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Country
                      </label>
                      <select
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        value={formData.primaryContact.residenceAddress.country}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContact',
                            'country',
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value=''>Select a country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Zip Code */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Zip Code
                      </label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='Zip Code'
                        value={formData.primaryContact.residenceAddress.zipCode}
                        onChange={(e) =>
                          handleInputChange(
                            'primaryContact',
                            'zipCode',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {/* isBeneficialOwner? */}
                  {/* <div className=' lex items-center'>
                    <input
                      type='checkbox'
                      checked={formData.primaryContact.isBeneficialOwner}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'isBeneficialOwner',
                          e.target.checked
                        )
                      }
                      className='mr-2'
                    />
                    <label>Are you the beneficial owner of the store?</label>
                  </div> */}
                  {/* isLegalRepresentative? */}
                  {/* <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={formData.primaryContact.isLegalRepresentative}
                      onChange={(e) =>
                        handleInputChange(
                          'primaryContact',
                          'isLegalRepresentative',
                          e.target.checked
                        )
                      }
                      className='mr-2'
                    />
                    <label>Are you a legal representative of the store?</label>
                  </div> */}

                  {/* Additional fields for this section */}
                  {/* Repeat similar styling for the rest of the form fields */}
                </>
              )}
              {/* Business Info Section */}
              {currentSection === 1 && (
                <>
                  {/* Seller Type */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm  w-24'>
                      Seller Type
                    </label>
                    <select
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      value={formData.businessInfo.sellerType}
                      onChange={(e) =>
                        handleInputChange(
                          'businessInfo',
                          'sellerType',
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value=''>Select type</option>
                      <option value='Manufacturer'>Manufacturer</option>
                      <option value='Wholesaler'>Wholesaler</option>
                      <option value='Retailer'>Retailer</option>
                    </select>
                  </div>
                  {/* Registration number */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-24'>
                      Business Registration Number
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='number'
                      value={formData.businessInfo.registrationNumber}
                      onChange={(e) =>
                        handleInputChange(
                          'businessInfo',
                          'registrationNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* Businesss Name */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-24'>
                      Business Name
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      value={formData.businessInfo.businessName}
                      onChange={(e) =>
                        handleInputChange(
                          'businessInfo',
                          'businessName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Businesss Type */}
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-24'>
                      Business Type
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='e.g., Grocery store, Clothing store, etc.'
                      value={formData.businessInfo.businessType}
                      onChange={(e) =>
                        handleInputChange(
                          'businessInfo',
                          'businessType',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className='flex  items-center'>
                    <label className='text-gray-600 text-sm  w-24'>
                      Business Phone
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text' //TODO: make it phone nbr and verify it
                      value={formData.businessInfo.phone}
                      onChange={(e) =>
                        handleInputChange(
                          'businessInfo',
                          'phone',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Business Address */}
                  <div className='flex flex-col space-y-4'>
                    <label className='text-gray-600 text-md font-semibold'>
                      Business Address
                    </label>

                    {/* Street Address */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Street Address
                      </label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='e.g., 123 Main St'
                        value={formData.businessInfo.businessAddress.street}
                        onChange={(e) =>
                          handleInputChange(
                            'businessInfo',
                            'street',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    {/* City */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>City</label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='City'
                        value={formData.businessInfo.businessAddress.city}
                        onChange={(e) =>
                          handleInputChange(
                            'businessInfo', //TODO: change this to add residenceAddress to a nested object
                            'city',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>

                    {/* State */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        State
                      </label>
                      <select
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        value={formData.businessInfo.businessAddress.state}
                        onChange={(e) =>
                          handleInputChange(
                            'businessInfo',
                            'state',
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value=''>Select a state</option>
                        {states.map((state) => (
                          <option key={state.abbreviation} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Country (Dropdown) */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Country
                      </label>
                      <select
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        value={formData.businessInfo.businessAddress.country}
                        onChange={(e) =>
                          handleInputChange(
                            'businessInfo',
                            'country',
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value=''>Select a country</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Zip Code */}
                    <div className='flex items-center'>
                      <label className='text-gray-600 text-sm w-24'>
                        Zip Code
                      </label>
                      <input
                        className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                        type='text'
                        placeholder='Zip Code'
                        value={formData.businessInfo.businessAddress.zipCode}
                        onChange={(e) =>
                          handleInputChange(
                            'businessInfo',
                            'zipCode',
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Billing Info Section */}
              {currentSection === 2 && (
                <div className='flex flex-col space-y-4'>
                  <label className='text-gray-600 text-md font-semibold'>
                    Enter Bank Details
                  </label>
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-40'>
                      Routing number
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='Routing number'
                      value={formData.billingInfo.routingNumber}
                      onChange={(e) =>
                        handleInputChange(
                          'billingInfo',
                          'routingNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-40'>
                      Account number
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='Account number'
                      value={formData.billingInfo.accountNumber}
                      onChange={(e) =>
                        handleInputChange(
                          'billingInfo',
                          'accountNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className='flex items-center'>
                    <label className='text-gray-600 text-sm w-40'>
                      Confirm account number
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='Account number'
                      value={confirmAccountNumber}
                      onChange={handleAccountNumberChange}
                      required
                    />
                  </div>
                  <div>
                    {errorMessage && (
                      <p className='text-center text-nezeza_red_600'>
                        {errorMessage}
                      </p>
                    )}
                  </div>

                  <label className='text-gray-600 text-md font-semibold'>
                    Enter Credit/Debit Card details
                  </label>
                  {/* Cardholder's Name */}
                  <div className='flex items-center mb-4'>
                    <label className='text-gray-600 text-sm w-40'>
                      Cardholder's Name
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='Name on card'
                      value={formData.billingInfo.cardholderName || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'billingInfo',
                          'cardholderName',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Card Number */}
                  <div className='flex items-center mb-4'>
                    <label className='text-gray-600 text-sm w-40'>
                      Card Number
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='text'
                      placeholder='XXXX-XXXX-XXXX-XXXX'
                      value={formData.billingInfo.cardNumber || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'billingInfo',
                          'cardNumber',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  {/* Expiration Date */}
                  <div className='flex items-center mb-4'>
                    <label className='text-gray-600 text-sm w-40'>
                      Expiration Date
                    </label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='month'
                      placeholder='MM/YY'
                      value={formData.billingInfo.expirationDate || ''}
                      onChange={(e) =>
                        handleInputChange(
                          'billingInfo',
                          'expirationDate',
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>

                  {/* CVV */}
                  <div className='flex items-center mb-4'>
                    <label className='text-gray-600 text-sm w-40'>CVV</label>
                    <input
                      className='w-full px-3 py-1 text-gray-800 bg-white rounded-md border-2 border-gray-300 focus:outline-none focus:border-blue-500 shadow-sm'
                      type='password'
                      placeholder='XXX'
                      value={formData.billingInfo.cvv || ''}
                      onChange={(e) =>
                        handleInputChange('billingInfo', 'cvv', e.target.value)
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              )}
              {/* Add more sections as needed */}

              {/* Buttons for navigation */}
              <div className='flex justify-end mt-4'>
                {currentSection > 0 && (
                  <button
                    className='px-4 py-1 bg-gray-200 text-gray-700 rounded-md mr-2'
                    onClick={() => setCurrentSection(currentSection - 1)}
                  >
                    Previous
                  </button>
                )}
                {currentSection < sections.length - 1 ? (
                  <button
                    className='bg-nezeza_dark_blue text-white px-4 py-1 rounded-md hover:bg-nezeza_yellow hover:text-black'
                    onClick={handleNext}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className='bg-nezeza_green_600  text-white px-4 py-1 rounded-md hover:bg-green-700'
                    onClick={() =>
                      (window.location.href =
                        '/post-store-application-submission')
                    }
                  >
                    SUBMIT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

StoreSetupPage.noLayout = true; // remove root layout from this page

export default StoreSetupPage;

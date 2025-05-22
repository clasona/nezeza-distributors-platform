// import React from 'react';
// import AddressInput from '../AddressInput';
// import DropdownInput from '../DropdownInput';
// import TextInput from '../TextInput';
// import countries from '@/pages/data/countries.json';
// import {
//   FieldErrors,
//   FieldValues,
//   UseFormRegister,
//   Control,
// } from 'react-hook-form';
// import StoreFormHeading from './StoreFormHeading';

// interface BillingInfoInputProps {
//   errors: FieldErrors;
//   defaultValue?: string;
//   register: UseFormRegister<FieldValues>;
//   control: Control<FieldValues>;
// }

// const BillingInfoInput = ({
//   register,
//   errors,
//   control,
// }: BillingInfoInputProps) => {
//   return (
//     <>
//       <div className='grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-6'>
//         <StoreFormHeading heading='Bank Details' />
//         <TextInput
//           label='Routing Number'
//           id='routingNumber'
//           name='routingNumber'
//           register={register}
//           errors={errors}
//           type='text'
//         />
//         <TextInput
//           label='Account Number'
//           id='accountNumber'
//           name='accountNumber'
//           register={register}
//           errors={errors}
//           type='text'
//         />
//         <TextInput
//           label='Confirm Account Number'
//           id='confirmAccountNumber'
//           name='confirmAccountNumber'
//           register={register}
//           errors={errors}
//           type='text'
//         />
//         <StoreFormHeading heading='Card Details' />
//         <TextInput
//           label="Cardholder's Full Name"
//           id='cardholderFullName'
//           name='cardholderFullName'
//           register={register}
//           errors={errors}
//           type='text'
//         />
//         <TextInput
//           label='Card Number'
//           id='cardNumber'
//           name='cardNumber'
//           register={register}
//           errors={errors}
//           type='text'
//         />
//         <TextInput
//           label='Expiration Date '
//           id='expirationDate'
//           name='expirationDate'
//           register={register}
//           errors={errors}
//           type='date'
//         />
//         <TextInput
//           label='CVV'
//           id='cvv'
//           name='cvv'
//           register={register}
//           errors={errors}
//           type='number'
//         />
//         <StoreFormHeading heading='Billing Address' />
//         <AddressInput
//           streetFieldName='billingStreet'
//           cityFieldName='billingCity'
//           stateFieldName='billingState'
//           countryFieldName='billingCountry'
//           zipCodeFieldName='billingZipCode'
//           register={register}
//           errors={errors}
//           control={control}
//           // setValue={setValue}
//         />
//       </div>
//     </>
//   );
// };

// export default BillingInfoInput;

import Button from '@/components/FormInputs/Button';
import DropdownInput from '@/components/FormInputs/DropdownInput';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput'
import React from 'react'
import {useForm} from 'react-hook-form'

export default function gabe() {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
      } = useForm();

      const orderFromGabe = () => [
        { value: 'pending', label: 'Pending' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'fulfilled', label: 'Fulfilled' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'returned', label: 'Returned' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'partially_fulfilled', label: 'Partially Fulfilled' },
        { value: 'canceled_partially', label: 'Canceled Partially' },
        { value: 'archived', label: 'Archived' },
      ];

  return (
    <div>
      gabe is starting today
      <form className='p-10'
      >
      <TextInput
              label='First Name'
              id='firstName'
              name='firstName'
              register={register}
              errors={errors}
              type='text'
            />
            <DropdownInputSearchable
                label='Fulfillment Status'
                id='fulfillmentStatus'
                name='fulfillmentStatus'
                options={orderFromGabe()}
                register={register}
                errors={errors}
                // value={orderData.fulfillmentStatus}
              />
            <SubmitButton
            
                buttonTitle= 'send'
            
            />
            </form>
            
    </div>
  )
}

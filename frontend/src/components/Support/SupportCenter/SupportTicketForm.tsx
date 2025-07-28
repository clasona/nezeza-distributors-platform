'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import Button from '@/components/FormInputs/Button'; // Replace with your actual button component

const topicOptions = [
  { value: 'order-issue', label: 'Order Issue' },
  { value: 'payment-problem', label: 'Payment Problem' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
];

const SupportTicketForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      orderNumber: '',
      issue: '',
      topic: topicOptions[0],
    },
  });

  const selectedTopic = watch('topic');

  const onSubmit = (data: any) => {
    console.log('Form Data:', data);
    
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-5"
    >
      <h2 className="text-xl font-semibold text-gray-800 text-center ">Submit a Support Ticket</h2>

      {/* Order Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Order Number</label>
        <input
          type="text"
          {...register('orderNumber', { required: true })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.orderNumber && (
          <p className="mt-1 text-sm text-red-500">Order Number is required</p>
        )}
      </div>

      {/* Issue or Request */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Issue or Request</label>
        <textarea
          {...register('issue', { required: true })}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.issue && (
          <p className="mt-1 text-sm text-red-500">This field is required</p>
        )}
      </div>

      {/* Topic Dropdown */}
      <DropdownInputSearchable
        name="topic"
        label="Topic"
        options={topicOptions}
        value={selectedTopic}
        onChange={(option) => setValue('topic', option)}
        register={register}
        errors={errors}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          buttonTitle="Submit"
          className="w-full bg-black text-white rounded-md py-2 text-center"
          type="submit"
        />
      </div>
    </form>
  );
};

export default SupportTicketForm;

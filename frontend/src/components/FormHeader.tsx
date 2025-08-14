import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/router';

interface FormHeaderProps {
  title: string;
}

const FormHeader = ({ title }: FormHeaderProps) => {
  const router = useRouter();
  return (
    <div className='flex items-center justify-between py-6 px-12 bg-vesoko_background rounded-lg shadow'>
      <h2 className='text-xl font-semibold'> {title}</h2>
      <button onClick={() => router.back()}>
        <X />
      </button>
    </div>
  );
};

export default FormHeader;

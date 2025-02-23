'use client';
import React, { useEffect, useState } from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';
import Select, { StylesConfig } from 'react-select'; // Import react-select
import AsyncSelect from 'react-select/async';
import { ProductProps } from '../../../type';
import { getAllProducts } from '@/utils/product/getAllProducts';

interface DropdownInputSearchableAsyncProps {
  label: string;
  className?: string;
  isRequired?: boolean;
  onChange?: (selectedOption: { id: string; label: string } | null) => void;
}

/**
 *  Use the Async component to load options from a remote source as the user types.
 *  NOTE: Currently just using it for products, but can be customized later
 * @param param0
 * @returns
 */
const DropdownInputSearchableAsync = ({
  label,
  isRequired = true,
  className = '',
  onChange,
}: DropdownInputSearchableAsyncProps) => {
  const [isLoading, setIsLoading] = useState(false); // State for loading
  const [products, setProducts] = useState<ProductProps[] | null>(null); // Correct type
  const [selectOptions, setSelectOptions] = useState<
    { id: string; label: string }[]
  >([]);

  // fetch store poducts data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
        if (productsData) {
          const formattedOptions = productsData.map(
            (product: ProductProps) => ({
              id: product._id, // Or another unique identifier
              label: product.title, // Display the product name
            })
          );
          setSelectOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Error fetching products data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadOptions = async (inputValue: string) => {
    if (!products) return []; // Handle case where products haven't loaded yet

    const filteredProducts = products.filter((product) =>
      product.title.toLowerCase().includes(inputValue.toLowerCase())
    );

    return filteredProducts.map((product) => ({
      id: product._id, // Or another unique identifier
      label: product.title,
    }));
  };

  return (
    <div className={className}>
      <label className='block text-sm font-medium leading-6 text-gray-700'>
        {label}
        {isRequired && <span className='text-nezeza_red_600'> *</span>}
      </label>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        defaultOptions={selectOptions}
        onChange={onChange}
      />
    </div>
  );
};

export default DropdownInputSearchableAsync;

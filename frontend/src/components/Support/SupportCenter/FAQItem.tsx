import React from 'react';
import { useState } from 'react';


interface FAQItemProps{
    question: string;
    answer: string;
}


const FAQItem: React.FC<FAQItemProps> = ({question, answer}) => {
    const[isOpen, setIsOpen] = useState(false)
  return (
    <div className='border-b py-4'>
        <button
        onClick={()=> setIsOpen((prev)=> !prev)}
        className='flex justify-between w-full text-left font-medium text-gray-800'>
            {question}
            <span>{isOpen ? '-' : '+'}</span>

        </button>
        {isOpen && <div className="mt-2 text-sm text-gray-600">{answer}</div>}
    </div>
  );
};

export default FAQItem;

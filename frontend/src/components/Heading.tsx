import React from 'react';

interface HeadingProps {
  title: string;
}

export default function Heading({ title }: HeadingProps) {
  return (
    <div>
      <h2 className='text-2xl font-semibold text-vesoko_dark_slate'>{title}</h2>
    </div>
  );
}

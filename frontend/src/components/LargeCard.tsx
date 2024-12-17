import React from 'react'
import {
  MdLayers
} from 'react-icons/md';

type LargeCardProps = {
    className: string; // Classname for the large card container.
}

export default function LargeCard({className}: LargeCardProps) {
  return (
      <div className={`rounded-lg text-white shadow-md p-8 flex items-center gap-2 ${className}`}>
          <MdLayers />
          <h4> Total Orders</h4>
          <h2 className='lg:text-3xl text-2xl'> $300k</h2>
    </div> 
  )
}

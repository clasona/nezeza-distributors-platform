// import React, { useState } from 'react';

// interface UpdateRowProps {
//   rowData: any;
//   onSave: (updatedRow: any) => void;
// }

// const UpdateRow = ({ rowData, onSave }: UpdateRowProps) => {
//   const [formData, setFormData] = useState({ ...rowData });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev: any) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = () => {
//     onSave(formData);
//   };

//   return (
//     <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center'>
//       <div className='bg-white p-6 rounded-lg shadow-lg w-1/3'>
//         <h3 className='text-lg font-semibold mb-4'>Update Row</h3>
//         {Object.keys(formData).map((key) => (
//           <div key={key} className='mb-3'>
//             <label className='block text-gray-700 mb-1'>{key}</label>
//             <input
//               type='text'
//               name={key}
//               value={formData[key]}
//               onChange={handleInputChange}
//               className='w-full border rounded-md p-2'
//             />
//           </div>
//         ))}
//         <div className='flex justify-end'>
//           <button
//             onClick={handleSubmit}
//             className='px-4 py-2 bg-blue-600 text-white rounded-md'
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateRow;

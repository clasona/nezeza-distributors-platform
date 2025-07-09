interface ApproveModalProps<T extends object> {
  isOpen: boolean;
  rowData: T;
  onClose: () => void;
  onApprove: (id: number | string) => void;
}

const ApproveRowModal = <T extends { _id: number | string }>({
  isOpen,
  rowData,
  onClose,
  onApprove,
}: ApproveModalProps<T>) => {
  if (!isOpen) return null;

  const handleApprove = async () => {
    if ('_id' in rowData) {
      onApprove(rowData._id);
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
      <div className='bg-vesoko_light_blue p-6 rounded-lg shadow-lg w-96'>
        <h3 className='text-lg font-semibold mb-4'>Confirm Approve</h3>
        {/* {isOrderProps(rowData) && ( */}
        <p className='mb-4'>
          Are you sure you want to approve the application with ID #{' '}
          <span className='font-bold text-vesoko_dark_blue'>{rowData._id}</span>
          ? <br />
          This action cannot be undone.
        </p>
        <div className='flex justify-end space-x-2 sm:space-x-4'>
          <button
            onClick={onClose}
            className='px-2 sm:px-4 py-2 text-vesoko_gray_600 bg-gray-300 rounded-md hover:text-white hover:bg-gray-400'
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            className='px-2 sm:px-4 py-2 text-white bg-vesoko_green_600 rounded-md hover:bg-vesoko_green_800'
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRowModal;

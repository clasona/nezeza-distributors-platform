// CloudinaryImageUpload.tsx
const CloudinaryImageUpload = ({
  label,
  className,
  setImageResource,
}: {
  label: string;
  className?: string;
  setImageResource: (resource: any) => void; // Pass resource to parent
}) => {
  return (
    <div>
      <label
        htmlFor='course-image'
        className='block text-sm font-medium leading-6 text-gray-900'
      >
        {label}
      </label>
      <CldUploadWidget
        signatureEndpoint='/api/cloudinary-sign-image/route'
        onUpload={(result) => {
          const resource = result.info; // Get the uploaded image details
          setImageResource(resource); // Pass the full resource to the parent
        }}
      >
        {({ open }) => (
          <Button
            buttonTitle='Upload Image'
            icon={Upload}
            className='space-x-3 px-6 py-2 text-white bg-nezeza_dark_blue hover:bg-nezeza_green_800'
            onClick={() => open()}
          />
        )}
      </CldUploadWidget>
    </div>
  );
};

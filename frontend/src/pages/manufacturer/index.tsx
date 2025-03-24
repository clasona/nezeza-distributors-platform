import SellerDashboard from '@/components/SellerDashboard';
import ManufacturerLayout from './layout';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]'; // Adjust the path
import { GetServerSidePropsContext } from 'next'; 
import withManufacturerAuth from './withManufacturerAuth';

// export async function getServerSideProps(context: GetServerSidePropsContext) {
//   const session = await getServerSession(context.req, context.res, authOptions);

//   if (!session || session.user.role !== 'manufacturer') {
//     return {
//       redirect: {
//         destination: '/unauthorized', // Redirect to home or unauthorized page
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {}, // Pass props to your component if needed
//   };
// }
const ManufacturerDashboard = () => {
  return (
    <div>
      <ManufacturerLayout>
        <SellerDashboard />
      </ManufacturerLayout>
    </div>
  );
};

ManufacturerDashboard.noLayout = true;
export default ManufacturerDashboard;

// export default withManufacturerAuth(ManufacturerDashboard);

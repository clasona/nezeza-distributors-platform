// withManufacturerAuth.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]'; // Adjust the path
import { ComponentType } from 'react';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

// The function that creates a getServerSideProps function with auth checks
export const withManufacturerAuthSSP = <P extends object>(
  getServerSidePropsFunc?: (
    context: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<P>>
) => {
  return async (
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    if (!session || session.user.role !== 'manufacturer') {
      return {
        redirect: {
          destination: '/unauthorized', // Redirect to unauthorized page
          permanent: false,
        },
      };
    }

    if (getServerSidePropsFunc) {
      return getServerSidePropsFunc(context);
    }

    return { props: {} as P };
  };
};

// The HOC for the component
const withManufacturerAuth = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  const Wrapper = (props: P) => {
    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

withManufacturerAuth.noLayout = true;
export default withManufacturerAuth;

// // import { NextResponse } from 'next/server';
// // import type { NextRequest } from 'next/server';

// // // This function can be marked `async` if using `await` inside
// // export function middleware(request: NextRequest) {
// //   return NextResponse.redirect(new URL('/', request.url));
// // }

// // // See "Matching Paths" below to learn more
// // export const config = {
// //   matcher: '/manufacturer/:path*',
// // };

// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import { useSelector } from 'react-redux';
// import { stateProps } from '../type';

// export async function middleware(request: NextRequest) {
//   // Get the pathname of the request
//   const path = request.nextUrl.pathname;
  
//   // Define protected routes (routes that require manufacturer role)
//   const manufacturerRoutes = ['/manufacturer', '/manufacturer/inventory'];
  
//   // Check if the current path is a protected route
//   const isProtectedRoute = manufacturerRoutes.some(route => 
//     path === route || path.startsWith(`${route}/`)
//   );
  
//     if (isProtectedRoute) {
//       // Get the login details from redux
//     //   const { userInfo, storeInfo } = useSelector(
//     //     (state: stateProps) => state.next
//     //   );

//     //   // Check if user is authenticated and has the correct role
//     //     if (!storeInfo || storeInfo.storeType !== 'manufacturing') {
//     //       console.log('token', storeInfo.storeType);
//     //       // Redirect to unauthorized page
//     //       return NextResponse.redirect(new URL('/unauthorized', request.url));
//     //     }

        
//       // Get the session token
//       const token = await getToken({
//         req: request,
//         secret: process.env.NEXTAUTH_SECRET
//       });

//       // Check if user is authenticated and has the correct role
//         if (!token || token.role !== 'manufacturer') {
//           console.log('token', token)
//         // Redirect to unauthorized page
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }
//     }
  
//   // Continue with the request
//   return NextResponse.next();
// }

// // Configure which paths middleware runs on
// export const config = {
//   matcher: [
//     // Apply middleware to all manufacturer routes
//     '/manufacturer/:path*',
//     // Add other protected routes if needed
//   ]
// };
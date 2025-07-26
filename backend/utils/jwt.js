const jwt = require('jsonwebtoken');

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

const isTokenValid = ( token ) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  // Create JWT tokens for access and refresh tokens
  const accessTokenJWT = createJWT({ payload: {user} });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });
  
  // console.log("tokenssss soooo")
  // console.log(accessTokenJWT)
  // console.log(refreshTokenJWT)

  const oneDay = 1000 * 60 * 60 * 24; // 1 day for access token
  const longerExp = 1000 * 60 * 60 * 24 * 30; // 30 days for refresh token

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: oneDay, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + longerExp),
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    maxAge: longerExp, // 30 days
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

};


// const attachSingleCookieToResponse = ({ res, user }) => {
//   const token = createJWT({ payload: user });

//   const oneDay = 1000 * 60 * 60 * 24;

//   res.cookie('token', token, {
//     httpOnly: true,
//     expires: new Date(Date.now() + oneDay),
//     secure: process.env.NODE_ENV === 'production',
//     signed: true,
//   });
// };

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};

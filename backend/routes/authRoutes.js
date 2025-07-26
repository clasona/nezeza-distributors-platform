const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');
const { 
    register, 
    registerGoogle,
    login, 
    loginGoogle,
    verifyEmail,
    checkUserVerified,
    resendVerificationEmail,
    logout,
    resetPassword,
    forgotPassword,
    getUserForAuth,
    //getUserProfile,
    //updateUserProfile,
    //updateUserPassword, 
} = require('../controllers/authController');

router.post('/register', register);
router.post('/register/google', registerGoogle);
router.post('/login', login);
router.post('/login/google', loginGoogle);
router.post('/verify-email', verifyEmail);
router.get('/verify/status', checkUserVerified);
router.post('/resend-verification', resendVerificationEmail);
router.delete('/logout',authenticateUser, logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
router.get('/user-for-auth/:email', getUserForAuth);
//router.get('/logout', logout); previous logout route was used for testing purposes


module.exports = router;

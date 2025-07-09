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
    logout,
    resetPassword,
    forgotPassword,
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
router.delete('/logout',authenticateUser, logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);
//router.get('/logout', logout); previous logout route was used for testing purposes


module.exports = router;

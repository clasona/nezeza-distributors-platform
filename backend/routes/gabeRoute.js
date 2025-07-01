const express = require('express');
const router = express.Router();
const getGabeController =  require('../controllers/gabeController');

router.get('/', getGabeController.getGabeText);

module.exports = router;
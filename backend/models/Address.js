const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    street: { 
        type: String, 
        required: true, 
    },
    city: { 
        type: String, 
        required: true, 
    },
    state: { 
        type: String, 
        required: true, 
    },
    zipCode: { 
        type: String, 
        required: true, 
    },
    country: { 
        type: String, 
        required: true,
    }
  });
  

  module.exports = mongoose.model('Address', AddressSchema);

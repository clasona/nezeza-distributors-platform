const mongoose = require('mongoose')
const validator = require('validator');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide store name'],
        default: 'My Store',
        minlength: 3,
        maxlength: 50,
      },
      email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
          validator: validator.isEmail,
          message: 'Please provide valid email',
        },
      },
      description: {
        type: String,
        required: [true, 'Please provide store description'],
        maxlength: [1000, 'Description can not be more than 1000 characters'],
        default: 'Welcome to our store!'
      },
      ownerId: {  // Store Owner (Creator)
        type: mongoose.Schema.ObjectId, 
        ref: 'User',  
      },
      businessType: { 
        type: String, 
        //TODOS: change 'platform' to 'platform' or 'e-commerce' when e-commerce platform is fully implemented
        enum: ['manufacturing', 'wholesale', 'retail','E-commerce Marketplace'],  // Type of the store
        required: true 
      },
      
      address: {
        type: String,
        default: 'Store address',  // Placeholder for the store's primary address
        required: true  // Store's primary address
      },
      members: [{
        type: mongoose.Schema.ObjectId, 
        ref: 'User'  // Users (members) that belong to this store
        //For example, a wholesaler might invite sales agents, managers, etc
      }],
      isActive: {
        type: Boolean,
        default: false, // Store is active or not
      },

      
  },{ timestamps: true });


module.exports = mongoose.model('Store', storeSchema);
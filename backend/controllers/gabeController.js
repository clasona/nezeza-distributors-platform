const express = require('express')

const getGabeText = async (req, res) => {
    
    return res.send('Hello gabe, welcome to your page. Testing with postman');
  };

  module.exports = {getGabeText};
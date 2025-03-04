import React from 'react';
import axios from 'axios';

import { UserProps } from '../../../type';
import axiosInstance from '../axiosInstance';
import { ErrorResponse } from '../types/ErrorResponse';

export const registerUser = async (userData: UserProps) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

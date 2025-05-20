import { ReviewProps, NewReviewProps } from '../../type';
import axiosInstance from './axiosInstance';

export const createReview = async (reviewData: NewReviewProps) => {
  try {
    const response = await axiosInstance.post(`/reviews`, reviewData);
    return response.data;
  } catch (error: any) {
    console.log('err at bakend', error);
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const response = await axiosInstance.get('/reviews');

    if (response.status !== 200) {
      console.log('all reviews data not fetched.');
      return null;
    } else {
      return response.data.reviews;
    }
  } catch (error: any) {
    throw error;
  }
};

export const getReviewById = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/reviews/${id}`);

    if (response.status !== 200) {
      console.log('review data not fetched.');
      return null;
    } else {
      return response.data.review;
    }
  } catch (error: any) {
    throw error;
  }
};

export const updateReview = async (id: string, data: Partial<ReviewProps>) => {
  try {
    const response = await axiosInstance.patch(`/reviews/${id}`, data);

    if (response.status !== 200) {
      console.log('review data not updated.');
      return null;
    } else {
      return response.data.review;
    }
  } catch (error: any) {
    throw error;
  }
};

export const getReviewsByEntityTypeAndId = async (
  entityType: string,
  entityId: string
) => {
  try {
    const response = await axiosInstance.get(
      `/reviews/${entityType}/${entityId}`
    );

    if (response.status !== 200) {
      console.log(`reviews for ${entityType} with ID ${entityId} not fetched.`);
      return null;
    } else {
      return response.data.reviews;
    }
  } catch (error: any) {
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/reviews/${id}`);

    if (response.status !== 200) {
      console.log(`review with ID ${id} not deleted.`);
      return false;
    } else {
      return true;
    }
  } catch (error: any) {
    throw error;
  }
};

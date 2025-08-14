// components/ReviewsModal.tsx

import {
  createReview,
  deleteReview,
  getReviewsByEntityTypeAndId,
  updateReview,
} from '@/utils/reviews';
// import { useFavoritesWithImageControls } from '@/lib/useFavoritesWithImageControls';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { ProductProps, ReviewProps } from '../../../type';
import { handleError } from '@/utils/errorUtils';

interface ReviewsModalProps {
  product: ProductProps;
  // products: ProductProps[];
  isOpen: boolean;
  onClose: () => void;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
  product,
  // products,
  isOpen,
  onClose,
}) => {
  const { data: session } = useSession();

  const [reviews, setReviews] = useState<ReviewProps[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorLoadingReviews, setErrorLoadingReviews] = useState<string | null>(
    null
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<string>('');

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editComment, setEditComment] = useState<string>('');
  const [isUpdatingReview, setIsUpdatingReview] = useState(false);
  const [updateReviewError, setUpdateReviewError] = useState<string | null>(
    null
  );
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [deleteReviewError, setDeleteReviewError] = useState<string | null>(
    null
  );

  //   const { imageIndices, handleNextImage, handlePrevImage } =
  //     useFavoritesWithImageControls({
  //       items: products,
  //     });

  const fetchProductReviews = useCallback(async () => {
    setLoadingReviews(true);
    setErrorLoadingReviews(null);
    try {
      if (product?._id) {
        const fetchedReviews = await getReviewsByEntityTypeAndId(
          'Product',
          product._id
        );
        if (fetchedReviews) {
          setReviews(fetchedReviews);
        } else {
          setReviews([]); // Handle case where no reviews are found
        }
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      setErrorLoadingReviews('Failed to load reviews.');
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [product?._id, setLoadingReviews, setErrorLoadingReviews, setReviews]);

  useEffect(() => {
    fetchProductReviews();
  }, [fetchProductReviews]);

  const userHasReviewed = reviews?.some(
    (review) => review?.user?.email === session?.user?.email
  );

  const handleProductLearnMore = (tab: string) => {
    sessionStorage.setItem('selectedTab', tab);
    console.log('Selected tab from lisitng:', tab);
    window.open('/vp-specials', '_blank');
  };

  const handleCreateReview = async () => {
    if (!session?.user) {
      setReviewError('You must be logged in to leave a review.');
      return;
    }

    if (!newRating || !newComment) {
      setReviewError('Please provide a rating and a comment.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      const reviewData = {
        rating: newRating,
        comment: newComment,
        reviewableType: 'Product',
        reviewableId: product._id,
      };
      await createReview(reviewData);
      // Refresh reviews after successful submission
      fetchProductReviews();
      setNewRating(null);
      setNewComment('');
      setIsSubmittingReview(false);
    } catch (error: any) {
      console.error('Error creating review:', error);
      setReviewError(error || 'Failed to submit review.');
      setIsSubmittingReview(false);
      handleError(error);
    }
  };

  const handleEditReview = (review: ReviewProps) => {
    setEditingReviewId(review?._id || null);
    setEditRating(review?.rating || null);
    setEditComment(review?.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(null);
    setEditComment('');
    setUpdateReviewError(null);
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editRating || !editComment) {
      setUpdateReviewError('Please provide a rating and a comment.');
      return;
    }

    setIsUpdatingReview(true);
    setUpdateReviewError(null);

    try {
      const updatedData = {
        rating: editRating,
        comment: editComment,
      };
      await updateReview(reviewId, updatedData);
      // Refresh reviews after successful update
      fetchProductReviews();
      setEditingReviewId(null);
      setEditRating(null);
      setEditComment('');
      setIsUpdatingReview(false);
    } catch (error: any) {
      console.error('Error updating review:', error);
      setUpdateReviewError(
        error?.response?.data?.msg || 'Failed to update review.'
      );
      setIsUpdatingReview(false);
      handleError(error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setIsDeletingReview(true);
    setDeleteReviewError(null);

    try {
      await deleteReview(reviewId);
      fetchProductReviews(); // Refresh reviews after deletion
      setIsDeletingReview(false);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      setDeleteReviewError(
        error?.response?.data?.msg || 'Failed to delete review.'
      );
      setIsDeletingReview(false);
      handleError(error);
    }
  };

  return (
    <div className='fixed inset-0 flex justify-center items-center z-50'>
      <div
        className='fixed inset-0 bg-opacity-50 backdrop-filter backdrop-blur-sm'
        onClick={onClose}
      ></div>
      <div className='bg-white rounded-lg overflow-hidden shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 relative z-10'>
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-2 right-2 p-2 bg-gray-200 rounded-full hover:bg-gray-300 z-20'
        >
          <X size={16} />
        </button>

        {/* Image carousel */}
        {/* <div className='relative h-64 md:h-96 mb-4 md:mb-6 mt-6'>
          <Image
            src={product.images[imageIndices[product._id]]}
            alt={product.name}
            className='w-full h-full object-cover'
          />

          {product.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  handlePrevImage(product._id, product.images.length)
                }
                className='absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 z-10'
                aria-label='Previous image'
              >
                <ChevronLeft size={24} className='text-black' />
              </button>
              <button
                onClick={() =>
                  handleNextImage(product._id, product.images.length)
                }
                className='absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 z-10'
                aria-label='Next image'
              >
                <ChevronRight size={24} className='text-black' />
              </button>
            </>
          )}
        </div> */}

        {/* Details */}
        <h2 className='text-xl md:text-2xl font-semibold mb-2'>
          {product.title}
        </h2>

        <div className='flex items-center gap-1 mb-3'>
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={18}
              className={`${
                index < Math.floor(product.rating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : index < product.rating
                  ? 'text-yellow-500 fill-yellow-500 opacity-50'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className='text-sm ml-1 text-gray-600'>
            {product.rating.toFixed(1)}
          </span>
        </div>

        <p className='text-gray-700 mb-4'>{product.description}</p>

        {/* Reviews */}
        <div>
          <h3 className='text-lg font-semibold mb-2'>
            Reviews ({reviews?.length})
          </h3>
          {loadingReviews && <p>Loading reviews...</p>}
          {errorLoadingReviews && (
            <p className='text-red-500'>{errorLoadingReviews}</p>
          )}

          {!loadingReviews && reviews?.length === 0 && (
            <p className='text-gray-500'>No reviews yet for this product.</p>
          )}

          {!loadingReviews &&
            reviews?.map((review: ReviewProps) => (
              <div key={review?._id} className='mb-4 border-b pb-4'>
                {editingReviewId === review?._id ? (
                  <div className='mb-4'>
                    {updateReviewError && (
                      <p className='text-red-500 mb-2'>{updateReviewError}</p>
                    )}
                    <div className='mb-2'>
                      <label
                        htmlFor={`edit-rating-${review._id}`}
                        className='block text-gray-700 text-sm font-bold mb-1'
                      >
                        Rating:
                      </label>
                      <select
                        id={`edit-rating-${review._id}`}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        value={editRating === null ? '' : editRating}
                        onChange={(e) =>
                          setEditRating(parseInt(e.target.value))
                        }
                      >
                        <option value=''>Select Rating</option>
                        <option value='1'>1 Star</option>
                        <option value='2'>2 Stars</option>
                        <option value='3'>3 Stars</option>
                        <option value='4'>4 Stars</option>
                        <option value='5'>5 Stars</option>
                      </select>
                    </div>
                    <div className='mb-4'>
                      <label
                        htmlFor={`edit-comment-${review._id}`}
                        className='block text-gray-700 text-sm font-bold mb-1'
                      >
                        Comment:
                      </label>
                      <textarea
                        id={`edit-comment-${review._id}`}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                      />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleSaveEdit(review._id)}
                        className={`bg-vesoko_primary text-white py-2 px-4 rounded-lg hover:bg-vesoko_secondary cursor-pointer ${
                          isUpdatingReview
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={isUpdatingReview}
                      >
                        {isUpdatingReview ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className='bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 cursor-pointer'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1 mb-1'>
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={14}
                            className={`${
                              index < review?.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className='text-sm ml-1 text-gray-600'>
                          {review?.rating?.toFixed(1)}
                        </span>
                      </div>
                      {session?.user?.email === review?.user?.email && (
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEditReview(review)}
                            className='text-vesoko_primary hover:underline text-sm cursor-pointer'
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className={`text-red-500 hover:underline text-sm cursor-pointer ${
                              isDeletingReview
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                            disabled={isDeletingReview}
                          >
                            {isDeletingReview ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                    <p className='text-sm text-gray-700'>{review?.comment}</p>
                    <p className='text-xs text-gray-500'>
                      - {review?.user?.firstName} {review?.user?.lastName}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>

        {session?.user && !userHasReviewed && (
          <div className='mt-6 border-t pt-4'>
            <h3 className='text-lg font-semibold mb-2'>Leave a Review</h3>
            {reviewError && <p className='text-red-500 mb-2'>{reviewError}</p>}
            <div className='mb-2'>
              <label
                htmlFor='rating'
                className='block text-gray-700 text-sm font-bold mb-1'
              >
                Rating:
              </label>
              <select
                id='rating'
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                value={newRating === null ? '' : newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
              >
                <option value=''>Select Rating</option>
                <option value='1'>1 Star</option>
                <option value='2'>2 Stars</option>
                <option value='3'>3 Stars</option>
                <option value='4'>4 Stars</option>
                <option value='5'>5 Stars</option>
              </select>
            </div>
            <div className='mb-4'>
              <label
                htmlFor='comment'
                className='block text-gray-700 text-sm font-bold mb-1'
              >
                Comment:
              </label>
              <textarea
                id='comment'
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <button
              onClick={handleCreateReview}
              className={`bg-vesoko_primary text-white py-2 px-4 rounded-lg hover:bg-vesoko_secondary cursor-pointer ${
                isSubmittingReview ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        )}

        {/* Action buttons */}
        <div className='flex flex-col md:flex-row justify-end gap-2'>
          <button
            onClick={onClose}
            className='bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 mb-2 mt-2 md:mb-0' // Added margin for responsiveness
          >
            Close
          </button>
          {/* <button className='bg-vesoko_primary text-white py-2 px-4 rounded-lg hover:bg-vesoko_secondary'>
            Select
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;

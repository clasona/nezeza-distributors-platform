var stripe = Stripe(
  'pk_test_51QJNlGIxvdd0pNY43BocyQ4QbLIGqxufnrAcFB34u58R6vboKRezkA4r8jcEN9MFqWtDbavho5W7F1nBGXWZuC1s00wT0pIAN7'
);

// Initialize Stripe
//const stripe = Stripe('pk_test_your_publishable_key'); // Replace with your actual test key
const elements = stripe.elements();

// Create card element
const cardElement = elements.create('card', {
  style: {
    base: {
      fontSize: '16px',
      color: '#32325d',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
});

// Mount the card element to the DOM
cardElement.mount('#card-element');

// Handle real-time validation errors from the card Element.
cardElement.on('change', (event) => {
  const displayError = document.getElementById('card-errors');
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = '';
  }
});

// Handle form submission
const button = document.getElementById('submit-payment');
button.addEventListener('click', async () => {
  try {
    // Disable the button to prevent multiple clicks
    button.disabled = true;
    button.textContent = 'Processing...';

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      // Display error to customer
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = error.message;

      // Re-enable the button
      button.disabled = false;
      button.textContent = 'Checkout';
    } else {
      const paymentMethodId = paymentMethod.id;
      console.log('Payment Method ID:', paymentMethodId);

      // Here you would typically send the paymentMethodId to your server
      // For example:

      const response = await fetch(
        'http://localhost:8000/api/v1/payment/seller-subscription',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId,
            sellerId: '6828b9f52adaca538ba0ed0c',
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        // Handle successful payment
        alert('Payment successful!');
      } else {
        // Handle payment failure
        alert('Payment failed: ' + result.error);
      }

      // For demo purposes, just show success
      //alert('Payment method created with ID: ' + paymentMethodId);

      // Re-enable the button
      button.disabled = false;
      button.textContent = 'Checkout';
    }
  } catch (err) {
    console.error('An unexpected error occurred:', err);

    // Re-enable the button
    button.disabled = false;
    button.textContent = 'Checkout';

    const errorElement = document.getElementById('card-errors');
    errorElement.textContent =
      'An unexpected error occurred. Please try again.';
  }
});
// const button = document.querySelector('button');
// button.addEventListener('click', async () => {
//   const { paymentMethod, error } = await stripe.createPaymentMethod({
//     type: 'card',
//     card: cardElement, // This is the Stripe card element from the frontend
//   });

//   if (!error) {
//     const paymentMethodId = paymentMethod.id;
//     // Send this paymentMethodId to your backend
//   }

// fetch('http://localhost:8000/api/v1/payment/refun', {
//   method: 'POST',
// })
//   .then((res) => res.json())
//   .then(({ url }) => {
//     window.location = url;
//   })
//   .catch((e) => {
//     console.error(e.error);
//   });
//});

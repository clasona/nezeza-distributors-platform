import Button from '@/components/FormInputs/Button';
import router from 'next/router';
import React from 'react';

// const CustomerSupportHome = () => {
//   return (
//     <div>
//       Customer support going home soon
//       <div>
//         <Button
//           buttonTitle='Submit ticket'
//           className='text-nezeza_dark_blue hover:text-white hover:bg-nezeza_dark_blue'
//           onClick={() => {
//             router.push('/customer/support/submit-ticket');
//             // router.push('/customer/support/SupportCenter')
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default CustomerSupportHome;

import Link from 'next/link';

const CustomerSupportHome = () => {
  return (
    <div className="main-content">
      <section className="card-container">
        <div className="card">
          <h2>Ticket</h2>
          <p>Encountering an issue? Let us know and our support team will assist you promptly.</p>
          <Link href="/customer/support/submit-ticket">
            <button>Submit Ticket</button>
          </Link>
        </div>
        <div className="card">
          <h2>FAQs</h2>
          <p>Find answers to common questions...</p>
          <Link href="/customer/support/faqs">
            <button>Access FAQs</button>
          </Link>
        </div>
      </section>

      <section className="support-options">
        <h2>Support Options</h2>
        <p>We offer various support options to cater to your needs...</p>
        <ul>
          <li>Technical Support</li>

          <li>
              <Link href="/customer/support/order-assistance">
                  <button>Order Assistance</button>
              </Link>
          </li>

          <li>
            <Link href="/customer/support/track-package">
                  <button>Track Package</button>
              </Link>
          </li>

          <li>Vesoko Product Guidance</li>
        </ul>
      </section>
    </div>
  );
};

export default CustomerSupportHome;


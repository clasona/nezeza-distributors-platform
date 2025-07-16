// import React from 'react';
// import './SupportCenter.css';
// import Link from 'next/link';


// const SupportCenter: React.FC = () => {
//   return (
//     <div className="support-container">
//       <header className="header">
//         <div className="logo"> Vesoko Support</div>
//         <nav className="nav"> 
//          {/* <a href="/customer/support">Home</a>
//           <a href="/customer/support/submit-ticket">Submit Ticket</a>
//           <a href="customer/support/faqs">FAQs</a> */}

//           <Link href="/customer/support">Home</Link>

//           <Link href="/customer/support/submit-ticket">
//           <button>Submit Ticket</button>
//           </Link>

//           <Link href="customer/support/faqs">FAQs</Link>



//           <a href="#">Track Package</a>
//           <a href="#">Order Assistance</a>
//         </nav>
//       </header>

//       <div className="search-bar">
//         <input type="text" placeholder="Search topics/themes" />
//       </div>

//       <main className="main-content">
//         {/* <section className="card-container">
//           <div className="card">
//             <h2>Submit a Ticket</h2>
//             <p>Encountering an issue? Let us know and our support team will assist you promptly.</p>
//             <button>Submit Ticket</button>
//           </div>
//           <div className="card">
//             <h2>FAQs</h2>
//             <p>Find answers to the most common questions and learn how to resolve issues independently.</p>
//             <button>Access FAQs</button>
//           </div>
//         </section>

//         <section className="support-options">
//           <h2>Support Options</h2>
//           <p>We offer various support options to cater to your needs. Explore our resources and find the right support for you.</p>
//           <ul>
//             <li>Technical Support</li>
//             <li>Order Assistance</li>
//             <li>Track Package</li>
//             <li>Eco Product Guidance</li>
//           </ul>
//         </section> */}
//        {children} 
//       </main>

//       <footer className="footer">
//         <div className="footer-links">
//           <a href="#">Privacy Policy</a>
//           <a href="#">Terms of Service</a>
//           <a href="#">Contact Us</a>
//         </div>
//         <p>© 2023 Vesoko Support Center. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default SupportCenter;


// import React from 'react';
// import './SupportCenter.css';
// import Link from 'next/link';

// type Props = {
//   children: React.ReactNode;
//   tabBar: React.ReactNode;
// };

// const SupportCenter: React.FC<Props> = ({ children, tabBar }) => {
//   return (
//     <div className="support-container">
//       <header className="header">
//         <div className="logo"> Vesoko Support</div>
//         <nav className="nav">
//           <Link href="/customer/support">Home</Link>
//           {/* <Link href="/customer/support/submit-ticket">
//             <button>Submit Ticket</button>
//           </Link>
//           <Link href="/customer/support/faqs">FAQs</Link>
//           <a href="#">Track Package</a>
//           <a href="#">Order Assistance</a> */}
//           {tabBar}{
           
            
//           }
//         </nav>
//       </header>

//       <div className="search-bar">
//         <input type="text" placeholder="Search topics/themes" />
//       </div>

//       <main className="main-content">
//         {children} {/* ✅ Fix: You must accept and render this */}
//       </main>

//       <footer className="footer">
//         <div className="footer-links">
//           <a href="#">Privacy Policy</a>
//           <a href="#">Terms of Service</a>
//           <a href="#">Contact Us</a>
//         </div>
//         <p>© 2023 Vesoko Support Center. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default SupportCenter;

import React from 'react';
import './SupportCenter.css';

type Props = {
  children: React.ReactNode;
  tabBar: React.ReactNode;
};

const SupportCenter: React.FC<Props> = ({ children, tabBar }) => {
  return (
    <div className="support-container">
      <header className="header">
        <div className="logo">Vesoko Support</div>
        <nav className="nav">
          {tabBar} 
        </nav>
      </header>

      <div className="search-bar">
        <input type="text" placeholder="Search topics/themes" />
      </div>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
        <p>© 2025 Vesoko Support Center. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SupportCenter;



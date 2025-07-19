import RootLayout from '@/components/RootLayout';
import PageHeader from '@/components/PageHeader';

const faqs = [
  {
    question: 'How do I create a support ticket?',
    answer: 'Go to the support page and click on "Create Ticket". Fill out the form and submit.'
  },
  {
    question: 'How can I check the status of my ticket?',
    answer: 'Navigate to "My Tickets" to view all your submitted tickets and their statuses.'
  },
  {
    question: 'Can I add more information to my ticket?',
    answer: 'Yes, you can add messages and attachments to your ticket from the ticket details page.'
  },
  {
    question: 'What categories are available for support?',
    answer: 'Order Issue, Payment Problem, Shipping Delay, Product Quality, Refund Request, Account Access, Technical Support, Billing Inquiry, Seller Payout, Inventory Management, Platform Bug, Feature Request, Other.'
  },
  {
    question: 'How do I rate my support experience?',
    answer: 'After your ticket is resolved or closed, you can provide a satisfaction rating and feedback.'
  }
];

const FaqsPage = () => {
  return (
    <RootLayout>
      <div className='max-w-3xl mx-auto py-8'>
        <PageHeader heading='Frequently Asked Questions' />
        <div className='space-y-6'>
          {faqs.map((faq, idx) => (
            <div key={idx} className='bg-white rounded-lg shadow-md p-6'>
              <h3 className='font-bold text-vesoko_dark_blue mb-2'>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </RootLayout>
  );
};

FaqsPage.noLayout = true;
export default FaqsPage;

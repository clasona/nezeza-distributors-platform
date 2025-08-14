import Link from 'next/link';
import { 
  Store, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  MapPin, 
  Package,
  Users,
  TrendingUp,
  AlertCircle,
  Mail,
  MessageSquare,
  Phone,
  Download,
  ExternalLink,
  Info
} from 'lucide-react';

const SellersGuide = () => {
  const phases = [
    {
      phase: "Phase 1",
      title: "US-Based African Sellers",
      status: "Currently Active",
      statusColor: "bg-vesoko_green_100 text-green-800 border-green-200",
      description: "African entrepreneurs and businesses operating within the United States",
      requirements: [
        "Must be based in the United States",
        "African heritage or authentic African products",
        "Valid US business registration",
        "US tax identification (EIN)",
        "US-based business address"
      ]
    },
    {
      phase: "Phase 2", 
      title: "African-Based Sellers",
      status: "Coming Soon",
      statusColor: "bg-vesoko_background text-vesoko_secondary border-blue-200",
      description: "Direct partnerships with manufacturers and suppliers across Africa",
      requirements: [
        "Based in African countries",
        "Established manufacturing or wholesale operations", 
        "Export licensing and documentation",
        "Quality certification compliance",
        "International shipping capabilities"
      ]
    }
  ];

  const sellingSteps = [
    {
      step: 1,
      title: "Apply to Sell",
      description: "Complete our comprehensive application form",
      details: [
        "Provide personal contact information",
        "Submit business details and registration", 
        "Upload required verification documents",
        "Describe your product categories"
      ],
      timeframe: "15-20 minutes",
      icon: FileText
    },
    {
      step: 2,
      title: "Get Verified", 
      description: "Our team reviews and verifies your application",
      details: [
        "Document review and application processing (completed within 48 hours)",
        "Background and compliance checks",
        "Email notification with decision"
      ],
      timeframe: "48 hours",
      icon: Shield
    },
    {
      step: 3,
      title: "List Your Products",
      description: "Set up your store and add product listings",
      details: [
        "Access your seller dashboard",
        "Upload product images and descriptions",
        "Set pricing and inventory levels",
        "Configure shipping and fulfillment"
      ],
      timeframe: "1-2 hours",
      icon: Package
    },
    {
      step: 4,
      title: "Start Selling",
      description: "Go live and begin receiving orders",
      details: [
        "Store goes live on VeSoko marketplace",
        "Receive orders and payment notifications",
        "Process and fulfill customer orders",
        "Track sales and analytics"
      ],
      timeframe: "Immediate",
      icon: TrendingUp
    }
  ];

  const identityDocs = [
    "US Passport",
    "Driver's License", 
    "Passport Card",
    "State ID Card",
    "Green Card",
    "US Visa"
  ];

  const businessDocs = [
    "IRS Letter 147C (EIN confirmation)",
    "IRS SS-4 confirmation letter",
    "Business registration certificate",
    "State business license"
  ];

  const benefits = [
    {
      icon: Package,
      title: "African-Only Marketplace",
      description: "Dedicated exclusively to authentic African products and heritage"
    },
    {
      icon: Globe,
      title: "Global Market Access", 
      description: "Connect with customers across the US, with expansion to Canada & Europe"
    },
    {
      icon: TrendingUp,
      title: "End-to-End Supply Chain",
      description: "Complete platform supporting manufacturers, wholesalers & retailers"
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description: "Built-in compliance, logistics support, and payment protection"
    }
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-vesoko_primary50 via-white to-purple-50'>
      {/* Hero Section */}
      <div className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-vesoko_primary/90 to-vesoko_primary/90'></div>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24'>
          <div className='text-center'>
            <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6'>
              <Info className='h-4 w-4 text-yellow-400' />
              <span className='text-sm font-medium'>Complete Sellers Guide</span>
            </div>
            
            <h1 className='text-4xl md:text-6xl font-bold text-white mb-6 leading-tight'>
              Your Guide to
              <span className='block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'>
                Selling on VeSoko
              </span>
            </h1>
            
            <p className='text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed'>
              Everything you need to know about joining Africa's premier marketplace - 
              from application to successful selling.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Link
                href='/select-store-type'
                className='group inline-flex items-center gap-3 bg-vesoko_primary hover:bg-vesoko_primary_dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
              >
                <Store className='h-6 w-6' />
                Apply Now
                <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
              </Link>
              
              <Link
                href='/contact'
                className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300'
              >
                <MessageSquare className='h-5 w-5' />
                Ask Questions
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Current Selling Phases */}
      <div className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Seller Program Phases
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              We're launching VeSoko in phases to ensure the best experience for both sellers and customers
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            {phases.map((phase, index) => (
              <div key={index} className='bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300'>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-2xl font-bold text-gray-900'>{phase.phase}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${phase.statusColor}`}>
                    {phase.status}
                  </span>
                </div>
                
                <h4 className='text-xl font-semibold text-vesoko_primary mb-4'>{phase.title}</h4>
                <p className='text-gray-600 mb-6 leading-relaxed'>{phase.description}</p>
                
                <div>
                  <h5 className='font-semibold text-gray-900 mb-3'>Requirements:</h5>
                  <ul className='space-y-2'>
                    {phase.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className='flex items-center gap-2 text-gray-600'>
                        <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selling Process Steps */}
      <div className='py-24 bg-gradient-to-r from-gray-50 to-blue-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              How to Start Selling
            </h2>
            <p className='text-xl text-gray-600'>
              Follow these four simple steps to begin your selling journey
            </p>
          </div>

          <div className='space-y-8'>
            {sellingSteps.map((step, index) => {
              const IconComponent = step.icon;
              const isLast = index === sellingSteps.length - 1;
              
              return (
                <div key={index} className='relative'>
                  <div className='flex flex-col md:flex-row items-start gap-8 bg-white rounded-2xl p-8 shadow-lg border border-gray-200'>
                    {/* Step Number & Icon */}
                    <div className='flex-shrink-0 flex flex-col items-center'>
                      <div className='w-16 h-16 bg-gradient-to-r from-vesoko_primary to-vesoko_primary rounded-full flex items-center justify-center text-white text-xl font-bold mb-4'>
                        {step.step}
                      </div>
                      <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <IconComponent className='h-6 w-6 text-blue-600' />
                      </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1'>
                      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4'>
                        <h3 className='text-2xl font-bold text-gray-900'>{step.title}</h3>
                        <span className='text-sm font-medium text-vesoko_primary bg-vesoko_green_50 px-3 py-1 rounded-full mt-2 md:mt-0'>
                          {step.timeframe}
                        </span>
                      </div>
                      
                      <p className='text-lg text-gray-600 mb-6'>{step.description}</p>
                      
                      <div className='grid md:grid-cols-2 gap-4'>
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className='flex items-center gap-2 text-gray-600'>
                            <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className='flex justify-center mt-4 mb-4'>
                      <div className='w-0.5 h-8 bg-gradient-to-b from-vesoko_primary to-vesoko_primary'></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Document Requirements */}
      <div className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Required Documents
            </h2>
            <p className='text-xl text-gray-600'>
              Prepare these documents before starting your application
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            {/* Identity Documents */}
            <div className='bg-gradient-to-br from-vesoko_primary50 to-white border border-blue-200 rounded-2xl p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                  <FileText className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>Identity Documents</h3>
                  <p className='text-gray-600'>Personal verification required</p>
                </div>
              </div>

              <div className='space-y-4 mb-6'>
                <h4 className='font-semibold text-gray-900'>Acceptable Documents:</h4>
                <div className='grid grid-cols-2 gap-2'>
                  {identityDocs.map((doc, index) => (
                    <div key={index} className='flex items-center gap-2 text-gray-600'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      <span className='text-sm'>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                <h5 className='font-semibold text-amber-800 mb-2'>Must Include:</h5>
                <ul className='space-y-1 text-amber-700 text-sm'>
                  <li>• Full legal name</li>
                  <li>• Date of birth</li>
                  <li>• Clear, readable photo</li>
                  <li>• Valid expiration date</li>
                </ul>
              </div>
            </div>

            {/* Business Documents */}
            <div className='bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-8'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-12 h-12 bg-vesoko_green_100 rounded-lg flex items-center justify-center'>
                  <Shield className='h-6 w-6 text-green-600' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>Business Documents</h3>
                  <p className='text-gray-600'>Company registration verification</p>
                </div>
              </div>

              <div className='space-y-4 mb-6'>
                <h4 className='font-semibold text-gray-900'>Acceptable Documents:</h4>
                <div className='space-y-2'>
                  {businessDocs.map((doc, index) => (
                    <div key={index} className='flex items-center gap-2 text-gray-600'>
                      <CheckCircle className='h-4 w-4 text-green-500' />
                      <span className='text-sm'>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
                <h5 className='font-semibold text-amber-800 mb-2'>Must Include:</h5>
                <ul className='space-y-1 text-amber-700 text-sm'>
                  <li>• Full company legal name</li>
                  <li>• Tax ID / EIN number</li>
                  <li>• Business address</li>
                  <li>• Registration date</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Document Tips */}
          <div className='mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-semibold text-amber-800 mb-2'>Document Upload Tips</h3>
                <ul className='space-y-1 text-amber-700 text-sm'>
                  <li>• Upload clear, high-resolution scans or photos</li>
                  <li>• PDF format preferred (images also accepted)</li>
                  <li>• Ensure all information is clearly visible</li>
                  <li>• Documents must be current and valid</li>
                  <li>• Information must match details provided in application</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Timeline */}
      <div className='py-24 bg-gradient-to-r from-vesoko_primary to-vesoko_primary'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
            Application Review Process
          </h2>
          <p className='text-xl text-white mb-12'>
            Here's what happens after you submit your application
          </p>

          <div className='grid md:grid-cols-3 gap-8 mb-12'>
            {/* Document Review */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
              <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6'>
                <FileText className='h-8 w-8' />
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>Document Review</h3>
              <p className='text-white mb-4'>
                Our team carefully reviews your business documents and verifies information
              </p>
              <div className='text-blue-200 font-medium'>1-2 Business Days</div>
            </div>

            {/* Application Processing */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
              <div className='w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6'>
                <Clock className='h-8 w-8' />
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>Application Processing</h3>
              <p className='text-white mb-4'>
                We assess your application against our seller criteria and platform standards
              </p>
              <div className='text-blue-200 font-medium'>24 Hours</div>
            </div>

            {/* Decision Notification */}
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20'>
              <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6'>
                <Mail className='h-8 w-8' />
              </div>
              <h3 className='text-xl font-semibold text-white mb-4'>Decision Notification</h3>
              <p className='text-white mb-4'>
                You'll receive an email with our decision and next steps for setting up your store
              </p>
              <div className='text-blue-200 font-medium'>Within 48 Hours</div>
            </div>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20'>
            <h3 className='text-lg font-semibold text-white mb-4'>📧 What to Expect</h3>
            <div className='text-left max-w-2xl mx-auto'>
              <ul className='space-y-2 text-white'>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-400 flex-shrink-0' />
                  Confirmation email immediately after submission
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-400 flex-shrink-0' />
                  Regular updates on application status
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-400 flex-shrink-0' />
                  Detailed instructions if approved
                </li>
                <li className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-400 flex-shrink-0' />
                  Feedback and guidance if additional information needed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits of Selling */}
      <div className='py-24 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              Why Sell on VeSoko?
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Join a marketplace specifically designed for authentic African products and businesses
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className='group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-vesoko_primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2'>
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-vesoko_primary to-vesoko_primary rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300'>
                    <IconComponent className='h-8 w-8 text-white' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4'>{benefit.title}</h3>
                  <p className='text-gray-600 leading-relaxed'>{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Support & Contact */}
      <div className='py-24 bg-gradient-to-r from-gray-50 to-blue-50'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
            Need Help or Have Questions?
          </h2>
          <p className='text-xl text-gray-600 mb-12'>
            Our support team is here to help you succeed
          </p>

          <div className='grid md:grid-cols-2 gap-8 mb-12'>
            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'>
              <Mail className='h-12 w-12 text-vesoko_primary mx-auto mb-6' />
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>Email Support</h3>
              <p className='text-gray-600 mb-6'>Get detailed answers to your questions</p>
              <Link 
                href='mailto:support@vesoko.com' 
                className='inline-flex items-center gap-2 bg-vesoko_primary text-white px-6 py-3 rounded-lg font-medium hover:bg-vesoko_primary transition-colors'
              >
                <Mail className='h-5 w-5' />
                support@vesoko.com
              </Link>
            </div>

            <div className='bg-white rounded-2xl p-8 shadow-lg border border-gray-200'>
              <Phone className='h-12 w-12 text-vesoko_primary mx-auto mb-6' />
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>Call Us</h3>
              <p className='text-gray-600 mb-2'>Speak directly with our support team</p>
              <Link href='tel:+19599990661' className='text-vesoko_primary hover:text-vesoko_primary font-medium text-lg transition-colors block mb-4'>+1 (959) 999-0661</Link>
              <MessageSquare className='h-12 w-12 text-vesoko_dark_green mx-auto mb-6' />
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>WhatsApp</h3>
              <p className='text-gray-600 mb-2'>Chat with us on WhatsApp</p>
              <Link href='https://wa.me/18608169330' target='_blank' rel='noopener noreferrer' className='text-vesoko_dark_green hover:text-vesoko_primary font-medium text-lg transition-colors block'>+1 (860) 816-9330</Link>
            </div>
          </div>

          <div className='bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-8'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>📚 Additional Resources</h3>
            <div className='grid md:grid-cols-2 gap-4'>
              <Link 
                href='/faq' 
                className='flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors'
              >
                <Info className='h-5 w-5' />
                FAQ Section
              </Link>
              <Link 
                href='/sellers' 
                className='flex items-center justify-center gap-2 bg-vesoko_primary text-white px-6 py-3 rounded-lg font-medium hover:bg-vesoko_primary transition-colors'
              >
                <ExternalLink className='h-5 w-5' />
                Seller Onboarding
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className='py-24 bg-gradient-to-r from-vesoko_primary to-vesoko_primary'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl md:text-4xl font-bold text-white mb-6'>
            Ready to Start Selling?
          </h2>
          
          <p className='text-xl text-white mb-8 max-w-2xl mx-auto'>
            Join the premier marketplace for authentic African products and connect with customers worldwide.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
            <Link
              href='/select-store-type'
              className='group inline-flex items-center gap-3 bg-white text-vesoko_primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            >
              <Store className='h-6 w-6' />
              Start Your Application
              <ArrowRight className='h-5 w-5 group-hover:translate-x-1 transition-transform duration-300' />
            </Link>
            
            <Link
              href='/contact'
              className='inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300'
            >
              <MessageSquare className='h-5 w-5' />
              Contact Us First
            </Link>
          </div>

          <div className='text-blue-200 text-sm'>
            🌍 <strong>VeSoko</strong> - Connecting African businesses with global opportunities
          </div>
        </div>
      </div>
    </div>
  );
};

SellersGuide.noLayout = true;
export default SellersGuide;

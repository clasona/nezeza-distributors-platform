import React from 'react';
import { useForm } from 'react-hook-form';
import Head from 'next/head';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Users, Building, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TextInput from '@/components/FormInputs/TextInput';
import TextAreaInput from '@/components/FormInputs/TextAreaInput';
import DropdownInput from '@/components/FormInputs/DropdownInput';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import Link from 'next/link';

const Contact = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'seller', label: 'Becoming a Seller' },
    { value: 'wholesaler', label: 'Wholesale Opportunities' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'support', label: 'Technical Support' },
    { value: 'press', label: 'Press & Media' },
    { value: 'other', label: 'Other' }
  ];



  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setSuccessMessage(null);
    try {
      const response = await fetch('http://localhost:8000/api/v1/contact/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message || "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.");
        setSuccessMessage(result.message || "Your message was sent successfully! We'll get back to you within 24 hours.");
        reset();
      } else {
        toast.error(result.message || 'Failed to send message. Please try again.');
        setSuccessMessage(null);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["marketplace@vesoko.com", "support@vesoko.com"],
      description: "We typically respond within 24 hours"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+1 (959) 999-0661", "+1 (270) 363-7134"],
      description: "Monday - Friday, 9 AM - 6 PM EST"
    },
    // {
    //   icon: <MapPin className="w-6 h-6" />,
    //   title: "Visit Us",
    //   details: ["123 Business District", "New York, NY 10001"],
    //   description: "By appointment only"
    // },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: ["Monday - Friday: 8 AM - 6 PM EST", "Weekend: Emergency only"],
      description: "We're here to help!"
    }
  ];

  const departments = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Sales & Partnerships",
      description: "Interested in joining VeSoko as a seller or exploring partnership opportunities?",
      email: "marketplace@vesoko.com",
      color: "from-vesoko_green_600 to-green-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Customer Support",
      description: "Need help with your account, orders, or have technical questions?",
      email: "support@vesoko.com",
      color: "from-vesoko_dark_blue to-blue-600"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Business Development",
      description: "Enterprise solutions, wholesale inquiries, and strategic partnerships.",
      email: "marketplace@vesoko.com",
      color: "from-purple-600 to-purple-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Press & Media",
      description: "Media inquiries, press releases, and brand collaboration requests.",
      email: "marketplace@vesoko.com",
      color: "from-orange-600 to-orange-500"
    }
  ];

  return (
    <>
      <Head>
        <title>Contact VeSoko - Get in Touch with Our Team</title>
        <meta name="description" content="Contact VeSoko for inquiries about selling, partnerships, support, or general questions. We're here to help connect African products to global markets." />
        <meta property="og:title" content="Contact VeSoko - Get in Touch with Our Team" />
        <meta property="og:description" content="Contact VeSoko for inquiries about selling, partnerships, support, or general questions." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="flex flex-col min-h-screen bg-vesoko_powder_blue">        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-vesoko_dark_blue via-blue-700 to-vesoko_green_600 text-white py-16 sm:py-24">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Get in <span className="text-vesoko_yellow">Touch</span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                We'd love to hear from you. Whether you're interested in selling, partnerships, 
                or just want to learn more about VeSoko, we're here to help.
              </p>
            </div>
          </section>

          {/* Department Cards */}
          <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">How Can We Help?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Choose the department that best fits your inquiry for the fastest response.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {departments.map((dept, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${dept.color} rounded-2xl flex items-center justify-center text-white`}>
                      {dept.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{dept.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 text-center">{dept.description}</p>
                    <div className="text-center">
                      <Link 
                        href={`mailto:${dept.email}`}
                        className="text-vesoko_dark_blue hover:text-vesoko_green_600 font-medium text-sm transition-colors duration-300"
                      >
                        {dept.email}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Form & Info */}
          <section className="py-16 sm:py-24 bg-gradient-to-br from-vesoko_light_blue via-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h3>
                    <p className="text-gray-600">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <TextInput
                        label="First Name"
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Enter your first name"
                        register={register}
                        errors={errors}
                        isRequired={true}
                      />
                      <TextInput
                        label="Last Name"
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Enter your last name"
                        register={register}
                        errors={errors}
                        isRequired={true}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <TextInput
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        register={register}
                        errors={errors}
                        isRequired={true}
                      />
                      <TextInput
                        label="Phone Number"
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        register={register}
                        errors={errors}
                        isRequired={false}
                      />
                    </div>

                    <DropdownInput
                      label="Inquiry Type"
                      id="inquiryType"
                      name="inquiryType"
                      options={inquiryTypes}
                      register={register}
                      errors={errors}
                      isRequired={false}
                    />

                    <TextInput
                      label="Subject"
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      register={register}
                      errors={errors}
                      isRequired={true}
                    />

                    <TextAreaInput
                      label="Message"
                      id="message"
                      name="message"
                      register={register}
                      errors={errors}
                      isRequired={true}
                      className=""
                    />

                    <SubmitButton
                      buttonTitle={isLoading ? 'Sending...' : 'Send Message'}
                      loadingButtonTitle="Sending..."
                      isLoading={isLoading}
                      className="w-full bg-gradient-to-r from-vesoko_green_600 to-vesoko_dark_blue text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow duration-300"
                    />
                    {successMessage && (
                      <div className="mt-4 text-green-600 text-center text-base font-medium animate-fade-in">
                        {successMessage}
                      </div>
                    )}
                  </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We're always excited to hear from potential sellers, partners, and customers. 
                      Reach out to us through any of the channels below.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-vesoko_green_600 to-vesoko_dark_blue rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            {info.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{info.title}</h4>
                            {info.details.map((detail, idx) => (
                              <p key={idx} className="text-gray-700 font-medium mb-1">{detail}</p>
                            ))}
                            <p className="text-gray-500 text-sm">{info.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FAQ Link */}
                  <div className="bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 text-white rounded-xl p-6">
                    <h4 className="font-semibold mb-3">Need Quick Answers?</h4>
                    <p className="text-white/90 mb-4">
                      Check out our FAQ section for immediate answers to common questions.
                    </p>
                    <Link
                      href="/faq"
                      className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors duration-300"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Visit FAQ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

      </div>
    </>
  );
};

export default Contact;

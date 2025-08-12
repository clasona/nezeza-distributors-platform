import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '@/components/header/Header';
import Footer from '@/components/Footer';
import FAQComponent from '@/components/Content/FAQComponent';
import { Search, Filter, HelpCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { FAQ, getAllFAQs, searchContent } from '@/utils/content/contentApi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const FAQPage = () => {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUserType, setSelectedUserType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'seller', label: 'Selling' },
    { value: 'shopper', label: 'Shopping' },
    { value: 'payments', label: 'Payments' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'returns', label: 'Returns' },
    { value: 'account', label: 'Account' },
    { value: 'technical', label: 'Technical' }
  ];

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'seller', label: 'Sellers' },
    { value: 'shopper', label: 'Shoppers' },
    { value: 'wholesaler', label: 'Wholesalers' },
    { value: 'retailer', label: 'Retailers' },
    { value: 'manufacturer', label: 'Manufacturers' }
  ];

  // Load FAQs on component mount
  useEffect(() => {
    loadFAQs();
  }, []);

  // Filter FAQs when filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      filterFAQs();
    }
  }, [selectedCategory, selectedUserType, faqs, searchQuery]);

  const loadFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await getAllFAQs({ published: true });
      setFAQs(response.data);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQs = () => {
    let filtered = faqs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (selectedUserType !== 'all') {
      filtered = filtered.filter(faq => faq.userType === selectedUserType || faq.userType === 'all');
    }

    // Sort by featured first, then by helpful count, then by views
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      if (a.helpfulCount !== b.helpfulCount) {
        return b.helpfulCount - a.helpfulCount;
      }
      return b.views - a.views;
    });

    setFilteredFAQs(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      filterFAQs();
      return;
    }

    try {
      setIsSearching(true);
      const response = await searchContent(searchQuery, 'faqs');
      let searchResults = response.data.faqs || [];

      // Apply filters to search results
      if (selectedCategory !== 'all') {
        searchResults = searchResults.filter(faq => faq.category === selectedCategory);
      }

      if (selectedUserType !== 'all') {
        searchResults = searchResults.filter(faq => faq.userType === selectedUserType || faq.userType === 'all');
      }

      setFilteredFAQs(searchResults);
    } catch (error) {
      console.error('Error searching FAQs:', error);
      setFilteredFAQs([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedUserType('all');
  };

  const featuredFAQs = faqs.filter(faq => faq.featured).slice(0, 6);

  return (
    <>
      <Head>
        <title>Frequently Asked Questions - VeSoko Help Center</title>
        <meta name="description" content="Find answers to common questions about VeSoko, selling African products, buying, shipping, payments, and more. Get help with your account and technical issues." />
        <meta property="og:title" content="Frequently Asked Questions - VeSoko Help Center" />
        <meta property="og:description" content="Find answers to common questions about VeSoko. Get help with selling, buying, shipping, payments, and account issues." />
        <meta property="og:type" content="website" />
      </Head>

      <div className="flex flex-col min-h-screen bg-vesoko_powder_blue">
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-vesoko_dark_blue via-blue-700 to-vesoko_green_600 text-white py-16 sm:py-24">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-8 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                How can we <span className="text-vesoko_yellow">help</span>?
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
                Find answers to common questions about VeSoko, selling, buying, and more.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for answers..."
                    className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 focus:ring-2 focus:ring-vesoko_yellow/50 focus:outline-none text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-vesoko_green_600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-vesoko_green_700 transition-colors duration-300 disabled:opacity-50"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Quick Links */}
          {!searchQuery && featuredFAQs.length > 0 && (
            <section className="py-16 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Popular Questions</h2>
                  <p className="text-xl text-gray-600">Quick answers to the most frequently asked questions</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredFAQs.map((faq) => (
                    <div key={faq._id} className="bg-vesoko_light_blue rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {faq.answer.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          {faq.views} views
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-vesoko_green_600 text-white`}>
                          {faq.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Filters & Results */}
          <section className="py-16 bg-gradient-to-br from-vesoko_light_blue via-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Filters */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <div className="flex items-center gap-4 mb-6">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Filter Results</h3>
                  {(selectedCategory !== 'all' || selectedUserType !== 'all' || searchQuery) && (
                    <button
                      onClick={clearFilters}
                      className="text-vesoko_dark_blue hover:text-vesoko_green_600 text-sm font-medium transition-colors duration-200"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vesoko_green_600 focus:border-vesoko_green_600"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                    <select
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vesoko_green_600 focus:border-vesoko_green_600"
                    >
                      {userTypes.map((userType) => (
                        <option key={userType.value} value={userType.value}>
                          {userType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vesoko_green_600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading FAQs...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Frequently Asked Questions'}
                      </h2>
                      <p className="text-gray-600">
                        {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''} found
                      </p>
                    </div>

                    <FAQComponent 
                      faqs={filteredFAQs}
                      showCategories={selectedCategory === 'all'}
                      showUserTypes={selectedUserType === 'all'}
                      selectedCategory={selectedCategory}
                      selectedUserType={selectedUserType}
                    />
                  </>
                )}
              </div>

              {/* Still Need Help */}
              <div className="mt-12 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 text-white rounded-2xl p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-vesoko_yellow" />
                <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you with any questions or issues you may have.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-white text-vesoko_dark_blue px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-300">
                    Contact Support
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/customer/support" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-vesoko_dark_blue transition-colors duration-300">
                    Open Ticket
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

      </div>
    </>
  );
};

export default FAQPage;

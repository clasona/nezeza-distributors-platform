import React from 'react';
import Head from 'next/head';
import { ContentPage as ContentPageType } from '@/utils/content/contentApi';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface ContentPageProps {
  page: ContentPageType;
  backUrl?: string;
  backLabel?: string;
}

const ContentPageComponent: React.FC<ContentPageProps> = ({ 
  page, 
  backUrl = '/', 
  backLabel = 'Back to Home' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatReadingTime = (content: string) => {
    // Estimate reading time (average 200 words per minute)
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200);
    return readingTime === 1 ? '1 min read' : `${readingTime} min read`;
  };

  return (
    <>
      <Head>
        <title>{page.seoTitle || page.title} | VeSoko</title>
        <meta name="description" content={page.seoDescription || page.excerpt || page.title} />
        <meta property="og:title" content={page.seoTitle || page.title} />
        <meta property="og:description" content={page.seoDescription || page.excerpt || page.title} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={page.seoTitle || page.title} />
        <meta name="twitter:description" content={page.seoDescription || page.excerpt || page.title} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-vesoko_powder_blue via-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link 
              href={backUrl}
              className="inline-flex items-center gap-2 text-vesoko_dark_blue hover:text-vesoko_green_600 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="text-sm font-medium">{backLabel}</span>
            </Link>
          </div>

          {/* Article Header */}
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <header className="p-6 sm:p-8 lg:p-12 bg-gradient-to-r from-vesoko_dark_blue to-vesoko_green_600 text-white">
              <div className="space-y-4">
                {/* Category Badge */}
                <div className="inline-flex items-center">
                  <span className="px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full uppercase tracking-wide">
                    {page.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  {page.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(page.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatReadingTime(page.content)}</span>
                  </div>
                  {page.createdBy && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{page.createdBy.firstName} {page.createdBy.lastName}</span>
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                {page.excerpt && (
                  <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl">
                    {page.excerpt}
                  </p>
                )}
              </div>
            </header>

            {/* Article Content */}
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed space-y-6"
                  dangerouslySetInnerHTML={{ 
                    __html: page.content.replace(/\n/g, '<br />') 
                  }} 
                />
              </div>

              {/* Tags */}
              {page.tags && page.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {page.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-vesoko_light_blue text-vesoko_dark_blue rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Last Updated */}
          {page.updatedAt !== page.createdAt && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Last updated: {formatDate(page.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContentPageComponent;

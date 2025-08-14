import { GetServerSideProps } from 'next';
import ContentPageComponent from '@/components/Content/ContentPage';
import { getContentPageBySlug, ContentPage } from '@/utils/content/contentApi';

interface ContentPageProps {
  page: ContentPage;
}

const ContentPageWrapper: React.FC<ContentPageProps> = ({ page }) => {
  return (
    <div className="flex flex-col min-h-screen bg-vesoko_primary">
      <ContentPageComponent 
        page={page} 
        backUrl="/" 
        backLabel="Back to Home" 
      />
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };

  try {
    const response = await getContentPageBySlug(slug);
    
    if (!response.success) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        page: response.data,
      },
    };
  } catch (error) {
    console.error('Error fetching content page:', error);
    
    return {
      notFound: true,
    };
  }
};

export default ContentPageWrapper;

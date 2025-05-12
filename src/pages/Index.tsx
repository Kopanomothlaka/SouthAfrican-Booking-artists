
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedArtists from '@/components/FeaturedArtists';
import Categories from '@/components/Categories';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedArtists />
      <Categories />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;

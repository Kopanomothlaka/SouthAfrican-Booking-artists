import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturedArtists from '@/components/FeaturedArtists';
import Categories from '@/components/Categories';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // First check if user is a client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        if (!clientError && clientData) {
          // User is a client
          navigate('/client-dashboard');
          return;
        } else {
          // Check if user is in users table (for admin/artist)
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (userData?.role === 'admin') {
            navigate('/admin');
            return;
          } else {
            // Check if user is an artist
            const { data: artistData } = await supabase
              .from('artists')
              .select('status')
              .eq('id', session.user.id)
              .single();

            if (artistData) {
              if (artistData.status === 'approved') {
                navigate('/artist/dashboard');
                return;
              } else {
                navigate('/pending-approval');
                return;
              }
            }
          }
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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

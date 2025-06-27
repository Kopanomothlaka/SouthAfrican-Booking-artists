import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

const categoryDefinitions = [
  { id: 'musicians', name: 'Musicians', icon: '🎸' },
  { id: 'djs', name: 'DJs', icon: '🎧' },
  { id: 'dancers', name: 'Dancers', icon: '💃' },
  { id: 'comedians', name: 'Comedians', icon: '🎭' },
  { id: 'mcs', name: 'MCs', icon: '🎤' },
  { id: 'bands', name: 'Bands', icon: '🥁' },
];

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        
        // Fetch all active and available bookings (same as ArtistsList)
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            artists!inner(
              id,
              artist_name,
              full_name
            )
          `)
          .eq('is_active', true)
          .eq('status', 'available');

        if (error) {
          console.error('Error fetching bookings:', error);
          // Fallback to default categories with 0 counts
          setCategories(categoryDefinitions.map(cat => ({ ...cat, count: 0 })));
          return;
        }

        // Count bookings by category
        const categoryCounts = categoryDefinitions.map(categoryDef => {
          const count = bookingsData.filter(booking => booking.category === categoryDef.id).length;
          return {
            ...categoryDef,
            count
          };
        });

        setCategories(categoryCounts);
      } catch (error) {
        console.error('Error fetching category counts:', error);
        // Fallback to default categories with 0 counts
        setCategories(categoryDefinitions.map(cat => ({ ...cat, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display mb-4">Browse by Category</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Find the perfect artist for your event from our wide selection of talented performers
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryDefinitions.map((category, index) => (
              <Card 
                key={category.id}
                className="overflow-hidden border-border/50 animate-pulse"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-bold font-display">{category.name}</h3>
                  <div className="h-4 bg-gray-200 rounded mt-1"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button disabled>Explore All Categories</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-display mb-4">Browse by Category</h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Find the perfect artist for your event from our wide selection of talented performers
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Card 
              key={category.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold font-display">{category.name}</h3>
                <p className="text-sm text-foreground/70 mt-1">{category.count} Artists</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/categories">
            <Button>Explore All Categories</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;

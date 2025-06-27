import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ArtistCard, { Artist } from './ArtistCard';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FeaturedArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchFeaturedBookings = async () => {
      try {
        setLoading(true);
        
        // Fetch active bookings with artist information (same as ArtistsList)
        const { data: bookingsData, error } = await supabase
          .from('bookings')
          .select(`
            *,
            artists!inner(
              id,
              artist_name,
              full_name
            ),
            images:booking_images(*)
          `)
          .eq('is_active', true)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(5); // Limit to top 5

        if (error) {
          console.error('Error fetching bookings:', error);
          return;
        }

        // Transform booking data to match Artist interface (same as ArtistsList)
        const transformedBookings: Artist[] = bookingsData.map((booking: any, index) => {
          // Get the primary image or first image from the booking
          let bookingImage = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop'; // fallback
          
          if (booking.images && booking.images.length > 0) {
            // Try to find the primary image first
            const primaryImage = booking.images.find((img: any) => img.is_primary);
            if (primaryImage) {
              bookingImage = primaryImage.image_url;
            } else {
              // If no primary image, use the first image
              bookingImage = booking.images[0].image_url;
            }
          }

          return {
            id: booking.id,
            name: booking.artists.artist_name || booking.artists.full_name || booking.title,
            category: getCategoryLabel(booking.category),
            image: bookingImage,
            fee: booking.booking_fee ? `R${booking.booking_fee.toLocaleString()}` : 'Contact for pricing',
            location: booking.location || 'Location not specified',
            featured: index < 5 // First 5 are featured
          };
        });

        setArtists(transformedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBookings();
  }, []);

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'musicians': 'Musician',
      'djs': 'DJ',
      'dancers': 'Dancer',
      'comedians': 'Comedian',
      'mcs': 'MC',
      'bands': 'Band'
    };
    return categoryMap[category] || category;
  };

  const hasMore = visibleCount < artists.length;
  
  if (loading) {
    return (
      <div className="py-16 bg-gradient-to-b from-background to-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold font-display">Featured Artists</h2>
            <Button variant="outline">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-4 bg-white rounded-b-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold font-display">Featured Artists</h2>
          <Button variant="outline">
            View All
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {artists.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artists.slice(0, visibleCount).map((artist, index) => (
                <ArtistCard key={artist.id} artist={artist} index={index} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-10 text-center">
                <Button 
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 5)}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured artists available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedArtists;

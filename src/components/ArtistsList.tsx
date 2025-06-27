import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtistCard, { Artist } from './ArtistCard';
import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const ArtistsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Fetch booking details from database
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Fetch active bookings with artist information
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
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching bookings:', error);
          return;
        }

        // Transform booking data to match Artist interface
        const transformedBookings: Artist[] = bookingsData.map((booking: any) => {
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
            featured: false
          };
        });

        setAllArtists(transformedBookings);
        setFilteredArtists(transformedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Get unique categories and locations for filters
  const categories = [...new Set(allArtists.map(artist => artist.category))];
  const locations = [...new Set(allArtists.map(artist => artist.location))];

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
  
  useEffect(() => {
    // Check for category in URL query params
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    
    if (categoryParam) {
      // Map the URL category param to the actual category
      const categoryMap: Record<string, string> = {
        'musicians': 'Musician',
        'djs': 'DJ',
        'comedians': 'Comedian',
        'dancers': 'Dancer',
        'mcs': 'MC',
        'bands': 'Band'
      };
      
      if (categoryMap[categoryParam]) {
        setSelectedCategory(categoryMap[categoryParam]);
      }
    }
  }, [location]);
  
  useEffect(() => {
    let results = allArtists;
    
    if (searchTerm) {
      results = results.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      results = results.filter(artist => artist.category === selectedCategory);
    }
    
    if (selectedLocation && selectedLocation !== 'all') {
      results = results.filter(artist => artist.location === selectedLocation);
    }
    
    setFilteredArtists(results);
  }, [searchTerm, selectedCategory, selectedLocation, allArtists]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <Input
                  placeholder="Search artists..."
                  disabled
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
              </div>
            </div>
            
            <div className="w-full md:w-1/3">
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
              </Select>
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground/70">Loading booking offers...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-16">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Input
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-1/3">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredArtists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No booking offers found</h3>
            <p className="text-foreground/70 mb-4">
              {allArtists.length === 0 
                ? "No booking offers are currently available" 
                : "Try adjusting your search criteria"
              }
            </p>
            {allArtists.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsList;

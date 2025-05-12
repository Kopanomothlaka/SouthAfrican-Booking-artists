
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ArtistCard, { Artist } from './ArtistCard';
import { ChevronRight } from 'lucide-react';

// Mock data for featured artists
const featuredArtists: Artist[] = [
  {
    id: 1,
    name: 'Black Coffee',
    category: 'DJ',
    image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=2072&auto=format&fit=crop',
    fee: 'R25,000',
    location: 'Johannesburg',
    featured: true
  },
  {
    id: 2,
    name: 'Sho Madjozi',
    category: 'Musician',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=2070&auto=format&fit=crop',
    fee: 'R30,000',
    location: 'Limpopo',
    featured: true
  },
  {
    id: 3,
    name: 'Trevor Noah',
    category: 'Comedian',
    image: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=1856&auto=format&fit=crop',
    fee: 'R45,000',
    location: 'Cape Town',
    featured: true
  },
  {
    id: 4,
    name: 'Lira',
    category: 'Musician',
    image: 'https://images.unsplash.com/photo-1529518969858-8baa65152fc8?q=80&w=1932&auto=format&fit=crop',
    fee: 'R35,000',
    location: 'Pretoria',
    featured: true
  },
];

const FeaturedArtists = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const hasMore = visibleCount < featuredArtists.length;
  
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
          {featuredArtists.slice(0, visibleCount).map((artist, index) => (
            <ArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
        
        {hasMore && (
          <div className="mt-10 text-center">
            <Button 
              variant="outline"
              onClick={() => setVisibleCount(prev => prev + 4)}
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedArtists;

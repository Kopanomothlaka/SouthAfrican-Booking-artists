
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtistCard, { Artist } from './ArtistCard';
import { Search } from 'lucide-react';

// Mock data for artists
const allArtists: Artist[] = [
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
  {
    id: 5,
    name: 'DJ Zinhle',
    category: 'DJ',
    image: 'https://images.unsplash.com/photo-1571935441005-72a3abac439e?q=80&w=1974&auto=format&fit=crop',
    fee: 'R20,000',
    location: 'Johannesburg'
  },
  {
    id: 6,
    name: 'AKA',
    category: 'Musician',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop',
    fee: 'R40,000',
    location: 'Durban'
  },
  {
    id: 7,
    name: 'Loyiso Gola',
    category: 'Comedian',
    image: 'https://images.unsplash.com/photo-1612731486606-2614b4d74921?q=80&w=1974&auto=format&fit=crop',
    fee: 'R18,000',
    location: 'Cape Town'
  },
  {
    id: 8,
    name: 'Heavy K',
    category: 'DJ',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
    fee: 'R15,000',
    location: 'East London'
  },
];

const ArtistsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>(allArtists);
  
  // Get unique categories and locations for filters
  const categories = [...new Set(allArtists.map(artist => artist.category))];
  const locations = [...new Set(allArtists.map(artist => artist.location))];
  
  useEffect(() => {
    let results = allArtists;
    
    if (searchTerm) {
      results = results.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      results = results.filter(artist => artist.category === selectedCategory);
    }
    
    if (selectedLocation) {
      results = results.filter(artist => artist.location === selectedLocation);
    }
    
    setFilteredArtists(results);
  }, [searchTerm, selectedCategory, selectedLocation]);
  
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
                <SelectItem value="">All Categories</SelectItem>
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
                <SelectItem value="">All Locations</SelectItem>
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
            <h3 className="text-xl font-semibold mb-2">No artists found</h3>
            <p className="text-foreground/70 mb-4">Try adjusting your search criteria</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLocation('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistsList;

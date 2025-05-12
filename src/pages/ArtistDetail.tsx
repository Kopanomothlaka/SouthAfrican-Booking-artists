
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Artist } from '@/components/ArtistCard';
import { Calendar, MapPin, Clock, Music, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

interface ArtistDetailInfo extends Artist {
  bio?: string;
  experience?: string;
  performances?: string[];
  awards?: string[];
}

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistDetailInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundArtist = allArtists.find(a => a.id.toString() === id);
      
      if (foundArtist) {
        // Add additional details for the artist
        const enhancedArtist: ArtistDetailInfo = {
          ...foundArtist,
          bio: "One of South Africa's most acclaimed artists with international recognition and a unique style that has captivated audiences worldwide.",
          experience: "10+ years",
          performances: ["Coachella", "Ultra Music Festival", "AfroPunk Johannesburg", "Cape Town International Jazz Festival"],
          awards: ["South African Music Award (Best DJ)", "DJ Awards (Best Deep House DJ)", "International Recognition Award"]
        };
        
        setArtist(enhancedArtist);
      }
      
      setLoading(false);
    }, 800);
  }, [id]);
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="container py-16 text-center">
          <div className="animate-pulse-slow">Loading artist details...</div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!artist) {
    return (
      <>
        <Header />
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
          <p className="mb-6">The artist you're looking for doesn't exist or has been removed.</p>
          <Link to="/artists">
            <Button>Browse All Artists</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      
      <div className="bg-secondary/30 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 animate-fade-in">
            <div className="w-full md:w-1/3">
              <div className="sticky top-24">
                <img 
                  src={artist.image}
                  alt={artist.name}
                  className="rounded-xl shadow-lg w-full object-cover aspect-[3/4]"
                />
                
                <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Booking Fee</h3>
                    <span className="text-xl font-bold text-primary">{artist.fee}</span>
                  </div>
                  
                  <p className="text-sm text-foreground/70 mb-6">
                    Starting price for a standard booking. Final price may vary based on event details.
                  </p>
                  
                  <Button className="w-full">Request to Book</Button>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge>{artist.category}</Badge>
                <div className="flex items-center text-sm text-foreground/70">
                  <MapPin className="h-4 w-4 mr-1" /> {artist.location}
                </div>
              </div>
              
              <h1 className="text-4xl font-display font-bold mb-6">{artist.name}</h1>
              
              <div className="prose max-w-none mb-8">
                <p>{artist.bio}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <h3 className="font-medium text-sm">Experience</h3>
                      <p className="text-foreground/70">{artist.experience}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <h3 className="font-medium text-sm">Availability</h3>
                      <p className="text-foreground/70">Check Calendar</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-display font-bold mb-4">Notable Performances</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artist.performances?.map(performance => (
                    <div 
                      key={performance}
                      className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-border/50"
                    >
                      <Music className="h-4 w-4 text-primary mr-3" />
                      <span>{performance}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold mb-4">Awards & Recognition</h2>
                <div className="grid grid-cols-1 gap-3">
                  {artist.awards?.map(award => (
                    <div 
                      key={award}
                      className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-border/50"
                    >
                      <Award className="h-4 w-4 text-primary mr-3" />
                      <span>{award}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ArtistDetail;

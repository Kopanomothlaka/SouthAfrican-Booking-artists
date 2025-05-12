
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArtistsList from '@/components/ArtistsList';

const Artists = () => {
  return (
    <>
      <Header />
      
      <div className="bg-gradient-to-b from-secondary/50 to-background py-12">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">Book Top South African Artists</h1>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Browse our curated selection of South Africa's most talented performers and book them for your next event
            </p>
          </div>
        </div>
      </div>
      
      <ArtistsList />
      
      <Footer />
    </>
  );
};

export default Artists;

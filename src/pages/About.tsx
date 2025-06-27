import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { 
  Heart, 
  Users, 
  Star, 
  Globe, 
  Shield, 
  Zap, 
  Music, 
  Mic,
  Laugh,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Target
} from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Diverse Talent Pool",
      description: "Connect with talented South African artists across multiple categories including musicians, DJs, dancers, comedians, and more."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Booking System",
      description: "Safe and reliable booking process with secure payments and transparent communication between clients and artists."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Booking",
      description: "Quick and easy booking process with real-time availability and instant confirmation from artists."
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Quality Assurance",
      description: "All artists are verified and approved to ensure you get the best talent for your events."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Local & National Reach",
      description: "Find artists in your local area or book talent from across South Africa for your special events."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Supporting Local Artists",
      description: "We're committed to supporting and promoting South African artistic talent and cultural expression."
    }
  ];

  const categories = [
    { icon: <Music className="h-6 w-6" />, name: "Musicians", description: "Live bands, solo artists, instrumentalists" },
    { icon: <Mic className="h-6 w-6" />, name: "DJs", description: "Professional DJs for all occasions" },
    { icon: <Zap className="h-6 w-6" />, name: "Dancers", description: "Professional dancers and dance groups" },
    { icon: <Laugh className="h-6 w-6" />, name: "Comedians", description: "Stand-up comedians and entertainers" },
    { icon: <Mic className="h-6 w-6" />, name: "MCs", description: "Master of Ceremonies for events" },
    { icon: <Music className="h-6 w-6" />, name: "Bands", description: "Full bands and musical groups" }
  ];

  const stats = [
    { number: "500+", label: "Verified Artists" },
    { number: "1000+", label: "Successful Bookings" },
    { number: "50+", label: "Cities Covered" },
    { number: "98%", label: "Client Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              The BookSA Story
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Connecting South African Talent with the World
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              BookSA was born from a simple yet powerful vision: to create a platform that celebrates and connects 
              the incredible artistic talent that South Africa has to offer with people who need exceptional entertainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/artists">Browse Artists</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/join-as-artist">Join as Artist</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-xl text-muted-foreground">
              How BookSA became the leading platform for South African artists
            </p>
          </div>
          
          <div className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">The Beginning</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      In 2024, we recognized a gap in the South African entertainment industry. Talented artists 
                      struggled to find opportunities, while event organizers and clients had difficulty discovering 
                      and booking quality performers. This inspired us to create BookSA - a platform that bridges 
                      this gap and celebrates South African creativity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We believe in the power of South African creativity and the importance of supporting local artists. 
                      Our mission is to provide a platform where artists can showcase their talent, grow their careers, 
                      and connect with clients who appreciate authentic, high-quality entertainment. We're committed to 
                      promoting cultural diversity and celebrating the rich artistic heritage of South Africa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      To become the leading platform for South African artists, providing them with opportunities 
                      to showcase their talent, grow their careers, and connect with clients across the country 
                      and beyond. We envision a future where every talented South African artist has the opportunity 
                      to thrive and where every event is enhanced by exceptional local talent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">BookSA by the Numbers</h2>
            <p className="text-xl text-muted-foreground">
              Our impact on the South African entertainment industry
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose BookSA?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We provide a comprehensive platform that benefits both artists and clients, 
            making event planning and talent booking seamless and enjoyable.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <div className="text-primary">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-muted/50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Artist Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover talented artists across various entertainment categories
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <div className="text-primary">
                        {category.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How BookSA Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple steps to book amazing South African artists for your events
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <div className="text-2xl font-bold text-primary">1</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Artists</h3>
            <p className="text-muted-foreground">
              Explore our curated selection of verified South African artists across all categories
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <div className="text-2xl font-bold text-primary">2</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Book Your Artist</h3>
            <p className="text-muted-foreground">
              Select your preferred artist, choose your date and time, and submit your booking request
            </p>
          </div>
          
          <div className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <div className="text-2xl font-bold text-primary">3</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Enjoy Your Event</h3>
            <p className="text-muted-foreground">
              Once confirmed, your artist will deliver an amazing performance at your event
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about BookSA? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground">info@booksa.co.za</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground">+27 123 456 789</p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-muted-foreground">Johannesburg, South Africa</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience BookSA?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients and artists who trust BookSA for their entertainment needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/artists">Browse Artists Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/join-as-artist">Join as Artist</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 
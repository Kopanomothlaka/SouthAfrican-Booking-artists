import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const JoinAsArtist = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    artistName: '',
    category: '',
    location: '',
    bio: '',
    experience: ''
  });
  
  const [idDocument, setIdDocument] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type (accept only PDF, JPG, PNG)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, JPG, or PNG file",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setIdDocument(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!idDocument) {
      toast({
        title: "ID Document Required",
        description: "Please upload your ID document",
        variant: "destructive"
      });
      return;
    }

    // For now, just show success message
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you soon.",
    });
    
    console.log('Artist registration data:', { ...formData, idDocument: idDocument.name });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold mb-4">Join as an Artist</h1>
            <p className="text-foreground/70">
              Ready to showcase your talent? Join BookSA and connect with audiences across South Africa.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Artist Registration</CardTitle>
              <CardDescription>
                Fill out the form below to apply as an artist on our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Artist/Stage Name</Label>
                    <Input
                      id="artistName"
                      name="artistName"
                      value={formData.artistName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="musicians">Musician</option>
                      <option value="djs">DJ</option>
                      <option value="dancers">Dancer</option>
                      <option value="comedians">Comedian</option>
                      <option value="mcs">MC</option>
                      <option value="bands">Band</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Province"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself and your artistic style..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Describe your experience, notable performances, or achievements..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idDocument">ID Document</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="idDocument"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        required
                      />
                    </div>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {idDocument && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {idDocument.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload your ID document (PDF, JPG, or PNG, max 5MB)
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Submit Application
                </Button>

                <div className="text-center text-sm text-foreground/70">
                  Already have an account?{' '}
                  <Link to="/artist-login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default JoinAsArtist;

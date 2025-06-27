import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Plus, Calendar, DollarSign, MapPin, Clock } from 'lucide-react';

interface BookingFormData {
  title: string;
  description: string;
  category: string;
  booking_fee: string;
  experience_years: string;
  experience_description: string;
  availability_start: string;
  availability_end: string;
  availability_notes: string;
  location: string;
  max_duration_hours: string;
  min_duration_hours: string;
  contact_email: string;
  contact_phone: string;
}

interface CreateBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateBookingForm: React.FC<CreateBookingFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    title: '',
    description: '',
    category: '',
    booking_fee: '',
    experience_years: '',
    experience_description: '',
    availability_start: '',
    availability_end: '',
    availability_notes: '',
    location: '',
    max_duration_hours: '',
    min_duration_hours: '1',
    contact_email: '',
    contact_phone: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JPG, PNG, or WebP images",
        variant: "destructive"
      });
    }
    
    // Check file sizes (max 5MB each)
    const validSizeFiles = validFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validSizeFiles.length !== validFiles.length) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 5MB each",
        variant: "destructive"
      });
    }
    
    setImages(prev => [...prev, ...validSizeFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a booking",
          variant: "destructive"
        });
        return;
      }

      // Create booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          artist_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          booking_fee: parseFloat(formData.booking_fee),
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          experience_description: formData.experience_description,
          availability_start: formData.availability_start || null,
          availability_end: formData.availability_end || null,
          availability_notes: formData.availability_notes,
          location: formData.location,
          max_duration_hours: formData.max_duration_hours ? parseInt(formData.max_duration_hours) : null,
          min_duration_hours: parseInt(formData.min_duration_hours),
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Upload images if any
      if (images.length > 0) {
        const imagePromises = images.map(async (image, index) => {
          const fileExt = image.name.split('.').pop();
          const fileName = `${bookingData.id}-${Date.now()}-${index}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log(`Uploading image ${index + 1}:`, { fileName, filePath });

          const { error: uploadError } = await supabase.storage
            .from('booking-images')
            .upload(filePath, image);

          if (uploadError) throw uploadError;

          console.log(`Image ${index + 1} uploaded successfully`);

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('booking-images')
            .getPublicUrl(filePath);

          console.log(`Generated URL for image ${index + 1}:`, urlData.publicUrl);

          // Save image record
          const { error: imageError } = await supabase
            .from('booking_images')
            .insert({
              booking_id: bookingData.id,
              image_url: urlData.publicUrl,
              image_name: image.name,
              is_primary: index === 0, // First image is primary
              display_order: index
            });

          if (imageError) throw imageError;

          console.log(`Image ${index + 1} record saved to database`);
        });

        await Promise.all(imagePromises);
      }

      toast({
        title: "Booking Created!",
        description: "Your booking has been successfully created and is now available for clients.",
      });

      onSuccess?.();

    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Booking
        </CardTitle>
        <CardDescription>
          Create a new booking offer with your services, experience, and availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Booking Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Professional DJ for Wedding"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your services, what clients can expect, and any special features..."
              rows={4}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_fee">Booking Fee (ZAR) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="booking_fee"
                  name="booking_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.booking_fee}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Province"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                name="experience_years"
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={handleInputChange}
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_duration_hours">Minimum Duration (hours)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min_duration_hours"
                  name="min_duration_hours"
                  type="number"
                  min="1"
                  value={formData.min_duration_hours}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_description">Experience Description</Label>
            <Textarea
              id="experience_description"
              name="experience_description"
              value={formData.experience_description}
              onChange={handleInputChange}
              placeholder="Describe your experience, notable performances, awards, or specializations..."
              rows={3}
            />
          </div>

          {/* Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="availability_start">Available From</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="availability_start"
                  name="availability_start"
                  type="date"
                  value={formData.availability_start}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability_end">Available Until</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="availability_end"
                  name="availability_end"
                  type="date"
                  value={formData.availability_end}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_notes">Availability Notes</Label>
            <Textarea
              id="availability_notes"
              name="availability_notes"
              value={formData.availability_notes}
              onChange={handleInputChange}
              placeholder="Any specific availability details, preferred days, or scheduling notes..."
              rows={2}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="+27 123 456 789"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <Label>Booking Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="images" className="cursor-pointer">
                  <span className="text-primary hover:text-primary/80 font-medium">
                    Click to upload images
                  </span>
                  <span className="text-sm text-muted-foreground"> or drag and drop</span>
                </label>
                <input
                  id="images"
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                PNG, JPG, WebP up to 5MB each
              </p>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateBookingForm; 
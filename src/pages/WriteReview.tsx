import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Upload, 
  X, 
  ArrowLeft,
  Camera,
  Loader2
} from "lucide-react";
import heic2any from "heic2any";

interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  category?: string;
}

const WriteReview = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Product search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);



  // Check if user is authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  // Search for existing products
  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle image upload with HEIC conversion
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      file.name.toLowerCase().endsWith('.heic') || 
      file.name.toLowerCase().endsWith('.heif')
    );
    
    if (uploadedImages.length + imageFiles.length > 5) {
      setError("You can upload a maximum of 5 images");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const processedFiles: File[] = [];

      for (const file of imageFiles) {
        // Check if it's a HEIC/HEIF file
        if (file.name.toLowerCase().endsWith('.heic') || 
            file.name.toLowerCase().endsWith('.heif') ||
            file.type === 'image/heic' || 
            file.type === 'image/heif') {
          
          console.log('Converting HEIC file:', file.name);
          
          // Convert HEIC to JPEG
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          }) as Blob;
          
          // Create a new File object with the converted blob
          const convertedFile = new File([convertedBlob], 
            file.name.replace(/\.(heic|heif)$/i, '.jpg'), 
            { type: 'image/jpeg' }
          );
          
          processedFiles.push(convertedFile);
        } else {
          processedFiles.push(file);
        }
      }

      setUploadedImages(prev => [...prev, ...processedFiles]);
      
      // Create preview URLs
      processedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });

    } catch (err) {
      console.error('Error processing images:', err);
      setError('Error processing images. Please try again with different files.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images to Supabase storage
  const uploadImagesToStorage = async (reviewId: string): Promise<string[]> => {
    if (uploadedImages.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < uploadedImages.length; i++) {
      const file = uploadedImages[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${reviewId}_${i}_${Date.now()}.${fileExt}`;
      const filePath = `review-images/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('review-images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    return uploadedUrls;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('User:', user);
    console.log('Form data:', {
      productName: selectedProduct ? selectedProduct.name : searchQuery,
      reviewContent,
      rating
    });

    if (!user) {
      setError("You must be signed in to write a review");
      return;
    }

    // Check if we have a product name from either selectedProduct or searchQuery
    const finalProductName = selectedProduct ? selectedProduct.name : searchQuery.trim();
    if (!finalProductName) {
      setError("Please enter a product name");
      return;
    }

    if (!brandName.trim()) {
      setError("Please enter a brand name");
      return;
    }


    if (!reviewContent.trim()) {
      setError("Please enter your review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Starting database operations...');

      let productId: string;

      // If a product was selected from search, use its ID
      if (selectedProduct) {
        productId = selectedProduct.id;
        console.log('Using existing product ID:', productId);
      } else {
        // Create new product
        console.log('Creating new product...');
        
        // Upload first image to storage if available
        let productImageUrl = null;
        if (uploadedImages.length > 0) {
          const firstImage = uploadedImages[0];
          const fileExt = firstImage.name.split('.').pop();
          const fileName = `product_${Date.now()}.${fileExt}`;
          const filePath = `product-images/${fileName}`;
          
          try {
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('review-images')
              .upload(filePath, firstImage);
            
            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('review-images')
                .getPublicUrl(filePath);
              productImageUrl = urlData.publicUrl;
            }
          } catch (err) {
            console.error('Product image upload failed:', err);
          }
        }
        
        const { data: productData, error: productError } = await supabase
          .from('products')
          .insert({
            name: finalProductName,
            brand: brandName,
            category: 'General',
            image_url: productImageUrl
          })
          .select()
          .single();

        console.log('Product creation result:', { productData, productError });

        if (productError) {
          console.error('Product creation error:', productError);
          setError("Failed to create product: " + productError.message);
          return;
        }

        productId = productData.id;
        console.log('New product created with ID:', productId);
      }

      // Create the review
      console.log('Creating review...');
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          product_id: productId,
          rating: rating,
          content: reviewContent
        })
        .select()
        .single();

      console.log('Review creation result:', { reviewData, reviewError });

      if (reviewError) {
        console.error('Review creation error:', reviewError);
        setError("Failed to create review: " + reviewError.message);
        return;
      }

      // Upload images if any
      if (uploadedImages.length > 0) {
        const imageUrls = await uploadImagesToStorage(reviewData.id);
        // You could store these URLs in a separate review_images table
        console.log('Uploaded images:', imageUrls);
      }

      setSuccess("Review submitted successfully!");
      
      // Redirect to the product page after a short delay
      setTimeout(() => {
        navigate(`/product/${productId}`);
      }, 2000);

    } catch (err) {
      console.error('Submit error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || "");
    setSearchQuery(product.name);
    setShowSearchResults(false);
  };

  const clearSelectedProduct = () => {
    setSelectedProduct(null);
    setProductName("");
    setProductDescription("");
    setSearchQuery("");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Product Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product-search">Product Name *</Label>
                  <div className="relative">
                    <Input
                      id="product-search"
                      placeholder="Search for a product or enter a new one..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchResults(true);
                      }}
                      onFocus={() => setShowSearchResults(true)}
                    />
                    
                    {selectedProduct && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">Selected: {selectedProduct.name}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSelectedProduct}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                            onClick={() => selectProduct(product)}
                          >
                            <div className="font-medium">{product.name}</div>
                            {product.category && (
                              <div className="text-sm text-muted-foreground">{product.category}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brand Name */}
                <div className="space-y-2">
                  <Label htmlFor="brand-name">Brand Name *</Label>
                  <Input
                    id="brand-name"
                    placeholder="Enter the brand name..."
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-2xl transition-colors"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Review *</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your experience with this product..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    rows={6}
                    maxLength={1000}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {reviewContent.length}/1000 characters
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Photos (optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload images (max 5) - Supports JPG, PNG, HEIC
                      </p>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;

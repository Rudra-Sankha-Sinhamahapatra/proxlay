import React from "react";
import { useAuth } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { uploadVideoSchema, type UploadVideoFormData } from "@shared/schemas/youtube.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router";
import axiosClient from "@/lib/axios-client";
import { 
  Upload, 
  Video, 
  X, 
  FileVideo, 
  Eye,
  EyeOff,
  Cloud,
  Check,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import TagsInput from "@/components/tags-input";
import { Checkbox } from "@/components/ui/checkbox";
import { categories } from "@/lib/categories";


// Upload Progress Modal Component
const UploadProgressModal = ({ 
  isOpen, 
  progress, 
  fileName, 
  uploadStage,
  onCancel 
}: {
  isOpen: boolean;
  progress: number;
  fileName: string;
  uploadStage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  onCancel: () => void;
}) => {
  const getStageInfo = () => {
    switch (uploadStage) {
      case 'preparing':
        return {
          title: 'Preparing Upload',
          description: 'Getting everything ready for your video upload...',
          icon: <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        };
      case 'uploading':
        return {
          title: 'Uploading Video',
          description: 'Your video is being uploaded to YouTube...',
          icon: <Upload className="w-6 h-6 text-blue-500" />
        };
      case 'processing':
        return {
          title: 'Processing Video',
          description: 'YouTube is processing your video...',
          icon: <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
        };
      case 'complete':
        return {
          title: 'Upload Complete!',
          description: 'Your video has been successfully uploaded to YouTube.',
          icon: <CheckCircle className="w-6 h-6 text-green-500" />
        };
      case 'error':
        return {
          title: 'Upload Failed',
          description: 'There was an error uploading your video. Please try again.',
          icon: <XCircle className="w-6 h-6 text-red-500" />
        };
      default:
        return {
          title: 'Uploading',
          description: 'Processing your request...',
          icon: <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        };
    }
  };

  const stageInfo = getStageInfo();
  const canCancel = uploadStage === 'preparing' || uploadStage === 'uploading';

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {stageInfo.icon}
            <DialogTitle className="text-lg">{stageInfo.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {stageInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileVideo className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium truncate">{fileName}</span>
          </div>

          {/* Progress Bar */}
          {uploadStage !== 'complete' && uploadStage !== 'error' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Stage-specific content */}
          {uploadStage === 'uploading' && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                <span>Keep this tab open until upload completes</span>
              </div>
            </div>
          )}

          {uploadStage === 'processing' && (
            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>YouTube is processing your video. This may take a few minutes.</span>
              </div>
            </div>
          )}

          {uploadStage === 'complete' && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Your video is now live on YouTube!</span>
              </div>
            </div>
          )}

          {uploadStage === 'error' && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Upload failed. Please check your connection and try again.</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {uploadStage === 'complete' && (
            <Button onClick={() => window.location.reload()}>
              Upload Another Video
            </Button>
          )}
          {uploadStage === 'error' && (
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Upload
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Dialog for leaving page
const LeavePageDialog = ({ 
  isOpen, 
  onStay, 
  onLeave 
}: {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}) => (
  <Dialog open={isOpen} onOpenChange={() => {}}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <DialogTitle>Upload in Progress</DialogTitle>
        </div>
        <DialogDescription>
          Your video is still uploading. If you leave now, the upload will be cancelled and you'll lose your progress.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onStay}>
          Stay on Page
        </Button>
        <Button variant="destructive" onClick={onLeave}>
          Leave Anyway
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
  

const UPLOAD_STEPS = {
  DETAILS: 1,
  ELEMENTS: 2,
  CHECKS: 3,
  VISIBILITY: 4,
};
  
const YoutubeVideoUpload = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadStage, setUploadStage] = useState<'preparing' | 'uploading' | 'processing' | 'complete' | 'error'>('preparing');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [currentStep, setCurrentStep] = useState(UPLOAD_STEPS.DETAILS);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailType, setThumbnailType] = useState<'file' | 'url'>('url');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('https://ideogram.ai/assets/progressive-image/fast/response/rhCzptn7SlKqrER-87MHPg');
  
  const form = useForm<UploadVideoFormData>({
    resolver: zodResolver(uploadVideoSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      privacyStatus: "private",
      categoryId: "",
      madeForKids: false,
      ageRestriction: false,
      currentStep: UPLOAD_STEPS.DETAILS,
      thumbnail: { url: 'https://ideogram.ai/assets/progressive-image/fast/response/rhCzptn7SlKqrER-87MHPg' }
    }
  });

  const nextStep = () => {
    if (currentStep < UPLOAD_STEPS.VISIBILITY) {
       setCurrentStep(prev => prev + 1);
    }
  }

  const prevStep = () => {
    if(currentStep > UPLOAD_STEPS.DETAILS) {
      setCurrentStep(prev => prev - 1);
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case UPLOAD_STEPS.DETAILS:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your video title" 
                      className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-base"
                      disabled={isUploading}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A good title helps people discover your video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell viewers about your video" 
                      className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 min-h-[120px] text-base"
                      disabled={isUploading}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Help viewers understand what your video is about
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case UPLOAD_STEPS.ELEMENTS:
        return (
          <div className="space-y-6">
            {/* Thumbnail Selection */}
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Thumbnail <span className="text-sm text-gray-400 font-medium">(Optional)</span></FormLabel>
                  
                  {/* Thumbnail Type Toggle */}
                  <div className="flex gap-4 mb-4">
                    <Button
                      type="button"
                      variant={thumbnailType === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setThumbnailType('url');
                        setThumbnail(null);
                      }}
                      className={thumbnailType === 'url' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      Image URL
                    </Button>
                    <Button
                      type="button"
                      variant={thumbnailType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setThumbnailType('file');
                        setThumbnailUrl('');
                      }}
                      className={thumbnailType === 'file' ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      Upload File
                    </Button>
                  </div>

                  <FormControl>
                    {thumbnailType === 'url' ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={thumbnailUrl}
                          onChange={(e) => {
                            const url = e.target.value;
                            setThumbnailUrl(url);
                            console.log('Thumbnail URL:', url); // Console log the URL
                            if (url) {
                              field.onChange({ url });
                            } else {
                              field.onChange(undefined);
                            }
                          }}
                          className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                        />
                        {thumbnailUrl && (
                          <div className="mt-3 p-3 border rounded-lg bg-gray-50">
                            <img
                              src={thumbnailUrl}
                              alt="Thumbnail preview"
                              className="w-full h-32 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('Thumbnail image loaded successfully:', thumbnailUrl);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-4 hover:border-red-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setThumbnail(file);
                              console.log('Thumbnail file selected:', file.name); // Console log the file
                              field.onChange({ file });
                            }
                          }}
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label
                          htmlFor="thumbnail-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">
                            {thumbnail ? thumbnail.name : "Upload thumbnail"}
                          </span>
                        </label>
                      </div>
                    )}
                  </FormControl>
                  <FormDescription>
                    {thumbnailType === 'url' 
                      ? 'Enter a direct image URL for your thumbnail' 
                      : 'Select or upload a custom thumbnail file'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Tags</FormLabel>
                  <FormControl>
                    <TagsInput name="tags" />
                  </FormControl>
                  <FormDescription>
                    Tags help people discover your video
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )
      case UPLOAD_STEPS.CHECKS:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="madeForKids"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      This content is made for kids
                    </FormLabel>
                    <FormDescription>
                      Regardless of your location, you're legally required to comply with COPPA and/or other laws. You're required to tell us if your content is made for kids.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageRestriction"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Age restriction (18+ only)
                    </FormLabel>
                    <FormDescription>
                      Age-restricted videos are not shown in certain areas of YouTube.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        )
      case UPLOAD_STEPS.VISIBILITY:
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="privacyStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Visibility</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || "private"}
                      defaultValue="private"
                      disabled={isUploading}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="unlisted">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            Unlisted
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose who can watch your video
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Category</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Help people find your content
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        )
    }
  }
  
  const { getToken } = useAuth();
  const { workspaceId } = useParams();

  // Set initial thumbnail URL in form
  useEffect(() => {
    const initialUrl = 'https://ideogram.ai/assets/progressive-image/fast/response/rhCzptn7SlKqrER-87MHPg';
    form.setValue('thumbnail', { url: initialUrl });
    console.log('Initial thumbnail URL set:', initialUrl);
  }, [form]);

  // Prevent page unload during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading && uploadStage !== 'complete' && uploadStage !== 'error') {
        e.preventDefault();
        e.returnValue = 'Your video upload is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isUploading && uploadStage !== 'complete' && uploadStage !== 'error') {
        e.preventDefault();
        setShowLeaveDialog(true);
        setPendingNavigation(() => () => {
          window.history.back();
        });
      }
    };

    if (isUploading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isUploading, uploadStage]);

  const fileChangeHandler = async (file: File) => {
    console.log("file", file);
    setSelectedFile(file);
    // Auto-populate title from filename
    if (!form.getValues("title")) {
      const titleFromFile = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", titleFromFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      fileChangeHandler(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStage('preparing');
  };

  const handleLeaveConfirm = () => {
    setIsUploading(false);
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleStayOnPage = () => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  };

  const simulateUploadProgress = () => {
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          setUploadStage('processing');
          // Simulate processing time
          setTimeout(() => {
            setUploadStage('complete');
            setIsUploading(false);
          }, 3000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const onSubmit = async (data: UploadVideoFormData) => {
    console.log("form values", data)

    const { title, description, tags, privacyStatus, categoryId, thumbnail, madeForKids, ageRestriction } = data;

    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStage('preparing');

    try {
      // Handle thumbnail data based on type
      let thumbnailData = null;
      if (thumbnail) {
        if ('url' in thumbnail) {
          thumbnailData = { url: thumbnail.url };
          console.log('Sending thumbnail URL to backend:', thumbnail.url);
        } else if ('file' in thumbnail) {
          thumbnailData = { file: thumbnail.file };
          console.log('Sending thumbnail file to backend:', thumbnail.file);
        }
      }

      const uploadData = {
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        workspaceId,
        title,
        description,
        tags,
        categoryId,
        privacyStatus,
        thumbnail: thumbnailData,
        madeForKids,
        ageRestriction
      };

      const token = await getToken();
      
      // Simulate preparation phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadStage('uploading');
      
      const response = await axiosClient.post("/youtube/upload-video", uploadData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("response", response);
      if (response.status === 200) {
        const { url, thumbnailUrl } = response.data;
        
        console.log(url)
        console.log(thumbnailUrl)
        // Start progress simulation
        simulateUploadProgress();
        
       // Uncomment and modify this for actual upload
        // const uploadResponse = await axios.put(url, selectedFile, {
        //   headers: {
        //     "Content-Type": selectedFile.type,
        //   },
        //   onUploadProgress: (progress) => {
        //     const percentCompleted = Math.round((progress.loaded * 100) / progress.total!);
        //     setUploadProgress(percentCompleted);
        //   },
        // });

        // If there's a thumbnail, upload it

        // if (thumbnail?.file && thumbnailUrl) {
        //   await fetch(thumbnailUrl, {
        //     method: 'PUT',
        //     body: thumbnail.file,
        //     headers: {
        //       'Content-Type': thumbnail.file.type || 'image/jpeg',
        //       'x-amz-acl': 'public-read'
        //     },
        //   });
        // }
        
        console.log("File upload completed");
      } else {
        setUploadStage('error');
        setIsUploading(false);
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStage('error');
      setIsUploading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
          <p className="text-gray-600">Share your content with the world</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {/* File Upload Section */}
            <div className="mb-8">
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Choose a video file or drag it here
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Your video will be uploaded and processed
                  </p>
                  <div className="flex justify-center">
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-8">
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Supports MP4, MOV, AVI, WMV, FLV, WebM
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        fileChangeHandler(file);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 truncate">
                        {selectedFile.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        Ready to upload
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      disabled={isUploading}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Step Progress */}
            <div className="my-8">
              <div className="flex justify-between mb-2">
                {Object.entries(UPLOAD_STEPS).map(([key, value]) => (
                  <div
                    key={key}
                    className={`flex items-center ${
                      currentStep >= value ? 'text-red-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= value ? 'border-red-600 bg-red-50' : 'border-gray-300'
                    }`}>
                      {value}
                                </div>
                    <span className="ml-2 text-sm hidden sm:inline">{key}</span>
                                </div>
                ))}
                                </div>
              <div className="h-1 bg-gray-200 rounded">
                <div
                  className="h-1 bg-red-600 rounded transition-all"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
                </div>

            {/* Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStep()}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === UPLOAD_STEPS.DETAILS || isUploading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep === UPLOAD_STEPS.VISIBILITY ? (
                  <Button 
                    type="submit" 
                    disabled={!selectedFile || isUploading}
                      className="bg-red-600 hover:bg-red-700"
                  >
                    {isUploading ? (
                      <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                      </>
                    ) : (
                      <>
                          <Upload className="w-4 h-4 mr-2" />
                          Publish
                      </>
                    )}
                  </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isUploading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress Modal */}
      <UploadProgressModal
        isOpen={isUploading}
        progress={uploadProgress}
        fileName={selectedFile?.name || ''}
        uploadStage={uploadStage}
        onCancel={cancelUpload}
      />

      {/* Leave Page Confirmation Dialog */}
      <LeavePageDialog
        isOpen={showLeaveDialog}
        onStay={handleStayOnPage}
        onLeave={handleLeaveConfirm}
      />
    </div>
  );
};

export default YoutubeVideoUpload;


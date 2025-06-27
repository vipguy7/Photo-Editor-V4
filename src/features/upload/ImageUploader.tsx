import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/store/editorStore'
import { Upload, Image, FileImage, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  className?: string
  onImageLoad?: (imageUrl: string) => void
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  className, 
  onImageLoad 
}) => {
  const { importImage, setLoading, isLoading } = useEditorStore()
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setLoading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Create object URL for the image
      const imageUrl = URL.createObjectURL(file)
      
      // Import image to canvas
      importImage(imageUrl)
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Call callback if provided
      onImageLoad?.(imageUrl)
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0)
        setLoading(false)
      }, 500)
      
    } catch (error) {
      console.error('Error uploading image:', error)
      setLoading(false)
      setUploadProgress(0)
    }
  }, [importImage, setLoading, onImageLoad])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.svg']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading
  })

  const handleUrlUpload = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      importImage(url)
      onImageLoad?.(url)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-gray-400 dark:hover:border-gray-500",
          isDragActive && "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
          isDragReject && "border-red-500 bg-red-50 dark:bg-red-950/20",
          isLoading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uploading... {uploadProgress}%
              </p>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <Image className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  or click to browse files
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                Supports: JPEG, PNG, GIF, WebP, SVG • Max 10MB
              </div>
            </>
          )}
        </div>
      </div>

      {/* Alternative Upload Options */}
      <div className="flex gap-2">
        <Button
          onClick={handleUrlUpload}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          <FileImage className="w-4 h-4 mr-2" />
          Upload from URL
        </Button>
        
        <Button
          onClick={() => document.querySelector('input[type="file"]')?.click()}
          variant="outline"
          className="flex-1"
          disabled={isLoading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Browse Files
        </Button>
      </div>

      {/* Stock Photo Integration */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Or use stock photos:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STOCK_PHOTOS.map((photo, index) => (
            <button
              key={index}
              onClick={() => {
                importImage(photo.url)
                onImageLoad?.(photo.url)
              }}
              className="relative aspect-video rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              disabled={isLoading}
            >
              <img
                src={photo.thumbnail}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Stock photos from Pexels (using known working URLs)
const STOCK_PHOTOS = [
  {
    url: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    thumbnail: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    alt: 'Abstract background'
  },
  {
    url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    thumbnail: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    alt: 'Technology background'
  },
  {
    url: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    thumbnail: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    alt: 'Nature landscape'
  },
  {
    url: 'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    thumbnail: 'https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&dpr=1',
    alt: 'Gradient background'
  }
]

// Add react-dropzone to package.json dependencies
declare global {
  interface Window {
    __REACT_DROPZONE_INSTALLED__: boolean
  }
}
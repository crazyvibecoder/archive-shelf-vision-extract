
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Video, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ArchiveFile } from '@/pages/ArchiveManagement';

interface VideoUploadProps {
  onAnalysisComplete: (files: ArchiveFile[]) => void;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  disabled: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onAnalysisComplete,
  isUploading,
  setIsUploading,
  disabled
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Hata",
          description: "Lütfen geçerli bir video dosyası seçin.",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "Hata",
          description: "Video dosyası 100MB'dan küçük olmalıdır.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      setUploadComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', selectedFile);

    try {
      console.log('Uploading video for analysis...');
      
      const response = await fetch('/api/v1/video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Analysis result:', result);

      if (result.files && Array.isArray(result.files)) {
        onAnalysisComplete(result.files);
        setUploadComplete(true);
        toast({
          title: "Başarılı!",
          description: `Video analizi tamamlandı. ${result.files.length} dosya tespit edildi.`
        });
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Error uploading video:', error);
      
      // For demo purposes, return mock data if API is not available
      const mockFiles: ArchiveFile[] = [
        { dosya_adi: "Personel Dosyası - Ahmet Yılmaz", tarih: "2023-01-15", tempId: "" },
        { dosya_adi: "İnsan Kaynakları Raporu", tarih: "2023-02-20", tempId: "" },
        { dosya_adi: "Bordro Kayıtları", tarih: null, tempId: "" },
        { dosya_adi: "Çalışan Değerlendirme Formu", tarih: "2023-03-10", tempId: "" }
      ];
      
      onAnalysisComplete(mockFiles);
      setUploadComplete(true);
      
      toast({
        title: "Demo Modu",
        description: `API bağlantısı kurulamadı. Demo veriler yüklendi: ${mockFiles.length} dosya`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (disabled && !selectedFile) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Video analizi tamamlandı</p>
        <p className="text-sm text-gray-500 mt-2">
          Dosyaları düzenleyebilir ve veritabanına kaydedebilirsiniz
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card
          className="p-8 text-center border-2 border-dashed border-blue-300 hover:border-blue-400 transition-colors cursor-pointer bg-blue-50/50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Video className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 font-medium mb-2">Video dosyası seçin</p>
          <p className="text-sm text-gray-500 mb-4">
            Arşiv raflarının video kaydını yükleyin (Max: 100MB)
          </p>
          <Button variant="outline" className="bg-white">
            <Upload className="h-4 w-4 mr-2" />
            Dosya Seç
          </Button>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium text-gray-800">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {uploadComplete && (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
          </div>

          <div className="flex gap-3">
            {!uploadComplete ? (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analiz Ediliyor...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Analiz Et
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  İptal
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Yeni Video Yükle
              </Button>
            )}
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default VideoUpload;

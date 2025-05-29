
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import VideoUpload from '@/components/VideoUpload';
import FileEditor from '@/components/FileEditor';
import { toast } from '@/hooks/use-toast';

export interface ArchiveFile {
  dosya_adi: string;
  tarih: string | null;
  dosya_no?: number;
  tempId: string;
}

const ArchiveManagement = () => {
  const { sutunNo, rafNo } = useParams<{ sutunNo: string; rafNo: string }>();
  const navigate = useNavigate();
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pageKey = `archive_${sutunNo}_${rafNo}_files`;

  useEffect(() => {
    // Load files from localStorage
    const savedFiles = localStorage.getItem(pageKey);
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
  }, [pageKey]);

  const saveToLocalStorage = (updatedFiles: ArchiveFile[]) => {
    localStorage.setItem(pageKey, JSON.stringify(updatedFiles));
    setFiles(updatedFiles);
  };

  const handleVideoAnalysis = (analyzedFiles: ArchiveFile[]) => {
    // Add temp IDs and dosya_no to analyzed files
    const filesWithIds = analyzedFiles.map((file, index) => ({
      ...file,
      tempId: `temp_${Date.now()}_${index}`,
      dosya_no: index + 1
    }));
    
    saveToLocalStorage(filesWithIds);
    toast({
      title: "Video Analizi Tamamlandı",
      description: `${filesWithIds.length} dosya tespit edildi ve düzenleme için hazırlandı.`
    });
  };

  const handleFileUpdate = (tempId: string, updatedFile: Partial<ArchiveFile>) => {
    const updatedFiles = files.map(file => 
      file.tempId === tempId 
        ? { ...file, ...updatedFile }
        : file
    );
    saveToLocalStorage(updatedFiles);
  };

  const handleDeleteFile = (tempId: string) => {
    const updatedFiles = files.filter(file => file.tempId !== tempId);
    saveToLocalStorage(updatedFiles);
    toast({
      title: "Dosya Silindi",
      description: "Dosya listeden kaldırıldı."
    });
  };

  const handleSaveToDatabase = async () => {
    if (files.length === 0) {
      toast({
        title: "Hata",
        description: "Kaydedilecek dosya bulunmuyor.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Process files one by one in the order they appear
      for (const [index, file] of files.entries()) {
        const documentData = {
          sutun_no: parseInt(sutunNo!),
          raf_no: parseInt(rafNo!),
          dosya_no: file.dosya_no || index + 1,
          dosya_adi: file.dosya_adi,
          tarih: file.tarih
        };

        console.log(`Saving document ${index + 1}/${files.length}:`, documentData);

        const response = await fetch('/api/v1/documents/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(documentData),
        });

        if (!response.ok) {
          throw new Error(`Failed to save document: ${file.dosya_adi}`);
        }

        // Show progress
        toast({
          title: "Kaydediliyor...",
          description: `${index + 1}/${files.length} dosya kaydedildi: ${file.dosya_adi}`
        });
      }

      // Clear local storage after successful save
      localStorage.removeItem(pageKey);
      setFiles([]);

      toast({
        title: "Başarılı!",
        description: `${files.length} dosya veritabanına başarıyla kaydedildi.`
      });

    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Hata",
        description: "Veritabanına kaydederken hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-white/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfa
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Sütun {sutunNo} - Raf {rafNo}
              </h1>
              <p className="text-gray-600">Arşiv Dosyası Yönetimi</p>
            </div>
          </div>
          
          {files.length > 0 && (
            <Button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Veritabanına Kaydet'}
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Upload Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Upload className="h-5 w-5" />
                Video Yükleme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoUpload
                onAnalysisComplete={handleVideoAnalysis}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
                disabled={files.length > 0}
              />
            </CardContent>
          </Card>

          {/* File Editor Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-green-700">
                Dosya Düzenleme ({files.length} dosya)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileEditor
                files={files}
                onFileUpdate={handleFileUpdate}
                onFileDelete={handleDeleteFile}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArchiveManagement;

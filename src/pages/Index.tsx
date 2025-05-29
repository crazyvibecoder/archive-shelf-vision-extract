
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderOpen, Archive, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SavedPage {
  sutun_no: number;
  raf_no: number;
  timestamp: string;
}

const Index = () => {
  const [sutunNo, setSutunNo] = useState<number>(1);
  const [rafNo, setRafNo] = useState<number>(1);
  const [savedPages, setSavedPages] = useState<SavedPage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved pages from localStorage
    const saved = localStorage.getItem('archivePages');
    if (saved) {
      setSavedPages(JSON.parse(saved));
    }
  }, []);

  const handleCreatePage = () => {
    if (sutunNo < 1 || rafNo < 1) {
      toast({
        title: "Hata",
        description: "Sütun ve raf numaraları 1'den büyük olmalıdır.",
        variant: "destructive"
      });
      return;
    }

    const pageKey = `archive_${sutunNo}_${rafNo}`;
    const newPage: SavedPage = {
      sutun_no: sutunNo,
      raf_no: rafNo,
      timestamp: new Date().toISOString()
    };

    // Check if page already exists
    const exists = savedPages.some(page => 
      page.sutun_no === sutunNo && page.raf_no === rafNo
    );

    if (!exists) {
      const updatedPages = [...savedPages, newPage];
      setSavedPages(updatedPages);
      localStorage.setItem('archivePages', JSON.stringify(updatedPages));
    }

    // Navigate to archive management page
    navigate(`/archive/${sutunNo}/${rafNo}`);
  };

  const handleOpenPage = (page: SavedPage) => {
    navigate(`/archive/${page.sutun_no}/${page.raf_no}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Archive className="h-10 w-10 text-blue-600" />
            Arşiv Yönetim Sistemi
          </h1>
          <p className="text-gray-600 text-lg">Video analizi ile arşiv belgelerini dijitalleştirin</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create New Page */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Plus className="h-5 w-5" />
                Yeni Arşiv Sayfası
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sutun">Sütun No</Label>
                  <Input
                    id="sutun"
                    type="number"
                    min="1"
                    value={sutunNo}
                    onChange={(e) => setSutunNo(parseInt(e.target.value) || 1)}
                    className="text-center text-lg font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raf">Raf No</Label>
                  <Input
                    id="raf"
                    type="number"
                    min="1"
                    value={rafNo}
                    onChange={(e) => setRafNo(parseInt(e.target.value) || 1)}
                    className="text-center text-lg font-semibold"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreatePage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                <FolderOpen className="h-5 w-5 mr-2" />
                Sayfayı Oluştur
              </Button>
            </CardContent>
          </Card>

          {/* Saved Pages */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Archive className="h-5 w-5" />
                Kayıtlı Sayfalar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {savedPages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Henüz kayıtlı sayfa bulunmuyor
                  </p>
                ) : (
                  savedPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleOpenPage(page)}
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          Sütun {page.sutun_no} - Raf {page.raf_no}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(page.timestamp).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

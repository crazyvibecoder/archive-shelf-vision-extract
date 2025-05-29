
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText, Calendar, Hash } from 'lucide-react';
import { ArchiveFile } from '@/pages/ArchiveManagement';

interface FileEditorProps {
  files: ArchiveFile[];
  onFileUpdate: (tempId: string, updatedFile: Partial<ArchiveFile>) => void;
  onFileDelete: (tempId: string) => void;
}

const FileEditor: React.FC<FileEditorProps> = ({
  files,
  onFileUpdate,
  onFileDelete
}) => {
  if (files.length === 0) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-300">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Henüz dosya bulunmuyor</p>
        <p className="text-sm text-gray-500 mt-2">
          Video yükleyip analiz ettikten sonra dosyalar burada görünecek
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {files.map((file, index) => (
        <Card key={file.tempId} className="p-4 bg-white border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                #{index + 1}
              </span>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileDelete(file.tempId)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* Dosya No */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Dosya No
              </Label>
              <Input
                type="number"
                min="1"
                value={file.dosya_no || index + 1}
                onChange={(e) => onFileUpdate(file.tempId, {
                  dosya_no: parseInt(e.target.value) || index + 1
                })}
                className="text-sm"
              />
            </div>

            {/* Dosya Adı */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Dosya Adı
              </Label>
              <Input
                value={file.dosya_adi}
                onChange={(e) => onFileUpdate(file.tempId, {
                  dosya_adi: e.target.value
                })}
                placeholder="Dosya adını girin..."
                className="text-sm"
              />
            </div>

            {/* Tarih */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Tarih
              </Label>
              <Input
                value={file.tarih || ''}
                onChange={(e) => onFileUpdate(file.tempId, {
                  tarih: e.target.value || null
                })}
                placeholder="Tarih bilgisi (isteğe bağlı)"
                className="text-sm"
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FileEditor;

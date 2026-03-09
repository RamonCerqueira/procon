import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Camera, 
  MapPin, 
  CheckSquare, 
  AlertTriangle, 
  Save, 
  X,
  MoreVertical
} from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { useNavigate } from 'react-router-dom';

export function InspectionMobile() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Preços visíveis ao consumidor', status: 'unchecked' },
    { id: 2, label: 'Validade dos produtos perecíveis', status: 'unchecked' },
    { id: 3, label: 'Exemplar do CDC disponível', status: 'unchecked' },
    { id: 4, label: 'Condições de higiene', status: 'unchecked' },
    { id: 5, label: 'Acessibilidade', status: 'unchecked' },
  ]);

  const handleTakePhoto = () => {
    // Simulate taking a photo
    const mockPhoto = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?q=80&w=2070&auto=format&fit=crop";
    setPhotos([...photos, mockPhoto]);
  };

  const handleChecklistChange = (id: number, status: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, status } : item));
    // Update progress
    const checkedCount = checklist.filter(i => i.id !== id && i.status !== 'unchecked').length + (status !== 'unchecked' ? 1 : 0);
    const progress = Math.min(3, Math.ceil((checkedCount / checklist.length) * 3));
    setActiveStep(progress);
  };

  const handleFinish = () => {
    const data = {
      establishment: 'Supermercado Preço Bom',
      address: 'Rua das Acácias, 123 - Centro',
      checklist,
      photos,
      observations,
      date: new Date().toISOString()
    };
    console.log('Fiscalização Finalizada:', data);
    alert('Fiscalização finalizada e sincronizada com sucesso!');
    navigate('/dashboard'); // Or back to inspection list
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col">
        
        {/* Mobile Header */}
        <header className="bg-blue-700 text-white p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(-1)} 
              className="p-1 hover:bg-blue-600 rounded-full"
              aria-label="Voltar para a página anterior"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <div>
              <h1 className="font-bold text-lg leading-none">Fiscalização #492</h1>
              <p className="text-xs text-blue-200">Supermercado Preço Bom</p>
            </div>
          </div>
          <button 
            className="p-1 hover:bg-blue-600 rounded-full"
            aria-label="Mais opções"
          >
            <MoreVertical className="h-6 w-6" aria-hidden="true" />
          </button>
        </header>

        {/* Progress Bar */}
        <div 
          className="bg-gray-100 h-1 w-full" 
          role="progressbar" 
          aria-valuenow={activeStep} 
          aria-valuemin={0} 
          aria-valuemax={3}
          aria-label="Progresso da fiscalização"
        >
          <div className="bg-green-500 h-1 transition-all" style={{ width: `${(activeStep / 3) * 100}%` }}></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* Location Card */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-gray-900">Rua das Acácias, 123 - Centro</p>
              <p className="text-xs text-gray-500">Check-in realizado às 14:30</p>
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-gray-500" />
              Checklist de Infração
            </h3>
            <div className="space-y-3">
              {checklist.map(item => (
                <CheckItem 
                  key={item.id} 
                  label={item.label} 
                  status={item.status} 
                  onChange={(status) => handleChecklistChange(item.id, status)} 
                />
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Camera className="h-5 w-5 text-gray-500" />
              Evidências ({photos.length})
            </h3>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group">
                  <img 
                    src={photo} 
                    className="w-full h-full object-cover" 
                    alt={`Evidência fotográfica ${idx + 1}`} 
                    loading="lazy"
                  />
                  <button 
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white"
                    aria-label={`Remover evidência fotográfica ${idx + 1}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <button 
                onClick={handleTakePhoto}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Tirar nova foto de evidência"
              >
                <Camera className="h-6 w-6 mb-1" aria-hidden="true" />
                <span className="text-xs font-medium">Adicionar</span>
              </button>
            </div>
          </div>

          {/* Observations */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
              Observações
            </h3>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              placeholder="Descreva as irregularidades encontradas..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            ></textarea>
          </div>

        </div>

        {/* Floating Action Button (Save) */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <Button 
            className="w-full h-12 text-lg shadow-lg shadow-blue-500/30"
            onClick={handleFinish}
          >
            <Save className="h-5 w-5 mr-2" />
            Finalizar Fiscalização
          </Button>
        </div>

      </div>
    </div>
  );
}

function CheckItem({ label, status, onChange }: { label: string, status: string, onChange: (s: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="flex gap-2">
        <button 
          onClick={() => onChange('ok')}
          className={`p-2 rounded-lg font-bold text-xs transition-colors ${status === 'ok' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
        >
          OK
        </button>
        <button 
          onClick={() => onChange('nok')}
          className={`p-2 rounded-lg font-bold text-xs transition-colors ${status === 'nok' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}
        >
          Irregular
        </button>
      </div>
    </div>
  );
}

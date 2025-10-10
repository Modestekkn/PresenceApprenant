import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/UI/Modal';
import { Button } from '@/components/UI/Button';
import { Input } from '@/components/UI/Input';
import { getAppSettings, saveAppSettings } from '@/config/constants';
import { Clock } from 'lucide-react';

export const PresenceTimeSettings: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endTime, setEndTime] = useState<string>('00:00');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      const currentSettings = getAppSettings();
      setStartTime(currentSettings.presenceStartTime);
      setEndTime(currentSettings.presenceEndTime);
      setError('');
    }
  }, [isModalOpen]);

  const handleSave = () => {
    if (startTime >= endTime) {
      setError("L'heure de début doit être antérieure à l'heure de fin.");
      return;
    }
    setError('');
    saveAppSettings({ presenceStartTime: startTime, presenceEndTime: endTime });
    setIsModalOpen(false);
    // On pourrait ajouter une notification de succès ici
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsModalOpen(true)}>
        <Clock className="w-4 h-4 mr-2" />
        Configurer les heures de présence
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configurer la plage horaire de présence"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Définissez la plage horaire pendant laquelle les formateurs peuvent marquer les présences.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Heure de début"
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="Heure de fin"
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          {error && <p className="mt-2 text-sm text-danger-500">{error}</p>}
        </div>
      </Modal>
    </>
  );
};

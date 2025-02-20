import React, { useState } from 'react';
import { ActivitySelector } from './ActivitySelector';
import { NearbyPlaces } from './NearbyPlaces';

export const MultiStepActivity: React.FC<{ onSelect: (data: string) => void }> = ({ onSelect }) => {
  const [step, setStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleNext = (activity: string) => {
    setSelectedActivity(activity);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  return (
    <div>
      {step === 1 && <ActivitySelector onSelect={handleNext} />}
      {step === 2 && selectedActivity && (
        <NearbyPlaces activity={selectedActivity} onBack={handleBack} onSelect={onSelect} />
      )}
    </div>
  );
};
'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FoodSpotSelector } from '@/components/FoodSpotSelector';

const FoodSpotSelectionContent = () => {
  const [foodSpot, setFoodSpot] = useState('');  // Use setFoodSpot to update foodSpot
  const router = useRouter();

  const handleNext = () => {
    if (!foodSpot) {
      alert('Please select a food spot');
      return;
    }

    // Pass the selected foodSpot to the next page
    router.push(
      `/plan/activity?foodSpot=${encodeURIComponent(foodSpot)}`
    );
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Select a Food Spot</h1>

      {/* Only wrap FoodSpotSelector inside Suspense */}
      <Suspense fallback={<div>Loading food spots...</div>}>
        <FoodSpotSelector onSelect={setFoodSpot} />
      </Suspense>

      <button
        onClick={handleNext}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Next
      </button>
    </main>
  );
};

export default function FoodSpotSelection() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FoodSpotSelectionContent />
    </Suspense>
  );
}
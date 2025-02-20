'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DessertSpotSelector } from '@/components/DessertSelector';

export default function ActivitySelection() {
  const searchParams = useSearchParams();
  const foodSpot = searchParams?.get('foodSpot') ?? ''; // Get foodSpot from the search params
  const activity = searchParams?.get('activity') ?? ''; // Get activity from the search params
  const dessertSpot = searchParams?.get('dessertSpot') ?? ''; // Get dessertSpot from the search params
  const router = useRouter();

  // State to manage the selected dessert
  const [selectedDessertSpot, setSelectedDessertSpot] = useState<string>(dessertSpot);

  const handleNext = () => {
    if (!selectedDessertSpot) {
      alert('Please select a dessert.');
      return;
    }

    // Navigate to datetime page with the updated query parameters
    router.push(
      `/plan/datetime?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(selectedDessertSpot)}`
    );
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Select a Dessert Place</h1>

      {/* Pass onSelect to update selected dessert */}
      <DessertSpotSelector onSelect={setSelectedDessertSpot} />

      <button
        onClick={handleNext}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Next
      </button>

      <button
        onClick={() =>
          router.push(`/plan/activity?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(selectedDessertSpot)}`)
        }
        className="mt-6 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
      >
        Back
      </button>
    </main>
  );
}
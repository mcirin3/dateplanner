// ActivitySelection.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivitySelector } from '@/components/ActivitySelector';

export default function ActivitySelection() {
  const searchParams = useSearchParams();
  const foodSpot = searchParams?.get('foodSpot') ?? '';
  const dessertSpot = searchParams?.get('dessertSpot') ?? '';
  const [activity, setActivity] = useState<string>(''); 
  const router = useRouter();

  const handleNext = () => {
    if (!activity) {
      alert('Please select an activity.');
      return;
    }
    router.push(
      `/plan/dessert?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(dessertSpot)}`
    );
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Select an Activity</h1>

      <ActivitySelector onSelect={setActivity} />

      <button
        onClick={handleNext}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Next
      </button>
    </main>
  );
}
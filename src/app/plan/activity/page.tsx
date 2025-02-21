'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ActivitySelector } from '@/components/ActivitySelector';

const ActivitySelectionContent = () => {
  const searchParams = useSearchParams();
  const foodSpot = searchParams?.get('foodSpot') ?? ''; // Get foodSpot from URL params
  const dessertSpot = searchParams?.get('dessertSpot') ?? ''; // Get dessertSpot from URL params
  const [activity, setActivity] = useState<string>(''); // State for selected activity
  const router = useRouter();

  const handleNext = () => {
    if (!activity) {
      alert('Please select an activity.');
      return;
    }

    // Navigate to the dessert selection page with updated query parameters
    router.push(
      `/plan/dessert?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(dessertSpot)}`
    );
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Select an Activity</h1>

      {/* Wrap ActivitySelector with Suspense for data fetching */}
      <Suspense fallback={<div>Loading...</div>}>
        <ActivitySelector onSelect={setActivity} />
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

export default function ActivitySelectionPage() {
  return (
    <Suspense fallback={<div>Loading Activity Selection...</div>}>
      <ActivitySelectionContent />
    </Suspense>
  );
}
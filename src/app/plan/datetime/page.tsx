'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DateSelector } from '@/components/DateSelector';

export default function DateSelection() {
  const searchParams = useSearchParams();
  
  // Get previous selections from URL
  const foodSpot = searchParams?.get('foodSpot') ?? '';
  const activity = searchParams?.get('activity') ?? '';
  const dessertSpot = searchParams?.get('dessertSpot') ?? '';

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>('');
  const router = useRouter();

  const handleNext = () => {
    if (!date || !time) {
      alert('Please select a date and time.');
      return;
    }

    // Navigate to the confirmation page with all query parameters
    router.push(
      `/plan/confirmation?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(dessertSpot)}&date=${encodeURIComponent(date.toISOString())}&time=${encodeURIComponent(time)}`
    );
  };

  const handleBack = () => {
    // Navigate back to the activity page, keeping previous selections
    router.push(
      `/plan/activity?foodSpot=${encodeURIComponent(foodSpot)}&activity=${encodeURIComponent(activity)}&dessertSpot=${encodeURIComponent(dessertSpot)}`
    );
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Select Date and Time</h1>

      <DateSelector
        onSelect={(selectedDate, selectedTime) => {
          setDate(selectedDate);
          setTime(selectedTime);
        }}
      />

      <button
        onClick={handleNext}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
      >
        Next
      </button>

      <button
        onClick={handleBack}
        className="mt-6 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 ml-4"
      >
        Back
      </button>
    </main>
  );
}
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FoodSpotSelector } from '../components/FoodSpotSelector';
import { ActivitySelector } from '../components/ActivitySelector';
import { DateSelector } from '../components/DateSelector';
import { DessertSpotSelector } from '../components/DessertSelector'; // Import DessertSelector

interface DatePlan {
  foodSpot: string;
  activity: string;
  dessertSpot: string;
  date: Date | null;
  time: string;
}

export default function Home() {
  const [datePlan, setDatePlan] = useState<DatePlan>({
    foodSpot: '',
    activity: '',
    dessertSpot: '',
    date: null,
    time: '',
  });

  const router = useRouter();

  const handleSavePlan = async () => {
    const { foodSpot, activity, dessertSpot, date, time } = datePlan;

    if (foodSpot && activity && dessertSpot && date && time) {
      try {
        // Format the date as ISO string for query parameters
        const dateStr = date.toISOString();

        // Construct the query string
        const queryParams = new URLSearchParams({
          foodSpot,
          activity,
          dessertSpot,
          date: dateStr,
          time,
        }).toString();

        // Redirect to the confirmation page with query parameters
        router.push(`/confirmation?${queryParams}`);

        // Optionally, send the confirmation email (uncomment to enable)
        // const response = await fetch('/api/sendConfirmationEmail', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     foodSpot,
        //     activity,
        //     dessertSpot,
        //     date: dateStr,
        //     time,
        //     recipientEmail: 'recipient@example.com', // Replace with actual recipient email
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to send confirmation email');
        // }

        // alert('Date plan confirmation email sent successfully!');
      } catch (error) {
        console.error('Error sending confirmation email:', error);
        alert('Failed to process your date plan. Please try again.');
      }
    } else {
      alert('Please complete all selections before proceeding.');
    }
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Date Planner</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Food Spot Selector */}
        <FoodSpotSelector
          onSelect={(foodSpot) => setDatePlan((prev) => ({ ...prev, foodSpot }))}
        />

        {/* Activity Selector */}
        <ActivitySelector
          onSelect={(activity) => setDatePlan((prev) => ({ ...prev, activity }))}
        />

        <DessertSpotSelector
          onSelect={(dessertSpot: string) =>
            setDatePlan((prev) => ({ ...prev, dessertSpot }))
          }
        />

        {/* Date Selector */}
        <DateSelector
          onSelect={(date, time) =>
            setDatePlan((prev) => ({ ...prev, date, time }))
          }
        />
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSavePlan}
          className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600"
        >
          Next
        </button>
      </div>
    </main>
  );
}

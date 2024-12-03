'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FoodSpotSelector } from '../components/FoodSpotSelector';
import { ActivitySelector } from '../components/ActivitySelector';
import { DateSelector } from '../components/DateSelector';

export default function Home() {
  const [datePlan, setDatePlan] = useState({
    foodSpot: '',
    activity: '',
    date: null as Date | null,
    time: ''
  });

  const router = useRouter();

  const handleSavePlan = async () => {
    if (datePlan.foodSpot && datePlan.activity && datePlan.date && datePlan.time) {
      try {

        const dateStr = datePlan.date.toISOString();
        // Build the URL with query parameters
        const queryParams = new URLSearchParams({
          foodSpot: datePlan.foodSpot,
          activity: datePlan.activity,
          date: dateStr,
          time: datePlan.time
        }).toString();

        // Redirect to the confirmation page
        router.push(`/confirmation?${queryParams}`);

        // Send the confirmation email in the background
        // const response = await fetch('/api/sendConfirmationEmail', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     foodSpot: datePlan.foodSpot,
        //     activity: datePlan.activity,
        //     date: datePlan.date,
        //     time: datePlan.time,
        //     recipientEmail: 'recipient@example.com' // Replace with the recipient's email
        //   })
        // });

        // if (!response.ok) {
        //   throw new Error('Failed to send confirmation email');
        // }

        // alert('Date plan confirmation email sent successfully!');
      } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send confirmation email');
      }
    } else {
      alert('Please complete all selections');
    }
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Date Planner</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Food Spot Selector */}
        <FoodSpotSelector 
          onSelect={(foodSpot) => setDatePlan(prev => ({ ...prev, foodSpot }))} 
        />

        {/* Activity Selector */}
        <ActivitySelector 
          onSelect={(activity) => setDatePlan(prev => ({ ...prev, activity }))} 
        />

        {/* Date Selector */}
        <DateSelector 
          onSelect={(date, time) => setDatePlan(prev => ({ ...prev, date, time }))} 
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

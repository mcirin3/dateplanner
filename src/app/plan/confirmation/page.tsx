'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ConfirmationPage = () => {
  const searchParams = useSearchParams();
  const foodSpot = searchParams?.get('foodSpot') ?? '';
  const activity = searchParams?.get('activity') ?? ''; 
  const dessertSpot = searchParams?.get('dessertSpot') ?? ''; 
  const date = searchParams?.get('date') ?? ''; 
  const time = searchParams?.get('time') ?? ''; 

  const [emailList, setEmailList] = useState<string[]>(['']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emailList];
    updatedEmails[index] = value;
    setEmailList(updatedEmails);
  };

  const handleAddEmail = () => {
    setEmailList([...emailList, '']);
  };

  const handleRemoveEmail = (index: number) => {
    const updatedEmails = emailList.filter((_, i) => i !== index);
    setEmailList(updatedEmails);
  };

  const handleSendEmails = async () => {
    if (emailList.some((email) => email.trim() === '')) {
      setError('Please ensure all email fields are filled out.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await fetch('/api/sendConfirmationEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        foodSpot,
        activity,
        dessertSpot,
        date,
        time,
        emails: emailList,
      }),
    });

    setIsSubmitting(false);

    if (response.ok) {
      alert('Confirmation emails sent!');
    } else {
      alert('Failed to send confirmation emails');
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Confirm Your Date Plan</h2>
      <div className="space-y-4">
        <div>
          <strong className="block text-gray-700">Food Spot:</strong>
          <p className="text-gray-900">{foodSpot}</p>
        </div>
        <div>
          <strong className="block text-gray-700">Activity:</strong>
          <p className="text-gray-900">{activity}</p>
        </div>
        <div>
          <strong className="block text-gray-700">Dessert Spot:</strong>
          <p className="text-gray-900">{dessertSpot}</p>
        </div>
        <div>
          <strong className="block text-gray-700">Date:</strong>
          <p className="text-gray-900">{date ? new Date(date).toLocaleDateString() : 'Not Provided'}</p>
        </div>
        <div>
          <strong className="block text-gray-700">Time:</strong>
          <p className="text-gray-900">{time || 'Not Provided'}</p>
        </div>

        {/* Email Fields */}
        {emailList.map((email, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder={`Enter email ${index + 1}`}
            />
            {emailList.length > 1 && (
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleRemoveEmail(index)}
                aria-label={`Remove email field ${index + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Add Email Button */}
        <button
          onClick={handleAddEmail}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add Another Email
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          className={`px-6 py-2 rounded-lg text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={handleSendEmails}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Confirm and Send Emails'}
        </button>
      </div>
    </div>
  );
};

export default function ConfirmationPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationPage />
    </Suspense>
  );
}
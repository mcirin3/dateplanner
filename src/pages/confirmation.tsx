import { useRouter } from 'next/router';
import { useState } from 'react';


const ConfirmationPage = () => {
  const router = useRouter();
  const { foodSpot, activity, dessertSpot, date, time } = router.query;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSendEmail = async () => {
    if (!email) {
      setError('Please enter an email address.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await fetch('/api/sendConfirmationEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ foodSpot, activity, date, dessertSpot, time, email }),
    });

    setIsSubmitting(false);

    if (response.ok) {
      alert('Confirmation email sent!');
    } else {
      alert('Failed to send confirmation email');
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
          <p className="text-gray-900">{new Date(date as string).toLocaleDateString()}</p>
        </div>
        <div>
          <strong className="block text-gray-700">Time:</strong>
          <p className="text-gray-900">{time}</p>
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold">
            Your Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="mt-2 w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Enter your email"
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
      <div className="mt-6 text-center">
        <button
          className={`px-6 py-2 rounded-lg text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={handleSendEmail}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Confirm and Send Email'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;

import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the types for the function parameters
interface SendConfirmationEmailParams {
  email: string;
  foodSpot: string;
  activity: string;
  date: string;
  time: string;
}

const sendConfirmationEmail = async ({
  email,
  foodSpot,
  activity,
  date,
  time,
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mcirineo9@gmail.com', // Replace with your email
      pass: 'todb ikva wjog pifr', // Use an app password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: 'mcirineo9@gmail.com', // Replace with your email
    to: email, // Use the email passed in the request
    subject: 'Your Date Plan Confirmation',
    text: `
Here are the details of your planned date:

Food Spot: ${foodSpot}
Activity: ${activity}
Date: ${date}
Time: ${time}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    // Use the Error type for better error handling
    const typedError = error as Error; // Type the error as an instance of Error
    console.error('Error sending email:', typedError.message);
    return { success: false, error: typedError.message };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, foodSpot, activity, date, time } = req.body;

    if (!email || !foodSpot || !activity || !date || !time) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await sendConfirmationEmail({ email, foodSpot, activity, date, time });

    if (result.success) {
      return res.status(200).json({ message: 'Email sent successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to send email', details: result.error });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

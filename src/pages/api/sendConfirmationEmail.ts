import nodemailer from 'nodemailer';
import { NextApiRequest, NextApiResponse } from 'next';

// Define the types for the function parameters
interface SendConfirmationEmailParams {
  emails: string[]; // Array of email addresses
  foodSpot: string;
  activity: string;
  dessertSpot: string;
  date: string;
  time: string;
}

const sendConfirmationEmail = async ({
  emails,
  foodSpot,
  activity,
  dessertSpot,
  date,
  time,
}: SendConfirmationEmailParams): Promise<{ success: boolean; error?: string }> => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mcirineo9@gmail.com', // Replace with your email
      pass: 'pmlj pxfx yqci ormg', // Use an app password if 2FA is enabled
    },
  });

  const emailPromises = emails.map((email) => {
    const mailOptions = {
      from: 'mcirineo9@gmail.com', // Replace with your email
      to: email, // Send email to each recipient
      subject: 'Your Date Plan Confirmation',
      text: `
Here are the details of your planned date:

Food Spot: ${foodSpot}
Activity: ${activity}
Dessert: ${dessertSpot}
Date: ${date}
Time: ${time}
      `,
    };

    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(emailPromises); // Wait for all emails to be sent
    return { success: true };
  } catch (error) {
    const typedError = error as Error; // Type the error as an instance of Error
    console.error('Error sending emails:', typedError.message);
    return { success: false, error: typedError.message };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { emails, foodSpot, activity, dessertSpot, date, time } = req.body;

    // Ensure all required fields are present
    if (!emails || !Array.isArray(emails) || emails.length === 0 || !foodSpot || !activity || !dessertSpot || !date || !time) {
      return res.status(400).json({ error: 'All fields are required, including at least one email.' });
    }

    const result = await sendConfirmationEmail({ emails, foodSpot, activity, dessertSpot, date, time });

    if (result.success) {
      return res.status(200).json({ message: 'Emails sent successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to send emails', details: result.error });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
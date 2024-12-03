import nodemailer from 'nodemailer';

const sendConfirmationEmail = async ({ email, foodSpot, activity, date, time }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'mcirineo9@gmail.com', // Replace with your email
      pass: 'todb ikva wjog pifr',    // Use an app password if 2FA is enabled
    },
  });

  const mailOptions = {
    from: 'mcirineo9@gmail.com', // Replace with your email
    to: email,                    // Use the email passed in the request
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
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, foodSpot, activity, date, time } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await sendConfirmationEmail({ email, foodSpot, activity, date, time });
    if (result.success) {
      return res.status(200).json({ message: 'Email sent successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to send email', details: result.error });
      console.log(result.error);
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { foodSpot, activity, date, time } = req.body
      console.log('Received body:', req.body); // Log the incoming request

      if (!foodSpot || !activity || !date || !time) {
        return res.status(400).json({ error: 'All fields are required' })
      }

      const savedPlan = await prisma.datePlan.create({
        data: {
          foodSpot,
          activity,
          date: new Date(date), // Ensure date is properly parsed
          time
        }
      })

      return res.status(200).json(savedPlan)
    } catch (error) {
      console.error('Error saving date plan:', error)
      return res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

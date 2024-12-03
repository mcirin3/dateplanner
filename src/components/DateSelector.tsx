
import React, { useState } from 'react'

interface DateSelectorProps {
  onSelect: (date: Date, time: string) => void
}

export const DateSelector: React.FC<DateSelectorProps> = ({ onSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    setSelectedDate(date)
    if (selectedTime) {
      onSelect(date, selectedTime)
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value)
    if (selectedDate) {
      onSelect(selectedDate, e.target.value)
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Select Date and Time</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Date</label>
          <input 
            type="date" 
            onChange={handleDateChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-2">Time</label>
          <input 
            type="time" 
            onChange={handleTimeChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  )
}

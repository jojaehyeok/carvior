'use client';

import React, { useState, useEffect } from 'react';

// DateSelector 수정
interface DateSelectorProps {
  onDateTimeSelect?: (date: string, time: string) => void;
  initialDate?: string;
  initialTime?: string;
}

export default function DateTimeSelector({ onDateTimeSelect }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isBusinessHour, setIsBusinessHour] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', 
    '16:00'
  ];

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsBusinessHour(hours >= 8 && hours < 17);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setSelectedDate(dateStr);
    setSelectedTime('');
    
    if (onDateTimeSelect) {
      onDateTimeSelect(dateStr, '');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    if (onDateTimeSelect && selectedDate) {
      onDateTimeSelect(selectedDate, time);
    }
  };

  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          평가일시 선택
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={getMinDate()}
          max={getMaxDate()}
          className="
            w-full
            text-sm
            border border-gray-300 rounded-lg
            px-3 py-2.5
            focus:outline-none focus:ring-1 focus:ring-black
            bg-white
            cursor-pointer
          "
        />
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            시간 선택
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {TIME_SLOTS.map((time) => {
              const hour = parseInt(time.split(':')[0]);
              const isSelected = selectedTime === time;
              
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={`
                    py-2 px-1
                    rounded border
                    text-xs font-medium
                    transition
                    ${isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                    }
                  `}
                >
                  {hour}시
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
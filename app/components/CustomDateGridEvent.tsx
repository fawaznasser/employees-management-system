import React from "react";

interface DateGridEventProps {
  calendarEvent: {
    id: string;
    title: string;
    start: string;
    end: string;
  };
}

const CustomDateGridEvent: React.FC<DateGridEventProps> = ({ calendarEvent }) => {
  return (
    <div className="bg-green-600 text-white p-3 rounded-lg shadow-md border-l-4 border-white hover:scale-105 transition transform">
      <h3 className="text-sm font-bold">{calendarEvent.title}</h3>
      <p className="text-xs mt-1">
        📅 {new Date(calendarEvent.start).toLocaleDateString()}
      </p>
    </div>
  );
};

export default CustomDateGridEvent;

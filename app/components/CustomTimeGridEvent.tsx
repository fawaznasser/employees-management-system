import React from "react";

interface TimeGridEventProps {
  calendarEvent: {
    id: string;
    title: string;
    start: string;
    end: string;
  };
}

const CustomTimeGridEvent: React.FC<TimeGridEventProps> = ({ calendarEvent }) => {
  return (
    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-md border-l-4 border-white hover:scale-105 transition transform">
      <h3 className="text-sm font-bold">{calendarEvent.title}</h3>
      <p className="text-xs mt-1">
        🕒 {new Date(calendarEvent.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - 
        {new Date(calendarEvent.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
};

export default CustomTimeGridEvent;

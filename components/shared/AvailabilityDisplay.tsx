import React from "react";
import { Clock } from "lucide-react";

type AvailableHours = Record<string, string[]>;

const AvailabilityDisplay = ({
  availableHours,
}: {
  availableHours: AvailableHours;
}) => {
  // Group days by their hours string representation
  const groupedAvailability = Object.entries(availableHours).reduce(
    (acc, [day, hours]) => {
      const hoursKey = hours.join(", ");
      if (!acc[hoursKey]) {
        acc[hoursKey] = [];
      }
      acc[hoursKey].push(day);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Check if all days have the same hours
  const allDaysHaveSameHours = Object.keys(groupedAvailability).length === 1;

  return (
    <div className="space-y-4">
      {Object.entries(groupedAvailability).map(([hours, days]) => (
        <div key={hours} className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-500 mt-1" />
          <div>
            {!allDaysHaveSameHours && (
              <p className="font-medium text-gray-700">{days.join(", ")}</p>
            )}
            <p className="text-sm text-gray-500">{hours}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilityDisplay;

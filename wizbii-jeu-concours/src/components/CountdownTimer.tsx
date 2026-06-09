import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Clock } from "lucide-react";

export default function CountdownTimer() {
  // Target date value: July 31st, 2026 at 23:59:59
  // Note: Month is 0-indexed, so July is 6
  const targetDate = new Date(2026, 6, 31, 23, 59, 59).getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    function calculateTime() {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isCompleted: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isCompleted: false,
      });
    }

    // Initial run
    calculateTime();

    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const timeBlocks = [
    { label: "Jours", value: timeLeft.days },
    { label: "Heures", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Secondes", value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="bg-white rounded-3xl p-4 md:p-5 border border-white flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
      id="countdown-container"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#8386ff] animate-pulse" />
        <span className="text-xs font-extrabold text-[#000028] uppercase tracking-wider">
          Temps restant pour participer :
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-[#fcfaff] border border-gray-100 rounded-2xl py-2 px-1 sm:py-2.5 shadow-3xs"
          >
            <div className="text-lg sm:text-xl md:text-2xl font-black text-[#8386ff] tracking-tight font-mono">
              {String(block.value).padStart(2, "0")}
            </div>
            <div className="text-[9px] md:text-[10px] font-bold text-[#46464f]/70 uppercase mt-0.5">
              {block.label}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

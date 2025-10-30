import { useEffect, useState } from 'react';
import { Badge } from '@/frontend/components/ui/badge';
import { cn } from '@/frontend/utils/utils';

interface DomainCountdownProps {
  expiryDate: string;
  className?: string;
}

export function DomainCountdown({ expiryDate, className }: DomainCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiryTime = new Date(expiryDate).getTime();
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60); // Update every minute

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) {
    return (
      <Badge variant="destructive" className={className}>
        Expired
      </Badge>
    );
  }

  // Show warning if less than 30 days
  const isWarning = timeLeft.days < 30;
  // Show danger if less than 7 days
  const isDanger = timeLeft.days < 7;

  return (
    <Badge
      variant={isDanger ? "destructive" : isWarning ? "default" : "secondary"}
      className={cn(
        "transition-colors",
        className
      )}
    >
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
    </Badge>
  );
}
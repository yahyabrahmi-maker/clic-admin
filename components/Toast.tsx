'use client';
import { useEffect } from 'react';
import { Check } from 'lucide-react';

export default function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <Check size={16} />
      <span>{message}</span>
    </div>
  );
}
'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export function RocketLaunch() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none overflow-hidden">
      <div className="animate-launch relative">
        <span className="text-6xl">🚀</span>
        <div className="absolute top-12 left-4 -z-10 flex items-center justify-center">
            {/* Flames */}
            <div className="absolute h-16 w-6 rounded-full bg-orange-500 blur-md animate-flicker"></div>
            <div className="absolute h-20 w-8 rounded-full bg-yellow-400 blur-lg animate-flicker delay-100"></div>
            
            {/* Smoke */}
            <div className="absolute mt-10 h-10 w-10 rounded-full bg-gray-300 blur-xl animate-puff"></div>
            <div className="absolute mt-16 ml-4 h-8 w-8 rounded-full bg-gray-200 blur-lg animate-puff delay-200"></div>
            <div className="absolute mt-16 -ml-4 h-8 w-8 rounded-full bg-gray-200 blur-lg animate-puff delay-300"></div>
        </div>
      </div>
      <style jsx>{`
        @keyframes launch {
          0% {
            transform: translateY(200px) rotate(-45deg);
            opacity: 0;
          }
          20% {
            transform: translateY(0) rotate(-45deg);
            opacity: 1;
          }
          80% {
            transform: translateY(-80vh) rotate(-45deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(-45deg);
            opacity: 0;
          }
        }
        .animate-launch {
          animation: launch 2.5s ease-in forwards;
        }
        @keyframes flicker {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
        }
        .animate-flicker {
            animation: flicker 0.2s infinite;
        }
        @keyframes puff {
            0% { transform: scale(0.5); opacity: 0.8; }
            100% { transform: scale(3); opacity: 0; }
        }
        .animate-puff {
            animation: puff 1s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

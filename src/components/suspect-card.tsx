"use client";

import { User, Briefcase, MapPin, AlertTriangle, Scale, History } from "lucide-react";

export interface SuspectCardData {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  occupation: string;
  employer?: string;
  priorCount: number;
  currentCrime: string;
  caseAmount?: string;
  maxSentence: string;
}

interface SuspectCardProps {
  suspect: SuspectCardData;
}

export function SuspectCard({ suspect }: SuspectCardProps) {
  return (
    <div className="bg-black/60 border border-white/10 rounded-lg p-4 mb-4 backdrop-blur-sm">
      {/* Header row - ID badge style */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-red-900/30 border border-red-500/30 flex items-center justify-center">
            <User className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white tracking-wide">{suspect.name}</h3>
            <p className="text-sm text-white/50 font-typewriter">
              {suspect.age}yo • {suspect.gender} • {suspect.id}
            </p>
          </div>
        </div>
        
        {/* Prior badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          suspect.priorCount > 0 
            ? "bg-red-900/50 text-red-300 border border-red-500/30" 
            : "bg-green-900/30 text-green-400 border border-green-500/30"
        }`}>
          {suspect.priorCount > 0 ? (
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              {suspect.priorCount} PRIOR{suspect.priorCount > 1 ? "S" : ""}
            </span>
          ) : (
            "FIRST OFFENSE"
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {/* Location */}
        <div className="flex items-center gap-2 text-white/60">
          <MapPin className="w-4 h-4 text-white/40" />
          <span>{suspect.city}</span>
        </div>

        {/* Occupation */}
        <div className="flex items-center gap-2 text-white/60">
          <Briefcase className="w-4 h-4 text-white/40" />
          <span className="truncate">
            {suspect.occupation}
            {suspect.employer && <span className="text-white/40"> @ {suspect.employer}</span>}
          </span>
        </div>

        {/* Crime */}
        <div className="flex items-center gap-2 text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="font-medium">
            {suspect.currentCrime}
            {suspect.caseAmount && <span className="text-white/50 ml-1">({suspect.caseAmount})</span>}
          </span>
        </div>

        {/* Sentence */}
        <div className="flex items-center gap-2 text-white/60">
          <Scale className="w-4 h-4 text-white/40" />
          <span>Up to {suspect.maxSentence}</span>
        </div>
      </div>
    </div>
  );
}


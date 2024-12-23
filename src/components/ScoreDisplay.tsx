import { Score } from "@/types/evaluation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { getAdjustedScores } from "@/utils/scoring";

interface ScoreDisplayProps {
  scores: Score;
}

const ScoreDisplay = ({ scores }: ScoreDisplayProps) => {
  const adjustedScores = getAdjustedScores(scores);
  
  // Ensure all scores are between 0 and 5
  const normalizedScores = {
    sort: Math.min(5, Math.max(0, adjustedScores.sort)),
    setInOrder: Math.min(5, Math.max(0, adjustedScores.setInOrder)),
    shine: Math.min(5, Math.max(0, adjustedScores.shine)),
    standardize: Math.min(5, Math.max(0, adjustedScores.standardize)),
    sustain: Math.min(5, Math.max(0, adjustedScores.sustain)),
  };

  const data = [
    { subject: "Sort", score: normalizedScores.sort },
    { subject: "Set in Order", score: normalizedScores.setInOrder },
    { subject: "Shine", score: normalizedScores.shine },
    { subject: "Standardize", score: normalizedScores.standardize },
    { subject: "Sustain", score: normalizedScores.sustain },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <RadarChart data={data} startAngle={90} endAngle={-270}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b' }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreDisplay;
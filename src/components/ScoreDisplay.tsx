import { Score } from "@/types/evaluation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  PolarRadiusAxis,
} from "recharts";
import { getAdjustedScores } from "@/utils/scoring";

interface ScoreDisplayProps {
  scores: Score;
}

const ScoreDisplay = ({ scores }: ScoreDisplayProps) => {
  const adjustedScores = getAdjustedScores(scores);
  
  const data = [
    { subject: "Sort", score: adjustedScores.sort },
    { subject: "Set in Order", score: adjustedScores.setInOrder },
    { subject: "Shine", score: adjustedScores.shine },
    { subject: "Standardize", score: adjustedScores.standardize },
    { subject: "Sustain", score: adjustedScores.sustain },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <RadarChart 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
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
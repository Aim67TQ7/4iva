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
import { calculateTotalScore, calculatePercentageScore } from "@/utils/scoring";

interface ScoreDisplayProps {
  scores: Score;
}

const ScoreDisplay = ({ scores }: ScoreDisplayProps) => {
  const adjustedScores = getAdjustedScores(scores);
  const totalScore = calculateTotalScore(scores);
  const percentageScore = calculatePercentageScore(totalScore);
  
  const data = [
    { subject: "Sort", score: adjustedScores.sort },
    { subject: "Set in Order", score: adjustedScores.setInOrder },
    { subject: "Shine", score: adjustedScores.shine },
    { subject: "Standardize", score: adjustedScores.standardize },
    { subject: "Sustain", score: adjustedScores.sustain },
  ];

  return (
    <div className="relative w-full h-[300px]">
      <div className="absolute top-0 right-0 text-right">
        <div className="text-2xl font-bold text-blue-600">{percentageScore}%</div>
        <div className="text-sm text-gray-500">{totalScore}/50</div>
      </div>
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
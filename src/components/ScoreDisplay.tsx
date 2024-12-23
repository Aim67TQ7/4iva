import { Score } from "@/types/evaluation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface ScoreDisplayProps {
  scores: Score;
}

const ScoreDisplay = ({ scores }: ScoreDisplayProps) => {
  const data = [
    { subject: "Sort", score: scores.sort },
    { subject: "Set in Order", score: scores.setInOrder },
    { subject: "Shine", score: scores.shine },
    { subject: "Standardize", score: scores.standardize },
    { subject: "Sustain", score: scores.sustain },
  ];

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
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
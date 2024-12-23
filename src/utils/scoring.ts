import { Score } from "@/types/evaluation";

export const calculateTotalScore = (scores: Score): number => {
  // Ensure all scores are between 0 and 5 before calculating total
  const normalizedScores = {
    sort: Math.min(5, Math.max(0, scores.sort)),
    setInOrder: Math.min(5, Math.max(0, scores.setInOrder)),
    shine: Math.min(5, Math.max(0, scores.shine)),
    standardize: Math.min(5, Math.max(0, scores.standardize)),
    sustain: Math.min(5, Math.max(0, scores.sustain)),
  };
  
  const baseScore = normalizedScores.sort + normalizedScores.setInOrder + normalizedScores.shine;
  
  // If base score is less than 12, standardize and sustain are automatically 0
  if (baseScore < 12) {
    return baseScore;
  }
  
  return baseScore + normalizedScores.standardize + normalizedScores.sustain;
};
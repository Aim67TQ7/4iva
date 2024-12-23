import { Score } from "@/pages/Index";

export const calculateTotalScore = (scores: Score): number => {
  const baseScore = scores.sort + scores.setInOrder + scores.shine;
  
  // If base score is less than 12, standardize and sustain are automatically 0
  if (baseScore < 12) {
    return baseScore;
  }
  
  return baseScore + scores.standardize + scores.sustain;
};
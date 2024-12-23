import { Score } from "@/types/evaluation";

export const calculateTotalScore = (scores: Score): number => {
  const baseScore = scores.sort + scores.setInOrder + scores.shine;
  
  // If base score is less than 22, standardize and sustain are disqualified
  if (baseScore < 22) {
    return baseScore;
  }
  
  return baseScore + scores.standardize + scores.sustain;
};

export const calculatePercentageScore = (totalScore: number): number => {
  const maxPossibleScore = 50; // 10 points per category
  return Math.round((totalScore / maxPossibleScore) * 100);
};

export const getAdjustedScores = (scores: Score): Score => {
  const baseScore = scores.sort + scores.setInOrder + scores.shine;
  
  // If base score is less than 22, standardize and sustain are set to 0
  if (baseScore < 22) {
    return {
      ...scores,
      standardize: 0,
      sustain: 0
    };
  }
  
  return scores;
};
import { Score } from "@/types/evaluation";

export const calculateTotalScore = (scores: Score): number => {
  // Ensure all scores are between 1 and 10
  const normalizedScores = {
    sort: Math.min(10, Math.max(1, scores.sort)),
    setInOrder: Math.min(10, Math.max(1, scores.setInOrder)),
    shine: Math.min(10, Math.max(1, scores.shine)),
    standardize: Math.min(10, Math.max(0, scores.standardize)),
    sustain: Math.min(10, Math.max(0, scores.sustain)),
  };
  
  const baseScore = normalizedScores.sort + normalizedScores.setInOrder + normalizedScores.shine;
  
  // If base score is less than 22, standardize and sustain should be 0
  if (baseScore < 22) {
    return baseScore;
  }
  
  return baseScore + normalizedScores.standardize + normalizedScores.sustain;
};

export const calculatePercentageScore = (totalScore: number): number => {
  const maxPossibleScore = 50; // 10 points per category
  return Math.round((totalScore / maxPossibleScore) * 100);
};

export const getAdjustedScores = (scores: Score): Score => {
  // Ensure all scores are between 1 and 10
  const normalizedScores = {
    sort: Math.min(10, Math.max(1, scores.sort)),
    setInOrder: Math.min(10, Math.max(1, scores.setInOrder)),
    shine: Math.min(10, Math.max(1, scores.shine)),
    standardize: Math.min(10, Math.max(0, scores.standardize)),
    sustain: Math.min(10, Math.max(0, scores.sustain)),
  };
  
  const baseScore = normalizedScores.sort + normalizedScores.setInOrder + normalizedScores.shine;
  
  // If base score is less than 22, standardize and sustain are set to 0
  if (baseScore < 22) {
    return {
      sort: normalizedScores.sort,
      setInOrder: normalizedScores.setInOrder,
      shine: normalizedScores.shine,
      standardize: 0,
      sustain: 0
    };
  }
  
  return normalizedScores;
};
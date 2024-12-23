import { Score } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTotalScore } from "@/utils/scoring";

interface FeedbackProps {
  scores: Score;
}

const Feedback = ({ scores }: FeedbackProps) => {
  const totalScore = calculateTotalScore(scores);
  const baseScore = scores.sort + scores.setInOrder + scores.shine;

  const getFeedbackText = () => {
    if (baseScore < 12) {
      return "The first three S's (Sort, Set in Order, and Shine) need to be stabilized before implementing Standardize and Sustain. Focus on improving these fundamental aspects first.";
    }

    if (totalScore >= 21) {
      return "Excellent work! Your workspace demonstrates strong adherence to 5S principles. Keep maintaining these high standards.";
    } else if (totalScore >= 16) {
      return "Good progress! There's room for improvement, but you're on the right track. Focus on areas with lower scores.";
    } else if (totalScore >= 11) {
      return "Your workspace needs significant improvements. Review each principle and create an action plan.";
    } else {
      return "Immediate action is required. Consider implementing 5S principles from the ground up.";
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <p className="text-sm text-gray-600">{getFeedbackText()}</p>
      </CardContent>
    </Card>
  );
};

export default Feedback;
import { Score } from "@/types/evaluation";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTotalScore } from "@/utils/scoring";

interface FeedbackProps {
  scores: Score;
}

const Feedback = ({ scores }: FeedbackProps) => {
  const totalScore = calculateTotalScore(scores);
  const baseScore = scores.sort + scores.setInOrder + scores.shine;

  const getDetailedFeedback = () => {
    const feedback = [];
    
    // Sort feedback
    feedback.push({
      category: "Sort",
      score: scores.sort,
      comment: scores.sort >= 4 ? 
        "Excellent organization with minimal unnecessary items." :
        scores.sort >= 3 ?
        "Good sorting, but some unnecessary items remain." :
        "Significant improvement needed in removing unnecessary items."
    });

    // Set in Order feedback
    feedback.push({
      category: "Set in Order",
      score: scores.setInOrder,
      comment: scores.setInOrder >= 4 ?
        "Items are very well organized and easily accessible." :
        scores.setInOrder >= 3 ?
        "Decent organization, but some items could be better arranged." :
        "Items need better organization and arrangement."
    });

    // Shine feedback
    feedback.push({
      category: "Shine",
      score: scores.shine,
      comment: scores.shine >= 4 ?
        "Workspace is exceptionally clean and well-maintained." :
        scores.shine >= 3 ?
        "Workspace is generally clean but needs some attention." :
        "Cleanliness needs significant improvement."
    });

    // Standardize feedback
    feedback.push({
      category: "Standardize",
      score: scores.standardize,
      comment: scores.standardize >= 4 ?
        "Excellent standardization with clear procedures." :
        scores.standardize >= 3 ?
        "Good standards in place but room for improvement." :
        "Better standardization procedures needed."
    });

    // Sustain feedback
    feedback.push({
      category: "Sustain",
      score: scores.sustain,
      comment: scores.sustain >= 4 ?
        "Strong sustainability practices in place." :
        scores.sustain >= 3 ?
        "Decent sustainability but needs more consistency." :
        "Sustainability practices need significant improvement."
    });

    return feedback;
  };

  const getSummaryFeedback = () => {
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
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Summary</h3>
          <p className="text-sm text-gray-600 mb-6">{getSummaryFeedback()}</p>
          
          <h3 className="font-semibold mb-4">Detailed Feedback</h3>
          <div className="space-y-4">
            {getDetailedFeedback().map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{item.category}</h4>
                  <span className="text-sm text-gray-500">Score: {item.score}/5</span>
                </div>
                <p className="text-sm text-gray-600">{item.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
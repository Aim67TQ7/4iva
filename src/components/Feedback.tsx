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
        "Excellent organization with clear distinction between necessary and unnecessary items. All items have clear purpose and frequency of use is considered." :
        scores.sort >= 3 ?
        "Workspace shows basic organization but needs improvement. Some unnecessary items remain and the distinction between needed and unneeded items could be clearer. Consider implementing a red tag system for questionable items." :
        "Critical improvement needed in sorting. Many unnecessary items present, creating clutter and inefficiency. Implement immediate sorting process with clear criteria for keeping or removing items based on necessity and frequency of use."
    });

    // Set in Order feedback
    feedback.push({
      category: "Set in Order",
      score: scores.setInOrder,
      comment: scores.setInOrder >= 4 ?
        "Outstanding organization with clear visual management system. Items are perfectly positioned for efficiency with excellent labeling and space optimization." :
        scores.setInOrder >= 3 ?
        "Basic organization is present but could be improved. Consider implementing shadow boards, clearer labels, and optimizing item placement based on frequency of use. Some items are not in their optimal locations." :
        "Significant organization improvements needed. Items lack proper placement strategy, labels are missing or unclear, and workflow efficiency is compromised. Implement immediate space planning and visual management systems."
    });

    // Shine feedback
    feedback.push({
      category: "Shine",
      score: scores.shine,
      comment: scores.shine >= 4 ?
        "Exceptional cleanliness standards maintained. Equipment is well-maintained, surfaces are spotless, and regular cleaning protocols are evident and documented." :
        scores.shine >= 3 ?
        "Acceptable cleanliness but room for improvement. Some areas show signs of neglect, and cleaning protocols may not be consistently followed. Consider implementing daily cleaning checklists and maintenance schedules." :
        "Urgent attention needed for cleanliness. Multiple areas show dirt, dust, or debris. Equipment maintenance is lacking. Implement immediate cleaning standards and create detailed cleaning schedules with assigned responsibilities."
    });

    // Standardize feedback
    feedback.push({
      category: "Standardize",
      score: scores.standardize,
      comment: scores.standardize >= 4 ?
        "Excellent standardization with clear, documented procedures. Visual controls are effective and consistently maintained. Best practices are well-documented and followed." :
        scores.standardize >= 3 ?
        "Basic standards exist but need strengthening. Some procedures are unclear or inconsistently followed. Enhance visual controls and ensure all procedures are documented and accessible." :
        "Standardization is severely lacking. Few or no documented procedures exist. Create comprehensive standard operating procedures and implement visual management systems."
    });

    // Sustain feedback
    feedback.push({
      category: "Sustain",
      score: scores.sustain,
      comment: scores.sustain >= 4 ?
        "Strong sustainability practices with regular audits and continuous improvement culture. Team engagement is high and improvements are regularly implemented." :
        scores.sustain >= 3 ?
        "Basic sustainability measures exist but need reinforcement. Audit processes are inconsistent. Strengthen regular audits and increase team engagement in maintaining standards." :
        "Sustainability measures are inadequate. Implement regular audit schedules, create accountability systems, and develop team engagement strategies for maintaining 5S standards."
    });

    return feedback;
  };

  const getSummaryFeedback = () => {
    if (totalScore >= 21) {
      return "Excellent work! Your workspace demonstrates strong adherence to 5S principles. Focus on maintaining these high standards and look for opportunities for continuous improvement.";
    } else if (totalScore >= 16) {
      return "Good progress, but there's room for improvement. Focus particularly on areas scoring below 4, and develop specific action plans to address these gaps. Consider implementing more visual management systems and standardized procedures.";
    } else if (totalScore >= 11) {
      return "Your workspace needs significant improvements. Start by focusing on the first 3S principles (Sort, Set in Order, Shine) to build a strong foundation. Create detailed action plans with specific timelines and responsibilities.";
    } else {
      return "Immediate action required. Begin with a thorough sorting process to remove unnecessary items, then focus on organizing remaining items and establishing basic cleaning standards. Document all improvements and create specific action plans for each area.";
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
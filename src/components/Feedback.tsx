import { Score } from "@/types/evaluation";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTotalScore, calculatePercentageScore } from "@/utils/scoring";

interface FeedbackProps {
  scores: Score;
}

const Feedback = ({ scores }: FeedbackProps) => {
  const totalScore = calculateTotalScore(scores);
  const percentageScore = calculatePercentageScore(totalScore);
  const baseScore = scores.sort + scores.setInOrder + scores.shine;

  const getDetailedFeedback = () => {
    const feedback = [];
    
    // Sort feedback
    feedback.push({
      category: "Sort",
      score: scores.sort,
      comment: scores.sort >= 8 ? 
        "Exceptional organization with perfect distinction between necessary and unnecessary items. Clear red-tag system in place with documented criteria for item retention. Frequency of use is clearly considered in all storage decisions." :
        scores.sort >= 6 ?
        "Good organization with clear distinction between necessary and unnecessary items. Some improvement needed in documenting criteria for keeping items. Consider implementing a more structured red-tag system and reviewing item usage frequency more systematically." :
        scores.sort >= 4 ?
        "Basic sorting is present but significant improvement needed. Many unnecessary items remain. Implement immediate sorting process with clear criteria for keeping or removing items. Start with a thorough red-tag event and document all decisions." :
        "Critical improvement needed in sorting. Workspace is cluttered with many unnecessary items creating inefficiency and safety hazards. Urgent need for a comprehensive sorting system with clear criteria for item retention based on necessity and frequency of use."
    });

    // Set in Order feedback
    feedback.push({
      category: "Set in Order",
      score: scores.setInOrder,
      comment: scores.setInOrder >= 8 ?
        "Outstanding organization with advanced visual management system. Perfect item positioning for maximum efficiency. Excellent use of shadow boards, labels, and space optimization. Clear workflow patterns established and documented." :
        scores.setInOrder >= 6 ?
        "Good organization with basic visual management system in place. Most items have designated locations but some optimization needed. Consider implementing more shadow boards and reviewing item placement based on frequency of use. Some workflow patterns could be improved." :
        scores.setInOrder >= 4 ?
        "Basic organization exists but needs significant improvement. Many items lack proper placement strategy. Implement comprehensive space planning, add clear visual indicators, and optimize workflow patterns. Consider time-motion studies to improve efficiency." :
        "Urgent attention needed for organization. Most items lack designated locations causing significant time waste. No clear visual management system. Implement immediate space planning with emphasis on frequency of use and workflow efficiency."
    });

    // Shine feedback
    feedback.push({
      category: "Shine",
      score: scores.shine,
      comment: scores.shine >= 8 ?
        "Exemplary cleanliness standards with documented daily cleaning protocols. Equipment maintenance schedules are detailed and followed rigorously. Cleaning responsibilities are clearly assigned and tracked. Preventive maintenance program is highly effective." :
        scores.shine >= 6 ?
        "Good cleanliness standards with basic cleaning protocols in place. Some areas show minor neglect. Strengthen daily cleaning schedules and equipment maintenance tracking. Consider implementing more detailed cleaning checklists and preventive maintenance schedules." :
        scores.shine >= 4 ?
        "Basic cleanliness maintained but significant improvement needed. Several areas show neglect and equipment maintenance is inconsistent. Create comprehensive cleaning standards with clear responsibilities. Implement daily cleaning checklists and regular maintenance schedules." :
        "Critical improvement needed in cleanliness and maintenance. Multiple areas show significant dirt, dust, or debris. Equipment maintenance is severely lacking. Urgent need for establishing basic cleaning standards and maintenance protocols."
    });

    // Standardize feedback
    feedback.push({
      category: "Standardize",
      score: scores.standardize,
      comment: scores.standardize >= 8 ?
        "Exceptional standardization with comprehensive documented procedures. Visual controls are highly effective and consistently maintained. Best practices are well-documented, followed, and regularly updated. Regular audits ensure compliance." :
        scores.standardize >= 6 ?
        "Good standardization with most procedures documented. Visual controls are effective but some improvements needed. Most best practices are documented but updates are inconsistent. Consider implementing more regular audits and updating procedures more frequently." :
        scores.standardize >= 4 ?
        "Basic standardization exists but needs significant improvement. Many procedures are unclear or outdated. Visual controls are inconsistent. Create comprehensive standard operating procedures and implement regular review process." :
        "Standardization is severely lacking or disqualified due to low base scores. Few or no documented procedures exist. Create comprehensive standard operating procedures and implement visual management systems."
    });

    // Sustain feedback
    feedback.push({
      category: "Sustain",
      score: scores.sustain,
      comment: scores.sustain >= 8 ?
        "Outstanding sustainability practices with robust audit system and strong continuous improvement culture. Team engagement is exceptional with regular kaizen events. Improvements are consistently implemented and tracked." :
        scores.sustain >= 6 ?
        "Good sustainability measures with regular audits and decent team engagement. Some improvement opportunities in maintaining standards. Consider implementing more frequent kaizen events and strengthening team involvement in improvement initiatives." :
        scores.sustain >= 4 ?
        "Basic sustainability measures exist but need significant improvement. Audit processes are inconsistent and team engagement is low. Implement regular audit schedules and develop comprehensive team engagement strategy." :
        "Sustainability measures are inadequate or disqualified due to low base scores. Implement fundamental audit schedules, create accountability systems, and develop team engagement strategies for maintaining 5S standards."
    });

    return feedback;
  };

  const getSummaryFeedback = () => {
    if (percentageScore >= 80) {
      return `Outstanding performance with a score of ${percentageScore}%! Your workspace demonstrates exceptional adherence to 5S principles. Focus on maintaining these high standards and continue driving continuous improvement initiatives.`;
    } else if (percentageScore >= 60) {
      return `Good progress with a score of ${percentageScore}%. While showing strong fundamentals, there's room for improvement. Focus particularly on areas scoring below 8, and develop specific action plans to address these gaps.`;
    } else if (percentageScore >= 40) {
      return `Basic implementation with a score of ${percentageScore}%. Your workspace needs significant improvements. Start by strengthening the first 3S principles (Sort, Set in Order, Shine) to build a stronger foundation. Create detailed action plans with specific timelines.`;
    } else {
      return `Critical attention needed with a score of ${percentageScore}%. Begin with a thorough review of the first 3S principles. Create comprehensive improvement plans with clear milestones and responsibilities for each area.`;
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
                  <span className="text-sm text-gray-500">Score: {item.score}/10</span>
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
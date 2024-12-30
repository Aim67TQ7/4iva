import { Score } from "@/types/evaluation";
import { Card, CardContent } from "@/components/ui/card";
import { calculateTotalScore, calculatePercentageScore } from "@/utils/scoring";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface FeedbackProps {
  scores: Score;
}

const Feedback = ({ scores }: FeedbackProps) => {
  const totalScore = calculateTotalScore(scores);
  const percentageScore = calculatePercentageScore(totalScore);

  const getScoreIndicator = (score: number) => {
    if (score >= 8) return <CheckCircle2 className="inline-block w-5 h-5 text-green-500 mr-2" />;
    if (score >= 5) return <AlertCircle className="inline-block w-5 h-5 text-yellow-500 mr-2" />;
    return <XCircle className="inline-block w-5 h-5 text-red-500 mr-2" />;
  };

  const getDetailedFeedback = () => {
    const feedback = [];
    
    // Sort feedback
    feedback.push({
      category: "Sort",
      score: scores.sort,
      comment: scores.sort >= 8 ? 
        "The workspace demonstrates exceptional organization with a clear red-tag system. All items are properly categorized based on frequency of use, with unnecessary items completely removed. Visual indicators clearly show what belongs and what doesn't." :
        scores.sort >= 6 ?
        "While most items are organized, there are opportunities to improve the red-tag system. Some infrequently used items could be relocated, and clearer documentation is needed for item retention criteria. Consider implementing a more systematic approach to evaluating item necessity." :
        scores.sort >= 4 ?
        "Significant sorting improvements needed. Multiple unnecessary items were observed in the workspace. Implement an immediate red-tag event focusing on removing obsolete equipment, excess inventory, and rarely used tools. Document all sorting decisions and criteria." :
        "Critical sorting issues detected. The workspace shows excessive clutter with many unnecessary items creating workflow bottlenecks. Urgent need to implement a comprehensive sorting system with clear decision criteria for keeping or removing items."
    });

    // Set in Order feedback
    feedback.push({
      category: "Set in Order",
      score: scores.setInOrder,
      comment: scores.setInOrder >= 8 ?
        "Excellent visual management system observed with clear labeling and optimal item placement. Shadow boards are effectively utilized, and workflow patterns are clearly marked. Storage locations are strategically positioned based on usage frequency." :
        scores.setInOrder >= 6 ?
        "Good organization with basic visual management, but some optimization needed. While most items have designated locations, some high-use items could be better positioned. Consider implementing more shadow boards and reviewing current layout for improved efficiency." :
        scores.setInOrder >= 4 ?
        "Organization needs significant improvement. Many items lack proper placement strategy, causing inefficient movement patterns. Implement comprehensive space planning with clear visual indicators. Consider conducting time-motion studies to optimize layout." :
        "Severe organization issues detected. Most items lack designated locations, resulting in significant time waste. No clear visual management system in place. Immediate action needed to establish proper storage locations and workflow patterns."
    });

    // Shine feedback
    feedback.push({
      category: "Shine",
      score: scores.shine,
      comment: scores.shine >= 8 ?
        "Outstanding cleanliness standards with visible daily cleaning protocols. Equipment maintenance schedules are detailed and consistently followed. All surfaces are clean, and preventive maintenance program shows excellent results." :
        scores.shine >= 6 ?
        "Generally clean workspace but some areas show minor neglect. Basic cleaning protocols exist but need more consistency. Strengthen daily cleaning schedules and implement more detailed maintenance tracking systems." :
        scores.shine >= 4 ?
        "Cleanliness standards need significant improvement. Several areas show visible dirt and dust accumulation. Equipment maintenance is inconsistent. Create and implement detailed cleaning standards with clear responsibilities." :
        "Critical cleanliness issues found. Multiple areas show significant dirt, dust, or debris. Equipment maintenance is severely lacking. Urgent need to establish basic cleaning standards and regular maintenance protocols."
    });

    // Standardize feedback
    if (scores.standardize > 0) {
      feedback.push({
        category: "Standardize",
        score: scores.standardize,
        comment: scores.standardize >= 8 ?
          "Exceptional standardization with comprehensive documented procedures. Visual controls are consistently maintained and updated. Regular audits ensure compliance with established standards." :
          scores.standardize >= 6 ?
          "Good standardization but some procedures need updating. Visual controls are mostly effective but some improvements needed. Consider implementing more regular audits and procedure reviews." :
          scores.standardize >= 4 ?
          "Basic standardization exists but needs significant improvement. Many procedures are unclear or outdated. Create comprehensive standard operating procedures and implement regular review process." :
          "Standardization is severely lacking. Few or no documented procedures exist. Create detailed standard operating procedures and implement visual management systems."
      });
    }

    // Sustain feedback
    if (scores.sustain > 0) {
      feedback.push({
        category: "Sustain",
        score: scores.sustain,
        comment: scores.sustain >= 8 ?
          "Strong sustainability practices with robust audit system and active continuous improvement culture. Team engagement is exceptional with regular kaizen events and documented improvements." :
          scores.sustain >= 6 ?
          "Good sustainability measures but engagement could improve. Regular audits are conducted but follow-through on improvements is inconsistent. Strengthen team involvement in improvement initiatives." :
          scores.sustain >= 4 ?
          "Basic sustainability measures exist but need significant improvement. Audit processes are inconsistent and team engagement is low. Implement regular audit schedules and develop team engagement strategy." :
          "Sustainability measures are inadequate. Implement fundamental audit schedules and create accountability systems for maintaining standards."
      });
    }

    return feedback;
  };

  const getSummaryFeedback = () => {
    if (percentageScore >= 80) {
      return `Outstanding workspace organization (${percentageScore}%)! The evaluation reveals exceptional 5S implementation with clear visual management systems, consistent cleaning protocols, and strong team engagement. Focus on maintaining these high standards through regular audits and continuous improvement initiatives.`;
    } else if (percentageScore >= 60) {
      return `Good progress shown (${percentageScore}%). While fundamental 5S principles are implemented, specific areas need attention. Focus particularly on improving ${scores.sort < 7 ? 'sorting and red-tag systems' : scores.setInOrder < 7 ? 'visual management and workflow optimization' : 'cleaning and maintenance protocols'}. Develop targeted action plans for areas scoring below 7.`;
    } else if (percentageScore >= 40) {
      return `Significant improvements needed (${percentageScore}%). The evaluation indicates fundamental gaps in 5S implementation. Priority should be given to ${scores.sort < 5 ? 'removing unnecessary items and establishing clear sorting criteria' : scores.setInOrder < 5 ? 'implementing proper storage systems and visual controls' : 'establishing basic cleaning and maintenance standards'}. Create detailed action plans with specific timelines.`;
    } else {
      return `Critical attention required (${percentageScore}%). The workspace evaluation reveals serious organizational issues affecting efficiency and safety. Immediate action needed to implement basic 5S principles, starting with ${scores.sort < 4 ? 'removing unnecessary items and establishing organization systems' : scores.setInOrder < 4 ? 'creating designated storage locations and visual management' : 'implementing basic cleaning and maintenance protocols'}.`;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Executive Summary</h3>
          <p className="text-sm text-gray-600 mb-6">{getSummaryFeedback()}</p>
          
          <h3 className="font-semibold mb-4">Detailed Analysis</h3>
          <div className="space-y-4">
            {getDetailedFeedback().map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium flex items-center">
                    {getScoreIndicator(item.score)}
                    {item.category}
                  </h4>
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
import React from "react";
import { Card, Chip, Progress, Spinner } from "@nextui-org/react";

interface ScoreCardProps {
    relevanceScore: number | null;
    trustworthinessScore: number | null;
    isCalculating: boolean;
  }

const ScoreCard: React.FC<ScoreCardProps> = ({ relevanceScore, trustworthinessScore, isCalculating }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    if (score >= 40) return "primary";
    return "danger";
  };

  const ScoreIndicator: React.FC<{ label: string; score: number | null }> = ({ label, score }) => (
    <div className="flex flex-col space-y-1 mb-2">
      <div className="flex justify-between items-center">
        <Chip variant="flat" size="sm">{label}</Chip>
        {isCalculating ? (
          <Spinner size="sm" />
        ) : (
          score !== null && <span className="text-sm font-semibold">{score}%</span>
        )}
      </div>
      {isCalculating ? (
        <Progress 
          size="sm"
          className="max-w-full"
        />
      ) : (
        score !== null ? (
          <Progress 
            size="sm" 
            value={score} 
            color={getScoreColor(score)}
            className="max-w-full"
          />
        ) : (
          <span className="text-gray-400 text-sm">Not available</span>
        )
      )}
    </div>
  );

  return (
    <Card className="p-4 bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-3">Result Scores</h3>
      <ScoreIndicator label="Relevance" score={relevanceScore} />
      <ScoreIndicator label="Trustworthiness" score={trustworthinessScore} />
    </Card>
  );
};

export default ScoreCard;
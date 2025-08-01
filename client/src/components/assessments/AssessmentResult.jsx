import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AssessmentResult = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/assessments/${assessmentId}`);
        if (response.data.success) {
          setResult(response.data.data.assessment);
        }
      } catch (error) {
        console.error("Failed to fetch assessment result:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResult();
  }, [assessmentId]);

  const getMaturityLevel = (score) => {
    if (score >= 2.4) return { level: 'M3', label: 'Maturité élevée', color: 'bg-green-500' };
    if (score >= 1.7) return { level: 'M2', label: 'Maturité moyenne', color: 'bg-yellow-500' };
    return { level: 'M1', label: 'Maturité faible', color: 'bg-red-500' };
  };

  if (isLoading) return <div>Loading results...</div>;
  if (!result) return <div>Could not load assessment results.</div>;

  const maturity = getMaturityLevel(result.overallScore);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Assessment Results</h1>
          <p className="text-gray-600">Project: {result.project?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Overall Score</h3>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-600">{result.overallScore?.toFixed(2)}</div>
                <div className="text-lg text-gray-600">out of 3.0</div>
              </div>
              <div className={`${maturity.color} text-white rounded-xl p-4 text-center mb-6`}>
                <div className="text-xl font-bold">{maturity.level}</div>
                <div>{maturity.label}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Category Breakdown</h3>
              <div className="space-y-4">
                {(result.categoryScores || []).map((cs, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{cs.category?.name || 'Unnamed Category'}</span>
                      <span className="font-bold text-blue-600">{(cs.score / cs.questionsAnswered).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(cs.score / (cs.questionsAnswered * 3)) * 100}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>

        <div className="text-center mt-8">
            <button
                onClick={() => navigate(`/projects/${result.project?._id || result.project}`)}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
                Back to Project
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
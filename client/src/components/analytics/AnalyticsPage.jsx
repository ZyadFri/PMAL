import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, 
  Legend, RadialLinearScale, Filler, ArcElement, BarElement
);

const AnalyticsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/projects/${projectId}/analytics?timeRange=${selectedTimeRange}`);
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        } else {
          setError('Failed to load analytics data.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId, selectedTimeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-red-100">
          <div className="text-red-500 text-xl font-semibold">{error}</div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600 text-xl">No analytics data available.</div>
      </div>
    );
  }

  const { kpis, charts, projectName } = analyticsData;

  // Enhanced Chart Configurations
  const scoreHistoryData = {
    labels: charts.scoreHistory.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [{
      label: 'Overall Score',
      data: charts.scoreHistory.map(h => h.score),
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgb(99, 102, 241)',
      borderWidth: 3,
      tension: 0.4,
      pointBackgroundColor: 'rgb(99, 102, 241)',
      pointBorderColor: 'white',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      shadowColor: 'rgba(99, 102, 241, 0.3)',
      shadowBlur: 10,
    }],
  };

  const categoryPerformanceData = {
    labels: charts.categoryPerformance.map(c => c.category.name),
    datasets: [{
      label: 'Category Performance',
      data: charts.categoryPerformance.map(c => c.score),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(14, 165, 233, 0.8)',
      ],
      borderColor: 'white',
      borderWidth: 3,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 12,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748b',
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#64748b',
        }
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(99, 102, 241, 0.2)' },
        grid: { color: 'rgba(99, 102, 241, 0.1)' },
        pointLabels: { 
          font: { size: 12, weight: 'bold' },
          color: '#475569'
        },
        suggestedMin: 0,
        suggestedMax: 3,
        ticks: {
          display: false,
        }
      },
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 12,
        padding: 12,
      }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Floating Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-slate-600 font-medium mt-1">{projectName}</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 bg-white/80 border border-white/30 rounded-xl text-slate-700 font-medium shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button
                onClick={() => navigate(`/projects/${projectId}`)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Back to Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Enhanced KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          <KpiCard 
            title="Total Assessments" 
            value={kpis.totalAssessments} 
            icon="📊"
            gradient="from-blue-500 to-cyan-500"
          />
          <KpiCard 
            title="Average Score" 
            value={kpis.averageScore.toFixed(2)} 
            icon="⭐"
            gradient="from-purple-500 to-pink-500"
          />
          <KpiCard 
            title="Highest Score" 
            value={kpis.highestScore.toFixed(2)} 
            icon="🏆"
            gradient="from-green-500 to-emerald-500"
          />
          <KpiCard 
            title="Lowest Score" 
            value={kpis.lowestScore.toFixed(2)} 
            icon="📉"
            gradient="from-orange-500 to-red-500"
          />
          <KpiCard 
            title="Quick Assessments" 
            value={kpis.quickAssessmentCount} 
            icon="⚡"
            gradient="from-yellow-500 to-orange-500"
          />
          <KpiCard 
            title="Deep Assessments" 
            value={kpis.deepAssessmentCount} 
            icon="🔍"
            gradient="from-indigo-500 to-purple-500"
          />
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Score History - Takes 2 columns */}
          <div className="xl:col-span-2 bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Score Evolution</h3>
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div className="h-80">
              <Line data={scoreHistoryData} options={chartOptions} />
            </div>
          </div>

          {/* Category Performance Radar */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Category Radar</h3>
              <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
            </div>
            <div className="h-80">
              <Radar data={categoryPerformanceData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Additional Insights Section */}
        
      </div>
    </div>
  );
};

// Enhanced KPI Card Component
const KpiCard = ({ title, value, icon, gradient }) => (
  <div className="group relative bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className={`w-2 h-2 bg-gradient-to-r ${gradient} rounded-full animate-pulse`}></div>
      </div>
      <p className="text-sm text-slate-600 font-semibold mb-2">{title}</p>
      <p className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  </div>
);

// Insight Card Component
const InsightCard = ({ label, value, positive }) => (
  <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/30">
    <span className="text-slate-700 font-medium">{label}</span>
    <span className={`font-bold ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {positive && '+'}
      {value}
    </span>
  </div>
);

// Category Bar Component
const CategoryBar = ({ name, score, maxScore, color }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-700">{name}</span>
        <span className="text-sm font-bold text-slate-600">{score.toFixed(1)}/{maxScore}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
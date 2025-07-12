import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  ChatBubbleBottomCenterTextIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  NewspaperIcon,
  GlobeAltIcon,
  TagIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SpeakerWaveIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SentimentData {
  id: string;
  symbol: string;
  timestamp: number;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
  source: 'NEWS' | 'SOCIAL' | 'ANALYST' | 'EARNINGS' | 'TECHNICAL';
  title: string;
  content: string;
  url?: string;
  author?: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  keywords: string[];
  volume: number; // mention volume
}

interface SentimentSummary {
  symbol: string;
  overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  averageScore: number;
  confidence: number;
  totalMentions: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  trendDirection: 'UP' | 'DOWN' | 'FLAT';
  lastUpdated: number;
}

const SentimentFeed: React.FC = () => {
  const { theme } = useTheme();
  const [sentiments, setSentiments] = useState<SentimentData[]>([]);
  const [summary, setSummary] = useState<SentimentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'NEWS' | 'SOCIAL' | 'ANALYST' | 'EARNINGS' | 'TECHNICAL'>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSentimentData = async () => {
    try {
      setLoading(true);
      const data = await liveDataService.getSentimentData();
      
      // If no real data, generate sample sentiment data
      if (!data || data.length === 0) {
        const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'NIFTY', 'BANKNIFTY'];
        const sources = ['NEWS', 'SOCIAL', 'ANALYST', 'EARNINGS', 'TECHNICAL'];
        const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
        const impacts = ['HIGH', 'MEDIUM', 'LOW'];
        
        const sampleData: SentimentData[] = [];
        
        for (let i = 0; i < 100; i++) {
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const source = sources[Math.floor(Math.random() * sources.length)];
          const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
          const impact = impacts[Math.floor(Math.random() * impacts.length)];
          
          sampleData.push({
            id: `sentiment_${i}`,
            symbol,
            timestamp: Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
            sentiment: sentiment as SentimentData['sentiment'],
            score: sentiment === 'POSITIVE' ? Math.random() * 0.5 + 0.5 : 
                   sentiment === 'NEGATIVE' ? Math.random() * -0.5 - 0.5 : 
                   (Math.random() - 0.5) * 0.3,
            confidence: Math.random() * 0.3 + 0.7,
            source: source as SentimentData['source'],
            title: `${symbol} ${sentiment.toLowerCase()} sentiment detected`,
            content: `Analysis shows ${sentiment.toLowerCase()} sentiment for ${symbol} based on recent ${source.toLowerCase()} data.`,
            url: `https://example.com/article/${i}`,
            author: `Analyst ${i % 10 + 1}`,
            impact: impact as SentimentData['impact'],
            keywords: ['market', 'trading', symbol.toLowerCase(), sentiment.toLowerCase()],
            volume: Math.floor(Math.random() * 1000) + 10
          });
        }
        
        setSentiments(sampleData);
        
        // Generate summary data
        const summaryData: SentimentSummary[] = symbols.map(symbol => {
          const symbolData = sampleData.filter(d => d.symbol === symbol);
          const positiveCount = symbolData.filter(d => d.sentiment === 'POSITIVE').length;
          const negativeCount = symbolData.filter(d => d.sentiment === 'NEGATIVE').length;
          const neutralCount = symbolData.filter(d => d.sentiment === 'NEUTRAL').length;
          const averageScore = symbolData.reduce((sum, d) => sum + d.score, 0) / symbolData.length;
          
          return {
            symbol,
            overallSentiment: averageScore > 0.1 ? 'POSITIVE' : averageScore < -0.1 ? 'NEGATIVE' : 'NEUTRAL',
            averageScore,
            confidence: symbolData.reduce((sum, d) => sum + d.confidence, 0) / symbolData.length,
            totalMentions: symbolData.length,
            positiveCount,
            negativeCount,
            neutralCount,
            trendDirection: averageScore > 0.05 ? 'UP' : averageScore < -0.05 ? 'DOWN' : 'FLAT',
            lastUpdated: Date.now()
          };
        });
        
        setSummary(summaryData);
      } else {
        setSentiments(data.sentiments);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentimentData();
    
    // Subscribe to real-time sentiment updates
    const unsubscribe = liveDataService.subscribeToSentiment((newSentiment) => {
      setSentiments(prev => [newSentiment, ...prev.slice(0, 99)]);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchSentimentData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredSentiments = sentiments.filter(sentiment => {
    const matchesSearch = sentiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sentiment.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sentiment.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = sourceFilter === 'ALL' || sentiment.source === sourceFilter;
    const matchesSentiment = sentimentFilter === 'ALL' || sentiment.sentiment === sentimentFilter;
    const matchesImpact = impactFilter === 'ALL' || sentiment.impact === impactFilter;
    const matchesSymbol = !selectedSymbol || sentiment.symbol === selectedSymbol;
    
    return matchesSearch && matchesSource && matchesSentiment && matchesImpact && matchesSymbol;
  });

  const getSentimentColor = (sentiment: SentimentData['sentiment']) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'text-green-500';
      case 'NEGATIVE':
        return 'text-red-500';
      case 'NEUTRAL':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getSentimentIcon = (sentiment: SentimentData['sentiment']) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <FaceSmileIcon className="w-5 h-5 text-green-500" />;
      case 'NEGATIVE':
        return <FaceFrownIcon className="w-5 h-5 text-red-500" />;
      case 'NEUTRAL':
        return <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSourceIcon = (source: SentimentData['source']) => {
    switch (source) {
      case 'NEWS':
        return <NewspaperIcon className="w-4 h-4" />;
      case 'SOCIAL':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'ANALYST':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'EARNINGS':
        return <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />;
      case 'TECHNICAL':
        return <ArrowTrendingUpIcon className="w-4 h-4" />;
      default:
        return <TagIcon className="w-4 h-4" />;
    }
  };

  const formatScore = (score: number) => {
    return score >= 0 ? `+${score.toFixed(3)}` : score.toFixed(3);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">
                Sentiment Feed
              </h1>
              <p className="text-text-secondary">
                Real-time market sentiment analysis and social media monitoring
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-bg-secondary hover:bg-bg-tertiary text-text-primary'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SpeakerWaveIcon className="w-4 h-4" />
                <span>{autoRefresh ? 'Live' : 'Paused'}</span>
              </motion.button>
              <motion.button
                onClick={fetchSentimentData}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-accent-primary hover:bg-accent-secondary text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ClockIcon className="w-4 h-4" />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Sentiment Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Market Sentiment Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {summary.map((item) => (
              <motion.div
                key={item.symbol}
                onClick={() => setSelectedSymbol(selectedSymbol === item.symbol ? '' : item.symbol)}
                className={`bg-bg-secondary rounded-lg p-4 cursor-pointer transition-all hover:bg-bg-tertiary ${
                  selectedSymbol === item.symbol ? 'ring-2 ring-accent-primary' : ''
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-text-primary">{item.symbol}</h3>
                  <div className="flex items-center space-x-1">
                    {getSentimentIcon(item.overallSentiment)}
                    {item.trendDirection === 'UP' && <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />}
                    {item.trendDirection === 'DOWN' && <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Score</span>
                    <span className={`font-medium ${getSentimentColor(item.overallSentiment)}`}>
                      {formatScore(item.averageScore)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Mentions</span>
                    <span className="text-text-primary">{item.totalMentions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Confidence</span>
                    <span className="text-text-primary">{(item.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-3 flex space-x-1">
                  <div className="flex-1 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(item.positiveCount / item.totalMentions) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${(item.negativeCount / item.totalMentions) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${(item.neutralCount / item.totalMentions) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search sentiment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Sources</option>
              <option value="NEWS">News</option>
              <option value="SOCIAL">Social Media</option>
              <option value="ANALYST">Analyst</option>
              <option value="EARNINGS">Earnings</option>
              <option value="TECHNICAL">Technical</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POSITIVE">Positive</option>
              <option value="NEGATIVE">Negative</option>
              <option value="NEUTRAL">Neutral</option>
            </select>

            {/* Impact Filter */}
            <select
              value={impactFilter}
              onChange={(e) => setImpactFilter(e.target.value as any)}
              className="px-3 py-2 bg-bg-tertiary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="ALL">All Impact</option>
              <option value="HIGH">High Impact</option>
              <option value="MEDIUM">Medium Impact</option>
              <option value="LOW">Low Impact</option>
            </select>

            {selectedSymbol && (
              <motion.button
                onClick={() => setSelectedSymbol('')}
                className="px-3 py-2 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear: {selectedSymbol}
              </motion.button>
            )}
          </div>
        </div>

        {/* Sentiment Feed */}
        <div className="bg-bg-secondary rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border-primary">
            <h2 className="text-lg font-semibold text-text-primary">
              Live Sentiment Feed ({filteredSentiments.length})
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
                <span className="text-text-secondary">Loading sentiment data...</span>
              </div>
            ) : filteredSentiments.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                No sentiment data matches your criteria
              </div>
            ) : (
              <div className="divide-y divide-border-primary">
                {filteredSentiments.map((sentiment, index) => (
                  <motion.div
                    key={sentiment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    className="p-4 hover:bg-bg-tertiary/50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getSentimentIcon(sentiment.sentiment)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-text-primary">{sentiment.symbol}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sentiment.impact === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                              sentiment.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {sentiment.impact}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-text-secondary text-sm">
                            <div className="flex items-center space-x-1">
                              {getSourceIcon(sentiment.source)}
                              <span>{sentiment.source}</span>
                            </div>
                            <span>{formatDateTime(sentiment.timestamp)}</span>
                          </div>
                        </div>
                        <h3 className="text-text-primary font-medium mb-1">{sentiment.title}</h3>
                        <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                          {sentiment.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-text-secondary">Score:</span>
                              <span className={`font-medium ${getSentimentColor(sentiment.sentiment)}`}>
                                {formatScore(sentiment.score)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-text-secondary">Confidence:</span>
                              <span className="text-text-primary">{(sentiment.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-text-secondary">Volume:</span>
                              <span className="text-text-primary">{sentiment.volume}</span>
                            </div>
                          </div>
                          {sentiment.url && (
                            <motion.a
                              href={sentiment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-primary hover:text-accent-secondary text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                            >
                              View Source
                            </motion.a>
                          )}
                        </div>
                        {sentiment.keywords.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {sentiment.keywords.slice(0, 5).map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-bg-tertiary text-text-secondary text-xs rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SentimentFeed;

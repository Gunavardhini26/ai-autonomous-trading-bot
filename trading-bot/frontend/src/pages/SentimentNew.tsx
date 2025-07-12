import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  TrendingUp,
  TrendingDown,
  Newspaper,
  MessageCircle,
  Twitter,
  Globe,
  Filter,
  RefreshCw,
  Activity,
  Brain,
  Target,
  AlertTriangle,
  Calendar,
  Clock
} from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  symbols: string[];
  url: string;
  category: 'market' | 'company' | 'economic' | 'political';
}

interface SentimentData {
  symbol: string;
  overall: number;
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  newsCount: number;
  socialMentions: number;
}

const SentimentNew: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'news' | 'social' | 'market'>('news');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [showFilters, setShowFilters] = useState(false);

  const [news, setNews] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'RBI Monetary Policy: Rate Cut Expected to Boost Market Sentiment',
      summary: 'The Reserve Bank of India is expected to announce a 25 basis point rate cut in the upcoming monetary policy meeting, which could provide a significant boost to equity markets.',
      source: 'Economic Times',
      publishedAt: new Date('2025-07-10T14:30:00'),
      sentiment: 'positive',
      sentimentScore: 0.78,
      symbols: ['NIFTY', 'BANKNIFTY', 'HDFC', 'ICICI'],
      url: '#',
      category: 'economic'
    },
    {
      id: '2',
      title: 'Reliance Industries Q1 Results Beat Estimates',
      summary: 'Reliance Industries reported strong Q1 earnings with revenue growth of 15% YoY, driven by robust performance in the oil & gas and digital services segments.',
      source: 'Business Standard',
      publishedAt: new Date('2025-07-10T13:45:00'),
      sentiment: 'positive',
      sentimentScore: 0.85,
      symbols: ['RELIANCE'],
      url: '#',
      category: 'company'
    },
    {
      id: '3',
      title: 'IT Sector Faces Headwinds Amid Global Economic Uncertainty',
      summary: 'The Indian IT sector is experiencing challenges due to global economic uncertainties and reduced client spending in key markets like the US and Europe.',
      source: 'Mint',
      publishedAt: new Date('2025-07-10T12:15:00'),
      sentiment: 'negative',
      sentimentScore: -0.65,
      symbols: ['TCS', 'INFY', 'WIPRO', 'HCLTECH'],
      url: '#',
      category: 'market'
    },
    {
      id: '4',
      title: 'Green Energy Stocks Rally on Government Policy Support',
      summary: 'Renewable energy stocks surged after the government announced new subsidies and policy support for clean energy initiatives.',
      source: 'Reuters',
      publishedAt: new Date('2025-07-10T11:30:00'),
      sentiment: 'positive',
      sentimentScore: 0.72,
      symbols: ['ADANIGREEN', 'TATAPOWER'],
      url: '#',
      category: 'market'
    }
  ]);

  const [sentimentData, setSentimentData] = useState<SentimentData[]>([
    {
      symbol: 'RELIANCE',
      overall: 0.78,
      trend: 'up',
      change24h: 0.12,
      newsCount: 15,
      socialMentions: 2340
    },
    {
      symbol: 'TCS',
      overall: -0.32,
      trend: 'down',
      change24h: -0.18,
      newsCount: 8,
      socialMentions: 1820
    },
    {
      symbol: 'HDFC',
      overall: 0.45,
      trend: 'up',
      change24h: 0.08,
      newsCount: 12,
      socialMentions: 1950
    },
    {
      symbol: 'INFY',
      overall: -0.25,
      trend: 'down',
      change24h: -0.15,
      newsCount: 6,
      socialMentions: 1420
    },
    {
      symbol: 'ICICI',
      overall: 0.62,
      trend: 'up',
      change24h: 0.09,
      newsCount: 10,
      socialMentions: 1680
    }
  ]);

  const [aggregatedSentiment, setAggregatedSentiment] = useState({
    overall: 0.32,
    change24h: 0.05,
    positiveNews: 68,
    negativeNews: 32,
    aiInfluence: 0.75
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentData(prev => prev.map(item => ({
        ...item,
        overall: item.overall + (Math.random() - 0.5) * 0.1,
        change24h: item.change24h + (Math.random() - 0.5) * 0.05,
        socialMentions: item.socialMentions + Math.floor((Math.random() - 0.5) * 100)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (sentiment < -0.3) return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Positive';
    if (sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return <TrendingUp className="h-4 w-4" />;
    if (sentiment < -0.3) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const filteredNews = news.filter(item => {
    // Add filtering logic based on selected filters
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              News & Sentiment Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time sentiment analysis and news monitoring for informed trading decisions
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Sentiment</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className={`text-2xl font-bold ${
                    aggregatedSentiment.overall > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(aggregatedSentiment.overall * 100).toFixed(0)}%
                  </p>
                  <span className={`flex items-center text-sm ${
                    aggregatedSentiment.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {aggregatedSentiment.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(aggregatedSentiment.change24h * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive News</p>
                <p className="text-2xl font-bold text-green-600">{aggregatedSentiment.positiveNews}%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Negative News</p>
                <p className="text-2xl font-bold text-red-600">{aggregatedSentiment.negativeNews}%</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Influence</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(aggregatedSentiment.aiInfluence * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Decision Weight</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Time Frame Selector */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</span>
          {['1h', '24h', '7d', '30d'].map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe as any)}
              className={`px-3 py-1 text-sm rounded-lg ${
                selectedTimeframe === timeframe
                  ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'news', label: 'News Feed', icon: <Newspaper className="h-4 w-4" /> },
                { key: 'social', label: 'Social Media', icon: <MessageCircle className="h-4 w-4" /> },
                { key: 'market', label: 'Market Sentiment', icon: <Target className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.key
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'news' && (
              <div className="space-y-4">
                {filteredNews.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.source}</span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {item.publishedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentimentScore)}`}>
                        {getSentimentIcon(item.sentimentScore)}
                        <span>{getSentimentLabel(item.sentimentScore)}</span>
                        <span>({Math.abs(item.sentimentScore).toFixed(2)})</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {item.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {item.symbols.map((symbol) => (
                          <span
                            key={symbol}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                     bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {symbol}
                          </span>
                        ))}
                      </div>
                      <button className="text-rose-600 hover:text-rose-800 text-sm font-medium">
                        Read More →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-12">
                  <Twitter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Social Media Sentiment
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Real-time social media sentiment analysis coming soon
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'market' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Market Sentiment Heatmap
                </h3>
                <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Interactive sentiment heatmap
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Visualizing market sentiment by sector and symbol
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sentiment Tracker */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Symbol Sentiment
              </h3>
              
              <div className="space-y-4">
                {sentimentData.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{item.symbol}</div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <Newspaper className="h-3 w-3" />
                        <span>{item.newsCount}</span>
                        <MessageCircle className="h-3 w-3" />
                        <span>{item.socialMentions}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${
                        item.overall > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {(item.overall * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        24h: {item.change24h > 0 ? '+' : ''}{(item.change24h * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aggregated Sentiment Graph */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sentiment Trend
              </h3>
              <div className="h-48 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    24h Sentiment Graph
                  </p>
                </div>
              </div>
            </div>

            {/* AI Sentiment Impact */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Impact Score
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">News Sentiment Weight</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Social Sentiment Weight</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">30%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Technical Analysis Weight</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">25%</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-start space-x-2">
                  <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      AI Recommendation
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Current sentiment suggests cautious optimism. Monitor key support levels.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentNew;

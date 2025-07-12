import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  Play,
  Pause,
  Square,
  RefreshCw,
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Download
} from 'lucide-react';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  reward?: number;
  epsilon?: number;
}

interface ModelConfig {
  modelType: 'LSTM' | 'GRU' | 'TRANSFORMER' | 'DQN' | 'PPO' | 'A3C';
  batchSize: number;
  learningRate: number;
  epochs: number;
  sequenceLength: number;
  hiddenSize: number;
  numLayers: number;
  dropout: number;
}

const AITrainingNew: React.FC = () => {
  const { theme } = useTheme();
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'paused' | 'completed' | 'error'>('idle');
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [totalEpochs, setTotalEpochs] = useState(100);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
  const [metrics, setMetrics] = useState<TrainingMetrics[]>([
    { epoch: 1, loss: 0.145, accuracy: 0.856, valLoss: 0.178, valAccuracy: 0.823, reward: 0.23 },
    { epoch: 2, loss: 0.132, accuracy: 0.867, valLoss: 0.165, valAccuracy: 0.834, reward: 0.28 },
    { epoch: 3, loss: 0.128, accuracy: 0.871, valLoss: 0.158, valAccuracy: 0.845, reward: 0.31 },
    { epoch: 4, loss: 0.123, accuracy: 0.878, valLoss: 0.152, valAccuracy: 0.851, reward: 0.35 },
    { epoch: 5, loss: 0.119, accuracy: 0.883, valLoss: 0.148, valAccuracy: 0.856, reward: 0.39 }
  ]);

  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelType: 'LSTM',
    batchSize: 32,
    learningRate: 0.001,
    epochs: 100,
    sequenceLength: 60,
    hiddenSize: 128,
    numLayers: 2,
    dropout: 0.2
  });

  const [logs, setLogs] = useState<string[]>([
    '[2025-07-10 14:30:15] Training session started',
    '[2025-07-10 14:30:16] Loading market data...',
    '[2025-07-10 14:30:18] Data preprocessing complete: 50,000 samples',
    '[2025-07-10 14:30:20] Model initialized: LSTM with 128 hidden units',
    '[2025-07-10 14:30:22] Starting training...',
    '[2025-07-10 14:31:45] Epoch 1/100 - Loss: 0.145, Accuracy: 85.6%',
    '[2025-07-10 14:33:12] Epoch 2/100 - Loss: 0.132, Accuracy: 86.7%',
    '[2025-07-10 14:34:38] Epoch 3/100 - Loss: 0.128, Accuracy: 87.1%',
    '[2025-07-10 14:36:05] Validation complete - Val Loss: 0.158, Val Accuracy: 84.5%'
  ]);

  // Simulate real-time training updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (trainingStatus === 'training') {
      interval = setInterval(() => {
        setCurrentEpoch(prev => {
          const newEpoch = prev + 1;
          setTrainingProgress((newEpoch / totalEpochs) * 100);
          
          // Add new metrics
          if (newEpoch <= totalEpochs) {
            const newMetric: TrainingMetrics = {
              epoch: newEpoch,
              loss: Math.max(0.05, 0.15 - (newEpoch * 0.001)),
              accuracy: Math.min(0.95, 0.85 + (newEpoch * 0.001)),
              valLoss: Math.max(0.06, 0.18 - (newEpoch * 0.0008)),
              valAccuracy: Math.min(0.92, 0.82 + (newEpoch * 0.0008)),
              reward: Math.min(0.8, 0.2 + (newEpoch * 0.005))
            };
            
            setMetrics(prev => [...prev.slice(-19), newMetric]);
            
            // Add log entry
            setLogs(prev => [...prev.slice(-8), 
              `[${new Date().toLocaleTimeString()}] Epoch ${newEpoch}/${totalEpochs} - Loss: ${newMetric.loss.toFixed(3)}, Accuracy: ${(newMetric.accuracy * 100).toFixed(1)}%`
            ]);
          }
          
          if (newEpoch >= totalEpochs) {
            setTrainingStatus('completed');
            setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Training completed successfully`]);
          }
          
          return newEpoch;
        });
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trainingStatus, totalEpochs]);

  const startTraining = () => {
    setTrainingStatus('training');
    setCurrentEpoch(0);
    setTrainingProgress(0);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Training started with ${modelConfig.modelType} model`]);
  };

  const pauseTraining = () => {
    setTrainingStatus('paused');
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Training paused`]);
  };

  const resumeTraining = () => {
    setTrainingStatus('training');
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Training resumed`]);
  };

  const stopTraining = () => {
    setTrainingStatus('idle');
    setCurrentEpoch(0);
    setTrainingProgress(0);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Training stopped`]);
  };

  const getStatusColor = () => {
    switch (trainingStatus) {
      case 'training': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'paused': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'error': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = () => {
    switch (trainingStatus) {
      case 'training': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const latestMetrics = metrics[metrics.length - 1];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Training Monitor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Train and monitor AI models for trading strategies
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Settings className="h-4 w-4" />
              <span>Config</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 
                             text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Training Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Training Status</h3>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="capitalize">{trainingStatus}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {trainingStatus === 'idle' && (
                <button
                  onClick={startTraining}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                           text-white font-medium rounded-lg"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Training</span>
                </button>
              )}
              
              {trainingStatus === 'training' && (
                <>
                  <button
                    onClick={pauseTraining}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 
                             text-white font-medium rounded-lg"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Pause</span>
                  </button>
                  <button
                    onClick={stopTraining}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                             text-white font-medium rounded-lg"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                </>
              )}
              
              {trainingStatus === 'paused' && (
                <>
                  <button
                    onClick={resumeTraining}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                             text-white font-medium rounded-lg"
                  >
                    <Play className="h-4 w-4" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={stopTraining}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                             text-white font-medium rounded-lg"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop</span>
                  </button>
                </>
              )}
              
              {(trainingStatus === 'completed' || trainingStatus === 'error') && (
                <button
                  onClick={() => {
                    setTrainingStatus('idle');
                    setCurrentEpoch(0);
                    setTrainingProgress(0);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                           text-white font-medium rounded-lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>New Training</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {(trainingStatus === 'training' || trainingStatus === 'paused' || trainingStatus === 'completed') && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Epoch {currentEpoch} of {totalEpochs}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {trainingProgress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Current Metrics */}
          {latestMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestMetrics.loss.toFixed(3)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Loss</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(latestMetrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {latestMetrics.valLoss.toFixed(3)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Val Loss</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(latestMetrics.valAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Val Accuracy</div>
              </div>
              {latestMetrics.reward && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {latestMetrics.reward.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Reward</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loss Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Loss Graph
              </h3>
              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingDown className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Training vs Validation Loss
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Real-time loss visualization
                  </p>
                </div>
              </div>
            </div>

            {/* Accuracy Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Accuracy Graph
              </h3>
              <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Training vs Validation Accuracy
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Model performance over time
                  </p>
                </div>
              </div>
            </div>

            {/* Reward Chart (for RL models) */}
            {modelConfig.modelType.includes('DQN') || modelConfig.modelType.includes('PPO') || modelConfig.modelType.includes('A3C') ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Reward Graph
                </h3>
                <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Cumulative Reward Progress
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Agent learning performance
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Model Configuration & Logs */}
          <div className="space-y-6">
            {/* Model Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Configuration
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Model Type
                  </label>
                  <select
                    value={modelConfig.modelType}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, modelType: e.target.value as any }))}
                    disabled={trainingStatus === 'training'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                             disabled:bg-gray-100 dark:disabled:bg-gray-800"
                  >
                    <option value="LSTM">LSTM</option>
                    <option value="GRU">GRU</option>
                    <option value="TRANSFORMER">Transformer</option>
                    <option value="DQN">DQN (RL)</option>
                    <option value="PPO">PPO (RL)</option>
                    <option value="A3C">A3C (RL)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      value={modelConfig.batchSize}
                      onChange={(e) => setModelConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                      disabled={trainingStatus === 'training'}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={modelConfig.learningRate}
                      onChange={(e) => setModelConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                      disabled={trainingStatus === 'training'}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Epochs
                    </label>
                    <input
                      type="number"
                      value={modelConfig.epochs}
                      onChange={(e) => {
                        const epochs = parseInt(e.target.value);
                        setModelConfig(prev => ({ ...prev, epochs }));
                        setTotalEpochs(epochs);
                      }}
                      disabled={trainingStatus === 'training'}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Hidden Size
                    </label>
                    <input
                      type="number"
                      value={modelConfig.hiddenSize}
                      onChange={(e) => setModelConfig(prev => ({ ...prev, hiddenSize: parseInt(e.target.value) }))}
                      disabled={trainingStatus === 'training'}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                               disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {modelConfig.modelType} Model - {modelConfig.hiddenSize} neurons
                  </span>
                </div>
              </div>
            </div>

            {/* Training Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Training Logs
              </h3>
              
              <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-green-400">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">GPU Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">4.2 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Training Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1h 23m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">ETA</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2h 15m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrainingNew;

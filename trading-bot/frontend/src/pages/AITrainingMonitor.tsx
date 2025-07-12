import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { liveDataService } from '../services/LiveDataService';
import { 
  CpuChipIcon, 
  PlayIcon, 
  PauseIcon,
  StopIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  LightBulbIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface AIModel {
  id: string;
  name: string;
  type: 'DEEP_LEARNING' | 'REINFORCEMENT_LEARNING' | 'ENSEMBLE' | 'TRANSFORMER';
  status: 'TRAINING' | 'TRAINED' | 'DEPLOYED' | 'FAILED';
  version: string;
  description: string;
  architecture: string;
  trainingProgress: number;
  accuracy: number;
  loss: number;
  epochs: number;
  maxEpochs: number;
  learningRate: number;
  batchSize: number;
  datasetSize: number;
  validationAccuracy: number;
  createdAt: number;
  lastUpdated: number;
  estimatedTimeRemaining: number;
  hyperparameters: Record<string, any>;
}

interface TrainingMetrics {
  epoch: number;
  timestamp: number;
  loss: number;
  accuracy: number;
  validationLoss: number;
  validationAccuracy: number;
  learningRate: number;
}

const AITrainingMonitor: React.FC = () => {
  const { theme } = useTheme();
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'logs' | 'hyperparameters'>('overview');
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await liveDataService.getAIModels();
      
      // If no real data, generate sample models
      if (!data || data.length === 0) {
        const sampleModels: AIModel[] = [
          {
            id: 'model_lstm_1',
            name: 'LSTM Price Predictor',
            type: 'DEEP_LEARNING',
            status: 'TRAINING',
            version: 'v1.3',
            description: 'Long Short-Term Memory network for price prediction',
            architecture: 'LSTM with 3 layers, 128 hidden units each',
            trainingProgress: 73.5,
            accuracy: 0.847,
            loss: 0.0234,
            epochs: 147,
            maxEpochs: 200,
            learningRate: 0.001,
            batchSize: 32,
            datasetSize: 50000,
            validationAccuracy: 0.832,
            createdAt: Date.now() - 2 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 30 * 1000,
            estimatedTimeRemaining: 45 * 60 * 1000,
            hyperparameters: {
              hidden_units: 128,
              dropout: 0.2,
              sequence_length: 60,
              optimizer: 'adam',
              beta1: 0.9,
              beta2: 0.999
            }
          },
          {
            id: 'model_rl_1',
            name: 'Q-Learning Trader',
            type: 'REINFORCEMENT_LEARNING',
            status: 'DEPLOYED',
            version: 'v2.1',
            description: 'Deep Q-Network for autonomous trading decisions',
            architecture: 'DQN with experience replay and target network',
            trainingProgress: 100,
            accuracy: 0.921,
            loss: 0.0087,
            epochs: 500,
            maxEpochs: 500,
            learningRate: 0.0005,
            batchSize: 64,
            datasetSize: 100000,
            validationAccuracy: 0.915,
            createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 10 * 60 * 1000,
            estimatedTimeRemaining: 0,
            hyperparameters: {
              epsilon: 0.1,
              gamma: 0.99,
              memory_size: 10000,
              target_update_freq: 100,
              exploration_decay: 0.995
            }
          },
          {
            id: 'model_transformer_1',
            name: 'Transformer Market Analyzer',
            type: 'TRANSFORMER',
            status: 'TRAINED',
            version: 'v1.0',
            description: 'Transformer model for market sentiment and pattern analysis',
            architecture: 'Multi-head attention with 8 heads, 6 layers',
            trainingProgress: 100,
            accuracy: 0.893,
            loss: 0.0145,
            epochs: 100,
            maxEpochs: 100,
            learningRate: 0.0001,
            batchSize: 16,
            datasetSize: 75000,
            validationAccuracy: 0.887,
            createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
            lastUpdated: Date.now() - 2 * 60 * 60 * 1000,
            estimatedTimeRemaining: 0,
            hyperparameters: {
              num_heads: 8,
              num_layers: 6,
              d_model: 512,
              d_ff: 2048,
              attention_dropout: 0.1
            }
          }
        ];
        
        setModels(sampleModels);
        setSelectedModel(sampleModels[0]);
      } else {
        setModels(data);
        setSelectedModel(data[0]);
      }
    } catch (error) {
      console.error('Error fetching AI models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingMetrics = async (modelId: string) => {
    try {
      const data = await liveDataService.getTrainingMetrics(modelId);
      
      // If no real data, generate sample metrics
      if (!data || data.length === 0) {
        const sampleMetrics: TrainingMetrics[] = [];
        const model = models.find(m => m.id === modelId);
        
        if (model) {
          for (let i = 0; i < model.epochs; i++) {
            const baseAccuracy = 0.5 + (i / model.epochs) * 0.4;
            const baseLoss = 0.5 - (i / model.epochs) * 0.4;
            
            sampleMetrics.push({
              epoch: i + 1,
              timestamp: model.createdAt + i * 60 * 1000,
              loss: baseLoss + (Math.random() - 0.5) * 0.1,
              accuracy: baseAccuracy + (Math.random() - 0.5) * 0.1,
              validationLoss: baseLoss + (Math.random() - 0.5) * 0.1 + 0.05,
              validationAccuracy: baseAccuracy + (Math.random() - 0.5) * 0.1 - 0.02,
              learningRate: model.learningRate
            });
          }
        }
        
        setTrainingMetrics(sampleMetrics);
      } else {
        setTrainingMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching training metrics:', error);
    }
  };

  const fetchTrainingLogs = async (modelId: string) => {
    try {
      const data = await liveDataService.getTrainingLogs(modelId);
      
      // If no real data, generate sample logs
      if (!data || data.length === 0) {
        const sampleLogs = [
          `[${new Date().toISOString()}] Starting training for model ${modelId}`,
          `[${new Date().toISOString()}] Loading dataset: 50000 samples`,
          `[${new Date().toISOString()}] Model architecture: LSTM with 3 layers`,
          `[${new Date().toISOString()}] Hyperparameters: lr=0.001, batch_size=32`,
          `[${new Date().toISOString()}] Epoch 1/200 - loss: 0.4532 - accuracy: 0.6234`,
          `[${new Date().toISOString()}] Epoch 2/200 - loss: 0.3890 - accuracy: 0.6789`,
          `[${new Date().toISOString()}] Validation accuracy improved from 0.6234 to 0.6789`,
          `[${new Date().toISOString()}] Epoch 3/200 - loss: 0.3456 - accuracy: 0.7123`,
          `[${new Date().toISOString()}] Learning rate reduced to 0.0005`,
          `[${new Date().toISOString()}] Epoch 147/200 - loss: 0.0234 - accuracy: 0.8470`,
          `[${new Date().toISOString()}] Current training progress: 73.5%`,
          `[${new Date().toISOString()}] Estimated time remaining: 45 minutes`
        ];
        
        setTrainingLogs(sampleLogs);
      } else {
        setTrainingLogs(data);
      }
    } catch (error) {
      console.error('Error fetching training logs:', error);
    }
  };

  const startTraining = async (modelId: string) => {
    try {
      await liveDataService.startTraining(modelId);
      
      // Update model status
      setModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { ...model, status: 'TRAINING', lastUpdated: Date.now() }
            : model
        )
      );
      
      if (selectedModel?.id === modelId) {
        setSelectedModel(prev => 
          prev ? { ...prev, status: 'TRAINING', lastUpdated: Date.now() } : null
        );
      }
    } catch (error) {
      console.error('Error starting training:', error);
    }
  };

  const pauseTraining = async (modelId: string) => {
    try {
      await liveDataService.pauseTraining(modelId);
      
      // Update model status
      setModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { ...model, status: 'TRAINED', lastUpdated: Date.now() }
            : model
        )
      );
      
      if (selectedModel?.id === modelId) {
        setSelectedModel(prev => 
          prev ? { ...prev, status: 'TRAINED', lastUpdated: Date.now() } : null
        );
      }
    } catch (error) {
      console.error('Error pausing training:', error);
    }
  };

  const deployModel = async (modelId: string) => {
    try {
      await liveDataService.deployModel(modelId);
      
      // Update model status
      setModels(prev => 
        prev.map(model => 
          model.id === modelId 
            ? { ...model, status: 'DEPLOYED', lastUpdated: Date.now() }
            : model
        )
      );
      
      if (selectedModel?.id === modelId) {
        setSelectedModel(prev => 
          prev ? { ...prev, status: 'DEPLOYED', lastUpdated: Date.now() } : null
        );
      }
    } catch (error) {
      console.error('Error deploying model:', error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      fetchTrainingMetrics(selectedModel.id);
      fetchTrainingLogs(selectedModel.id);
    }
  }, [selectedModel]);

  // Real-time updates for training models
  useEffect(() => {
    const interval = setInterval(() => {
      const trainingModels = models.filter(m => m.status === 'TRAINING');
      
      if (trainingModels.length > 0) {
        setModels(prev => 
          prev.map(model => {
            if (model.status === 'TRAINING') {
              const newProgress = Math.min(model.trainingProgress + 0.1, 100);
              const newEpochs = Math.floor((newProgress / 100) * model.maxEpochs);
              
              return {
                ...model,
                trainingProgress: newProgress,
                epochs: newEpochs,
                lastUpdated: Date.now(),
                estimatedTimeRemaining: Math.max(0, model.estimatedTimeRemaining - 1000)
              };
            }
            return model;
          })
        );
        
        if (selectedModel?.status === 'TRAINING') {
          setSelectedModel(prev => {
            if (!prev) return null;
            const newProgress = Math.min(prev.trainingProgress + 0.1, 100);
            const newEpochs = Math.floor((newProgress / 100) * prev.maxEpochs);
            
            return {
              ...prev,
              trainingProgress: newProgress,
              epochs: newEpochs,
              lastUpdated: Date.now(),
              estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - 1000)
            };
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [models, selectedModel]);

  const getStatusColor = (status: AIModel['status']) => {
    switch (status) {
      case 'TRAINING':
        return 'text-blue-500';
      case 'TRAINED':
        return 'text-green-500';
      case 'DEPLOYED':
        return 'text-purple-500';
      case 'FAILED':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: AIModel['status']) => {
    switch (status) {
      case 'TRAINING':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case 'TRAINED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'DEPLOYED':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />;
      case 'FAILED':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            AI Training Monitor
          </h1>
          <p className="text-text-secondary">
            Monitor and manage AI model training processes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Model List */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border-primary">
                <h2 className="text-lg font-semibold text-text-primary">AI Models</h2>
              </div>
              <div className="divide-y divide-border-primary">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-primary mx-auto mb-2"></div>
                    <span className="text-text-secondary">Loading models...</span>
                  </div>
                ) : (
                  models.map((model) => (
                    <motion.div
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-bg-tertiary ${
                        selectedModel?.id === model.id ? 'bg-bg-tertiary' : ''
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-text-primary">{model.name}</h3>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(model.status)}
                          <span className={`text-xs font-medium ${getStatusColor(model.status)}`}>
                            {model.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                        {model.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{model.type}</span>
                        <span className="text-text-secondary">{model.version}</span>
                      </div>
                      {model.status === 'TRAINING' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-secondary">Progress</span>
                            <span className="text-text-primary">{model.trainingProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-bg-tertiary rounded-full h-2">
                            <div 
                              className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${model.trainingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                        <span className="text-text-secondary">Loss: {model.loss.toFixed(4)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Model Details */}
          <div className="lg:col-span-2">
            {selectedModel ? (
              <div className="bg-bg-secondary rounded-lg">
                {/* Model Header */}
                <div className="p-6 border-b border-border-primary">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary mb-2">
                        {selectedModel.name}
                      </h2>
                      <p className="text-text-secondary">{selectedModel.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedModel.status === 'TRAINING' && (
                        <motion.button
                          onClick={() => pauseTraining(selectedModel.id)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <PauseIcon className="w-4 h-4" />
                          <span>Pause</span>
                        </motion.button>
                      )}
                      {selectedModel.status === 'TRAINED' && (
                        <motion.button
                          onClick={() => deployModel(selectedModel.id)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ArrowTrendingUpIcon className="w-4 h-4" />
                          <span>Deploy</span>
                        </motion.button>
                      )}
                      {(selectedModel.status === 'TRAINED' || selectedModel.status === 'FAILED') && (
                        <motion.button
                          onClick={() => startTraining(selectedModel.id)}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <PlayIcon className="w-4 h-4" />
                          <span>Start Training</span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Training Progress */}
                  {selectedModel.status === 'TRAINING' && (
                    <div className="bg-bg-tertiary rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary">Training Progress</span>
                        <span className="text-text-primary font-medium">
                          {selectedModel.trainingProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-bg-primary rounded-full h-3 mb-2">
                        <div 
                          className="bg-accent-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedModel.trainingProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-secondary">
                          Epoch {selectedModel.epochs} / {selectedModel.maxEpochs}
                        </span>
                        <span className="text-text-secondary">
                          ETA: {formatTime(selectedModel.estimatedTimeRemaining)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Model Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Accuracy</p>
                      <p className="text-lg font-bold text-text-primary">
                        {(selectedModel.accuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Loss</p>
                      <p className="text-lg font-bold text-text-primary">
                        {selectedModel.loss.toFixed(4)}
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Val Accuracy</p>
                      <p className="text-lg font-bold text-text-primary">
                        {(selectedModel.validationAccuracy * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-text-secondary text-sm">Dataset Size</p>
                      <p className="text-lg font-bold text-text-primary">
                        {selectedModel.datasetSize.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-border-primary">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Overview', icon: EyeIcon },
                      { id: 'metrics', label: 'Metrics', icon: ChartBarIcon },
                      { id: 'logs', label: 'Logs', icon: DocumentTextIcon },
                      { id: 'hyperparameters', label: 'Hyperparameters', icon: AdjustmentsHorizontalIcon }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-accent-primary text-accent-primary'
                              : 'border-transparent text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Model Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Type</p>
                            <p className="text-text-primary font-medium">{selectedModel.type}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Version</p>
                            <p className="text-text-primary font-medium">{selectedModel.version}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Architecture</p>
                            <p className="text-text-primary font-medium">{selectedModel.architecture}</p>
                          </div>
                          <div>
                            <p className="text-text-secondary text-sm mb-1">Status</p>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(selectedModel.status)}
                              <span className={`font-medium ${getStatusColor(selectedModel.status)}`}>
                                {selectedModel.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-3">Training Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Learning Rate</p>
                            <p className="text-xl font-bold text-text-primary">
                              {selectedModel.learningRate}
                            </p>
                          </div>
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Batch Size</p>
                            <p className="text-xl font-bold text-text-primary">
                              {selectedModel.batchSize}
                            </p>
                          </div>
                          <div className="bg-bg-tertiary rounded-lg p-4">
                            <p className="text-text-secondary text-sm mb-1">Max Epochs</p>
                            <p className="text-xl font-bold text-text-primary">
                              {selectedModel.maxEpochs}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'metrics' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Training Metrics</h3>
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <div className="text-center py-8">
                          <ChartBarIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                          <p className="text-text-secondary">Training metrics visualization</p>
                          <p className="text-text-secondary text-sm">Real-time charts coming soon</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'logs' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Training Logs</h3>
                      <div className="bg-bg-tertiary rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-text-primary text-sm font-mono whitespace-pre-wrap">
                          {trainingLogs.join('\n')}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === 'hyperparameters' && (
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary mb-3">Hyperparameters</h3>
                      <div className="bg-bg-tertiary rounded-lg p-4">
                        <pre className="text-text-primary text-sm overflow-x-auto">
                          {JSON.stringify(selectedModel.hyperparameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-lg p-8 text-center">
                <CpuChipIcon className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary">Select a model to view details</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AITrainingMonitor;

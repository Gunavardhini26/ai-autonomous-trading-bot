import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { updateLiveData, updateConnectionStatus } from '../store/slices/marketSlice';
import { addSignal } from '../store/slices/aiSlice';
import { addTrade, updatePosition, updatePortfolio } from '../store/slices/tradingSlice';
import { addNewsArticle } from '../store/slices/newsSlice';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No auth token found, cannot connect to WebSocket');
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8000';
    
    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      store.dispatch(updateConnectionStatus(true));
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      store.dispatch(updateConnectionStatus(false));
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      store.dispatch(updateConnectionStatus(false));
      this.handleReconnect();
    });

    // Market data events
    this.socket.on('market_data', (data) => {
      store.dispatch(updateLiveData(data));
    });

    this.socket.on('price_update', (data) => {
      store.dispatch(updateLiveData(data));
    });

    // Trading events
    this.socket.on('trade_executed', (data) => {
      store.dispatch(addTrade(data));
    });

    this.socket.on('position_update', (data) => {
      store.dispatch(updatePosition(data));
    });

    this.socket.on('portfolio_update', (data) => {
      store.dispatch(updatePortfolio(data));
    });

    // AI events
    this.socket.on('ai_signal', (data) => {
      store.dispatch(addSignal(data));
    });

    this.socket.on('model_trained', (data) => {
      console.log('Model training completed:', data);
      // You can dispatch a specific action here if needed
    });

    // News events
    this.socket.on('news_article', (data) => {
      store.dispatch(addNewsArticle(data));
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Subscribe to market data for specific symbols
  subscribeToMarketData(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_market_data', { symbols });
    }
  }

  // Unsubscribe from market data for specific symbols
  unsubscribeFromMarketData(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_market_data', { symbols });
    }
  }

  // Subscribe to trading updates
  subscribeToTradingUpdates() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_trading_updates');
    }
  }

  // Subscribe to AI signals
  subscribeToAISignals() {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_ai_signals');
    }
  }

  // Subscribe to news updates
  subscribeToNews(symbols?: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_news', { symbols });
    }
  }

  // Send a custom message
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit event:', event);
    }
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(updateConnectionStatus(false));
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

// WebSocket Service for Real-time Data
// Handles all WebSocket connections and real-time updates

import { API_CONFIG, WS_EVENTS } from '../config/api';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval = 30000;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private isReconnecting = false;
  private subscriptions: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      url: API_CONFIG.WS_URL,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  // Connect to WebSocket
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('access_token');
        const wsUrl = token ? `${this.config.url}?token=${token}` : this.config.url;
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          if (!this.isReconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket
  public disconnect(): void {
    if (this.ws) {
      this.isReconnecting = false;
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  // Send message to WebSocket
  public send(message: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  // Subscribe to specific event types
  public subscribe(eventType: string, callback: (data: any) => void): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    this.subscriptions.get(eventType)!.add(callback);
  }

  // Unsubscribe from specific event types
  public unsubscribe(eventType: string, callback: (data: any) => void): void {
    if (this.subscriptions.has(eventType)) {
      this.subscriptions.get(eventType)!.delete(callback);
    }
  }

  // Subscribe to market data updates
  public subscribeToMarketData(symbols: string[], callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.MARKET_DATA, callback);
    this.send({
      type: 'subscribe',
      data: { symbols },
    });
  }

  // Unsubscribe from market data updates
  public unsubscribeFromMarketData(symbols: string[]): void {
    this.send({
      type: 'unsubscribe',
      data: { symbols },
    });
  }

  // Subscribe to order updates
  public subscribeToOrderUpdates(callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.ORDER_UPDATE, callback);
    this.send({
      type: 'subscribe_orders',
    });
  }

  // Subscribe to position updates
  public subscribeToPositionUpdates(callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.POSITION_UPDATE, callback);
    this.send({
      type: 'subscribe_positions',
    });
  }

  // Subscribe to account updates
  public subscribeToAccountUpdates(callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.ACCOUNT_UPDATE, callback);
    this.send({
      type: 'subscribe_account',
    });
  }

  // Subscribe to news updates
  public subscribeToNewsUpdates(callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.NEWS_UPDATE, callback);
    this.send({
      type: 'subscribe_news',
    });
  }

  // Subscribe to AI signals
  public subscribeToAISignals(callback: (data: any) => void): void {
    this.subscribe(WS_EVENTS.AI_SIGNAL, callback);
    this.send({
      type: 'subscribe_ai_signals',
    });
  }

  // Get connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Private methods

  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message;
    
    if (this.subscriptions.has(type)) {
      this.subscriptions.get(type)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }

  private reconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        this.isReconnecting = false;
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        } else {
          console.error('Max reconnection attempts reached');
        }
      });
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Create singleton instance
export const wsService = new WebSocketService();

// Market Data WebSocket Hook
export const useMarketDataWebSocket = (symbols: string[]) => {
  const [marketData, setMarketData] = React.useState<any>({});
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleMarketData = (data: any) => {
      setMarketData(prevData => ({
        ...prevData,
        [data.symbol]: data,
      }));
    };

    if (!wsService.getConnectionStatus()) {
      wsService.connect().then(() => {
        setIsConnected(true);
        wsService.subscribeToMarketData(symbols, handleMarketData);
      });
    } else {
      setIsConnected(true);
      wsService.subscribeToMarketData(symbols, handleMarketData);
    }

    return () => {
      wsService.unsubscribeFromMarketData(symbols);
    };
  }, [symbols]);

  return { marketData, isConnected };
};

// Order Updates WebSocket Hook
export const useOrderUpdatesWebSocket = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handleOrderUpdate = (data: any) => {
      setOrders(prevOrders => {
        const existingIndex = prevOrders.findIndex(order => order.id === data.id);
        if (existingIndex >= 0) {
          const newOrders = [...prevOrders];
          newOrders[existingIndex] = data;
          return newOrders;
        } else {
          return [...prevOrders, data];
        }
      });
    };

    if (!wsService.getConnectionStatus()) {
      wsService.connect().then(() => {
        setIsConnected(true);
        wsService.subscribeToOrderUpdates(handleOrderUpdate);
      });
    } else {
      setIsConnected(true);
      wsService.subscribeToOrderUpdates(handleOrderUpdate);
    }

    return () => {
      // Cleanup subscription if needed
    };
  }, []);

  return { orders, isConnected };
};

// Position Updates WebSocket Hook
export const usePositionUpdatesWebSocket = () => {
  const [positions, setPositions] = React.useState<any[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    const handlePositionUpdate = (data: any) => {
      setPositions(prevPositions => {
        const existingIndex = prevPositions.findIndex(pos => pos.symbol === data.symbol);
        if (existingIndex >= 0) {
          const newPositions = [...prevPositions];
          newPositions[existingIndex] = data;
          return newPositions;
        } else {
          return [...prevPositions, data];
        }
      });
    };

    if (!wsService.getConnectionStatus()) {
      wsService.connect().then(() => {
        setIsConnected(true);
        wsService.subscribeToPositionUpdates(handlePositionUpdate);
      });
    } else {
      setIsConnected(true);
      wsService.subscribeToPositionUpdates(handlePositionUpdate);
    }

    return () => {
      // Cleanup subscription if needed
    };
  }, []);

  return { positions, isConnected };
};

import React from 'react';

export default wsService;

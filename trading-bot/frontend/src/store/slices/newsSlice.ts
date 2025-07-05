import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsAPI } from '../../services/api';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
  sentiment_score: number;
  sentiment_label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  symbols_mentioned: string[];
}

interface NewsState {
  articles: NewsArticle[];
  filteredArticles: NewsArticle[];
  selectedSymbol: string | null;
  sentimentFilter: 'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  isLoading: boolean;
  error: string | null;
}

const initialState: NewsState = {
  articles: [],
  filteredArticles: [],
  selectedSymbol: null,
  sentimentFilter: 'ALL',
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (params?: { symbol?: string; limit?: number }) => {
    const response = await newsAPI.getNews(params);
    return response;
  }
);

export const analyzeNewsSentiment = createAsyncThunk(
  'news/analyzeSentiment',
  async (articleId: string) => {
    const response = await newsAPI.analyzeSentiment(articleId);
    return response;
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSymbolFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedSymbol = action.payload;
      newsSlice.caseReducers.applyFilters(state);
    },
    setSentimentFilter: (state, action: PayloadAction<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'>) => {
      state.sentimentFilter = action.payload;
      newsSlice.caseReducers.applyFilters(state);
    },
    applyFilters: (state) => {
      let filtered = state.articles;

      // Filter by symbol
      if (state.selectedSymbol) {
        filtered = filtered.filter(article => 
          article.symbols_mentioned.includes(state.selectedSymbol!)
        );
      }

      // Filter by sentiment
      if (state.sentimentFilter !== 'ALL') {
        filtered = filtered.filter(article => 
          article.sentiment_label === state.sentimentFilter
        );
      }

      state.filteredArticles = filtered;
    },
    addNewsArticle: (state, action: PayloadAction<NewsArticle>) => {
      state.articles.unshift(action.payload);
      // Keep only the latest 200 articles
      if (state.articles.length > 200) {
        state.articles = state.articles.slice(0, 200);
      }
      newsSlice.caseReducers.applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch news
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articles = action.payload;
        newsSlice.caseReducers.applyFilters(state);
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch news';
      })
      // Analyze sentiment
      .addCase(analyzeNewsSentiment.fulfilled, (state, action) => {
        const index = state.articles.findIndex(article => article.id === action.payload.id);
        if (index !== -1) {
          state.articles[index] = action.payload;
          newsSlice.caseReducers.applyFilters(state);
        }
      });
  },
});

export const { 
  clearError, 
  setSymbolFilter, 
  setSentimentFilter, 
  addNewsArticle 
} = newsSlice.actions;
export default newsSlice.reducer;

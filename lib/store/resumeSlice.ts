import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastMessage {
  msg: string;
  type: 'success' | 'info';
}

interface ResumeState {
  analysisData: any | null;
  loading: boolean;
  error: string | null;
  hasResume: boolean;
  toast: ToastMessage | null;
}

const initialState: ResumeState = {
  analysisData: null,
  loading: false,
  error: null,
  hasResume: false,
  toast: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setAnalysisData: (state, action: PayloadAction<any>) => {
      state.analysisData = action.payload;
      state.hasResume = action.payload?.analysis?.readinessScore != null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setHasResume: (state, action: PayloadAction<boolean>) => {
      state.hasResume = action.payload;
    },
    setToast: (state, action: PayloadAction<ToastMessage | null>) => {
      state.toast = action.payload;
    },
    resetResume: (state) => {
      state.analysisData = null;
      state.hasResume = false;
      state.error = null;
    },
  },
});

export const { setAnalysisData, setLoading, setError, setHasResume, setToast, resetResume } = resumeSlice.actions;

export default resumeSlice.reducer;

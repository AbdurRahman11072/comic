import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReaderMode = 'scroll' | 'page';
export type ReaderTheme = 'dark' | 'light' | 'sepia' | 'amoled';

interface ReaderState {
  mode: ReaderMode;
  theme: ReaderTheme;
  imageWidth: number;
}

const getInitialState = (): ReaderState => {
  if (typeof window !== 'undefined') {
    const savedMode = localStorage.getItem('reader_mode') as ReaderMode;
    const savedTheme = localStorage.getItem('reader_theme') as ReaderTheme;
    const savedWidth = Number(localStorage.getItem('reader_width')) || 100;

    return {
      mode: savedMode || 'scroll',
      theme: savedTheme || 'dark',
      imageWidth: savedWidth,
    };
  }
  return {
    mode: 'scroll',
    theme: 'dark',
    imageWidth: 100,
  };
};

export const readerSlice = createSlice({
  name: 'reader',
  initialState: getInitialState(),
  reducers: {
    setReaderMode: (state, action: PayloadAction<ReaderMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('reader_mode', action.payload);
      }
    },
    setReaderTheme: (state, action: PayloadAction<ReaderTheme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('reader_theme', action.payload);
      }
    },
    setImageWidth: (state, action: PayloadAction<number>) => {
      state.imageWidth = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('reader_width', String(action.payload));
      }
    },
  },
});

export const { setReaderMode, setReaderTheme, setImageWidth } = readerSlice.actions;
export default readerSlice.reducer;

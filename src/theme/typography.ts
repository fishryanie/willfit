import type { TextStyle } from 'react-native';

type TypeScale = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
};

export const typography: Record<
  | 'heroNumber'
  | 'largeNumber'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'title'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong',
  TypeScale
> = {
  heroNumber: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  largeNumber: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  captionStrong: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
};

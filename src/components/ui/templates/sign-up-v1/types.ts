interface IBackgroundGradient<T> {
  colors?: T[];
  children?: React.ReactNode;
}

interface IGoogleIcon {
  size?: number;
}

type IGithubIcon = IGoogleIcon;

export type { IBackgroundGradient, IGoogleIcon, IGithubIcon };

import { useEffect } from 'react';
import Animated, { Easing, interpolate, useAnimatedProps, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size?: number;
  loop?: boolean;
};

export default function WillfitSplashLogo({ size = 260, loop = true }: Props) {
  const progress = useSharedValue(0);
  const dot = useSharedValue(0);

  useEffect(() => {
    const run = () => {
      progress.value = 0;
      dot.value = 0;

      progress.value = withTiming(1, {
        duration: 1800,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      });

      dot.value = withDelay(
        1100,
        withTiming(1, {
          duration: 450,
          easing: Easing.out(Easing.cubic),
        }),
      );
    };

    if (loop) {
      progress.value = withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1800,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          }),
          withDelay(700, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      );

      dot.value = withRepeat(
        withSequence(
          withDelay(
            1100,
            withTiming(1, {
              duration: 450,
              easing: Easing.out(Easing.cubic),
            }),
          ),
          withDelay(650, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      );
    } else {
      run();
    }
  }, [dot, loop, progress]);

  const p1 = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [2400, 0]),
    opacity: interpolate(progress.value, [0, 0.12, 1], [0, 1, 1]),
  }));

  const p2 = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0, 1], [1800, 0]),
    opacity: interpolate(progress.value, [0, 0.18, 1], [0, 1, 1]),
  }));

  const p3 = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0.2, 1], [750, 0], 'clamp'),
    opacity: interpolate(progress.value, [0, 0.22, 1], [0, 1, 1]),
  }));

  const p4 = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0.28, 1], [700, 0], 'clamp'),
    opacity: interpolate(progress.value, [0, 0.3, 1], [0, 1, 1]),
  }));

  const p5 = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(progress.value, [0.1, 1], [900, 0], 'clamp'),
    opacity: interpolate(progress.value, [0, 0.14, 1], [0, 1, 1]),
  }));

  const dotAnimated = useAnimatedProps(() => ({
    opacity: dot.value,
    transform: [{ scale: interpolate(dot.value, [0, 1], [0.6, 1]) }],
  })) as any;

  return (
    <Svg width={size} height={size} viewBox='0 0 1024 1024' fill='none'>
      <Defs>
        <LinearGradient id='gradCyan' x1='0' y1='0' x2='1024' y2='0' gradientUnits='userSpaceOnUse'>
          <Stop offset='0' stopColor='#1E5ED6' />
          <Stop offset='1' stopColor='#18A7C9' />
        </LinearGradient>
        <LinearGradient id='gradMag' x1='140' y1='0' x2='907' y2='0' gradientUnits='userSpaceOnUse'>
          <Stop offset='0' stopColor='#7B1F8F' />
          <Stop offset='0.45' stopColor='#E6007A' />
          <Stop offset='1' stopColor='#FF1493' />
        </LinearGradient>
        <LinearGradient id='gradBlue' x1='290' y1='0' x2='755' y2='0' gradientUnits='userSpaceOnUse'>
          <Stop offset='0' stopColor='#2D49C8' />
          <Stop offset='1' stopColor='#1E6BD6' />
        </LinearGradient>
      </Defs>

      <AnimatedPath
        animatedProps={p1}
        d='M 510 470 C 620 350, 765 250, 900 300 C 985 335, 1020 465, 985 590 C 942 740, 830 800, 705 800 C 560 800, 430 760, 285 710'
        stroke='url(#gradCyan)'
        strokeWidth={62}
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        strokeDasharray='2400'
      />

      <AnimatedPath
        animatedProps={p5}
        d='M 290 600 C 410 690, 580 760, 755 760'
        stroke='url(#gradBlue)'
        strokeWidth={32}
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        strokeDasharray='900'
      />

      <AnimatedPath
        animatedProps={p2}
        d='M 260 700 C 175 700, 120 645, 140 560 C 164 460, 278 450, 390 480 C 465 500, 520 525, 560 540 C 625 470, 700 390, 790 390 C 845 390, 882 415, 907 460'
        stroke='url(#gradMag)'
        strokeWidth={62}
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        strokeDasharray='1800'
      />

      <AnimatedPath
        animatedProps={p3}
        d='M 560 540 C 650 610, 720 615, 820 610'
        stroke='url(#gradMag)'
        strokeWidth={46}
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        strokeDasharray='750'
      />

      <AnimatedPath
        animatedProps={p4}
        d='M 540 565 C 620 485, 690 410, 790 410 C 845 410, 875 435, 893 470'
        stroke='url(#gradMag)'
        strokeWidth={38}
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
        strokeDasharray='700'
      />

      <AnimatedCircle animatedProps={dotAnimated} cx={720} cy={505} r={66} fill='#F3008D' />
    </Svg>
  );
}

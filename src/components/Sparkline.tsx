import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { DataPoint } from '../core/DataSource';

type Props = {
  data: DataPoint[];
  color: string;
  width: number;
  height: number;
};

export function Sparkline({ data, color, width, height }: Props) {
  const { linePath, areaPath } = useMemo(() => {
    if (data.length < 2) return { linePath: '', areaPath: '' };
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.value - min) / range) * height;
      return [x, y] as const;
    });

    const linePath = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(' ');

    const areaPath =
      `${linePath} L${(width).toFixed(2)},${height} L0,${height} Z`;

    return { linePath, areaPath };
  }, [data, width, height]);

  if (!linePath) return <View style={{ width, height }} />;

  const gradientId = `grad-${color.replace('#', '')}`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#${gradientId})`} />
      <Path d={linePath} stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

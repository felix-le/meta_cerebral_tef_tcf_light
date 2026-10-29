import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppIcon } from './AppIcon';
import type { IconName } from './icons';

const R = 19;
const C = 2 * Math.PI * R;

export function ProgressRing({ pct, color, icon }: { pct: number; color: string; icon: IconName }) {
  const clamped = Math.max(0, Math.min(1, pct));
  return (
    <View style={styles.outer}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={R} stroke="#EFE3EC" strokeWidth={5} fill="none" />
        {clamped > 0 && (
          <Circle
            cx={22}
            cy={22}
            r={R}
            stroke={color}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${C * clamped} ${C}`}
            rotation="-90"
            origin="22, 22"
          />
        )}
      </Svg>
      <View style={styles.inner}>
        <AppIcon name={icon} size={18} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  inner: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});

import { SvgXml } from 'react-native-svg';
import { ICONS, type IconName } from './icons';

export function AppIcon({ name, size = 24, color = '#111827' }: { name: IconName; size?: number; color?: string }) {
  const icon = ICONS[name];
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}">${icon.body}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
}

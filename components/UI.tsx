import React from 'react';
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export const palette = {
  background: '#FBF8EF', ink: '#234D43', muted: '#75837A', green: '#34775C',
  paleGreen: '#EDF2E3', line: '#E7E8DA', yellow: '#F2CB70', blue: '#E4F0F3',
};

type IconName = 'leaf' | 'sound' | 'muted' | 'arrow' | 'back' | 'play' | 'pause' | 'close' | 'sun' | 'headphones' | 'sparkle' | 'music' | 'check';
const decorativeAccessibility = Platform.OS === 'web'
  ? { 'aria-hidden': true }
  : { accessible: false, accessibilityElementsHidden: true };

export function Icon({ name, size = 22, color = palette.ink }: { name: IconName; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...decorativeAccessibility}>
      <G stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {name === 'leaf' && <><Path d="M20 3C8 2 3 7 5 14c2 6 12 7 14-2 1-3 0-5 1-9Z" /><Path d="M3 22 15 9M7 18v-6M10 15h5" /></>}
        {(name === 'sound' || name === 'muted') && <><Path d="m11 4-5 4H3v8h3l5 4V4Z" />{name === 'sound' ? <><Path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : <Path d="m16 9 6 6m0-6-6 6" />}</>}
        {name === 'arrow' && <Path d="M4 12h15m-6-6 6 6-6 6" />}
        {name === 'back' && <Path d="M20 12H5m6-6-6 6 6 6" />}
        {name === 'play' && <Path d="m9 5 11 7-11 7V5Z" fill={color} strokeWidth={0} />}
        {name === 'pause' && <><Path d="M8 5v14M16 5v14" strokeWidth={3} /></>}
        {name === 'close' && <Path d="m6 6 12 12M6 18 18 6" />}
        {name === 'sun' && <><Circle cx={12} cy={12} r={4} /><Path d="M12 1v2m0 18v2M1 12h2m18 0h2M4.2 4.2l1.5 1.5m12.6 12.6 1.5 1.5M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" /></>}
        {name === 'headphones' && <><Path d="M4 13v-2a8 8 0 0 1 16 0v2" /><Path d="M4 12H3v7h4v-7H4Zm16 0h1v7h-4v-7h3Z" /></>}
        {name === 'sparkle' && <><Path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z" /></>}
        {name === 'music' && <><Path d="M9 18V5l11-2v13M9 9l11-2" /><Ellipse cx={5.5} cy={18.5} rx={3.5} ry={2.5} /><Ellipse cx={16.5} cy={16.5} rx={3.5} ry={2.5} /></>}
        {name === 'check' && <Path d="m5 12 4 4L19 6" />}
      </G>
    </Svg>
  );
}

export function PrimaryButton({ label, onPress, icon = 'arrow', light = false, style, accessibilityLabel }: { label: string; onPress: () => void; icon?: IconName; light?: boolean; style?: ViewStyle; accessibilityLabel?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} onPress={onPress}
      style={({ pressed }) => [styles.button, light && styles.lightButton, style, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, light && { color: palette.ink }]}>{label}</Text>
      <Icon name={icon} color={light ? palette.ink : '#FFFFFF'} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: palette.green, paddingHorizontal: 25, paddingVertical: 17, borderRadius: 22, minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  lightButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: palette.line },
  buttonText: { fontFamily: 'Nunito_800ExtraBold', color: '#FFFFFF', fontSize: 17 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
});

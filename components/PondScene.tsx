import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { AnimalArt, type AnimalId } from './AnimalArt';

interface PondSceneProps {
  activeAnimal: AnimalId | null;
  onAnimalPress: (id: AnimalId) => void;
  enabled?: boolean;
}

const decorativeAccessibility = Platform.OS === 'web'
  ? { 'aria-hidden': true }
  : { accessible: false, accessibilityElementsHidden: true };

const characters: {
  animal: AnimalId;
  label: string;
  left: `${number}%`;
  top: `${number}%`;
  width: `${number}%`;
}[] = [
  { animal: 'bee', label: 'Пчела', left: '12%', top: '16%', width: '21%' },
  { animal: 'duck', label: 'Утка', left: '53%', top: '38%', width: '29%' },
  { animal: 'frog', label: 'Лягушка', left: '16%', top: '48%', width: '30%' },
  { animal: 'grasshopper', label: 'Кузнечик', left: '59%', top: '70%', width: '25%' },
];

/** The scene is deliberately static until touched: children set the pace. */
export function PondScene({ activeAnimal, onAnimalPress, enabled = true }: PondSceneProps) {
  const [sceneWidth, setSceneWidth] = React.useState(350);

  return (
    <View
      style={styles.scene}
      onLayout={(event) => setSceneWidth(event.nativeEvent.layout.width)}
      accessible={!enabled}
      accessibilityRole={!enabled ? 'image' : undefined}
      accessibilityLabel={!enabled ? 'Пруд, лягушка на кувшинке, утка, кузнечик и пчела' : undefined}
    >
      <Svg width="100%" height="100%" viewBox="0 0 700 660" style={StyleSheet.absoluteFill} {...decorativeAccessibility}>
        <Rect width="700" height="660" fill="#E6F1E3" />
        <Path d="M0 0h700v229c-87-23-155 25-231 5-89-23-151-16-235 4C125 265 58 226 0 248Z" fill="#DCEFEA" />
        <Circle cx="570" cy="76" r="36" fill="#F4D986" />
        <Circle cx="570" cy="76" r="49" fill="#F4D986" opacity={0.16} />
        <Cloud x={78} y={65} scale={0.9} />
        <Cloud x={384} y={104} scale={0.7} />
        <Path d="M0 220C85 139 187 145 281 200c105-68 214-87 419-2v164H0Z" fill="#C6DDB5" />
        <Path d="M0 266c105-63 154-24 242-31 111-10 159-72 246-48 79 22 140 31 212 23v450H0Z" fill="#B2CF93" />
        <Path d="M0 320c118-54 225-41 333-36 131 6 235-30 367-3v379H0Z" fill="#C7DCA4" />
        <Path d="M0 482c88-18 120 34 223 70 150 52 294-4 477 53v55H0Z" fill="#B8D294" />

        <Path d="M129 295c79-51 175-37 264-23 68 11 153-10 206 31 35 27 13 65 42 107 32 48-15 102-86 127-99 35-286 36-387 6-90-27-125-74-104-124 17-40 7-87 65-124Z" fill="#9EBD7B" opacity={0.42} />
        <Path d="M137 293c84-45 168-28 250-16 84 12 151-8 197 31 34 30 10 60 38 100 32 46-15 89-82 112-91 31-265 34-363 5-80-24-116-65-96-109 18-38 1-93 56-123Z" fill="#7DBCC0" />
        <Path d="M141 306c85-43 161-22 242-12 77 9 137-5 183 24 31 20 8 58 36 91 25 29 0 65-62 86-98 32-247 31-342 7-82-20-106-52-88-89 17-37-16-77 31-107Z" fill="#8DC9CB" />
        <Path d="M122 405c82 10 139 41 220 32 87-9 161-14 250 3-19 31-51 46-93 56-106 23-220 14-301-4-62-14-88-46-76-87Z" fill="#99CFCA" opacity={0.8} />
        <Path d="M209 319q43-10 80-3m119 18q50-9 86 0m-346 70q26-5 51 0m129 91q43-6 76-1m82-86q32-6 57-1m-309 61q23 4 41 0" stroke="#D8EAE0" strokeWidth="4" strokeLinecap="round" fill="none" opacity={0.85} />
        <Path d="M287 365q25-5 43-1m125 105q31 5 51-1m-122-83 16-1" stroke="#D8EAE0" strokeWidth="3" strokeLinecap="round" fill="none" opacity={0.7} />

        <Lily x={217} y={501} scale={1.4} />
        <Lily x={431} y={487} scale={0.8} />
        <Lily x={503} y={348} scale={0.57} />
        <WaterFlower x={441} y={478} />

        <Cattail x={74} y={355} height={160} />
        <Cattail x={43} y={375} height={123} lean={-12} />
        <Cattail x={104} y={345} height={109} lean={16} />
        <Cattail x={620} y={365} height={142} lean={6} />
        <Cattail x={651} y={387} height={179} lean={12} />
        <Cattail x={679} y={403} height={114} lean={-5} />

        <G fill="#8DB46C">
          <Ellipse cx="44" cy="479" rx="23" ry="12" transform="rotate(-13 44 479)" />
          <Ellipse cx="74" cy="522" rx="27" ry="13" transform="rotate(20 74 522)" />
          <Ellipse cx="593" cy="565" rx="31" ry="16" transform="rotate(-15 593 565)" />
        </G>
        <G fill="#ACC48E">
          <Ellipse cx="45" cy="487" rx="18" ry="7" />
          <Ellipse cx="588" cy="572" rx="24" ry="9" />
        </G>
        <Grass x={25} y={553} scale={1.1} />
        <Grass x={120} y={597} scale={0.8} />
        <Grass x={319} y={605} scale={0.7} />
        <Grass x={638} y={543} scale={1} />
        <Grass x={668} y={630} scale={1.3} />
        <Grass x={356} y={253} scale={0.55} />
        <Flower x={80} y={180} scale={0.68} color="#F7E5AD" />
        <Flower x={47} y={229} scale={0.52} color="#FFF2D5" />
        <Flower x={124} y={230} scale={0.62} color="#F2C6B7" />
        <Flower x={617} y={506} scale={0.7} color="#FAEAC5" />
        <Flower x={575} y={598} scale={0.66} color="#F4D8AE" />
        <Flower x={368} y={568} scale={0.52} color="#FCF2D8" />
        <Flower x={165} y={622} scale={0.74} color="#F2C6B7" />
        <Flower x={54} y={611} scale={0.58} color="#FAEAC5" />
        <G fill="#8BAE6E" opacity={0.75}>
          <Circle cx="181" cy="240" r="3" />
          <Circle cx="195" cy="245" r="2" />
          <Circle cx="523" cy="589" r="3" />
          <Circle cx="537" cy="582" r="2" />
          <Circle cx="280" cy="575" r="3" />
          <Circle cx="293" cy="580" r="2" />
          <Circle cx="595" cy="263" r="2.5" />
        </G>
        <Path d="M270 92q8-10 16 0 8-10 16 0m26 33q6-7 12 0 6-7 12 0" fill="none" stroke="#8DAA98" strokeWidth="3" strokeLinecap="round" />
        <Path d="M201 174c35-35 74-16 62 5-13 22-35-3-14-17" fill="none" stroke="#91B495" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 9" />
      </Svg>

      {characters.map((character) => (
        <AnimalTouchTarget
          key={character.animal}
          {...character}
          size={(sceneWidth * Number.parseFloat(character.width)) / 100}
          active={activeAnimal === character.animal}
          enabled={enabled}
          onPress={() => onAnimalPress(character.animal)}
        />
      ))}

    </View>
  );
}

function AnimalTouchTarget({
  animal,
  label,
  left,
  top,
  width,
  size,
  active,
  enabled,
  onPress,
}: (typeof characters)[number] & {
  size: number;
  active: boolean;
  enabled: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = React.useState(false);

  useEffect(() => {
    if (!active) {
      scale.setValue(1);
      return;
    }

    const animation = Animated.sequence([
      Animated.timing(scale, { toValue: 1.1, duration: 160, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 130, useNativeDriver: false }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [active, scale]);

  if (!enabled) {
    return (
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.animal, { left, top, width, aspectRatio: 1 }]}
      >
        <AnimalArt animal={animal} size={size} />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. Послушать звук`}
      accessibilityState={{ selected: active }}
      focusable
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      hitSlop={8}
      style={[styles.animal, { left, top, width, aspectRatio: 1 }, focused && styles.animalFocused]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <AnimalArt animal={animal} size={size} active={active} />
      </Animated.View>
      {active && (
        <View pointerEvents="none" style={styles.soundBubble}>
          <View style={[styles.soundBar, { height: 6 }]} />
          <View style={[styles.soundBar, { height: 12 }]} />
          <View style={[styles.soundBar, { height: 17 }]} />
          <View style={[styles.soundBar, { height: 9 }]} />
        </View>
      )}
    </Pressable>
  );
}

function Cloud({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} fill="#F8FBEB" opacity={0.9}>
      <Ellipse cx="45" cy="24" rx="45" ry="18" />
      <Circle cx="32" cy="10" r="24" />
      <Circle cx="60" cy="14" r="19" />
    </G>
  );
}

function Lily({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Ellipse cy="5" rx="47" ry="16" fill="#659F8C" opacity={0.35} />
      <Path d="M0 0 28-18C7-27-32-23-43-9c-15 20 18 36 49 28 32-8 36-24 26-34Z" fill="#70A772" />
      <Path d="M0 0-27 5M0 0l3 14M0 0-14-12" fill="none" stroke="#8FBD83" strokeWidth="2" strokeLinecap="round" />
    </G>
  );
}

function WaterFlower({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Path d="M0 4c-21-1-23-17-22-22C-7-20 1-9 0 4Z" fill="#F5D1C5" />
      <Path d="M0 4c21-1 23-17 22-22C7-20-1-9 0 4Z" fill="#F5D1C5" />
      <Path d="M0 4c-12-8-10-24 0-32C10-20 12-4 0 4Z" fill="#FAE4D6" />
      <Ellipse cy="2" rx="9" ry="4" fill="#E6BE6D" />
    </G>
  );
}

function Cattail({ x, y, height, lean = 0 }: { x: number; y: number; height: number; lean?: number }) {
  return (
    <G>
      <Path d={`M${x} ${y}q${lean} ${-height / 2} ${lean} ${-height}`} fill="none" stroke="#6B965C" strokeWidth="4" strokeLinecap="round" />
      <Path d={`M${x} ${y}q-35-31-31-65 27 23 31 65m0 0q20-50 40-61-9 44-40 61`} fill="#7BA663" />
      <Rect x={x + lean - 6} y={y - height - 29} width="12" height="35" rx="6" fill="#9E7855" />
      <Path d={`M${x + lean} ${y - height - 35}v-6`} stroke="#6B965C" strokeWidth="2" strokeLinecap="round" />
    </G>
  );
}

function Grass({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke="#84A964" strokeWidth="4" strokeLinecap="round">
      <Path d="M0 0q-2-18-14-26M0 0q6-24 2-36M0 0q10-14 21-16" />
    </G>
  );
}

function Flower({ x, y, scale, color }: { x: number; y: number; scale: number; color: string }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Path d="M0 0v32m0-5q-17-2-15-15 14 1 15 15" fill="#7FA66A" stroke="#7FA66A" strokeWidth="3" strokeLinecap="round" />
      <G fill={color}>
        <Ellipse cy="-11" rx="7" ry="11" />
        <Ellipse cy="11" rx="7" ry="11" />
        <Ellipse cx="-11" rx="11" ry="7" />
        <Ellipse cx="11" rx="11" ry="7" />
        <Ellipse cx="-8" cy="-8" rx="8" ry="7" />
        <Ellipse cx="8" cy="-8" rx="8" ry="7" />
        <Ellipse cx="-8" cy="8" rx="8" ry="7" />
        <Ellipse cx="8" cy="8" rx="8" ry="7" />
      </G>
      <Circle r="7" fill="#E3BB5B" />
    </G>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: '100%',
    aspectRatio: 700 / 660,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#C7DCA4',
  },
  animal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animalFocused: {
    borderRadius: 30,
    outlineColor: '#377A5D',
    outlineStyle: 'solid',
    outlineWidth: 3,
    outlineOffset: 3,
  },
  soundBubble: {
    position: 'absolute',
    top: '1%',
    right: '-1%',
    backgroundColor: '#FFFDF3',
    width: 37,
    height: 32,
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#315344',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  soundBar: {
    width: 3,
    borderRadius: 3,
    backgroundColor: '#65966A',
  },
});

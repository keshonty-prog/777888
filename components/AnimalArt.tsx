import React from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type AnimalId = 'frog' | 'duck' | 'grasshopper' | 'bee';

export interface AnimalArtProps {
  animal: AnimalId;
  size?: number;
  active?: boolean;
}

const ink = '#25493C';
const decorativeAccessibility = Platform.OS === 'web'
  ? { 'aria-hidden': true }
  : { accessible: false, accessibilityElementsHidden: true };

/** Original vector characters, bundled with the app and available offline. */
export const AnimalArt = React.memo(function AnimalArt({
  animal,
  size = 160,
  active = false,
}: AnimalArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" {...decorativeAccessibility}>
      {animal === 'frog' && <Frog />}
      {animal === 'duck' && <Duck />}
      {animal === 'grasshopper' && <Grasshopper />}
      {animal === 'bee' && <Bee />}
      {active && (
        <G fill="#E7B754">
          <Path d="m20 38 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z" />
          <Path d="m134 24 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" />
          <Circle cx="143" cy="62" r="3" />
          <Circle cx="19" cy="67" r="2.5" />
        </G>
      )}
    </Svg>
  );
});

function Frog() {
  return (
    <G>
      <Ellipse cx="80" cy="140" rx="53" ry="8" fill="#305D43" opacity={0.1} />
      <Ellipse cx="45" cy="120" rx="23" ry="17" fill="#549D55" transform="rotate(-30 45 120)" />
      <Ellipse cx="115" cy="120" rx="23" ry="17" fill="#549D55" transform="rotate(30 115 120)" />
      <Ellipse cx="80" cy="109" rx="41" ry="30" fill="#79B85C" />
      <Ellipse cx="80" cy="116" rx="28" ry="20" fill="#C8DD88" />
      <Path d="M48 104c-3 10-7 20-14 25m78-25c3 10 7 20 14 25" stroke="#6AA953" strokeWidth="12" strokeLinecap="round" />
      <Path d="m34 129-9 2m9-2-3 8m3-8 7 5m85-5 9 2m-9-2 3 8m-3-8-7 5" stroke="#6AA953" strokeWidth="6" strokeLinecap="round" />
      <Ellipse cx="80" cy="82" rx="47" ry="34" fill="#8FC96A" />
      <Circle cx="52" cy="53" r="19" fill="#8FC96A" />
      <Circle cx="108" cy="53" r="19" fill="#8FC96A" />
      <Ellipse cx="53" cy="51" rx="12" ry="14" fill="#FFFCED" />
      <Ellipse cx="107" cy="51" rx="12" ry="14" fill="#FFFCED" />
      <Ellipse cx="55" cy="53" rx="5" ry="7" fill={ink} />
      <Ellipse cx="105" cy="53" rx="5" ry="7" fill={ink} />
      <Circle cx="56.5" cy="50.5" r="1.8" fill="white" />
      <Circle cx="106.5" cy="50.5" r="1.8" fill="white" />
      <Ellipse cx="48" cy="82" rx="8" ry="5" fill="#E9B7A0" opacity={0.8} />
      <Ellipse cx="112" cy="82" rx="8" ry="5" fill="#E9B7A0" opacity={0.8} />
      <Path d="M62 84q18 18 36 0" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="74" cy="73" r="1.8" fill="#4D8B47" />
      <Circle cx="86" cy="73" r="1.8" fill="#4D8B47" />
      <Ellipse cx="65" cy="102" rx="4" ry="2.5" fill="#6BAA52" />
      <Ellipse cx="104" cy="99" rx="3.5" ry="2.5" fill="#6BAA52" />
    </G>
  );
}

function Duck() {
  return (
    <G>
      <Ellipse cx="82" cy="139" rx="57" ry="7" fill="#315D60" opacity={0.1} />
      <Path d="M31 94 15 80c-5 20 0 37 19 41Z" fill="#E9BC58" />
      <Ellipse cx="72" cy="111" rx="48" ry="28" fill="#F5D071" />
      <Path d="M39 107c11-13 32-15 48-4 6 4 8 10 7 15-16 8-38 5-55-11Z" fill="#E8B957" />
      <Path d="M45 109q21 12 40 5" fill="none" stroke="#D7A248" strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M91 104c0-16-2-22 0-33h29c1 21-1 35-10 45Z" fill="#F5D071" />
      <Circle cx="108" cy="63" r="29" fill="#F8D87D" />
      <Path d="M87 42c-3-8 2-12 8-10-1-8 6-12 11-6l3 9" fill="#F8D87D" />
      <Path d="M128 65c10-5 21-3 23 3 1 6-10 13-25 10Z" fill="#E8904C" />
      <Path d="m132 72 17-2" stroke="#C26E37" strokeWidth="2" strokeLinecap="round" />
      <Ellipse cx="113" cy="59" rx="4" ry="5.5" fill={ink} />
      <Circle cx="114" cy="57" r="1.4" fill="white" />
      <Ellipse cx="119" cy="76" rx="7" ry="4" fill="#ECA88A" opacity={0.8} />
      <Path d="M99 83q6 5 11 1" fill="none" stroke="#BA8E42" strokeWidth="2" strokeLinecap="round" />
      <Path d="M35 142q14 4 28 0m36 2q15 4 29-1" fill="none" stroke="#FAFFEE" strokeWidth="3" strokeLinecap="round" opacity={0.8} />
    </G>
  );
}

function Grasshopper() {
  return (
    <G>
      <Ellipse cx="79" cy="143" rx="58" ry="6" fill="#305D43" opacity={0.1} />
      <Path d="m58 97-22-27-19 62m42-23 13-37 28 58" fill="none" stroke="#558A4B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m16 132-7 4m91-6 10 5" fill="none" stroke="#558A4B" strokeWidth="4" strokeLinecap="round" />
      <Path d="M28 100c6-24 36-31 75-15l-5 27c-30 8-56 5-70-12Z" fill="#9CBF5E" />
      <Path d="M26 101c18-12 42-11 74 5-28 11-54 8-74-5Z" fill="#77A754" />
      <Path d="m40 99 43 7m-30-7 5 8m10-4 4 6" fill="none" stroke="#5F9347" strokeWidth="2" strokeLinecap="round" />
      <Path d="m88 112 5 24 12 2m6-25 12 19 13 2" fill="none" stroke="#65984C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <Ellipse cx="111" cy="89" rx="25" ry="29" fill="#B4D078" transform="rotate(-10 111 89)" />
      <Path d="M104 66 94 36m22 30 10-30" fill="none" stroke="#65984C" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="93" cy="34" r="3" fill="#65984C" />
      <Circle cx="127" cy="34" r="3" fill="#65984C" />
      <Ellipse cx="105" cy="80" rx="4" ry="6" fill={ink} />
      <Ellipse cx="122" cy="80" rx="4" ry="6" fill={ink} />
      <Circle cx="106" cy="78" r="1.3" fill="white" />
      <Circle cx="123" cy="78" r="1.3" fill="white" />
      <Ellipse cx="99" cy="93" rx="5" ry="3" fill="#E9B7A0" />
      <Ellipse cx="129" cy="93" rx="5" ry="3" fill="#E9B7A0" />
      <Path d="M108 98q7 6 12-1" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
    </G>
  );
}

function Bee() {
  return (
    <G>
      <Ellipse cx="80" cy="139" rx="33" ry="5" fill="#305D43" opacity={0.08} />
      <Path d="M75 78C41 74 35 38 53 33c15-5 27 18 29 41" fill="#F8FFFC" stroke="#C5DBDA" strokeWidth="2.5" />
      <Path d="M85 76c-5-25 9-50 25-41 15 9 2 33-20 45" fill="#F8FFFC" stroke="#C5DBDA" strokeWidth="2.5" />
      <Path d="m111 105 14 2-9 9" fill="#5D5B43" />
      <Ellipse cx="83" cy="97" rx="40" ry="28" fill="#EDC661" transform="rotate(13 83 97)" />
      <Path d="M79 70c-7 14-9 32-3 51m18-46c-5 14-6 31-1 48" fill="none" stroke="#645C43" strokeWidth="10" />
      <Circle cx="51" cy="86" r="25" fill="#F4D779" />
      <Path d="M43 64 34 51m21 11 3-17" fill="none" stroke="#645C43" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="33" cy="50" r="3.5" fill="#645C43" />
      <Circle cx="58" cy="44" r="3.5" fill="#645C43" />
      <Ellipse cx="42" cy="82" rx="3.5" ry="5" fill={ink} />
      <Ellipse cx="58" cy="81" rx="3.5" ry="5" fill={ink} />
      <Circle cx="43" cy="80" r="1.3" fill="white" />
      <Circle cx="59" cy="79" r="1.3" fill="white" />
      <Ellipse cx="34" cy="91" rx="5" ry="3" fill="#E8A886" />
      <Ellipse cx="66" cy="90" rx="5" ry="3" fill="#E8A886" />
      <Path d="M44 95q7 7 13-1" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <Path d="m69 123-3 8m16-5-1 8m15-8 4 7" fill="none" stroke="#645C43" strokeWidth="3" strokeLinecap="round" />
    </G>
  );
}

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, BackHandler, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Switch, Text, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Lora_600SemiBold } from '@expo-google-fonts/lora/600SemiBold';
import { AnimalArt } from './components/AnimalArt';
import { PondScene } from './components/PondScene';
import { Icon, palette, PrimaryButton } from './components/UI';
import { ANIMALS, AnimalId, GROUPS, NatureGroup, SectionId } from './data/nature';
import { useNatureAudio } from './hooks/useNatureAudio';

type Screen = 'home' | 'groups' | 'intro' | 'pond';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Lora_600SemiBold });
  if (!fontsLoaded && !fontError) {
    return <View style={styles.loading}><Icon name="leaf" size={48} /><Text style={styles.loadingText}>Привет, природа!</Text><ActivityIndicator color={palette.green} /></View>;
  }
  return <SafeAreaProvider><NatureApp /><StatusBar style="dark" /></SafeAreaProvider>;
}

function NatureApp() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const small = width < 700;
  const narrow = width < 380;
  const desktop = width >= 980;
  const [screen, setScreen] = useState<Screen>('home');
  const [section, setSection] = useState<SectionId>('animals');
  const [group, setGroup] = useState<NatureGroup>(GROUPS[0]);
  const [lastAnimal, setLastAnimal] = useState<AnimalId | null>(null);
  const [parentsOpen, setParentsOpen] = useState(false);
  const audio = useNatureAudio();

  const goHome = () => {
    audio.leaveScene();
    setLastAnimal(null);
    setScreen('home');
  };
  const goBack = () => {
    audio.leaveScene();
    setLastAnimal(null);
    setScreen(screen === 'groups' || section === 'insects' ? 'home' : 'groups');
  };
  const openPond = (selected: NatureGroup) => {
    audio.stopNarration();
    setGroup(selected);
    setLastAnimal(null);
    setScreen('pond');
    void audio.enterScene();
  };
  const openGroup = (selected: NatureGroup) => {
    audio.leaveScene();
    setSection(selected.section);
    setGroup(selected);
    setScreen('intro');
    audio.narrate(selected.narration, () => openPond(selected));
  };
  const chooseSection = (selected: SectionId) => {
    audio.leaveScene();
    setSection(selected);
    if (selected === 'insects') openGroup(GROUPS.find((item) => item.section === 'insects')!);
    else setScreen('groups');
  };
  const playAnimal = (animal: AnimalId) => {
    setLastAnimal(animal);
    void audio.playAnimal(animal);
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (parentsOpen) { setParentsOpen(false); return true; }
      if (screen !== 'home') { goBack(); return true; }
      return false;
    });
    return () => listener.remove();
  }, [screen, section, parentsOpen]);

  return (
    <View style={[styles.app, { paddingTop: insets.top }]}>
      <ScrollView key={screen} style={styles.scroll} contentContainerStyle={{ paddingBottom: Math.max(28, insets.bottom) }}>
        <View style={[styles.page, { paddingHorizontal: small ? 22 : 48 }]}>
          <View style={[styles.header, small && styles.headerSmall]}>
            <Pressable accessibilityRole="button" accessibilityLabel="Привет, природа! На главную" onPress={goHome} style={styles.brand}>
              <View style={[styles.brandIcon, narrow && { width: 39, height: 39 }]}><Icon name="leaf" size={27} color="#FFFFFF" /></View>
              <View><Text style={[styles.brandName, narrow && { fontSize: 18 }]}>привет, природа!</Text><Text style={[styles.brandSubtitle, narrow && { fontSize: 8 }]}>маленькие открытия каждый день</Text></View>
            </Pressable>
            <View style={styles.headerActions}>
              {!small && <Pressable accessibilityRole="button" onPress={() => setParentsOpen(true)} style={styles.parentsLink}><Text style={styles.parentsLinkText}>Для родителей</Text></Pressable>}
              <Pressable accessibilityRole="button" accessibilityLabel={audio.muted ? 'Включить звук' : 'Выключить звук'} onPress={audio.toggleMuted} style={styles.soundButton}>
                <Icon name={audio.muted ? 'muted' : 'sound'} size={21} />
              </Pressable>
            </View>
          </View>

          {screen === 'home' && <>
            <View style={[styles.hero, desktop && styles.heroDesktop]}>
              <View style={[styles.heroCopy, desktop && { flex: 0.92 }]}>
                <View style={styles.agePill}><View style={styles.smallDot} /><Text style={styles.agePillText}>ДЛЯ МАЛЕНЬКИХ ИССЛЕДОВАТЕЛЕЙ · 0–3</Text></View>
                <Text accessibilityRole="header" style={[styles.heroTitle, small && styles.heroTitleSmall, narrow && { fontSize: 35, lineHeight: 43 }]}>Большой мир.{"\n"}<Text style={styles.heroTitleGreen}>Маленькие{small ? ' ' : '\n'}открытия.</Text></Text>
                <Text style={[styles.heroDescription, small && { marginTop: 14, fontSize: 15, lineHeight: 23 }]}>{small ? 'Слушаем, играем и удивляемся вместе.\nСтолько интересного рядом!' : 'Кто прячется в траве и поёт у пруда?\nЗнакомимся с природой — слушаем, играем\nи удивляемся вместе.'}</Text>
                {!small && <><PrimaryButton label="Пойдём к пруду" onPress={() => openGroup(GROUPS[0])} style={styles.heroButton} /><View style={styles.heroHint}><Icon name="headphones" size={17} color="#859184" /><Text style={styles.heroHintText}>Включите звук — природа заговорит</Text></View></>}
              </View>
              {!small && <PondPreview desktop={desktop} onPress={() => openGroup(GROUPS[0])} />}
            </View>

            <View style={styles.sectionHeading}><View><Text style={styles.eyebrow}>НАЧНЁМ ЗНАКОМСТВО</Text><Text accessibilityRole="header" style={[styles.sectionTitle, small && { fontSize: 28 }]}>Кого будем изучать?</Text></View>{!small && <Text style={styles.sectionHint}>Выберите нового друга</Text>}</View>
            <View style={[styles.categoryRow, small && { gap: 12 }]}>
              <CategoryCard kind="animals" onPress={() => chooseSection('animals')} small={small} />
              <CategoryCard kind="insects" onPress={() => chooseSection('insects')} small={small} />
            </View>
            {small && <View style={{ marginTop: 28 }}><PondPreview desktop={false} compact onPress={() => openGroup(GROUPS[0])} /></View>}
            <View style={[styles.benefits, small && { gap: 16, flexWrap: 'wrap' }]}>
              <Benefit icon="sound" label="Слушаем и узнаём" />
              <View style={styles.benefitDivider} />
              <Benefit icon="leaf" label="Исследуем без спешки" />
              <View style={styles.benefitDivider} />
              <Benefit icon="sparkle" label="Играем вместе" />
            </View>
          </>}

          {screen !== 'home' && <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={goBack} style={styles.backButton}><Icon name="back" size={20} /><Text style={styles.backText}>{screen === 'groups' || section === 'insects' ? 'На главную' : 'К выбору друзей'}</Text></Pressable>}

          {screen === 'groups' && <View style={styles.innerScreen}>
            <View style={styles.centerBadge}><Icon name="leaf" size={17} /><Text style={styles.centerBadgeText}>У КАЖДОГО ЕСТЬ СВОЯ ИСТОРИЯ</Text></View>
            <Text accessibilityRole="header" style={[styles.pageTitle, small && { fontSize: 39 }]}>Знакомься: животные</Text>
            <Text style={styles.pageDescription}>Они такие разные! Выбери, о ком послушаем сегодня.</Text>
            <View style={[styles.groupGrid, small && { flexDirection: 'column' }]}>
              {GROUPS.filter((item) => item.section === section).map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => openGroup(item)} style={({ pressed }) => [styles.groupCard, pressed && styles.pressed]}>
                <View style={[styles.groupArt, { backgroundColor: item.color }]}><AnimalArt animal={item.animalIds[0]} size={small ? 155 : 190} /></View>
                <Text style={styles.groupTitle}>{item.title}</Text><Text style={styles.groupSubtitle}>{item.subtitle}</Text>
                <View style={styles.groupListen}><Icon name="headphones" size={18} /><Text style={styles.groupListenText}>Послушаем и поиграем</Text><Icon name="arrow" size={20} /></View>
              </Pressable>)}
            </View>
            <Text style={styles.bottomHint}>Сегодня исследуем пруд. Здесь уже ждут новые друзья!</Text>
          </View>}

          {screen === 'intro' && <View style={[styles.introLayout, desktop && { flexDirection: 'row' }]}>
            <View style={[styles.introArt, { backgroundColor: group.color }]}><View style={styles.introHalo} /><AnimalArt animal={group.animalIds[0]} size={small ? 210 : 285} active={audio.narrating} /><View style={styles.introArtLabel}><Icon name="headphones" size={17} /><Text style={styles.introArtLabelText}>Маленькая история · около 20 секунд</Text></View></View>
            <View style={styles.introCopy}>
              <Text style={styles.eyebrow}>СНАЧАЛА ПОЗНАКОМИМСЯ</Text>
              <Text accessibilityRole="header" style={[styles.pageTitle, { textAlign: 'left', fontSize: small ? 38 : 48, marginTop: 12 }]}>{group.title}</Text>
              <Text style={styles.introSubtitle}>{group.subtitle}</Text>
              <Text style={styles.storyText}>{group.narration}</Text>
              <View style={styles.storyStatus}><View style={[styles.smallDot, { backgroundColor: audio.narrating ? '#6EA86F' : '#BEC5B3' }]} /><Text style={styles.storyStatusText}>{audio.narrating ? 'Слушаем историю… Потом отправимся к пруду' : audio.muted ? 'Звук выключен. Можно сразу отправиться к пруду' : audio.narrationUnavailable ? 'Для рассказа включите русский голос в настройках устройства' : 'Можно послушать историю или сразу начать играть'}</Text></View>
              <View style={[styles.introButtons, small && { flexDirection: 'column' }]}>
                <PrimaryButton label="К пруду" onPress={() => openPond(group)} />
                <PrimaryButton label={audio.narrating ? 'Остановить рассказ' : 'Послушать рассказ'} icon={audio.narrating ? 'pause' : 'play'} light onPress={() => audio.narrating ? audio.stopNarration() : audio.narrate(group.narration, () => openPond(group))} />
              </View>
            </View>
          </View>}

          {screen === 'pond' && <View style={styles.pondScreen}>
            <View style={[styles.pondHeading, small && { flexDirection: 'column', gap: 16, alignItems: 'flex-start' }]}>
              <View><Text style={styles.eyebrow}>НАШ МАЛЕНЬКИЙ МИР</Text><Text accessibilityRole="header" style={[styles.pondTitle, small && { fontSize: 35 }]}>Один день у пруда</Text><Text style={styles.pondDescription}>Коснись друга и послушай его голос.</Text></View>
              <Pressable accessibilityRole="switch" aria-checked={audio.ambientEnabled} accessibilityState={{ checked: audio.ambientEnabled }} accessibilityLabel="Звуки природы" onPress={audio.toggleAmbient} style={[styles.ambientButton, !audio.ambientEnabled && { backgroundColor: '#F0EFE9' }]}><Icon name="music" size={19} /><Text style={styles.ambientButtonText}>Звуки природы</Text><View style={[styles.toggleDot, { backgroundColor: audio.ambientEnabled ? '#6F9D69' : '#A3AAA0' }]} /></Pressable>
            </View>
            <View style={[styles.pondContent, desktop && { flexDirection: 'row', alignItems: 'stretch' }]}>
              <View style={styles.sceneContainer}><PondScene activeAnimal={audio.activeAnimal} onAnimalPress={playAnimal} /><View pointerEvents="none" style={styles.sceneCorner}><Icon name="sun" size={16} color="#9A7B44" /><Text style={styles.sceneCornerText}>Тёплый день · +24°</Text></View></View>
              <View style={[styles.pondSidebar, desktop && { width: 288, paddingTop: 10 }]}>
                <Text style={styles.sidebarTitle}>Кто здесь живёт?</Text><Text style={styles.sidebarDescription}>У каждого свой голос.{"\n"}Давай послушаем!</Text>
                <View style={[styles.animalList, !desktop && { flexDirection: 'row', flexWrap: 'wrap' }]}>
                  {(Object.keys(ANIMALS) as AnimalId[]).map((id) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Послушать: ${ANIMALS[id].name}`} onPress={() => playAnimal(id)} style={({ pressed }) => [styles.animalRow, !desktop && { flexBasis: small ? '47%' : '23%', flexGrow: 1 }, (audio.activeAnimal === id || lastAnimal === id) && styles.animalRowSelected, pressed && styles.pressed]}>
                    <View style={[styles.animalAvatar, { backgroundColor: ANIMALS[id].color }]}><AnimalArt animal={id} size={54} /></View><View style={{ flex: 1 }}><Text style={styles.animalRowName}>{ANIMALS[id].name}</Text><Text style={styles.animalRowAction}>{ANIMALS[id].action}</Text></View>{desktop && <Icon name="sound" size={18} color={audio.activeAnimal === id ? palette.green : '#8B9A8B'} />}
                  </Pressable>)}
                </View>
                <View accessibilityLiveRegion="polite" style={styles.discovery}><Icon name={lastAnimal ? 'sound' : 'sparkle'} size={21} color="#B48C3C" /><Text style={styles.discoveryText}>{lastAnimal ? ANIMALS[lastAnimal].description : 'Нажимай на животных на картинке или выбирай их здесь.'}</Text></View>
                <Pressable accessibilityRole="button" onPress={() => { audio.leaveScene(); setScreen('intro'); audio.narrate(group.narration, () => openPond(group)); }} style={styles.replayStory}><Icon name="headphones" size={18} /><Text style={styles.replayStoryText}>Послушать историю ещё раз</Text></Pressable>
              </View>
            </View>
          </View>}

          {audio.audioError && <View accessibilityRole="alert" style={styles.audioAlert}><Text style={styles.audioAlertText}>{audio.audioError}</Text></View>}
          <View style={styles.footer}><View style={styles.footerBrand}><Icon name="leaf" size={15} color="#9AA68D" /><Text style={styles.footerText}>С любовью к природе и маленьким людям</Text></View><Pressable accessibilityRole="button" onPress={() => setParentsOpen(true)} hitSlop={12}><Text style={styles.footerLink}>Для родителей</Text></Pressable></View>
        </View>
      </ScrollView>

      <Modal visible={parentsOpen} transparent animationType="fade" onRequestClose={() => setParentsOpen(false)}>
        <View style={styles.modalOverlay}><View accessibilityViewIsModal style={styles.modalCard}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 26 }}>
          <View style={styles.modalHeader}><View style={styles.modalIcon}><Icon name="leaf" size={27} /></View><Pressable accessibilityRole="button" accessibilityLabel="Закрыть настройки" onPress={() => setParentsOpen(false)} style={styles.closeButton}><Icon name="close" /></Pressable></View>
          <Text accessibilityRole="header" style={styles.modalTitle}>Исследуем вместе</Text><Text style={styles.modalDescription}>Приложение для первых знакомств с природой. Рассматривайте картинки вместе, называйте животных и повторяйте их звуки.</Text>
          <View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={styles.settingTitle}>Звук</Text><Text style={styles.settingDescription}>Голоса друзей и короткие рассказы</Text></View><Switch accessibilityLabel="Звук приложения" value={!audio.muted} onValueChange={audio.toggleMuted} trackColor={{ false: '#D5DBCF', true: '#377A5D' }} thumbColor="#FFFFFF" /></View>
          <View style={styles.settingRow}><View style={{ flex: 1 }}><Text style={styles.settingTitle}>Природный фон</Text><Text style={styles.settingDescription}>Тихая вода, ветер и пение птиц</Text></View><Switch accessibilityLabel="Природный фон" value={audio.ambientEnabled} onValueChange={audio.toggleAmbient} trackColor={{ false: '#D5DBCF', true: '#377A5D' }} thumbColor="#FFFFFF" /></View>
          <View style={styles.parentNote}><Text style={styles.parentNoteText}>Рассказы читает русский голос устройства. Если голос не установлен, текст остаётся на экране. Персонажи озвучены мягкими игровыми звуками.</Text></View>
          <Text style={styles.parentPrivacy}>Без рекламы, аккаунтов и сбора личных данных.</Text>
          <PrimaryButton label="Продолжить открытия" onPress={() => setParentsOpen(false)} />
        </ScrollView></View></View>
      </Modal>
    </View>
  );
}

function PondPreview({ desktop, compact = false, onPress }: { desktop: boolean; compact?: boolean; onPress: () => void }) {
  return <View style={[styles.heroArt, desktop && { flex: 1.08 }, !desktop && styles.heroArtStacked]}>
    <View style={styles.artDecorationOne} /><View style={styles.artDecorationTwo} />
    <View style={styles.previewFrame}>
      <PondScene activeAnimal={null} onAnimalPress={() => {}} enabled={false} />
      <View style={styles.previewLabel}><View style={[styles.smallDot, { backgroundColor: '#7EA769' }]} /><Text style={styles.previewLabelText}>Один день у пруда</Text><Icon name="sun" size={16} color="#C79D4F" /></View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Послушать рассказ о лягушке" onPress={onPress} style={({ pressed }) => [styles.floatingCard, compact && { right: 0, gap: 8 }, pressed && styles.pressed]}>
      <View style={[styles.miniFrog, compact && { width: 48, height: 51 }]}><AnimalArt animal="frog" size={compact ? 51 : 68} /></View>
      <View style={{ flex: 1 }}><Text style={[styles.floatingEyebrow, compact && { fontSize: 7 }]}>ДАВАЙ ПОЗНАКОМИМСЯ</Text><Text style={[styles.floatingTitle, compact && { fontSize: 16 }]}>Кто сказал «ква»?</Text></View>
      <View style={styles.miniPlay}><Icon name="play" color="#FFFFFF" size={20} /></View>
    </Pressable>
    <View style={styles.handwritten}><Icon name="sparkle" size={15} color="#AC9161" /><Text style={styles.handwrittenText}>столько интересного рядом!</Text></View>
  </View>;
}

function CategoryCard({ kind, onPress, small }: { kind: SectionId; onPress: () => void; small: boolean }) {
  const insects = kind === 'insects';
  return <Pressable accessibilityRole="button" accessibilityLabel={insects ? 'Насекомые' : 'Животные'} onPress={onPress} style={({ pressed }) => [styles.categoryCard, { backgroundColor: insects ? '#F6EBCF' : '#E8EFDD' }, small && { minHeight: 225, paddingHorizontal: 10, paddingVertical: 15 }, pressed && styles.pressed]}>
    <View style={[styles.categoryCopy, small && { alignItems: 'center', marginTop: 107 }]}>{!small && <Text style={styles.categoryKicker}>{insects ? 'МАЛЕНЬКИЕ ЧУДЕСА' : 'ПУШИСТЫЕ, ПЕРНАТЫЕ И НЕ ТОЛЬКО'}</Text>}<Text style={[styles.categoryTitle, small && { fontSize: 22 }]}>{insects ? 'Насекомые' : 'Животные'}</Text><Text style={[styles.categoryDescription, small && { fontSize: 10, textAlign: 'center' }]}>{insects ? 'Кто жужжит и стрекочет?' : 'Летают, плавают и прыгают'}</Text>{!small && <View style={styles.categoryArrow}><Icon name="arrow" size={22} /></View>}</View>
    <View style={[styles.categoryAnimal, insects && { right: 12, bottom: 17 }, small && { left: 0, right: 0, top: 0, bottom: undefined, alignItems: 'center' }]}><AnimalArt animal={insects ? 'bee' : 'duck'} size={small ? 135 : 155} /></View>
    <View style={[styles.categoryCircle, { backgroundColor: insects ? '#F0DDA5' : '#D7E4C7' }]} />
  </Pressable>;
}

function Benefit({ icon, label }: { icon: 'sound' | 'leaf' | 'sparkle'; label: string }) {
  return <View style={styles.benefit}><Icon name={icon} size={20} color="#7A8B70" /><Text style={styles.benefitText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center', gap: 24 },
  loadingText: { fontSize: 26, color: palette.ink },
  app: { flex: 1, backgroundColor: palette.background }, scroll: { flex: 1 },
  page: { width: '100%', maxWidth: 1260, alignSelf: 'center' },
  header: { paddingVertical: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: palette.line },
  headerSmall: { paddingVertical: 20 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 11, flexShrink: 1 },
  brandIcon: { width: 46, height: 46, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center', borderRadius: 17, transform: [{ rotate: '-8deg' }] },
  brandName: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, color: palette.ink, letterSpacing: -0.7 },
  brandSubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, color: '#8A9585', marginTop: 1, letterSpacing: 0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 27, marginLeft: 10 },
  parentsLink: { paddingVertical: 12 }, parentsLinkText: { fontFamily: 'Nunito_700Bold', fontSize: 14, color: '#6D7D6A' },
  soundButton: { width: 45, height: 45, borderRadius: 16, borderWidth: 1, borderColor: '#DFE4D6', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF88' },
  hero: { paddingTop: 40, paddingBottom: 45, gap: 24 }, heroDesktop: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 54, gap: 36 },
  heroCopy: { alignItems: 'flex-start', zIndex: 1 },
  agePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF0DF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  smallDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#85A36D' }, agePillText: { color: '#6D8059', fontFamily: 'Nunito_800ExtraBold', fontSize: 9, letterSpacing: 1 },
  heroTitle: { fontFamily: 'Lora_600SemiBold', color: '#2D4B3F', fontSize: 61, lineHeight: 70, letterSpacing: -2, marginTop: 22 },
  heroTitleSmall: { fontSize: 41, lineHeight: 49, letterSpacing: -1.5 }, heroTitleGreen: { color: '#5E855F' },
  heroDescription: { fontFamily: 'Nunito_400Regular', color: '#7D887B', fontSize: 16, lineHeight: 26, marginTop: 22 },
  heroButton: { marginTop: 27, paddingHorizontal: 29, borderRadius: 21 }, heroHint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15 },
  heroHintText: { fontFamily: 'Nunito_600SemiBold', color: '#929C8B', fontSize: 11 },
  heroArt: { position: 'relative', width: '100%', padding: 15, paddingBottom: 38 }, heroArtStacked: { maxWidth: 550, alignSelf: 'center', marginTop: 5 },
  artDecorationOne: { width: 100, height: 100, backgroundColor: '#F1DBA2', borderRadius: 50, position: 'absolute', top: -3, right: -1 },
  artDecorationTwo: { width: 65, height: 65, backgroundColor: '#E3E9D2', borderRadius: 24, position: 'absolute', bottom: 12, left: -5, transform: [{ rotate: '15deg' }] },
  previewFrame: { borderRadius: 100, overflow: 'hidden', borderWidth: 7, borderColor: '#FFFFFF', transform: [{ rotate: '-3deg' }], boxShadow: '0 15px 38px rgba(70, 90, 57, 0.08)' },
  previewLabel: { position: 'absolute', top: 20, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 17, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: '#FFFFFFED' },
  previewLabelText: { fontFamily: 'Nunito_700Bold', color: '#557255', fontSize: 11 },
  floatingCard: { position: 'absolute', bottom: 26, left: 0, right: 34, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 23, backgroundColor: '#FFFFFF', boxShadow: '0 10px 35px rgba(55, 80, 43, 0.09)' },
  miniFrog: { height: 61, width: 68, borderRadius: 17, backgroundColor: '#EEF3E3', alignItems: 'center', justifyContent: 'center' },
  floatingEyebrow: { fontFamily: 'Nunito_800ExtraBold', fontSize: 8, color: '#A0A58F', letterSpacing: 1 },
  floatingTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 19, color: palette.ink, marginTop: 4 },
  miniPlay: { width: 39, height: 39, borderRadius: 15, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  handwritten: { position: 'absolute', right: 14, bottom: -4, flexDirection: 'row', alignItems: 'center', gap: 6, transform: [{ rotate: '-4deg' }] },
  handwrittenText: { fontFamily: 'Lora_600SemiBold', fontStyle: 'italic', color: '#A48D62', fontSize: 11 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, marginBottom: 22 },
  eyebrow: { fontFamily: 'Nunito_800ExtraBold', fontSize: 10, color: '#9A9F84', letterSpacing: 2 },
  sectionTitle: { fontFamily: 'Lora_600SemiBold', color: palette.ink, fontSize: 32, letterSpacing: -0.7, marginTop: 10 },
  sectionHint: { fontFamily: 'Nunito_600SemiBold', color: '#8E9985', fontSize: 12, marginBottom: 4 },
  categoryRow: { flexDirection: 'row', gap: 22 },
  categoryCard: { flex: 1, minHeight: 208, borderRadius: 29, overflow: 'hidden', paddingHorizontal: 26, paddingVertical: 23, position: 'relative' },
  categoryCopy: { zIndex: 2, alignItems: 'flex-start' }, categoryKicker: { fontFamily: 'Nunito_800ExtraBold', fontSize: 8, letterSpacing: 1.2, color: '#819172', maxWidth: 190 },
  categoryTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 33, letterSpacing: -0.7, color: '#365540', marginTop: 10 },
  categoryDescription: { fontFamily: 'Nunito_600SemiBold', fontSize: 12, color: '#839074', marginTop: 5, maxWidth: 200 },
  categoryArrow: { width: 40, height: 36, backgroundColor: '#FFFFFFAA', borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  categoryAnimal: { position: 'absolute', right: 6, bottom: 8, zIndex: 1 },
  categoryCircle: { position: 'absolute', right: -35, bottom: -55, width: 210, height: 210, borderRadius: 105, zIndex: 0 },
  benefits: { marginTop: 30, paddingVertical: 21, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 35 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 9 }, benefitText: { fontFamily: 'Nunito_700Bold', color: '#819075', fontSize: 11 },
  benefitDivider: { height: 17, width: 1, backgroundColor: '#E1E5D5' },
  footer: { borderTopWidth: 1, borderColor: palette.line, paddingTop: 22, marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 }, footerText: { fontFamily: 'Nunito_600SemiBold', fontSize: 10, color: '#A0A68F' },
  footerLink: { fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#8D9A80' },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 9, minHeight: 48, marginTop: 20, paddingRight: 20 },
  backText: { fontFamily: 'Nunito_700Bold', color: '#708469', fontSize: 14 },
  innerScreen: { alignItems: 'center', paddingTop: 30, paddingBottom: 28 },
  centerBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 17 }, centerBadgeText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 9, color: '#8B9B79', letterSpacing: 1.1 },
  pageTitle: { fontFamily: 'Lora_600SemiBold', fontSize: 49, color: palette.ink, letterSpacing: -1.3, textAlign: 'center' },
  pageDescription: { fontFamily: 'Nunito_400Regular', color: '#7D8B76', fontSize: 16, lineHeight: 25, textAlign: 'center', marginTop: 16 },
  groupGrid: { flexDirection: 'row', gap: 26, width: '100%', maxWidth: 770, marginTop: 35 },
  groupCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 31, borderWidth: 1, borderColor: '#E7E9DC' },
  groupArt: { width: '100%', borderRadius: 24, minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  groupTitle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 27, color: palette.ink, marginTop: 20 },
  groupSubtitle: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, color: '#83917D', marginTop: 6 },
  groupListen: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingTop: 19, marginTop: 19, borderTopWidth: 1, borderColor: palette.line },
  groupListenText: { flex: 1, fontFamily: 'Nunito_700Bold', color: '#6D8665', fontSize: 12 },
  bottomHint: { fontFamily: 'Nunito_600SemiBold', color: '#8A977F', fontSize: 12, marginTop: 29, textAlign: 'center', lineHeight: 20 },
  introLayout: { gap: 42, paddingVertical: 35, alignItems: 'center' },
  introArt: { width: '100%', maxWidth: 430, minHeight: 370, borderRadius: 65, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  introHalo: { width: 280, height: 280, borderRadius: 140, backgroundColor: '#FFFFFF50', position: 'absolute', top: 32 },
  introArtLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFFBB', borderRadius: 17, paddingHorizontal: 14, paddingVertical: 11, position: 'absolute', bottom: 21 },
  introArtLabelText: { fontFamily: 'Nunito_700Bold', color: '#638258', fontSize: 10 },
  introCopy: { flex: 1, width: '100%' }, introSubtitle: { fontFamily: 'Nunito_700Bold', color: '#8C9A7F', fontSize: 17, marginTop: 8 },
  storyText: { fontFamily: 'Nunito_400Regular', fontSize: 19, lineHeight: 32, color: '#687D62', marginTop: 24 },
  storyStatus: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 23 },
  storyStatusText: { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 12, lineHeight: 19, color: '#8A977F' },
  introButtons: { flexDirection: 'row', gap: 12, marginTop: 25, flexWrap: 'wrap' },
  pondScreen: { paddingTop: 15, paddingBottom: 15 }, pondHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 27 },
  pondTitle: { fontFamily: 'Lora_600SemiBold', color: palette.ink, fontSize: 43, letterSpacing: -1, marginTop: 11 },
  pondDescription: { fontFamily: 'Nunito_600SemiBold', color: '#83917B', fontSize: 15, marginTop: 10 },
  ambientButton: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 17, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#EAF0E1' },
  ambientButtonText: { fontFamily: 'Nunito_700Bold', fontSize: 12, color: '#6D8562' }, toggleDot: { width: 7, height: 7, borderRadius: 5 },
  pondContent: { gap: 28 }, sceneContainer: { flex: 1, borderRadius: 37, overflow: 'hidden', borderWidth: 5, borderColor: '#FFFFFF', position: 'relative' },
  sceneCorner: { position: 'absolute', top: 17, left: 17, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFFFFFD9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  sceneCornerText: { fontFamily: 'Nunito_700Bold', fontSize: 10, color: '#8D895E' },
  pondSidebar: { gap: 10 }, sidebarTitle: { fontFamily: 'Lora_600SemiBold', fontSize: 25, color: palette.ink, letterSpacing: -0.6 },
  sidebarDescription: { fontFamily: 'Nunito_600SemiBold', fontSize: 14, lineHeight: 22, color: '#83917B' }, animalList: { gap: 9, marginTop: 8 },
  animalRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF88', borderWidth: 1, borderColor: '#E9EBDF', padding: 9, borderRadius: 20, minHeight: 75 },
  animalRowSelected: { borderColor: '#A5BF8F', backgroundColor: '#EEF4E4' }, animalAvatar: { width: 50, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  animalRowName: { fontFamily: 'Nunito_800ExtraBold', color: palette.ink, fontSize: 14 }, animalRowAction: { fontFamily: 'Nunito_600SemiBold', color: '#95A082', fontSize: 11, marginTop: 3 },
  discovery: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F5EFD9', borderRadius: 20, padding: 16, marginTop: 9 },
  discoveryText: { flex: 1, fontFamily: 'Nunito_600SemiBold', fontSize: 12, lineHeight: 20, color: '#9A865C' },
  replayStory: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 15, minHeight: 48 },
  replayStoryText: { fontFamily: 'Nunito_700Bold', fontSize: 11, color: '#7E9171' },
  audioAlert: { backgroundColor: '#FAEACE', padding: 15, borderRadius: 17, marginTop: 20 }, audioAlertText: { fontFamily: 'Nunito_600SemiBold', color: '#9A6F39', fontSize: 13, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: '#18392E77', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: palette.background, borderRadius: 33, width: '100%', maxWidth: 500, maxHeight: '94%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, modalIcon: { width: 53, height: 53, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#E4EBD6' },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#F0F0E4' },
  modalTitle: { fontFamily: 'Lora_600SemiBold', fontSize: 29, color: palette.ink, marginTop: 23 },
  modalDescription: { fontFamily: 'Nunito_400Regular', color: '#7C8B70', fontSize: 14, lineHeight: 23, marginTop: 12, marginBottom: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15, borderTopWidth: 1, borderColor: palette.line },
  settingTitle: { fontFamily: 'Nunito_800ExtraBold', color: palette.ink, fontSize: 15 }, settingDescription: { fontFamily: 'Nunito_600SemiBold', fontSize: 11, color: '#8B987F', marginTop: 4 },
  parentNote: { backgroundColor: '#EEF0E2', padding: 14, borderRadius: 17, marginTop: 8 }, parentNoteText: { fontFamily: 'Nunito_600SemiBold', color: '#819071', fontSize: 12, lineHeight: 19 },
  parentPrivacy: { fontFamily: 'Nunito_700Bold', color: '#859776', fontSize: 11, textAlign: 'center', marginVertical: 19 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import { AMBIENCE, ANIMALS, type AnimalId } from '../data/nature';

const AUDIO_ERROR = 'Не удалось включить звук. Попробуйте ещё раз.';
const AMBIENT_VOLUME = 0.32;

/**
 * All five audio assets are bundled with the app. Players are prepared on mount,
 * but playback starts only after a child's (or parent's) explicit interaction.
 */
export function useNatureAudio() {
  const ambience = useAudioPlayer(AMBIENCE, { updateInterval: 200 });
  const frog = useAudioPlayer(ANIMALS.frog.sound, { updateInterval: 100 });
  const duck = useAudioPlayer(ANIMALS.duck.sound, { updateInterval: 100 });
  const grasshopper = useAudioPlayer(ANIMALS.grasshopper.sound, { updateInterval: 100 });
  const bee = useAudioPlayer(ANIMALS.bee.sound, { updateInterval: 100 });
  const animals = useMemo(() => ({ frog, duck, grasshopper, bee }), [frog, duck, grasshopper, bee]);

  const [muted, setMuted] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [narrating, setNarrating] = useState(false);
  const [narrationUnavailable, setNarrationUnavailable] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [activeAnimal, setActiveAnimal] = useState<AnimalId | null>(null);

  // Refs make quick repeated taps and cancellation take effect synchronously,
  // before React commits state updates or an old native callback arrives.
  const mounted = useRef(true);
  const mutedRef = useRef(false);
  const ambienceEnabledRef = useRef(true);
  const inScene = useRef(false);
  const foreground = useRef(AppState.currentState !== 'background');
  const activeRef = useRef<AnimalId | null>(null);
  const narratingRef = useRef(false);
  const narrationToken = useRef(0);
  const effectToken = useRef(0);
  const effectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const narrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelVoiceWait = useRef<(() => void) | null>(null);
  const webUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speechStop = useRef<Promise<void>>(Promise.resolve());
  const voices = useRef<Speech.Voice[]>([]);
  const voicesReady = useRef<Promise<Speech.Voice[]> | null>(null);

  const updateAmbience = useCallback(() => {
    if (!mounted.current) return;
    try {
      if (!inScene.current || mutedRef.current || !ambienceEnabledRef.current || !foreground.current) {
        ambience.pause();
        return;
      }
      ambience.loop = true;
      ambience.volume = narratingRef.current ? 0.08 : activeRef.current ? 0.15 : AMBIENT_VOLUME;
      if (!ambience.playing) ambience.play();
    } catch {
      setAudioError(AUDIO_ERROR);
    }
  }, [ambience]);

  const stopNarration = useCallback(() => {
    narrationToken.current += 1;
    if (narrationTimer.current) clearTimeout(narrationTimer.current);
    narrationTimer.current = null;
    cancelVoiceWait.current?.();
    cancelVoiceWait.current = null;
    webUtterance.current = null;
    narratingRef.current = false;
    if (mounted.current) setNarrating(false);
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
      } catch {
        // Unsupported speech synthesis must not prevent navigation or muting.
      }
    } else {
      speechStop.current = Speech.stop().catch(() => undefined);
    }
    updateAmbience();
  }, [updateAmbience]);

  const stopAnimals = useCallback(() => {
    effectToken.current += 1;
    if (effectTimer.current) clearTimeout(effectTimer.current);
    effectTimer.current = null;
    Object.values(animals).forEach((player) => {
      try { player.pause(); } catch { /* A player may already be released. */ }
    });
    activeRef.current = null;
    if (mounted.current) setActiveAnimal(null);
    updateAmbience();
  }, [animals, updateAmbience]);

  const leaveScene = useCallback(() => {
    inScene.current = false;
    stopNarration();
    stopAnimals();
    updateAmbience();
  }, [stopAnimals, stopNarration, updateAmbience]);

  const enterScene = useCallback(async () => {
    stopNarration();
    inScene.current = true;
    if (mounted.current) setAudioError(null);
    updateAmbience();
  }, [stopNarration, updateAmbience]);

  const playAnimal = useCallback(async (id: AnimalId) => {
    if (!mounted.current || !inScene.current || mutedRef.current || !foreground.current) return;
    stopNarration();
    stopAnimals();
    setAudioError(null);
    const token = effectToken.current;
    const player = animals[id];
    activeRef.current = id;
    setActiveAnimal(id);
    const fail = () => {
      if (mounted.current && effectToken.current === token) {
        setAudioError(AUDIO_ERROR);
        stopAnimals();
      }
    };
    try {
      player.volume = 0.8;
      // Web seekTo changes currentTime synchronously: retain the user gesture.
      // Native seeking is asynchronous: await it so replay starts at zero, and
      // discard the pending start if a newer tap, mute, or navigation wins.
      const seek = player.seekTo(0);
      if (Platform.OS === 'web') void seek.catch(fail);
      else await seek;
      if (!mounted.current || effectToken.current !== token || mutedRef.current || !inScene.current || !foreground.current) return;
      player.play();
      updateAmbience();
      // The actual ended event clears the highlight. This bounds it even if an
      // interrupted native player never delivers that event.
      effectTimer.current = setTimeout(() => {
        if (mounted.current && effectToken.current === token) stopAnimals();
      }, Math.max(player.duration + 0.5, 3.5) * 1000);
    } catch {
      fail();
    }
  }, [animals, stopAnimals, stopNarration, updateAmbience]);

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    [ambience, ...Object.values(animals)].forEach((player) => {
      try { player.muted = next; } catch { /* A player may already be released. */ }
    });
    if (next) {
      stopNarration();
      stopAnimals();
      updateAmbience();
    } else {
      updateAmbience();
    }
  }, [ambience, animals, stopAnimals, stopNarration, updateAmbience]);

  const toggleAmbient = useCallback(() => {
    const next = !ambienceEnabledRef.current;
    ambienceEnabledRef.current = next;
    setAmbientEnabled(next);
    updateAmbience();
  }, [updateAmbience]);

  const narrate = useCallback((text: string, onDone?: () => void) => {
    stopNarration();
    stopAnimals();
    if (!text.trim() || mutedRef.current || !foreground.current) return;
    const token = narrationToken.current;
    setNarrationUnavailable(false);
    setAudioError(null);

    const fail = () => {
      if (!mounted.current || narrationToken.current !== token) return;
      setNarrationUnavailable(true);
      stopNarration();
    };

    const speakWithVoice = (identifier: string, browserVoice?: SpeechSynthesisVoice) => {
      if (!mounted.current || narrationToken.current !== token || mutedRef.current || !foreground.current) return;
      narratingRef.current = true;
      setNarrating(true);
      updateAmbience();
      let started = false;
      narrationTimer.current = setTimeout(() => {
        if (!started) fail();
      }, 6000);
      const onStart = () => {
        if (!mounted.current || narrationToken.current !== token) return;
        started = true;
        if (narrationTimer.current) clearTimeout(narrationTimer.current);
        // Bound a stuck utterance too, without advancing the scene falsely.
        narrationTimer.current = setTimeout(fail, 60000);
      };
      const onComplete = () => {
        if (!mounted.current || narrationToken.current !== token) return;
        narrationToken.current += 1;
        if (narrationTimer.current) clearTimeout(narrationTimer.current);
        narrationTimer.current = null;
        webUtterance.current = null;
        narratingRef.current = false;
        setNarrating(false);
        updateAmbience();
        onDone?.();
      };
      const onStopped = () => {
        if (!mounted.current || narrationToken.current !== token) return;
        stopNarration();
      };
      try {
        if (Platform.OS === 'web') {
          // Expo's web wrapper discards the Promise returned by its async speak
          // implementation. The browser API lets us handle errors synchronously
          // and assign the actual Russian voice without another async lookup.
          const utterance = new window.SpeechSynthesisUtterance(text);
          utterance.lang = 'ru-RU';
          utterance.voice = browserVoice ?? null;
          utterance.rate = 0.85;
          utterance.pitch = 1.03;
          utterance.volume = 0.9;
          utterance.onstart = onStart;
          utterance.onend = onComplete;
          utterance.onpause = onStopped;
          utterance.onerror = fail;
          // Retain a strong reference until completion (needed by some browsers).
          webUtterance.current = utterance;
          window.speechSynthesis.speak(utterance);
          return;
        }
        Speech.speak(text, {
          language: 'ru-RU',
          voice: identifier,
          // Expo multiplies iOS's default rate internally; 0.85 is already
          // gently slower than normal on both native platforms.
          rate: 0.85,
          pitch: 1.03,
          volume: 0.9,
          useApplicationAudioSession: true,
          onStart,
          onDone: onComplete,
          onStopped,
          onError: fail,
        });
      } catch {
        fail();
      }
    };

    if (Platform.OS === 'web') {
      // Some browsers populate getVoices only after a voiceschanged event. Wait
      // briefly with a removable listener; browsers without TTS never hang.
      if (typeof window === 'undefined' || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {
        fail();
        return;
      }
      const synth = window.speechSynthesis;
      const chooseVoice = () => synth.getVoices()
        .filter((voice) => /^ru(?:[-_]|$)/i.test(voice.lang))
        .sort((a, b) => Number(b.localService) - Number(a.localService))[0];
      const russian = chooseVoice();
      if (russian) {
        speakWithVoice(russian.voiceURI, russian);
      } else {
        const onVoicesChanged = () => {
          if (!mounted.current || narrationToken.current !== token) return;
          const delayedVoice = chooseVoice();
          if (!delayedVoice) return;
          cancelVoiceWait.current?.();
          cancelVoiceWait.current = null;
          speakWithVoice(delayedVoice.voiceURI, delayedVoice);
        };
        synth.addEventListener('voiceschanged', onVoicesChanged);
        const timeout = setTimeout(fail, 1800);
        cancelVoiceWait.current = () => {
          clearTimeout(timeout);
          synth.removeEventListener('voiceschanged', onVoicesChanged);
        };
      }
    } else {
      // The native speech engine sometimes initializes after the screen mounts.
      // Re-query on the first interaction, with a bounded wait and cancellation.
      narrationTimer.current = setTimeout(fail, 5000);
      const availableVoices = voices.current.some((voice) => /^ru(?:[-_]|$)/i.test(voice.language))
        ? Promise.resolve(voices.current)
        : voicesReady.current ?? Speech.getAvailableVoicesAsync();
      // Native stop and seek operations are asynchronous. Respect the stop
      // completion so a previous utterance cannot stop a newly queued one.
      void Promise.all([speechStop.current, availableVoices]).then(([, available]) => {
        if (!mounted.current || narrationToken.current !== token) return;
        if (narrationTimer.current) clearTimeout(narrationTimer.current);
        voices.current = available;
        voicesReady.current = null;
        const russian = available.find((voice) => /^ru(?:[-_]|$)/i.test(voice.language));
        if (russian) speakWithVoice(russian.identifier);
        else fail();
      }).catch(fail);
    }
  }, [stopAnimals, stopNarration, updateAmbience]);

  useEffect(() => {
    mounted.current = true;
    void setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {
      if (mounted.current) setAudioError(AUDIO_ERROR);
    });
    if (Platform.OS !== 'web') {
      voicesReady.current = Speech.getAvailableVoicesAsync();
      void voicesReady.current.then((available) => {
        if (mounted.current) voices.current = available;
      }).catch(() => undefined).finally(() => { voicesReady.current = null; });
    }
    const statusSubscriptions = (Object.entries(animals) as [AnimalId, typeof frog][]).map(([id, player]) =>
      player.addListener('playbackStatusUpdate', (status) => {
        if (!mounted.current) return;
        if (status.error) {
          setAudioError(AUDIO_ERROR);
          if (activeRef.current === id) stopAnimals();
        } else if (status.didJustFinish && activeRef.current === id) {
          if (effectTimer.current) clearTimeout(effectTimer.current);
          effectTimer.current = null;
          activeRef.current = null;
          setActiveAnimal(null);
          updateAmbience();
        }
      })
    );
    const ambientSubscription = ambience.addListener('playbackStatusUpdate', (status) => {
      if (mounted.current && status.error) setAudioError(AUDIO_ERROR);
    });
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      foreground.current = state === 'active';
      if (!foreground.current) {
        stopNarration();
        stopAnimals();
        updateAmbience();
      }
      // Returning to the app stays silent until another explicit interaction.
    });
    return () => {
      mounted.current = false;
      inScene.current = false;
      effectToken.current += 1;
      if (effectTimer.current) clearTimeout(effectTimer.current);
      stopNarration();
      statusSubscriptions.forEach((subscription) => subscription.remove());
      ambientSubscription.remove();
      appStateSubscription.remove();
      // useAudioPlayer owns player disposal; avoid touching a released native
      // object from this effect's unmount cleanup.
    };
  }, [ambience, animals, stopAnimals, stopNarration, updateAmbience]);

  return {
    muted,
    toggleMuted,
    ambientEnabled,
    toggleAmbient,
    narrating,
    narrationUnavailable,
    audioError,
    activeAnimal,
    enterScene,
    leaveScene,
    playAnimal,
    narrate,
    stopNarration,
  };
}

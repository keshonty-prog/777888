#!/usr/bin/env python3
"""Exercise the exported web application with a real Chromium audio engine.

Run an export at http://127.0.0.1:4173, then run this script. Requires Python
Playwright and Chromium; no browser download is performed here. Override
NATURE_BASE_URL or NATURE_CHROMIUM for another local server or browser binary.
Speech completion is checked separately with an explicitly mocked TTS engine;
the main scenarios use actual bundled WAV playback, not mocked audio.
"""

from __future__ import annotations

import os
from pathlib import Path
import sys

from playwright.sync_api import Page, expect, sync_playwright


BASE_URL = os.environ.get('NATURE_BASE_URL', 'http://127.0.0.1:4173')
CHROMIUM = os.environ.get('NATURE_CHROMIUM', '/usr/bin/chromium')
CHECKS = 0

AUDIO_OBSERVER = r"""
(() => {
  const players = new Set();
  const events = [];
  const originalPlay = HTMLMediaElement.prototype.play;
  const originalPause = HTMLMediaElement.prototype.pause;
  const kind = (media) => (media.currentSrc || media.src || '').match(/\/(frog|duck|grasshopper|bee|pond)\./)?.[1] || 'unknown';
  const state = () => [...players].map(media => ({
    kind: kind(media), paused: media.paused, ended: media.ended,
    time: media.currentTime, duration: media.duration, ready: media.readyState,
    volume: media.volume, loop: media.loop
  }));
  const monitor = {
    events, maxForeground: 0,
    snapshot: state,
    sample() {
      const count = state().filter(p => !p.paused && !p.ended && p.kind !== 'pond').length;
      this.maxForeground = Math.max(this.maxForeground, count);
    }
  };
  const track = (media) => {
    if (players.has(media)) return;
    players.add(media);
    ['playing', 'timeupdate', 'ended', 'pause', 'error'].forEach(type => {
      media.addEventListener(type, () => {
        events.push({type, kind: kind(media), time: media.currentTime, at: performance.now()});
        monitor.sample();
      });
    });
  };
  HTMLMediaElement.prototype.play = function(...args) {
    track(this);
    events.push({type: 'requested', kind: kind(this), at: performance.now()});
    const promise = originalPlay.apply(this, args);
    promise.then(() => {
      events.push({type: 'played', kind: kind(this), time: this.currentTime, at: performance.now()});
      monitor.sample();
    }, error => {
      events.push({type: 'rejected', kind: kind(this), name: error.name, message: error.message, at: performance.now()});
    });
    return promise;
  };
  HTMLMediaElement.prototype.pause = function(...args) {
    track(this);
    const result = originalPause.apply(this, args);
    monitor.sample();
    return result;
  };
  setInterval(() => monitor.sample(), 15);
  window.__natureAudio = monitor;
})();
"""

SPEECH_MOCK = r"""
(() => {
  const utterances = [];
  const events = [];
  const engine = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => [{
      voiceURI: 'test-russian', name: 'Russian test voice', lang: 'ru-RU',
      localService: true, default: true
    }],
    speak(message) {
      utterances.push(message);
      events.push({type: 'speak', text: message.text, lang: message.lang, rate: message.rate});
      this.speaking = true;
      setTimeout(() => message.onstart?.({type: 'start'}), 0);
    },
    cancel() {
      this.speaking = false;
      events.push({type: 'cancel'});
      // Keep old callbacks deliberately: real native engines can deliver a late
      // completion after cancellation, and it must not navigate a new screen.
    },
    pause() { this.paused = true; },
    resume() { this.paused = false; },
    addEventListener() {}, removeEventListener() {}
  };
  Object.defineProperty(window, 'speechSynthesis', {configurable: true, value: engine});
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    configurable: true, value: class { constructor(text = '') { this.text = text; } }
  });
  window.__natureSpeech = {
    events,
    count: () => utterances.length,
    finish(index) {
      if (!utterances[index]) throw new Error('Missing test utterance ' + index);
      engine.speaking = false;
      utterances[index].onend?.({type: 'end'});
    }
  };
})();
"""


def checked(condition: bool, label: str) -> None:
    global CHECKS
    if not condition:
        raise AssertionError(label)
    CHECKS += 1
    print(f'  PASS {label}', flush=True)


def visible(page: Page, text: str, label: str | None = None) -> None:
    expect(page.get_by_text(text, exact=True)).to_be_visible()
    checked(True, label or text)


def click(page: Page, name: str, role: str = 'button') -> None:
    page.get_by_role(role, name=name, exact=True).click()


def sound_state(page: Page) -> list[dict]:
    return page.evaluate('window.__natureAudio.snapshot()')


def wait_silence(page: Page) -> None:
    page.wait_for_function('window.__natureAudio.snapshot().every(p => p.paused || p.ended)')


def open_home(page: Page) -> None:
    click(page, 'Привет, природа! На главную')
    visible(page, 'Кого будем изучать?')


def enter_pond_without_voice(page: Page) -> None:
    visible(page, 'Для рассказа включите русский голос в настройках устройства', 'missing Russian voice has an explicit fallback')
    click(page, 'К пруду')
    visible(page, 'Один день у пруда')


def check_no_horizontal_overflow(page: Page, label: str) -> None:
    dimensions = page.evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth})')
    checked(dimensions['scroll'] <= dimensions['width'] + 1, f'{label}: no horizontal document overflow')


def real_audio_flow(browser, width: int, height: int, name: str) -> None:
    print(f'\n{name} ({width}×{height}), real WAV playback', flush=True)
    context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce')
    context.add_init_script(AUDIO_OBSERVER)
    page = context.new_page()
    errors: list[str] = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(BASE_URL, wait_until='networkidle')
        visible(page, 'Кого будем изучать?', 'home loaded')
        checked(all(p['paused'] for p in sound_state(page)), 'home starts without automatic audio')
        check_no_horizontal_overflow(page, 'home')
        page.screenshot(path=f'/tmp/nature-{name}.png', full_page=True)

        click(page, 'Животные')
        visible(page, 'Знакомься: животные')
        click(page, 'Земноводные')
        enter_pond_without_voice(page)
        page.wait_for_function("window.__natureAudio.snapshot().some(p => p.kind === 'pond' && !p.paused && p.time > .05)")
        checked(True, 'ambient WAV actually advances')
        check_no_horizontal_overflow(page, 'pond')

        animal_labels = {
            'frog': 'Лягушка. Послушать звук',
            'duck': 'Утка. Послушать звук',
            'grasshopper': 'Кузнечик. Послушать звук',
            'bee': 'Пчела. Послушать звук',
        }
        for animal, label in animal_labels.items():
            click(page, label)
            page.wait_for_function(
                "name => window.__natureAudio.snapshot().some(p => p.kind === name && !p.paused && p.time > .05 && p.ready >= 2)",
                arg=animal,
            )
            state = next(p for p in sound_state(page) if p['kind'] == animal)
            checked(1 <= state['duration'] <= 2, f'{animal}: actual WAV decoded and playing')

        # Separate rapid taps from natural completion: old playback must stop
        # immediately, including when a different sound is still loading.
        for animal in ['frog', 'duck', 'grasshopper', 'bee', 'frog', 'frog', 'duck', 'bee']:
            click(page, animal_labels[animal])
        page.wait_for_timeout(150)
        checked(page.evaluate('window.__natureAudio.maxForeground') == 1, 'rapid taps never overlap two animal sounds')

        # Snapshot can capture both the interactive scene and its selected row.
        page.screenshot(path=f'/tmp/nature-pond-{name}.png', full_page=True)
        if name == 'desktop':
            page.screenshot(path='/tmp/nature-pond.png', full_page=True)

        click(page, 'Выключить звук')
        wait_silence(page)
        checked(True, 'mute pauses ambience and all animal sounds')
        before = page.evaluate("window.__natureAudio.events.filter(e => e.type === 'requested').length")
        click(page, animal_labels['frog'])
        click(page, animal_labels['duck'])
        page.wait_for_timeout(100)
        after = page.evaluate("window.__natureAudio.events.filter(e => e.type === 'requested').length")
        checked(before == after, 'tapping while muted does not request any audio playback')

        click(page, 'Включить звук')
        page.wait_for_function("window.__natureAudio.snapshot().some(p => p.kind === 'pond' && !p.paused)")
        click(page, 'Звуки природы', 'switch')
        expect(page.get_by_role('switch', name='Звуки природы', exact=True)).to_have_attribute('aria-checked', 'false')
        wait_silence(page)
        checked(True, 'nature switch stops the ambient track')

        click(page, 'Назад')
        visible(page, 'Знакомься: животные', 'back returns to animal groups')
        click(page, 'Птицы')
        enter_pond_without_voice(page)
        expect(page.get_by_role('switch', name='Звуки природы', exact=True)).to_have_attribute('aria-checked', 'false')
        wait_silence(page)
        checked(True, 'ambient preference survives leaving and re-entering the scene')

        open_home(page)
        wait_silence(page)
        checked(True, 'returning home stops all tracks')
        click(page, 'Насекомые')
        visible(page, 'На лугу', 'insect selection opens its own story')
        enter_pond_without_voice(page)
        click(page, 'Послушать: Пчела')
        page.wait_for_function("window.__natureAudio.snapshot().some(p => p.kind === 'bee' && !p.paused && p.time > .05)")
        checked(True, 'sidebar sound controls also play the correct animal')
        open_home(page)
        wait_silence(page)

        # Mobile has one footer entry; desktop also has a header entry.
        page.get_by_role('button', name='Для родителей', exact=True).last.click()
        visible(page, 'Исследуем вместе')
        visible(page, 'Без рекламы, аккаунтов и сбора личных данных.')
        click(page, 'Закрыть настройки')
        visible(page, 'Кого будем изучать?', 'parent modal closes without losing navigation')

        rejected = page.evaluate("window.__natureAudio.events.filter(e => e.type === 'rejected' && e.name !== 'AbortError')")
        media_errors = page.evaluate("window.__natureAudio.events.filter(e => e.type === 'error')")
        checked(not rejected, f'no unexpected audio play rejections: {rejected}')
        checked(not media_errors, f'no media decoding errors: {media_errors}')
        checked(not errors, f'no uncaught browser errors: {errors}')
        checked(page.get_by_role('alert').count() == 0, 'no application audio-error alert')
    except Exception:
        page.screenshot(path=f'/tmp/nature-failed-{name}.png', full_page=True)
        print(f'Failure screenshot: /tmp/nature-failed-{name}.png', file=sys.stderr)
        print('Audio state:', sound_state(page), file=sys.stderr)
        print('Browser errors:', errors, file=sys.stderr)
        raise
    finally:
        context.close()


def speech_flow(browser) -> None:
    print('\nRussian TTS lifecycle (explicit mock; not a real voice check)', flush=True)
    context = browser.new_context(viewport={'width': 1000, 'height': 900})
    context.add_init_script(AUDIO_OBSERVER)
    context.add_init_script(SPEECH_MOCK)
    page = context.new_page()
    errors: list[str] = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    try:
        page.goto(BASE_URL, wait_until='networkidle')
        visible(page, 'Кого будем изучать?')
        click(page, 'Животные')
        click(page, 'Земноводные')
        expect(page.get_by_role('button', name='Остановить рассказ', exact=True)).to_be_visible()
        utterance = page.evaluate("window.__natureSpeech.events.find(e => e.type === 'speak')")
        checked(utterance['lang'] == 'ru-RU' and 'земноводные' in utterance['text'], 'Russian story reaches the speech engine')
        checked(0 < utterance['rate'] < 1, 'story uses a gentle speaking rate')
        checked(all(p['paused'] for p in sound_state(page)), 'pond ambience stays off during the introduction')
        page.evaluate('window.__natureSpeech.finish(0)')
        visible(page, 'Один день у пруда', 'a completed story automatically opens the pond')

        click(page, 'Назад')
        click(page, 'Птицы')
        expect(page.get_by_role('button', name='Остановить рассказ', exact=True)).to_be_visible()
        click(page, 'Назад')
        visible(page, 'Знакомься: животные')
        page.evaluate('window.__natureSpeech.finish(1)')
        page.wait_for_timeout(100)
        visible(page, 'Знакомься: животные', 'late completion after Back cannot reopen the pond')

        click(page, 'Птицы')
        expect(page.get_by_role('button', name='Остановить рассказ', exact=True)).to_be_visible()
        click(page, 'Остановить рассказ')
        page.evaluate('window.__natureSpeech.finish(2)')
        page.wait_for_timeout(100)
        expect(page.get_by_role('button', name='Послушать рассказ', exact=True)).to_be_visible()
        checked(page.get_by_text('Перья, крылья и клюв', exact=True).is_visible(), 'Stop cancels narration without advancing')

        click(page, 'Послушать рассказ')
        expect(page.get_by_role('button', name='Остановить рассказ', exact=True)).to_be_visible()
        click(page, 'Выключить звук')
        page.evaluate('window.__natureSpeech.finish(3)')
        page.wait_for_timeout(100)
        visible(page, 'Звук выключен. Можно сразу отправиться к пруду', 'mute cancels speech and stale navigation')
        click(page, 'К пруду')
        visible(page, 'Один день у пруда')
        wait_silence(page)
        checked(True, 'manual entry while muted starts no audio')
        checked(not errors, f'no uncaught errors during TTS lifecycle: {errors}')
    finally:
        context.close()


def narrow_layout(browser) -> None:
    print('\nNarrow layout (320×740)', flush=True)
    context = browser.new_context(viewport={'width': 320, 'height': 740})
    page = context.new_page()
    try:
        page.goto(BASE_URL, wait_until='networkidle')
        visible(page, 'Кого будем изучать?')
        check_no_horizontal_overflow(page, '320px home')
        click(page, 'Животные')
        click(page, 'Земноводные')
        click(page, 'К пруду')
        visible(page, 'Один день у пруда')
        check_no_horizontal_overflow(page, '320px pond')
        page.get_by_role('button', name='Лягушка. Послушать звук', exact=True).scroll_into_view_if_needed()
        box = page.get_by_role('button', name='Лягушка. Послушать звук', exact=True).bounding_box()
        checked(box is not None and box['width'] >= 44 and box['height'] >= 44, 'narrow scene keeps a touch-sized frog target')
        page.screenshot(path='/tmp/nature-narrow.png', full_page=True)
    finally:
        context.close()


def main() -> None:
    if not Path(CHROMIUM).is_file():
        raise SystemExit(f'Chromium not found: {CHROMIUM}. Set NATURE_CHROMIUM to its executable.')
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=CHROMIUM, headless=True, args=['--no-sandbox'])
        try:
            real_audio_flow(browser, 1280, 1000, 'desktop')
            real_audio_flow(browser, 390, 844, 'mobile')
            narrow_layout(browser)
            speech_flow(browser)
        finally:
            browser.close()
    checked(CHECKS > 0, 'functional scenarios actually executed')
    print(f'\nPASS: {CHECKS} functional checks completed.', flush=True)


if __name__ == '__main__':
    main()

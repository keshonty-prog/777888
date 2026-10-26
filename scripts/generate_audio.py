#!/usr/bin/env python3
"""Reproduce this app's gentle, stylized nature sounds with Python alone.

No recordings, downloaded samples, speech models, or third-party libraries are
used. The generated audio is CC0-1.0; see assets/audio/README.md.
"""

from __future__ import annotations

import array
import math
from pathlib import Path
import random
import sys
import wave


RATE = 24_000
TAU = 2 * math.pi
OUT = Path(__file__).resolve().parents[1] / "assets" / "audio"
RANDOM = random.Random(777888)


def silence(seconds: float) -> list[float]:
    return [0.0] * round(seconds * RATE)


def smooth_edge(position: float, length: float, attack: float = .018,
                release: float = .055) -> float:
    if position < 0 or position >= length:
        return 0.0
    rise = min(1.0, position / attack)
    fall = min(1.0, (length - position) / release)
    return math.sin(rise * math.pi / 2) ** 2 * math.sin(fall * math.pi / 2) ** 2


def add_event(target: list[float], at: float, duration: float,
              sample_fn, gain: float = 1.0) -> None:
    start = round(at * RATE)
    count = round(duration * RATE)
    for j in range(count):
        if 0 <= start + j < len(target):
            target[start + j] += gain * sample_fn(j / RATE, duration)


def frog() -> list[float]:
    output = silence(1.8)
    for at, duration, pitch in [(.07, .26, 148), (.36, .34, 126),
                                (.91, .26, 143), (1.20, .36, 121)]:
        def croak(t: float, d: float, base=pitch) -> float:
            # Nasal harmonic formants, descending pitch, and throat pulses.
            phase = TAU * (base * t - 22 * t * t / d)
            harmonics = sum(math.sin(k * phase) * weight for k, weight in
                            [(1, .43), (2, .24), (3, .36), (5, .16), (7, .06)])
            throat = .70 + .30 * math.sin(TAU * 30 * t)
            return harmonics * throat * smooth_edge(t, d, .025, .08)
        add_event(output, at, duration, croak)
    return output


def duck() -> list[float]:
    output = silence(1.8)
    for at, duration, pitch in [(.08, .36, 200), (.59, .30, 185), (1.09, .39, 177)]:
        def quack(t: float, d: float, base=pitch) -> float:
            phase = TAU * (base * t - 37 * t * t / d)
            # Broad odd and even harmonics model a soft nasal quack.
            harmonics = sum(math.sin(k * phase) * weight for k, weight in
                            [(1, .36), (2, .21), (3, .30), (4, .12), (6, .08)])
            mouth = .55 + .45 * math.sin(math.pi * t / d)
            rasp = RANDOM.uniform(-1, 1) * .045
            return (harmonics + rasp) * mouth * smooth_edge(t, d, .018, .10)
        add_event(output, at, duration, quack)
    return output


def grasshopper() -> list[float]:
    output = silence(1.9)
    for group_at in [.10, .66, 1.22]:
        for pulse in range(12):
            def scrape(t: float, d: float) -> float:
                carrier = (math.sin(TAU * 4300 * t) * .52
                           + math.sin(TAU * 5700 * t) * .22
                           + RANDOM.uniform(-1, 1) * .17)
                return carrier * math.sin(math.pi * t / d) ** 2
            add_event(output, group_at + pulse * .029, .018, scrape, .61)
    return output


def bee() -> list[float]:
    output = silence(1.85)
    phase = 0.0
    for i in range(len(output)):
        t = i / RATE
        pitch = 193 + 15 * math.sin(TAU * .70 * t) + 3 * math.sin(TAU * 11 * t)
        phase += TAU * pitch / RATE
        harmonic = (math.sin(phase) * .48 + math.sin(phase * 2) * .22
                    + math.sin(phase * 3) * .11 + math.sin(phase * 5) * .05)
        wings = .83 + .17 * math.sin(TAU * 27 * t)
        fly_by = .55 + .45 * math.sin(math.pi * t / 1.85) ** 2
        output[i] = harmonic * wings * fly_by * smooth_edge(t, 1.85, .20, .30)
    return output


def pond() -> list[float]:
    seconds = 16.0
    overlap = .50
    output = silence(seconds + overlap)
    wind = 0.0
    water = 0.0
    for i in range(len(output)):
        t = i / RATE
        wind = .996 * wind + .004 * RANDOM.uniform(-1, 1)
        water = .91 * water + .09 * RANDOM.uniform(-1, 1)
        breeze = .7 + .3 * math.sin(TAU * .09 * t)
        output[i] = wind * .74 * breeze + water * .074

    # Tiny rounded water drops, with a long quiet tail instead of sharp clicks.
    for _ in range(54):
        at = RANDOM.uniform(0, seconds + overlap - .25)
        frequency = RANDOM.uniform(480, 1200)
        gain = RANDOM.uniform(.006, .017)
        def ripple(t: float, d: float, base=frequency) -> float:
            phase = TAU * (base * t - 260 * t * t)
            return math.sin(phase) * math.exp(-t * 23) * smooth_edge(t, d, .01, .06)
        add_event(output, at, .23, ripple, gain)

    # A distant stylized bird call; deliberately soft beneath foreground animals.
    for at in [1.4, 1.67, 7.4, 7.68, 12.3]:
        def bird(t: float, d: float) -> float:
            phase = TAU * (1550 * t + 220 * t * t / d)
            return math.sin(phase) * math.sin(math.pi * t / d) ** 2
        add_event(output, at, .15, bird, .010)

    # Loop boundary remains the continuation of the original signal. Blend the
    # extension into the opening half-second, then retain precisely 16 seconds.
    count = round(seconds * RATE)
    overlap_count = round(overlap * RATE)
    for i in range(overlap_count):
        fraction = i / overlap_count
        mix = .5 - .5 * math.cos(math.pi * fraction)
        output[i] = output[count + i] * (1 - mix) + output[i] * mix
    return output[:count]


def write_sound(name: str, samples: list[float], peak: float) -> None:
    measured_peak = max(abs(value) for value in samples)
    if measured_peak == 0:
        raise ValueError(f"{name}: silent waveform")
    scale = peak / measured_peak
    encoded = array.array('h', (round(value * scale * 32767) for value in samples))
    if sys.byteorder != 'little':
        encoded.byteswap()
    destination = OUT / f"{name}.wav"
    with wave.open(str(destination), 'wb') as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(RATE)
        handle.writeframes(encoded.tobytes())
    rms = math.sqrt(sum((sample * scale) ** 2 for sample in samples) / len(samples))
    print(f"{destination.name}: {len(samples) / RATE:.2f}s, "
          f"peak={peak:.3f}, RMS={rms:.4f}, {destination.stat().st_size:,} bytes")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_sound('frog', frog(), .57)
    write_sound('duck', duck(), .50)
    write_sound('grasshopper', grasshopper(), .31)
    write_sound('bee', bee(), .38)
    write_sound('pond', pond(), .16)


if __name__ == '__main__':
    main()

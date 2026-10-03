"""Render an original, slow piano-like instrumental loop; no external samples."""
from pathlib import Path
import wave
import numpy as np

RATE = 32000
BEAT = 1.15
BARS = 16
LENGTH = round(RATE * BEAT * 4 * BARS)
track = np.zeros((LENGTH, 2), dtype=np.float64)

def note(midi, beat, velocity, pan=0.0):
    frequency = 440 * 2 ** ((midi - 69) / 12)
    t = np.arange(round(RATE * 6.5)) / RATE
    tone = np.zeros(len(t))
    for harmonic, strength, decay in [(1, 1, 2.0), (2, .22, 1.25), (3, .07, .8), (4, .025, .55)]:
        tone += strength * np.sin(2 * np.pi * frequency * harmonic * t) * np.exp(-t / decay)
    tone *= (1 - np.exp(-t / .014)) * np.minimum(1, (6.5 - t) / .3) * velocity
    offset = round(beat * BEAT * RATE)
    # Wrapped tails make the last chord decay naturally across the loop boundary.
    indices = (offset + np.arange(len(t))) % LENGTH
    track[indices, 0] += tone * np.sqrt((1 - pan) / 2)
    track[indices, 1] += tone * np.sqrt((1 + pan) / 2)

# Cmaj7, Am7, Fmaj7, Gsus: quiet voicings, no percussion or vocals.
chords = [(48, 55, 59, 64), (45, 55, 60, 64), (41, 53, 57, 60), (43, 55, 60, 62)]
melodies = [
    [(0.7, 76), (2.3, 74)], [(1, 72), (3, 71)],
    [(0.8, 69), (2.4, 72)], [(1, 74)],
    [(1, 79), (2.5, 76)], [(0.8, 74), (2.8, 72)],
    [(1.4, 69)], [(1, 67), (3, 71)],
    [(0.8, 72), (2.5, 76)], [(1.2, 74), (3, 72)],
    [(0.7, 69), (2.4, 67)], [(1.4, 74)],
    [(1, 76), (2.7, 74)], [(0.9, 72)],
    [(1.1, 69), (2.8, 72)], [(1, 71), (2.8, 67)],
]
for bar in range(BARS):
    root, *upper = chords[bar % 4]
    note(root, bar * 4, .055, -.15)
    for i, midi in enumerate(upper):
        note(midi, bar * 4 + .12 + i * .55, .034, -.3 + i * .3)
    for i, (beat, midi) in enumerate(melodies[bar]):
        note(midi, bar * 4 + beat, .043 if i == 0 else .036, .12)

# Gentle diffuse reflections, with no periodic beat or sharp transient.
dry = track.copy()
for delay, gain in [(.089, .10), (.157, .075), (.241, .06), (.379, .04), (.563, .025)]:
    track += np.roll(dry[:, ::-1], round(delay * RATE), axis=0) * gain
peak = float(np.max(np.abs(track)))
track *= .48 / max(peak, 1e-9)
pcm = np.round(track * 32767).astype('<i2')
dest = Path(__file__).resolve().parents[1] / 'public' / 'audio'
dest.mkdir(exist_ok=True)
with wave.open(str(dest / 'quiet-desk.wav'), 'wb') as audio:
    audio.setnchannels(2)
    audio.setsampwidth(2)
    audio.setframerate(RATE)
    audio.writeframes(pcm.tobytes())
(dest / 'README.md').write_text('quiet-desk.wav: original slow instrumental composed and synthesized for this portfolio. No third-party recording or samples. Regenerate with scripts/prepare-desk-music.py (NumPy).\n', encoding='utf-8')
print(f'{LENGTH / RATE:.1f}s stereo; peak {np.max(np.abs(track)):.3f}; finite={np.isfinite(track).all()}')

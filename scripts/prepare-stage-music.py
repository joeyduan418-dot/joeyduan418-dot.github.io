"""Compose four original instrumental loops with distinct modal arrangements."""
from pathlib import Path
import sys, subprocess
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'output/video-tools'))
import imageio_ffmpeg
RATE=24000
DEST=ROOT/'public/audio/stages'
DEST.mkdir(parents=True,exist_ok=True)

def render(slug,tempo,chords,phrases,lead,accompaniment,style):
    beat=60/tempo
    length=round(RATE*beat*64)
    mix=np.zeros((length,2))
    rng=np.random.default_rng(418+tempo)

    def add(signal,position,pan=0):
        indices=(round(position*beat*RATE)+np.arange(len(signal)))%length
        mix[indices,0]+=signal*np.sqrt((1-pan)/2)
        mix[indices,1]+=signal*np.sqrt((1+pan)/2)

    def note(midi,position,beats,voice,volume,pan=0):
        f=440*2**((midi-69)/12)
        seconds=beats*beat
        if voice in ('pluck','guitar','dulcimer'): seconds=max(seconds,3.4)
        t=np.arange(round(RATE*(seconds+.35)))/RATE
        signal=np.zeros(len(t))
        if voice in ('flute','bow','pad'):
            vibrato=.0014*np.sin(2*np.pi*(4.5 if voice=='bow' else 4.1)*t)*(1-np.exp(-t/.5))
            phase=2*np.pi*f*np.cumsum(1+vibrato)/RATE
            partials={'flute':[1,.22,.06,.012],'bow':[1,.45,.19,.08,.035],'pad':[1,.12,.025]}[voice]
            for h,a in enumerate(partials,1):signal+=a*np.sin(phase*h)
            attack=.13 if voice=='flute' else .23 if voice=='bow' else .7
            env=(1-np.exp(-t/attack))*np.clip((seconds+.25-t)/(.3 if voice!='pad' else .8),0,1)
            signal*=env
        else:
            for h in range(1,9):
                strength=(.4 if voice=='guitar' else .65)**(h-1)/h**.3
                decay=(1.7 if voice=='pluck' else 1.25 if voice=='guitar' else 1.0)/h**.45
                signal+=strength*np.sin(2*np.pi*f*h*(1+.00008*h*h)*t)*np.exp(-t/decay)
            signal*=(1-np.exp(-t/.006))*np.clip((seconds+.35-t)/.2,0,1)
        add(signal*volume,position,pan)

    def percussion(position,low=False,volume=.018):
        t=np.arange(round(RATE*.22))/RATE
        if low:
            phase=2*np.pi*(95*t-28*.035*(1-np.exp(-t/.035)))
            signal=np.sin(phase)*np.exp(-t/.065)
        else:
            signal=rng.normal(size=len(t))*np.exp(-t/.018)*.18
        signal*=1-np.exp(-t/.002)
        add(signal*volume,position,-.15)

    for bar in range(16):
        chord=chords[bar%len(chords)]
        note(chord[0]-12,bar*4,3.8,'pad',.012,-.1)
        # Separate arrangements: spacious desert pulse, opera accents,
        # flowing Jiangnan plucks, or a relaxed pastoral guitar pattern.
        pattern={'desert':[0,1.5,2.5],'opera':[0,.75,2,3.25],
                 'water':[0,1,2.5],'rural':[0,.5,1.5,2.5,3.5]}[style]
        for j,p in enumerate(pattern):
            midi=chord[j%len(chord)]
            note(midi,bar*4+p,1.4,accompaniment,.031,-.35 if j%2==0 else .3)
        phrase=phrases[bar%len(phrases)]
        for j,(p,midi,duration) in enumerate(phrase):
            note(midi,bar*4+p,duration,lead,.046 if lead in ('flute','bow') else .064,.12)
        if style=='desert':
            percussion(bar*4,True,.022);percussion(bar*4+2.5,True,.012)
        elif style=='opera':
            percussion(bar*4+1.5,False,.02);percussion(bar*4+3.25,False,.015)
        elif style=='rural':
            note(chord[-1]+12,bar*4+3,1.5,'dulcimer',.014,.45)

    # Circular reflections preserve the final note tails at the loop boundary.
    dry=mix.copy()
    for seconds,gain in [(.083,.12),(.139,.08),(.227,.07),(.383,.045),(.61,.03)]:
        mix+=np.roll(dry[:,::-1],round(seconds*RATE),axis=0)*gain
    mix*=.52/max(np.max(np.abs(mix)),1e-9)
    pcm=np.round(mix*32767).astype('<i2')
    command=[imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-f','s16le','-ar',str(RATE),'-ac','2','-i','pipe:0','-c:a','libmp3lame','-b:a','128k','-y',str(DEST/(slug+'.mp3'))]
    subprocess.run(command,input=pcm.tobytes(),check=True)
    print(slug,round(length/RATE,1),'s; finite',np.isfinite(mix).all(),'peak',round(float(np.max(np.abs(mix))),2))

render('silk-road',72,[(50,57,62),(46,53,58),(48,55,60),(45,52,57)],
 [[(.5,74,1),(2,77,1.5)],[(.5,76,.8),(1.5,74,1),(3,69,.7)],
  [(0,72,1.5),(2,70,1)],[(.5,69,1),(2,73,1.5)],
  [(.5,77,1),(2,81,1.5)],[(0,79,1),(1.5,77,1),(3,74,.8)],
  [(.5,72,1),(2,70,1.5)],[(0,73,1),(1.5,69,1.8)]],
 'dulcimer','pluck','desert')

render('opera-garden',78,[(55,62,67),(52,59,64),(53,60,65),(50,57,62)],
 [[(0,79,.8),(1,81,.6),(2,83,1.5)],[(.5,81,.8),(1.5,79,.7),(3,76,.8)],
  [(0,74,1),(1.5,76,.8),(2.5,79,1)],[(.5,81,1),(2,79,1.5)],
  [(0,83,.8),(1,86,.7),(2.5,83,1)],[(.5,81,1),(2,79,1)],
  [(0,76,1.3),(2,74,1)],[(.5,76,1),(2,79,1.5)]],
 'bow','dulcimer','opera')

render('rural-fireflies',80,[(48,55,60,64),(45,52,57,60),(41,48,53,57),(43,50,55,62)],
 [[(.5,72,1),(2,76,1)],[(0,79,1),(1.5,76,.8),(3,74,.7)],
  [(.5,72,1),(2,69,1.5)],[(0,67,1),(2,74,1.5)],
  [(.5,76,1),(2,79,1)],[(0,81,1),(1.5,79,1),(3,76,.7)],
  [(0,74,1),(1.5,72,.8),(3,69,.8)],[(.5,67,1),(2,72,1.5)]],
 'flute','guitar','rural')

render('white-snake',64,[(50,57,62),(48,55,60),(46,53,58),(45,52,57)],
 [[(.5,74,1.5),(2.5,77,1)],[(0,79,1.2),(1.8,77,1.5)],
  [(.5,74,1),(2,72,1.5)],[(0,69,1.5),(2.5,72,1)],
  [(.5,77,1),(2,81,1.5)],[(0,79,1.3),(2,77,1)],
  [(.5,74,1.5),(2.5,72,.8)],[(0,69,1),(1.7,74,2)]],
 'flute','pluck','water')

(DEST/'README.md').write_text('Four original instrumental compositions created for this portfolio. No external songs, recordings or third-party samples. Source: scripts/prepare-stage-music.py.\nSilk Road: minor/modal plucked strings, dulcimer-like melody and restrained low drum.\nOpera Garden: pentatonic bowed melody, dulcimer-like accompaniment and light wood percussion.\nRural Fireflies: bright pentatonic flute-like melody and pastoral guitar arpeggios.\nWhite Snake: slower pentatonic flute-like melody and spacious zither-like plucks.\nTimbres are synthesized interpretations, not recordings of traditional instruments.\n',encoding='utf-8')

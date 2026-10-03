"""Short material-based Foley synthesis, without electronic UI beeps."""
from pathlib import Path
import wave
import numpy as np

rate=24000
rng=np.random.default_rng(418)
dest=Path(__file__).resolve().parents[1]/'public/audio/interactions'
dest.mkdir(parents=True,exist_ok=True)

def noise(seconds, low, high):
 n=round(seconds*rate); f=np.fft.rfftfreq(n,1/rate)
 spectrum=np.fft.rfft(rng.normal(size=n))
 filt=(1-np.exp(-(f/max(low,1))**2))*np.exp(-(f/high)**2)
 a=np.fft.irfft(spectrum*filt,n=n)
 return a/max(np.sqrt(np.mean(a*a)),1e-9)*.16

def friction(seconds, low, high, strokes):
 a=noise(seconds,low,high); t=np.arange(len(a))/rate; env=np.zeros(len(a))
 for start,length,strength in strokes:
  u=(t-start)/length; env+=strength*np.where((u>0)&(u<1),np.sin(np.pi*np.clip(u,0,1))**2,0)
 return a*env

def switch(deep=False):
 t=np.arange(round(.14*rate))/rate
 a=noise(.14,350 if deep else 900,6000)
 env=np.zeros(len(t))
 for start,strength in [(0,.85),(.058,.55)]:
  u=np.maximum(0,t-start)
  env+=strength*(1-np.exp(-u/.0007))*np.exp(-u/.006)*(t>=start)
 return a*env+np.sin(2*np.pi*(680 if deep else 1650)*t)*np.exp(-t/.006)*.026

def save(name,a):
 fade=min(round(.006*rate),len(a)//4)
 a[:fade]*=np.linspace(0,1,fade);a[-fade:]*=np.linspace(1,0,fade)
 peak=np.max(np.abs(a));a*=min(1,.6/max(peak,1e-9))
 with wave.open(str(dest/(name+'.wav')),'wb') as w:
  w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(np.round(a*32767).astype('<i2').tobytes())
 print(name,round(len(a)/rate,3),'s', 'peak',round(float(np.max(np.abs(a))),3))

save('page-turn',friction(1.1,350,5200,[(.03,.3,.45),(.23,.63,.8),(.81,.24,.25)]))
save('paper-slide',friction(.88,500,4600,[(.06,.45,.8),(.4,.4,.45)]))
# A sustained, uneven fiber rasp along a perforation; no decaying impact burst.
a=noise(.5,850,7200);t=np.arange(len(a))/rate
knots=np.linspace(0,.5,26); rough=np.interp(t,knots,rng.uniform(.35,1,26))
env=(1-np.exp(-t/.025))*np.minimum(1,(.5-t)/.055)
a*=rough*env
save('ticket-tear',a)
save('mouse-click',switch())
save('tv-button',switch(True)*1.2)
save('lamp-switch',switch(True)*.85)
save('handset',friction(.25,220,3500,[(.005,.055,.85),(.08,.14,.38)])+np.sin(2*np.pi*430*np.arange(round(.25*rate))/rate)*np.exp(-np.arange(round(.25*rate))/rate/.022)*.03)
save('photo',friction(.28,650,5400,[(.015,.24,.65)]))
save('ribbon',friction(.5,200,2500,[(.01,.46,.6)]))
t=np.arange(round(.64*rate))/rate
a=friction(.64,250,2100,[(.18,.4,.35)])
for hz,strength in [(2200,.025),(3460,.012),(4790,.005)]:a+=np.sin(2*np.pi*hz*t)*np.exp(-t/.035)*strength
save('cup',a)
(dest/'README.md').write_text('page-turn-real.wav uses the CC0 recording by OwlStorm; see PAGE-TURN-SOURCE.md. Other files are original material-based synthesized Foley from scripts/prepare-interaction-sounds.py. Synthesized page-turn.wav is unused. Paper sounds use filtered irregular friction; ticket tear is a continuous fiber rasp rather than a hit; physical controls use short paired mechanical contacts.\n',encoding='utf-8')

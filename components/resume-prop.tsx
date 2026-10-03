"use client";
import {useState} from 'react';
import {useInteractionSound} from './interaction-sound';

export default function ResumeProp({onRead}: {onRead: () => void}) {
  const [opened, setOpened] = useState(false);
  const sound=useInteractionSound();
  const toggle=()=>{sound('paper-slide');setOpened(!opened)};
  return <div className={`resume-book-experience ${opened ? 'paper-is-out' : ''}`}>
    <div className="resume-book-stage">
      <div className="resume-book">
        <div className="resume-book-back" aria-hidden="true"/>
        <div className="resume-book-pages" aria-hidden="true"/>
        <div className="resume-paper-motion">
          <button className="resume-book-sheet" disabled={!opened} aria-label="放大阅读原版简历" onClick={onRead}>
            <span className="resume-sheet-front"><img src="/assets/resume.png" alt="段静怡的个人简历" draggable={false}/><span className="resume-sheet-hint">点击阅读原版 ↗</span></span>
            <span className="resume-sheet-back" aria-hidden="true"><span>DUAN JINGYI / RESUME</span></span>
          </button>
        </div>
        <button className="resume-book-cover" aria-label={opened ? '收回简历纸张' : '抽出简历纸张'} aria-expanded={opened} onClick={toggle}>
          <span className="resume-cover-face resume-cover-front">
            <span className="resume-cover-mark">01 / PERSONAL</span>
            <span className="resume-cover-title">段静怡<small>个人简历<span>DUAN JINGYI</span></small></span>
            <span className="resume-cover-footer">VISUAL DESIGNER<span>2026</span></span>
          </span>
        </button>
        <div className="resume-book-spine" aria-hidden="true"/>
      </div>
    </div>
    <div className="resume-book-controls">
      <p>{opened ? '点击纸张阅读，点击封套收回' : '点击封套，抽出简历'}</p>
      <div><button onClick={toggle}>{opened ? '收回简历' : '抽出简历'} <span aria-hidden="true">{opened ? '↙' : '↗'}</span></button>
      <a href="/assets/resume.png" download="段静怡-简历.png">下载原版 ↓</a></div>
    </div>
  </div>;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, projects } from "../data/projects";

function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="返回首页">DJY<span>®</span></a>
      <nav aria-label="主导航">
        <a href="#works">WORKS</a><a href="#about">ABOUT</a><a href="#contact">CONTACT</a>
      </nav>
      <a className="header-index" href="#archive">INDEX 01—07</a>
      <details className="mobile-menu">
        <summary>MENU</summary>
        <div><a href="#works">WORKS</a><a href="#about">ABOUT</a><a href="#archive">INDEX</a><a href="#contact">CONTACT</a></div>
      </details>
    </header>
  );
}

function Intro({ onEnter, closing }: { onEnter: () => void; closing: boolean }) {
  return (
    <section className={`intro ${closing ? "intro-closing" : ""}`} aria-label="作品集开场页">
      <div className="intro-grid" aria-hidden="true" />
      <p className="system-line">ARCHIVE ONLINE · FILE NO. DJY/2026</p>
      <div className="intro-title"><span>PORTFOLIO</span><strong>2026</strong></div>
      <figure className="intro-image intro-image-main"><img src="/assets/zhangjiajie.webp" alt="张家界酒品牌视觉设计" /></figure>
      <figure className="intro-image intro-image-small"><img src="/assets/xiangwei.webp" alt="湘味五侠IP形象设计" /></figure>
      <div className="intro-id"><span>段静怡</span><span>DUAN JINGYI</span><small>VISUAL DESIGNER</small></div>
      <button className="enter-button" onClick={onEnter}><span>ENTER PORTFOLIO</span><b aria-hidden="true">→</b></button>
      <p className="loading-note">[ READY TO OPEN ]</p>
      <div className="scan-line" aria-hidden="true" />
    </section>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">VISUAL DESIGNER · CHANGSHA / XIANGXI</p>
        <h1><span>段静怡</span><br />DUAN JINGYI</h1>
        <p className="hero-lede">在品牌、视觉与空间之间，建立清晰、有记忆点且能够落地的表达。</p>
        <div className="hero-actions"><a className="button button-dark" href="#works">VIEW SELECTED WORKS</a><a className="button button-line" href="#about">ABOUT ME</a><a className="text-link" href="/assets/resume.png" download>DOWNLOAD RESUME ↓</a></div>
      </div>
      <div className="hero-collage" aria-label="代表作品拼贴">
        <div className="red-pin" aria-hidden="true" />
        <figure className="hero-card card-primary"><img src="/assets/zhangjiajie.webp" alt="张家界酒品牌重塑项目" /><figcaption>PROJECT 01 / BRAND IDENTITY</figcaption></figure>
        <figure className="hero-card card-secondary"><img src="/assets/warmstation.webp" alt="暖星驿站公益APP UI设计" /></figure>
        <span className="scribble">selected<br />works ↗</span>
      </div>
      <div className="hero-status"><span className="status-dot" /> OPEN TO OPPORTUNITIES · 2026</div>
    </section>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="section-heading dark"><span>DESIGNER DOSSIER</span><b>FILE / 001</b></div>
      <div className="about-layout">
        <div className="profile-photo"><img src="/assets/portrait.webp" alt="段静怡个人照片" /><span>IDENTITY VERIFIED</span></div>
        <div className="about-copy">
          <p className="eyebrow">ABOUT / 关于我</p>
          <h2>将文化信息<br />转译为可见的设计。</h2>
          <p>我是一名视觉传达设计师，拥有室内设计与视觉设计的复合学习经历。我习惯从调研、信息梳理与视觉策略出发，将概念推进到品牌、包装、IP、界面和空间中的具体呈现。</p>
          <a className="button button-line" href="/assets/resume.png" download>下载完整简历 ↓</a>
        </div>
        <dl className="profile-data">
          <div><dt>EDUCATION 01</dt><dd>吉首大学<br /><small>视觉传达设计 · 本科<br />2025.09—2027.06</small></dd></div>
          <div><dt>EDUCATION 02</dt><dd>湖南大众传媒职业技术学院<br /><small>室内艺术设计 · 专科<br />2022.09—2025.06</small></dd></div>
          <div><dt>EXPERIENCE</dt><dd>新媒体视频剪辑运营<br /><small>10 个账号 · 累计涨粉 2000+</small></dd></div>
        </dl>
      </div>
      <div className="stats-strip">
        <div><strong>3+</strong><span>核心作品集项目</span></div><div><strong>48</strong><span>页品牌 VI 手册</span></div><div><strong>5</strong><span>个包装 SKU</span></div><div><strong>10+</strong><span>项视觉落地物料</span></div>
      </div>
      <div className="honors">
        <div><span>HONORS / 荣誉档案</span><b>国家级奖项 2 项 · 省、校级奖项 8 项</b></div>
        <ol><li><time>2024</time>世界职业院校技能竞赛 · 国家级银奖</li><li><time>2024</time>湖南省“楚怡杯”舞台布景赛项 · 省级一等奖</li><li><time>2026</time>湖南省大学生数字媒体设计大赛 · 省级二等奖</li></ol>
      </div>
    </section>
  );
}

function SelectedWorks() {
  return (
    <section className="works-section" id="works">
      <div className="section-heading"><span>SELECTED WORKS</span><b>01—03</b></div>
      <div className="selected-grid">
        {projects.slice(0,3).map((project,index)=>(
          <a className={`project-card project-${index+1}`} href={`/works/${project.slug}`} key={project.slug} style={{"--project":project.accent} as React.CSSProperties}>
            <div className="project-image"><img src={project.cover} alt={`${project.title}项目主视觉`} loading={index ? "lazy" : "eager"} /></div>
            <div className="project-meta"><span>{project.number} / {project.english}</span><span>{project.year}</span></div>
            <h3>{project.title}</h3><p>{project.summary}</p><b className="project-open">OPEN DOSSIER ↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function Archive() {
  const [active,setActive] = useState<(typeof categories)[number]>("全部");
  const shown = useMemo(()=>active === "全部" ? projects : projects.filter(p=>p.category===active),[active]);
  return (
    <section className="archive-section" id="archive">
      <div className="section-heading dark"><span>ARCHIVE INDEX</span><b>FILTER / SELECT</b></div>
      <div className="archive-intro"><h2>项目档案索引</h2><p>从视觉系统到空间与影像，按创作方向浏览完整档案。</p></div>
      <div className="filters" aria-label="项目分类">{categories.map(category=><button key={category} className={active===category?"active":""} onClick={()=>setActive(category)} aria-pressed={active===category}>{category}</button>)}</div>
      <div className="archive-grid">
        {shown.map(project=><a href={`/works/${project.slug}`} className="archive-item" key={project.slug}>
          <span>{project.number}</span><div className="archive-thumb"><img src={project.cover} alt="" loading="lazy" /></div><div><b>{project.title}</b><small>{project.english} · {project.year}</small></div><i>↗</i>
        </a>)}
      </div>
    </section>
  );
}

const skills = [
  ["01","品牌视觉与包装","从文化信息、品牌定位到字体、包装和视觉落地，建立统一且有识别度的品牌表达。"],
  ["02","IP 与文创设计","将地方文化、人物特征和年轻化表达转化为可延展的角色与文创系统。"],
  ["03","UI 与信息组织","将复杂内容重新梳理为清晰的页面结构和用户浏览路径。"],
  ["04","AI 辅助设计","用 AI 参与概念探索与风格验证，通过人工判断和后期优化控制最终质量。"],
];

function Capabilities() {
  return (
    <section className="capabilities">
      <div className="section-heading"><span>CAPABILITIES</span><b>ATTRIBUTE / 04</b></div>
      <div className="skill-grid">{skills.map(([n,title,copy])=><article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p><div className="meter"><i /><i /><i /><i /><i /></div></article>)}</div>
      <div className="workflow"><span>RESEARCH</span><i>→</i><span>INSIGHT</span><i>→</i><span>CONCEPT</span><i>→</i><span>DESIGN</span><i>→</i><span>REFINE</span><i>→</i><span>DELIVERY</span></div>
      <p className="method-note">AI 负责加速发散，我负责判断与落地。</p>
    </section>
  );
}

function Contact() {
  const [copied,setCopied] = useState(false);
  const copy = async()=>{ await navigator.clipboard.writeText("2905126980@qq.com"); setCopied(true); setTimeout(()=>setCopied(false),1600); };
  return (
    <footer className="contact" id="contact">
      <p className="eyebrow">FINAL FILE / CONTACT</p><h2>LET’S CREATE<br />SOMETHING <em>TOGETHER.</em></h2>
      <div className="contact-grid"><div><span>EMAIL</span><a href="mailto:2905126980@qq.com">2905126980@qq.com</a><button onClick={copy}>{copied?"已复制 ✓":"复制邮箱"}</button></div><div><span>PHONE</span><a href="tel:19507449358">19507449358</a></div><div><span>STATUS</span><p><i /> OPEN TO OPPORTUNITIES</p></div></div>
      <div className="footer-bar"><span>段静怡 · DUAN JINGYI</span><a href="/assets/resume.png" download>DOWNLOAD RESUME ↓</a><a href="#top">BACK TO TOP ↑</a><span>© 2026</span></div>
    </footer>
  );
}

export default function PortfolioHome() {
  const [entered,setEntered] = useState(false); const [closing,setClosing] = useState(false);
  useEffect(()=>{ if (window.sessionStorage.getItem("djy-entered") || window.location.hash) setEntered(true); },[]);
  useEffect(()=>{ document.body.classList.toggle("intro-open",!entered); return()=>document.body.classList.remove("intro-open"); },[entered]);
  const enter=()=>{ setClosing(true); window.sessionStorage.setItem("djy-entered","1"); window.setTimeout(()=>setEntered(true),480); };
  return <main>{!entered&&<Intro onEnter={enter} closing={closing} />}<SiteHeader/><Hero/><About/><SelectedWorks/><Archive/><Capabilities/><Contact/></main>;
}

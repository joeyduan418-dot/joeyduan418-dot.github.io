"use client";

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Check, Copy, Mail, MessageCircle, Phone} from 'lucide-react';
import './contact-desk.css';

const channels = [
  {label: '电话', value: '19507449358', href: 'tel:19507449358', icon: Phone},
  {label: '邮箱', value: '2905126980@qq.com', href: 'mailto:2905126980@qq.com', icon: Mail},
  {label: 'Gmail', value: 'joeyduan418@gmail.com', href: 'mailto:joeyduan418@gmail.com', icon: Mail},
  {label: '微信', value: 'gklnjjj', href: undefined, icon: MessageCircle},
];

export default function ContactDesk() {
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const reset = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (reset.current) clearTimeout(reset.current); }, []);

  async function copy(value: string, label: string) {
    if (reset.current) clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setNotice(`${label}已复制`);
    } catch {
      setCopied(null);
      setNotice('复制未成功，可以选中信纸上的联系方式手动复制。');
    }
    reset.current = setTimeout(() => { setCopied(null); setNotice(''); }, 3500);
  }

  return <section className="contact-desk" aria-labelledby="contact-heading">
    <header className="contact-intro">
      <span className="contact-eyebrow">A LITTLE NOTE FROM MY DESK</span>
      <h1 id="contact-heading">下一段故事，<em>从一句你好开始。</em></h1>
      <p>看完作品，也可以聊聊新的想法。</p>
    </header>

    <div className="contact-arrangement">
      <aside className="contact-conversation">
        <span className="contact-line-label"><span aria-hidden="true"/> CONNECTION / 联系</span>
        <div className="contact-hello" aria-hidden="true">Hello<span>你好。</span></div>
        <p>从这张工作台出发，<br/>让想法与想法相遇。</p>
        <div className="contact-direct-actions">
          <a href={channels[0].href}><Phone size={16}/>拨打电话<ArrowUpRight size={15}/></a>
          <a href={channels[1].href}><Mail size={16}/>写一封邮件<ArrowUpRight size={15}/></a>
        </div>
        <span className="contact-small-note">也可以在信纸上复制联系方式</span>
      </aside>

      <div className="contact-letter-wrap">
        <div className="contact-envelope" aria-hidden="true"><span>FOR THE NEXT GOOD IDEA</span></div>
        <article className="contact-letter">
          <div className="contact-paperclip" aria-hidden="true"/>
          <header className="contact-letter-top"><span>一封留给你的信</span><div className="contact-stamp" aria-hidden="true">DJY<small>HELLO / 你好</small></div></header>
          <span className="contact-letter-to">TO / 正在看作品的你</span>
          <h2>很高兴，在这里遇见你。</h2>
          <p className="contact-letter-message">如果我的作品让你想到了什么，<br/>或你有一个想一起实现的点子，<br/>欢迎来聊聊。</p>
          <div className="contact-letter-addresses">
            {channels.map(({label, value, href, icon: AddressIcon}) => <div className="contact-letter-row" key={label}>
              <span className="contact-address-label"><AddressIcon size={14}/>{label}</span>
              {href ? <a href={href}>{value}</a> : <span className="contact-address-value">{value}</span>}
              <button type="button" onClick={() => copy(value, label)} aria-label={`复制${label}`} title={`复制${label}`}>{copied === value ? <Check size={16}/> : <Copy size={16}/>}<span>{copied === value ? '已复制' : '复制'}</span></button>
            </div>)}
          </div>
          <footer className="contact-letter-signature"><span>保持好奇，保持联系。</span><strong>段静怡<i>DUAN JINGYI</i></strong></footer>
        </article>
      </div>
    </div>
    <div className="contact-notice" role="status" aria-live="polite">{notice}</div>
    <footer className="contact-desk-footer"><span>作品之外，还有更多可能。</span><span>LET’S KEEP IN TOUCH <span aria-hidden="true">✳</span></span></footer>
  </section>;
}

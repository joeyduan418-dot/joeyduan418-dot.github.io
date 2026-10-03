"use client";

export type SiteStatus = 'loading' | 'leaving' | 'offline' | 'failed';

export default function SiteStatusScreen({status, progress = 0, onRetry}: {
  status: SiteStatus; progress?: number; onRetry?: () => void;
}) {
  const loading = status === 'loading' || status === 'leaving';
  const title = loading ? 'Welcome' : status === 'offline' ? 'Still there?' : 'Oops!';
  const count = loading ? Math.min(7, 3 + Math.floor(progress / 25)) : title.length;
  return <div className={`site-status site-status-${status}`} role="status" aria-live="polite" aria-busy={status === 'loading'}>
    <div className="site-status-center">
      <h1 className="site-status-title" aria-label={title}>
        {Array.from(title).map((letter, i) => <span key={i} aria-hidden="true" className={i < count ? 'letter-visible' : ''} style={{animationDelay: `${loading ? 0 : i * 14}ms`}}>{letter === ' ' ? '\u00a0' : letter}</span>)}
      </h1>
      {!loading && <p className="site-status-message">{status === 'offline' ? '网络好像走丢了' : '刚刚出了点小差错'}</p>}
      {!loading && <button className="site-status-retry" onClick={onRetry}>{status === 'offline' ? '重新连接' : '再试一次'} <span aria-hidden="true">↗</span></button>}
    </div>
    {loading && <div className="site-status-progress" role="progressbar" aria-label="网站加载进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>{status === 'leaving' ? 'ENTER' : `${progress}%`}</div>}
  </div>;
}

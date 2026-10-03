"use client";

import SiteStatusScreen from '../components/site-status';

export default function ErrorPage({reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return <SiteStatusScreen status="failed" onRetry={reset}/>;
}

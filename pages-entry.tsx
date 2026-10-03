import {Component, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import WorkingDesk from './components/working-desk';
import SiteEntry from './components/site-entry';
import SiteStatusScreen from './components/site-status';
import './app/globals.css';
import './app/workbench.css';
import './app/desk-refinement.css';
import './app/resume-direct.css';
import './app/personal-archive.css';
import './app/font-faces.css';
import './app/typography.css';
import './app/desk-home.css';
import './components/resume-prop.css';
import './app/site-status.css';

class PagesBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <SiteStatusScreen status="failed" onRetry={() => window.location.reload()}/> : this.props.children;}
}
createRoot(document.getElementById('root')!).render(<PagesBoundary><SiteEntry><WorkingDesk/></SiteEntry></PagesBoundary>);

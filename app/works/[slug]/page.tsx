import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "../../../data/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: `${project.title} · 段静怡`, description: project.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <main className="project-page" style={{ "--project": project.accent } as React.CSSProperties}>
      <nav className="project-nav" aria-label="项目导航"><a href="/#works">← BACK TO INDEX</a><a href="/">DJY®</a><span>{project.number} / 07</span></nav>
      <header className="project-hero">
        <div className="project-kicker"><span>{project.english}</span><span>PROJECT DOSSIER · {project.year}</span></div>
        <h1>{project.title}</h1>
        <figure className="project-cover"><img src={project.cover} alt={`${project.title}项目封面`} /></figure>
        <div className="project-facts"><div><span>YEAR</span><b>{project.year}</b></div><div><span>ROLE</span><b>{project.role}</b></div><div><span>CATEGORY</span><b>{project.category}</b></div></div>
      </header>
      <section className="project-story">
        <div className="story-row"><span>01 / BACKGROUND</span><div><h2>项目背景</h2><p>{project.overview}</p></div></div>
        <div className="story-row"><span>02 / ROLE</span><div><h2>我的职责</h2><div className="responsibility-list">{project.responsibilities.map(item=><span key={item}>{item}</span>)}</div></div></div>
        <div className="story-row"><span>03 / INSIGHT</span><div><h2>调研与设计推导</h2><p>{project.insight}</p></div></div>
        <div className="story-row"><span>04 / OUTCOME</span><div><h2>项目成果</h2><p>{project.result}</p></div></div>
      </section>
      <section className="project-gallery" aria-label="项目视觉展示">{project.gallery.map((image,index)=><figure key={image}><img src={image} alt={`${project.title}项目展示 ${index+1}`} loading="lazy" /></figure>)}</section>
      <nav className="project-pager" aria-label="切换项目"><a href={`/works/${previous.slug}`}>← {previous.title}</a><a href={`/works/${next.slug}`}>{next.title} →</a></nav>
    </main>
  );
}

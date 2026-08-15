import { StandaloneNav } from './StandaloneNav';

export default function CurriculumPage() {
  return (
    <div className="curriculum-page">
      <StandaloneNav />
      <iframe
        className="curriculum-frame"
        src="/curriculum/article.html"
        title="World Models: A Daily Series"
      />
    </div>
  );
}

import type { BlogPost } from '../../data/blogPosts';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div className="blog-card">
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <div className="blog-card-header">
        <span className="url-prefix">SYS://</span>
        <span className="url-body">nur.writings</span>
      </div>

      <div className="card-divider" />

      <h2 className="blog-card-title">{post.title}</h2>

      <div className="card-divider" />

      <div className="blog-card-body">
        {post.paragraphs.map((para, i) => (
          <p key={i} className="blog-card-para">{para}</p>
        ))}
      </div>
    </div>
  );
}

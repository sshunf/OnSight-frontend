import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { BLOG_POSTS } from '../data/blogPosts';

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogDetailPage() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((entry) => entry.slug === slug);

  if (!post) {
    return (
      <section className="relative py-24 px-6 lg:px-8 bg-black/95">
        <div className="mx-auto max-w-3xl rounded-xl border border-gray-800 bg-gray-950/80 p-10 text-center">
          <h1 className="text-3xl font-bold text-white">Blog not found</h1>
          <p className="mt-4 text-gray-300">This blog page does not exist yet.</p>
          <Link to="/blogs" className="mt-6 inline-block rounded border border-gray-600 px-4 py-2 text-sm text-gray-200 hover:bg-white/10">
            Back to Blogs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 px-6 lg:px-8 bg-black/95">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-gray-800 bg-gray-950/85">
        <div className="h-72 border-b border-gray-800" style={post.heroStyle} />
        <div className="p-8 md:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded border border-cyan-300/40 bg-cyan-300/15 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
              {post.category}
            </span>
            {(post.tags || []).map((tag) => (
              <span key={`${post.slug}_${tag}`} className="rounded-full border border-gray-700 px-2.5 py-1 text-xs text-gray-300">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span>{post.author}</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.readTime}</span>
          </div>
          <p className="mt-6 text-lg text-gray-300">{post.summary}</p>

          <div className="mt-8 space-y-5 text-gray-200 leading-8">
            {(post.content || []).map((paragraph, index) => (
              <p key={`${post.slug}_paragraph_${index}`}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 border-t border-gray-800 pt-6">
            <Link to="/blogs" className="inline-flex items-center gap-2 rounded border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-white/10">
              ← Back to all blogs
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

export default BlogDetailPage;

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES, BLOG_POSTS } from '../data/blogPosts';

function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTag, setActiveTag] = useState('All');

  const allTags = useMemo(() => {
    const tags = new Set();
    BLOG_POSTS.forEach((post) => (post.tags || []).forEach((tag) => tags.add(tag)));
    return ['All', ...Array.from(tags)];
  }, []);

  const filteredPosts = useMemo(() => (
    BLOG_POSTS.filter((post) => {
      const categoryMatch = activeCategory === 'All' || post.category === activeCategory;
      const tagMatch = activeTag === 'All' || (post.tags || []).includes(activeTag);
      return categoryMatch && tagMatch;
    })
  ), [activeCategory, activeTag]);

  const featuredPost = filteredPosts[0] || null;
  const remainingPosts = filteredPosts.slice(1);

  return (
    <section className="relative py-24 px-6 lg:px-8 bg-black/95">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-white">Blogs</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            Explore our latest posts, research insights, and company announcements.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {BLOG_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border rounded transition ${
                activeCategory === category
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-10 flex flex-wrap items-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 text-xs border rounded-full transition ${
                activeTag === tag
                  ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/40'
                  : 'bg-transparent text-gray-300 border-gray-700 hover:text-white hover:border-gray-500'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-10 text-center text-gray-300">
            No posts match your selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPost && (() => {
              const isExternal = Boolean(featuredPost.externalUrl);
              const Wrapper = isExternal ? 'a' : Link;
              const linkProps = isExternal
                ? { href: featuredPost.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
                : { to: `/blogs/${featuredPost.slug}` };

              return (
                <Wrapper
                  {...linkProps}
                  className="group md:col-span-2 rounded-xl overflow-hidden border border-gray-800 bg-gray-950/80 hover:border-gray-600 transition"
                >
                  <div className="h-56 border-b border-gray-800" style={featuredPost.heroStyle} />
                  <div className="p-6">
                    <div className="mb-2 text-xs uppercase tracking-wide text-cyan-300">{featuredPost.category}</div>
                    <h2 className="text-3xl font-bold text-white group-hover:text-cyan-200 transition">{featuredPost.title}</h2>
                    <p className="mt-3 text-gray-300">{featuredPost.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(featuredPost.tags || []).map((tag) => (
                        <span key={`${featuredPost.slug}_${tag}`} className="text-xs rounded-full border border-gray-700 px-2.5 py-1 text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                      <span>{featuredPost.author}</span>
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                    </div>
                  </div>
                </Wrapper>
              );
            })()}

            {remainingPosts.map((post) => {
              const isExternal = Boolean(post.externalUrl);
              const Wrapper = isExternal ? 'a' : Link;
              const linkProps = isExternal
                ? { href: post.externalUrl, target: '_blank', rel: 'noopener noreferrer' }
                : { to: `/blogs/${post.slug}` };

              return (
                <Wrapper
                  key={post.slug}
                  {...linkProps}
                  className="group rounded-xl overflow-hidden border border-gray-800 bg-gray-950/80 hover:border-gray-600 transition"
                >
                  <div className="h-40 border-b border-gray-800" style={post.heroStyle} />
                  <div className="p-5">
                    <div className="mb-2 text-xs uppercase tracking-wide text-cyan-300">{post.category}</div>
                    <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-cyan-200 transition">{post.title}</h2>
                    <p className="mt-3 text-sm text-gray-300">{post.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(post.tags || []).map((tag) => (
                        <span key={`${post.slug}_${tag}`} className="text-xs rounded-full border border-gray-700 px-2.5 py-1 text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                      <span>{post.readTime}</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogsPage;

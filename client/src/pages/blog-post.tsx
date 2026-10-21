import { useParams, Link } from "wouter";
import { SiteShell } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { blogPosts } from "@/generated/blog-content";
import NotFound from "@/pages/not-found";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <NotFound />;

  return (
    <SiteShell>
      <Seo title={post.title} description={post.description} />
      <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <div
          className="mb-7 flex items-center gap-2 text-xs text-muted-foreground"
          data-testid="text-blog-post-meta"
        >
          <span>Operations &amp; AI Readiness</span>
          <span aria-hidden="true">&middot;</span>
          <span>{post.date}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{post.readTime}</span>
        </div>
        <h1
          className="mb-7 text-3xl font-semibold tracking-tight text-balance md:text-4xl"
          data-testid="text-blog-post-title"
        >
          {post.title}
        </h1>
        <div
          className="blog-prose"
          data-testid="content-blog-post-body"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <div className="mt-16 border-t border-border/80 pt-8">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            data-testid="link-blog-back"
          >
            &larr; Back to all posts
          </Link>
        </div>
      </article>
    </SiteShell>
  );
}

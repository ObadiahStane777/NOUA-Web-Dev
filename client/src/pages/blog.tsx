import { Link } from "wouter";
import { SiteShell, Section } from "@/components/site-shell";
import { Seo } from "@/components/seo";
import { blogPosts } from "@/generated/blog-content";
import { ArrowRight } from "lucide-react";

export default function Blog() {
  return (
    <SiteShell>
      <Seo
        title="Blog"
        description="Practical operations and AI readiness thinking for founders — demand leaks, capacity constraints, and how to tell which one is costing you money."
      />
      <Section
        title="Operations &amp; AI Readiness"
        titleAs="h1"
        description="Practical thinking on where AI actually fits in a growing business — not tool reviews, operational diagnosis."
        testId="section-blog-index"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-3xl border border-border/80 bg-card/40 p-8 transition-colors hover:border-border hover:bg-card/70"
              data-testid={`card-blog-post-${post.slug}`}
            >
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{post.date}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="text-lg font-semibold tracking-tight" data-testid={`text-blog-title-${post.slug}`}>
                {post.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid={`text-blog-description-${post.slug}`}>
                {post.description}
              </p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-foreground">
                Read <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
}

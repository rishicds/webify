
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { BlogPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

function BlogPostCard({ post }: { post: BlogPost }) {
  const postDate = post.createdAt.toDate();
  const summary = post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          <Link href={`/blog/${post.id}`} className="hover:text-primary transition-colors">{post.title}</Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-2">
            <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={post.authorPhotoURL ?? undefined} />
                    <AvatarFallback>{post.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span>{post.authorName}</span>
            </Link>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-muted-foreground">{postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/blog/${post.id}`}>Read More <ArrowRight className="ml-2 h-4 w-4"/></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const fetchedPosts = await getAllPosts();
      setPosts(fetchedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <>
        <section className="bg-card border-b">
            <div className="container mx-auto py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
                The Konvele Blog
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Insights, stories, and ideas from the Konvele community.
            </p>
            </div>
        </section>

        <div className="container mx-auto py-12">
            {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => <BlogPostCard key={post.id} post={post} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <h2 className="text-2xl font-semibold">No Posts Yet</h2>
                    <p>Be the first to write a blog post!</p>
                </div>
            )}
        </div>
    </>
  );
}

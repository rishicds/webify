
"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPostById } from '@/lib/blog';
import type { BlogPost } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const fetchedPost = await getPostById(params.id);
      if (!fetchedPost) {
        notFound();
      }
      setPost(fetchedPost);
      setLoading(false);
    };
    fetchPost();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!post) {
    return notFound();
  }
  
  const postDate = post.createdAt.toDate();

  return (
    <div className="container mx-auto py-12 max-w-4xl">
        <article className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">{post.title}</h1>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                     <Link href={`/profile/${post.authorId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.authorPhotoURL ?? undefined} />
                            <AvatarFallback>{post.authorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{post.authorName}</span>
                     </Link>
                     <span>&bull;</span>
                     <span>{postDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
            <Separator />
             <div
                className="prose prose-lg dark:prose-invert max-w-none mx-auto"
                dangerouslySetInnerHTML={{ __html: post.content }}
             />
        </article>
    </div>
  );
}

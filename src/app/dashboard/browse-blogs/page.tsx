import React from 'react';
import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';

export default async function BrowseBlogsPage() {
  // Fetch all blogs (assuming getAllPosts returns an array of blog objects)
  const blogs = await getAllPosts();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Blog Posts</h1>
      <div className="grid gap-4">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog: any) => (
            <Link key={blog.id} href={`/blog/${blog.id}`} className="block p-4 border rounded hover:bg-gray-50">
              <h2 className="text-xl font-semibold">{blog.title}</h2>
              <p className="text-gray-600">{blog.summary || blog.description || ''}</p>
              <span className="text-xs text-gray-400">By {blog.authorName || 'Unknown'}</span>
            </Link>
          ))
        ) : (
          <p>No blog posts found.</p>
        )}
      </div>
    </div>
  );
}

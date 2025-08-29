"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter, notFound } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { getPostById, updatePost } from "@/lib/blog"
import type { BlogPost } from "@/lib/types"

const postFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title must be less than 100 characters."),
  content: z.string().min(100, "Content must be at least 100 characters."),
  tags: z.array(z.string()).optional(),
})

export default function EditPostPage({ params }: { params: { id:string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);

  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
  })

  useEffect(() => {
    const fetchPost = async () => {
      const fetchedPost = await getPostById(params.id);
      if (!fetchedPost || fetchedPost.authorId !== user?.uid) {
        notFound();
      }
      setPost(fetchedPost);
      form.reset({
        ...fetchedPost,
        tags: fetchedPost.tags || [],
      });
    };
    if (user?.uid) {
      fetchPost();
    }
  }, [params.id, form, user]);

  const contentValue = form.watch("content");

  async function onSubmit(values: z.infer<typeof postFormSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update a post." });
        return;
    }
    setIsLoading(true);
    try {
        await updatePost(params.id, values);
        toast({ title: "Success", description: "Post updated successfully!" });
        router.push("/dashboard/my-posts");
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error updating post", description: error.message });
        setIsLoading(false);
    }
  }
  
  if (!post) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold font-headline">Edit Post</h1>
                   <p className="text-muted-foreground">
                    Update your article "{post.title}".
                  </p>
                </div>
                 <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Post Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Post Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Your amazing post title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Write your post here. HTML is supported for formatting." {...field} rows={15} />
                              </FormControl>
                              <FormDescription>
                                 You can use basic HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;b&gt;, &lt;ul&gt;, etc. for formatting.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name="tags"
                          render={({ field: { onChange, value } }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Add tags separated by commas..."
                                  onChange={(e) => onChange(e.target.value.split(',').map(s => s.trim()))}
                                  value={value?.join(', ')}
                                />
                              </FormControl>
                              <FormDescription>
                                Enter tags separated by commas.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Live Preview</CardTitle>
                        <CardDescription>This is how your post will look on the site.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div
                            className="prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: contentValue || '<p class="text-muted-foreground">Start typing to see your post preview...</p>' }}
                         />
                    </CardContent>
                </Card>
            </div>
        </form>
      </Form>
  )
}

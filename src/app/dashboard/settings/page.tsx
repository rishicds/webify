
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, X } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { updateUserProfile } from "@/lib/users"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const studentFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be less than 50 characters."),
  collegeName: z.string().optional(),
  stream: z.string().optional(),
  year: z.string().optional(),
  skills: z.array(z.string()).min(1, "Please add at least one skill."),
})

const organizerFormSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be less than 50 characters."),
})

export default function SettingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');

  const isStudent = userData?.role === 'student';
  const formSchema = isStudent ? studentFormSchema : organizerFormSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const skills = form.watch('skills' as any);

  useEffect(() => {
    if (userData) {
      form.reset({
        displayName: userData.displayName ?? '',
        collegeName: userData.collegeName ?? '',
        stream: userData.stream ?? '',
        year: userData.year ?? '',
        skills: userData.skills ?? [],
      });
    }
  }, [userData, form]);

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
        form.setValue('skills' as any, [...skills, currentSkill.trim()]);
        setCurrentSkill('');
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    form.setValue('skills' as any, skills.filter((skill: string) => skill !== skillToRemove));
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
        return;
    }
    setIsLoading(true);
    try {
        await updateUserProfile(user.uid, values);
        toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error updating profile", description: error.message });
    } finally {
        setIsLoading(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!userData) {
      return <div>No user data found.</div>
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-headline">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and profile settings.
          </p>
        </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>This information will be displayed on your public profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {isStudent && (
                        <>
                             <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={userData.email ?? ''} disabled />
                                <FormDescription>Your email address cannot be changed.</FormDescription>
                            </div>
                            <FormField
                                control={form.control}
                                name="collegeName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>College Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. University of Example" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid sm:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="stream"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Stream / Major</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Computer Science" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="year"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Year of Study</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your year" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">1st Year</SelectItem>
                                                    <SelectItem value="2">2nd Year</SelectItem>
                                                    <SelectItem value="3">3rd Year</SelectItem>
                                                    <SelectItem value="4">4th Year</SelectItem>
                                                    <SelectItem value="5">5th Year+</SelectItem>
                                                    <SelectItem value="grad">Graduate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="skills"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skills</FormLabel>
                                        <div className="flex gap-2">
                                            <Input 
                                                placeholder="Enter a skill and click Add"
                                                value={currentSkill}
                                                onChange={(e) => setCurrentSkill(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddSkill();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={handleAddSkill}>
                                                <Plus className="h-4 w-4" /> Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[2rem]">
                                            {field.value?.map(skill => (
                                                <Badge key={skill} variant="secondary" className="flex items-center gap-1 text-base py-1">
                                                    {skill}
                                                    <button onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                                        <X className="h-3 w-3"/>
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
      </Form>
    </div>
  )
}

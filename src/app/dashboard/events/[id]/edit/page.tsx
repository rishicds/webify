"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, PlusCircle, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEventById, updateEvent } from "@/lib/events"
import { useAuth } from "@/components/AuthProvider"
import { useRouter, notFound } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import type { Event } from "@/lib/types"


const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(100, "Title must be less than 100 characters."),
  category: z.enum(['Tech', 'Business', 'Marketing', 'Design', 'Science'], { required_error: "Please select a category." }),
  date: z.date({ required_error: "A date is required." }),
  location: z.string().min(2, "Location is required."),
  tags: z.array(z.string()).optional(),
  description: z.string().min(20, "Description must be at least 20 characters.").max(500, "Description must be less than 500 characters."),
  longDescription: z.string().min(50, "Detailed description must be at least 50 characters."),
  imageUrl: z.string().url("Please enter a valid image URL."),
  schedule: z.array(z.object({
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
    title: z.string().min(3, "Schedule item title is required."),
    speaker: z.string().optional(),
  })).min(1, "Please add at least one schedule item."),
  speakers: z.array(z.object({
    name: z.string().min(2, "Speaker name is required."),
    title: z.string().min(3, "Speaker title is required."),
    avatar: z.string().url("Please enter a valid avatar URL."),
  })).min(1, "Please add at least one speaker."),
})

export default function EditEventPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
  })

  useEffect(() => {
    const fetchEvent = async () => {
      const fetchedEvent = await getEventById(params.id);
      if (!fetchedEvent) {
        notFound();
      }
      setEvent(fetchedEvent);
      form.reset({
        ...fetchedEvent,
        tags: fetchedEvent.tags || [],
        date: (fetchedEvent.date as any).toDate ? (fetchedEvent.date as any).toDate() : new Date(fetchedEvent.date),
      });
    };
    fetchEvent();
  }, [params.id, form]);

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control: form.control,
    name: "schedule",
  });

  const { fields: speakerFields, append: appendSpeaker, remove: removeSpeaker } = useFieldArray({
    control: form.control,
    name: "speakers",
  });


  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to update an event." });
        return;
    }
    setIsLoading(true);
    try {
        await updateEvent(params.id, {
            ...values,
        });
        toast({ title: "Success", description: "Event updated successfully!" });
        router.push("/dashboard/events");
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error updating event", description: error.message });
        setIsLoading(false);
    }
  }
  
  if (!event) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-headline">Edit Event</h1>
          <p className="text-muted-foreground">
            Update the details for "{event.title}".
          </p>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>The core information about your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Annual Tech Summit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Tech">Tech</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Design">Design</SelectItem>
                                        <SelectItem value="Science">Science</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Virtual or City Name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
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
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="A brief summary for the event card." {...field} />
                          </FormControl>
                          <FormDescription>Max 500 characters. This appears on the event listing pages.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="longDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Provide a full description for the event page. You can use HTML for formatting." {...field} rows={8} />
                          </FormControl>
                          <FormDescription>This will be displayed on the main event page.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>Plan the timeline of your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {scheduleFields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end p-4 border rounded-md">
                            <FormField
                                control={form.control}
                                name={`schedule.${index}.time`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time (HH:MM)</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`schedule.${index}.title`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Title</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSchedule(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendSchedule({ time: "", title: "", speaker: "" })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Schedule Item
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Speakers</CardTitle>
                    <CardDescription>Add the speakers for your event.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {speakerFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-md relative">
                            <FormField
                                control={form.control}
                                name={`speakers.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`speakers.${index}.title`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title / Company</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name={`speakers.${index}.avatar`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Avatar URL</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpeaker(index)} className="absolute top-1 right-1">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendSpeaker({ name: "", title: "", avatar: "https://i.pravatar.cc/150" })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Speaker
                    </Button>
                </CardContent>
            </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
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

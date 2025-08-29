
"use client"

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/users';
import type { UserData } from '@/lib/types';
import { Loader2, Mail, GraduationCap, School, Briefcase, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getUserById(params.id);
      if (!fetchedUser) {
        notFound();
      }
      setUser(fetchedUser);
      setLoading(false);
    };
    fetchUser();
  }, [params.id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
    return notFound();
  }

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }

  const isStudent = user.role === 'student';

  return (
    <div className="container mx-auto py-12 max-w-4xl">
        <Card>
            <CardHeader className="flex flex-col items-center text-center space-y-4 pb-8 bg-muted/30">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                    <AvatarFallback className="text-4xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold font-headline">{user.displayName}</h1>
                    <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
                        <Mail className="h-4 w-4" /> {user.email}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                {isStudent ? (
                    <>
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Education</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <p><strong className="font-medium text-muted-foreground block">College:</strong> {user.collegeName || 'Not specified'}</p>
                                <p><strong className="font-medium text-muted-foreground block">Stream:</strong> {user.stream || 'Not specified'}</p>
                                <p><strong className="font-medium text-muted-foreground block">Year:</strong> {user.year || 'Not specified'}</p>
                            </div>
                        </div>

                         <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {user.skills && user.skills.length > 0 ? (
                                    user.skills.map(skill => (
                                        <Badge key={skill} variant="secondary" className="text-base py-1 px-3">{skill}</Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No skills listed yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Role</h2>
                         <p className="text-lg">{user.role === 'admin' ? 'Administrator' : 'Event Organizer'}</p>
                    </div>
                )}
                 <div className="text-center pt-4">
                    <Button>Connect with {user.displayName?.split(' ')[0]}</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

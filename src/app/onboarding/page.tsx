"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Loader2, Plus, X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


type OnboardingStep = 'role' | 'details' | 'skills';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<OnboardingStep>('role');
  
  // Student Details State
  const [stream, setStream] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [year, setYear] = useState('');

  // Skills State
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
      router.push('/login');
      return null;
  }

  const handleRoleSelection = async (role: UserRole) => {
    if (!user) return;

    if (role === 'student') {
        setStep('details');
    } else {
        setIsSubmitting(true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, { role });
            router.push('/dashboard');
        } catch (error) {
            console.error("Error updating role: ", error);
            setIsSubmitting(false);
        }
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (stream && collegeName && year) {
          setStep('skills');
      }
  }
  
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
        setSkills([...skills, currentSkill.trim()]);
        setCurrentSkill('');
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  }

  const handleSkillsSubmit = async () => {
      if (!user || skills.length < 3) return;
      setIsSubmitting(true);
      try {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, { 
              role: 'student', 
              skills: skills,
              stream,
              collegeName,
              year
          });
          router.push('/');
      } catch (error) {
          console.error("Error updating role and skills: ", error);
      } finally {
          setIsSubmitting(false);
      }
  }


  const renderRoleSelection = () => (
     <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to Konvele!</CardTitle>
          <CardDescription>
            To get started, please tell us who you are.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={() => handleRoleSelection('organiser')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-8 border-2 border-transparent rounded-lg bg-card hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <Briefcase className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-semibold text-lg">I'm an Organiser</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Create and manage events.
            </p>
          </button>
          <button
            onClick={() => handleRoleSelection('student')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center p-8 border-2 border-transparent rounded-lg bg-card hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <GraduationCap className="h-12 w-12 mb-4 text-primary" />
            <h3 className="font-semibold text-lg">I'm a Student</h3>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Discover events and connect.
            </p>
          </button>
        </CardContent>
        {isSubmitting && (
            <CardFooter className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardFooter>
        )}
      </Card>
  )

  const renderDetailsSelection = () => (
      <Card className="w-full max-w-lg">
        <form onSubmit={handleDetailsSubmit}>
            <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Tell us about yourself</CardTitle>
            <CardDescription>
                This information will help us connect you with peers.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input id="collegeName" placeholder="e.g., University of Example" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stream">Stream / Major</Label>
                    <Input id="stream" placeholder="e.g., Computer Science" value={stream} onChange={(e) => setStream(e.target.value)} required />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="year">Year of Study</Label>
                      <Select value={year} onValueChange={setYear} required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                            <SelectItem value="5">5th Year+</SelectItem>
                            <SelectItem value="grad">Graduate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button type="button" variant="outline" onClick={() => setStep('role')}>Back</Button>
                <Button type="submit">Next</Button>
            </CardFooter>
        </form>
      </Card>
  )

  const renderSkillsSelection = () => (
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">What are your skills?</CardTitle>
          <CardDescription>
            Add at least 3 skills to help others connect with you. e.g., React, UI/UX Design, Public Speaking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
                <Input 
                    placeholder="Enter a skill"
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
            <div className="flex flex-wrap gap-2 min-h-[4rem]">
                {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1 text-base py-1">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                            <X className="h-3 w-3"/>
                        </button>
                    </Badge>
                ))}
            </div>
             {skills.length < 3 && <p className="text-sm text-destructive text-center">Please add at least {3-skills.length} more skill(s).</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep('details')}>Back</Button>
            <Button onClick={handleSkillsSubmit} disabled={isSubmitting || skills.length < 3}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Finish Onboarding
            </Button>
        </CardFooter>
      </Card>
  )

  const renderCurrentStep = () => {
      switch (step) {
          case 'role':
              return renderRoleSelection();
          case 'details':
              return renderDetailsSelection();
          case 'skills':
              return renderSkillsSelection();
          default:
              return renderRoleSelection();
      }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)]">
      {renderCurrentStep()}
    </div>
  );
}

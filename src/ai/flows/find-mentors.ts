'use server';
/**
 * @fileOverview An AI flow to find suitable mentors for a user based on a desired skill.
 *
 * - findMentors - A function that returns a list of matched mentors.
 * - FindMentorsInput - The input type for the findMentors function.
 * - FindMentorsOutput - The return type for the findMentors function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAllUsers } from '@/lib/users';
import type { MatchedMentor, UserData } from '@/lib/types';

export const FindMentorsInputSchema = z.object({
  userId: z.string().describe('The ID of the user searching for a mentor.'),
  skillToLearn: z.string().describe('The skill or topic the user wants to learn.'),
});
export type FindMentorsInput = z.infer<typeof FindMentorsInputSchema>;

export const FindMentorsOutputSchema = z.object({
  matches: z.array(z.object({
    uid: z.string().describe("The user ID of the matched mentor."),
    reason: z.string().describe("A short, personalized reason why this person is a good match."),
  })).describe('A list of up to 5 potential mentors.'),
});
export type FindMentorsOutput = z.infer<typeof FindMentorsOutputSchema>;


const findMentorsFlow = ai.defineFlow(
  {
    name: 'findMentorsFlow',
    inputSchema: FindMentorsInputSchema,
    outputSchema: FindMentorsOutputSchema,
  },
  async ({ userId, skillToLearn }) => {
    
    // Get all students, excluding the user making the request
    const allStudents = (await getAllUsers('student')).filter(u => u.uid !== userId);

    if (allStudents.length === 0) {
      return { matches: [] };
    }

    const prompt = ai.definePrompt({
        name: 'findMentorsPrompt',
        input: {schema: z.object({
            skillToLearn: z.string(),
            potentialMentors: z.any(),
        })},
        output: {schema: FindMentorsOutputSchema},
        prompt: `You are an AI-powered matchmaker for a student community platform called Konvele. Your goal is to connect students who want to learn with those who have the right skills to teach them.

A user wants to learn the following skill: "{{skillToLearn}}".

Analyze the list of potential mentors below. Identify the top 5 students who would be the best fit to mentor this user. Your decision should be based on the relevance of the skills listed in their profiles.

For each match, provide a short, personalized reason (1-2 sentences) explaining *why* they are a good match. For example, you could mention specific, relevant skills they possess.

List of Potential Mentors:
{{{json potentialMentors}}}

Provide your top 5 recommendations in the specified JSON format.`,
    });

    // Prepare a simplified list of potential mentors for the AI prompt
    const potentialMentors = allStudents.map(student => ({
        uid: student.uid,
        displayName: student.displayName,
        skills: student.skills || [],
    }));


    const {output} = await prompt({
        skillToLearn,
        potentialMentors,
    });
    
    return output!;
  }
);


export async function findMentors(input: FindMentorsInput): Promise<MatchedMentor[]> {
  const result = await findMentorsFlow(input);
  
  if (!result || !result.matches) {
    return [];
  }

  // Hydrate the mentor data with full user details for the UI
  const allUsers = await getAllUsers('student');
  const userMap = new Map(allUsers.map(u => [u.uid, u]));
  
  const matchedMentors: MatchedMentor[] = result.matches.map(match => {
      const mentorData = userMap.get(match.uid);
      if (!mentorData) return null;
      
      return {
          uid: mentorData.uid,
          displayName: mentorData.displayName,
          email: mentorData.email,
          photoURL: mentorData.photoURL,
          skills: mentorData.skills,
          reason: match.reason,
      };
  }).filter((m): m is MatchedMentor => m !== null);
  
  return matchedMentors;
}

import type { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'organiser' | 'student';

export type UserData = {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    role: UserRole | null;
    skills?: string[];
    stream?: string;
    collegeName?: string;
    year?: string;
}

export type MatchedMentor = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
    skills?: string[];
    reason: string;
}

export type Speaker = {
  name: string;
  title: string;
  avatar: string;
};

export type ScheduleItem = {
  time: string;
  title: string;
  speaker?: string;
};

export type Event = {
  id: string;
  title: string;
  category: 'Tech' | 'Business' | 'Marketing' | 'Design' | 'Science';
  date: any; // Allow both Date and Timestamp
  location: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  speakers: Speaker[];
  schedule: ScheduleItem[];
  organizerId: string;
  tags?: string[];
};

export type RecommendedEvent = Event & {
    reason: string;
}

export type Registration = {
    id: string;
    eventId: string;
    userId: string;
    userName: string;
    userEmail: string;
    registrationDate: Timestamp;
    checkedIn: boolean;
    checkInDate?: Timestamp;
}

export type ChatMessage = {
  id: string;
  eventId: string;
  userId: string;
  userName:string;
  userPhotoURL: string | null;
  text: string;
  timestamp: Timestamp;
};

export type Question = {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userPhotoURL: string | null;
  text: string;
  upvotes: number;
  upvotedBy: string[];
  isAnswered: boolean;
  timestamp: Timestamp;
};

export type PollOption = {
    id: string;
    text: string;
}

export type Poll = {
    id: string;
    eventId: string;
    question: string;
    options: PollOption[];
    timestamp: Timestamp;
}

export type Vote = {
    id: string;
    pollId: string;
    optionId: string;
    userId: string;
    eventId: string;
}

export type LeaderboardEntry = {
    id: string;
    userId: string;
    userName: string;
    userPhotoURL: string | null;
    score: number;
}

export type BlogPost = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorPhotoURL: string | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    tags?: string[];
}

export type Conversation = {
    id: string;
    participantIds: string[];
    participants: { [key: string]: Pick<UserData, 'displayName' | 'photoURL'> };
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    lastMessageSenderId: string;
}

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    timestamp: Timestamp;
}
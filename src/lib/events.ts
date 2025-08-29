
"use client";

import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, writeBatch } from "firebase/firestore";
import type { Event, Registration, UserData } from "./types";
import { sendRegistrationConfirmation } from "./email";
import { getQuestions } from "./engagement";

const eventsCollection = collection(db, "events");
const registrationsCollection = collection(db, "registrations");
const usersCollection = collection(db, "users");
const chatMessagesCollection = collection(db, "chatMessages");
const questionsCollection = collection(db, "questions");
const votesCollection = collection(db, "votes");


function eventFromDoc(doc: any): Event {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        date: data.date, // Keep as Timestamp or Date
    } as Event;
}

export async function createEvent(eventData: Omit<Event, 'id' | 'date'> & { date: Date }): Promise<string> {
    const docRef = await addDoc(eventsCollection, {
        ...eventData,
        date: Timestamp.fromDate(eventData.date)
    });
    return docRef.id;
}

export async function getAllEvents(): Promise<Event[]> {
    const querySnapshot = await getDocs(query(eventsCollection));
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Event;
    });
}


export async function getEventById(id: string): Promise<Event | null> {
    const docRef = doc(db, "events", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date, // Keep as Timestamp for server-side, convert on client
        } as Event;
    } else {
        return null;
    }
}

export async function getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    const q = query(eventsCollection, where("organizerId", "==", organizerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Event;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function updateEvent(id: string, eventData: Partial<Omit<Event, 'id' | 'date'>> & { date?: Date }): Promise<void> {
    const docRef = doc(db, "events", id);
    const dataToUpdate: { [key: string]: any } = { ...eventData };
    if (eventData.date && eventData.date instanceof Date) {
        dataToUpdate.date = Timestamp.fromDate(eventData.date);
    }
    await updateDoc(docRef, dataToUpdate);
}

export async function deleteEvent(id: string): Promise<void> {
    const batch = writeBatch(db);

    // Delete the event
    const eventDocRef = doc(db, "events", id);
    batch.delete(eventDocRef);

    // Delete associated registrations
    const registrationsQuery = query(registrationsCollection, where("eventId", "==", id));
    const registrationsSnapshot = await getDocs(registrationsQuery);
    registrationsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
}


// --- Registration Functions ---

export async function registerForEvent(eventId: string, eventTitle: string, user: UserData): Promise<Registration> {
    // Check if already registered
    const q = query(registrationsCollection, where("eventId", "==", eventId), where("userId", "==", user.uid));
    const existingRegistration = await getDocs(q);
    if (!existingRegistration.empty) {
        return { id: existingRegistration.docs[0].id, ...existingRegistration.docs[0].data()} as Registration
    }
    
    const registrationData = {
        eventId,
        userId: user.uid,
        userName: user.displayName || 'Unnamed User',
        userEmail: user.email || '',
        registrationDate: Timestamp.now(),
        checkedIn: false,
    }
    const docRef = await addDoc(registrationsCollection, registrationData);
    const registration = { id: docRef.id, ...registrationData } as Registration;

    // Send confirmation email (placeholder)
    await sendRegistrationConfirmation(registration, eventTitle);

    return registration;
}

export async function getRegistrationById(id: string): Promise<Registration | null> {
    const docRef = doc(db, "registrations", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Registration;
    } else {
        return null;
    }
}

export async function checkInUser(registrationId: string): Promise<void> {
    const docRef = doc(db, "registrations", registrationId);
    await updateDoc(docRef, { checkedIn: true, checkInDate: Timestamp.now() });
}

export async function getEventAttendees(eventId: string): Promise<Registration[]> {
    const q = query(registrationsCollection, where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Registration));
}

export async function getRegisteredEventsForUser(userId: string): Promise<Event[]> {
    const registrationsQuery = query(registrationsCollection, where("userId", "==", userId));
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    const eventIds = registrationsSnapshot.docs.map(doc => doc.data().eventId);

    if (eventIds.length === 0) {
        return [];
    }

    const eventsQuery = query(eventsCollection, where("__name__", "in", eventIds));
    const eventsSnapshot = await getDocs(eventsQuery);

    return eventsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
        } as Event;
    });
}

// --- Analytics Functions ---

export async function getOrganizerAnalytics(organizerId: string, eventId?: string) {
    const isForAllEvents = !eventId;
    
    const eventsQuery = isForAllEvents
        ? query(eventsCollection, where("organizerId", "==", organizerId))
        : query(eventsCollection, where("__name__", "==", eventId));

    const organizerEventsSnapshot = await getDocs(eventsQuery);
    const organizerEvents = organizerEventsSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Event));
    const eventIds = organizerEvents.map(e => e.id);

    if (eventIds.length === 0) {
        return {
            totalEvents: 0,
            totalRegistrations: 0,
            activeEventsCount: 0,
            registrationsByMonth: [],
            checkInRate: 0,
            totalEngagement: 0,
            topEvents: [],
        };
    }

    // Get all registrations for the relevant events
    const registrationsQuery = query(registrationsCollection, where("eventId", "in", eventIds));
    const registrationsSnapshot = await getDocs(registrationsQuery);
    const allRegistrations = registrationsSnapshot.docs.map(doc => doc.data() as Registration);
    const totalRegistrations = allRegistrations.length;

    // --- CARD METRICS ---
    const totalEvents = isForAllEvents ? organizerEvents.length : 1;
    
    const now = new Date();
    const activeEventsCount = organizerEvents.filter(event => (event.date as any).toDate() >= now).length;
    
    const checkedInCount = allRegistrations.filter(r => r.checkedIn).length;
    const checkInRate = totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0;
    
    // --- ENGAGEMENT METRICS ---
    const chatMessagesQuery = query(chatMessagesCollection, where("eventId", "in", eventIds));
    const questionsQuery = query(questionsCollection, where("eventId", "in", eventIds));
    const votesQuery = query(votesCollection, where("eventId", "in", eventIds));

    const [chatSnapshot, questionsSnapshot, votesSnapshot] = await Promise.all([
        getDocs(chatMessagesQuery),
        getDocs(questionsQuery),
        getDocs(votesQuery)
    ]);
    
    const totalEngagement = chatSnapshot.size + questionsSnapshot.size + votesSnapshot.size;

    // --- CHART DATA (Registrations over time) ---
    let registrationsByMonth;
    if (isForAllEvents) {
        const monthlyCounts = Array(12).fill(0);
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        allRegistrations.forEach(reg => {
            const regDate = reg.registrationDate.toDate();
            if (regDate.getFullYear() === now.getFullYear()) {
                const month = regDate.getMonth();
                monthlyCounts[month]++;
            }
        });
        registrationsByMonth = monthNames.map((month, index) => ({
            month,
            registrations: monthlyCounts[index]
        }));
    } else {
        // For single event, show daily registrations
        const dailyCounts: { [key: string]: number } = {};
        allRegistrations.forEach(reg => {
            const day = reg.registrationDate.toDate().toISOString().split('T')[0]; // YYYY-MM-DD
            dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });
        registrationsByMonth = Object.entries(dailyCounts)
            .sort(([dayA], [dayB]) => new Date(dayA).getTime() - new Date(dayB).getTime())
            .map(([day, count]) => ({ month: new Date(day).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), registrations: count }));
    }


    // --- TOP EVENTS ---
    let topEvents = [];
    if (isForAllEvents) {
        const allOrganizerEvents = await getEventsByOrganizer(organizerId); // Re-fetch to get all events for ranking
        const eventRegistrationCounts: {[key: string]: number} = {};
         const allOrganizerEventIds = allOrganizerEvents.map(e => e.id);
        const allOrganizerRegistrationsQuery = query(registrationsCollection, where("eventId", "in", allOrganizerEventIds));
        const allOrganizerRegistrationsSnapshot = await getDocs(allOrganizerRegistrationsQuery);
        
        allOrganizerRegistrationsSnapshot.docs.forEach(doc => {
            const reg = doc.data();
            eventRegistrationCounts[reg.eventId] = (eventRegistrationCounts[reg.eventId] || 0) + 1;
        });

        topEvents = allOrganizerEvents
            .map(event => ({
                id: event.id,
                title: event.title,
                registrations: eventRegistrationCounts[event.id] || 0,
            }))
            .sort((a, b) => b.registrations - a.registrations)
            .slice(0, 5);
    } else {
        topEvents = [{
            id: eventId,
            title: organizerEvents[0].title,
            registrations: totalRegistrations,
        }];
    }
        

    return {
        totalEvents,
        totalRegistrations,
        activeEventsCount,
        registrationsByMonth,
        checkInRate,
        totalEngagement,
        topEvents,
    };
}

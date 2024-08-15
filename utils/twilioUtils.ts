import { supabase } from '@/utils/supabaseClient'; // Import the supabase instance

export async function getTwilioMessages(pageSize = 30, pageToken = null) {
    try {
        const url = new URL(`localhost:3000/api/get-sms-logs`);
        url.searchParams.append('pageSize', pageSize.toString());
        if (pageToken) {
            url.searchParams.append('pageToken', pageToken);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error('Failed to fetch SMS data');
        }

        const data = await response.json();
        // Ensure data.messages is an array
        if (!Array.isArray(data.messages)) {
            console.error('Expected data.messages to be an array but got:', data.messages);
            return {
                messages: [],
                nextPageToken: data.nextPageToken,
                totalCount: data.totalCount,
            };
        }

        return {
            messages: data.messages,
            nextPageToken: data.nextPageToken,
            totalCount: data.totalCount,
        };
    } catch (error) {
        console.error('Error fetching Twilio messages:', error);
        throw error;
    }
}


export async function matchContacts(messages: any[]) {
    // Ensure messages is an array
    if (!Array.isArray(messages)) {
        console.error('Expected messages to be an array but got:', messages);
        return [];
    }

    const matchedMessages = await Promise.all(
        messages.map(async (message) => {
            const phoneNumber = message.from;
            const contact = await getContactByPhoneNumber(phoneNumber);
            return {
                ...message,
                contactName: contact ? contact.name : phoneNumber,
                avatar: contact ? contact.avatar : "", // Use a default avatar if needed
            };
        })
    );

    return matchedMessages;
}


export async function getContactByPhoneNumber(phoneNumber: string) {
    try {
        const { data, error } = await supabase
            .from("contacts")
            .select("*")
            .eq("phone", phoneNumber)
            .maybeSingle();

        if (error) {
            console.error("Error fetching contact:", error.message);
            return null;
        }

        if (!data) {
            console.warn(`No contact found for phone number: ${phoneNumber}`);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Unexpected error fetching contact:", err);
        return null;
    }
}

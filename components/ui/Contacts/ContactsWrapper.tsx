// components/ui/Contacts/ContactsWrapper.tsx

'use client'; // Mark this as a Client Component

import React from 'react';
import Contacts from './Contacts'; // Adjust the import path as necessary
import { supabase } from '@/utils/supabaseClient'; // Ensure correct path
import { toast } from 'react-toastify'; // For user notifications

interface ContactsWrapperProps {
    userId: string;
    AllApiKeys: { // Define the structure of AllApiKeys

        apiKey: string;

        twilioSid: string;

        twilioAuthToken: string;

        vapiKey: string;

    };
}

const ContactsWrapper: React.FC<ContactsWrapperProps> = ({ userId, AllApiKeys }) => {

    const handleAddToList = async (contactIds: string[], listId: string) => {
        try {
            // Perform the Supabase insert operation
            const { data, error } = await supabase
                .from('contact_lists') // Ensure this join table exists in Supabase
                .insert(
                    contactIds.map(contactId => ({
                        contact_id: contactId,
                        list_id: listId,                    }))
                );

            if (error) {
                throw error;
            }

            // Optionally, provide feedback to the user
            console.log('Contacts successfully added to the list:', data);
            toast.success('Contacts successfully added to the list!');
        } catch (error: any) {
            console.error('Error adding contacts to the list:', error);
            toast.error(error.message || 'Failed to add contacts to the list.');
        }
    };

    return (
        <Contacts 
            userId={userId} 
            AllApiKeys = {AllApiKeys}
            onAddToList={handleAddToList} // Pass the handler as a prop
        />
    );
};

export default ContactsWrapper;

// pages/contacts.js


"use client"; // This marks the component as a Client Component

import React from 'react';
import Contacts from '@/components/ui/Contacts/Contacts';
import ProtectedPage from '@/components/ProtectedPage';

function ContactsPage() {
  return <Contacts />;
}

export default ProtectedPage(ContactsPage);

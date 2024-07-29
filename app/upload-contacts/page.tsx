import { UserProvider } from '@/context/UserContext';
import UploadContacts from 'components/ui/UploadContacts/UploadContacts';
import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

const UploadContactsPage = async () => {
  const supabase = createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }

  return (
    <UserProvider>
      <UploadContacts />
    </UserProvider>
  );
};

export default UploadContactsPage;

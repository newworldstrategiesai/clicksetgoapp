import { UserProvider } from '@/context/UserContext';
import UploadContacts from 'components/ui/UploadContacts/UploadContacts';
import { createClient } from '@/app/server.server';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';

const UploadContactsPage = async () => {
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    return redirect('/signin');
  }else{
    console.log(user)
  }

  return (
    <UserProvider>
      <UploadContacts user={user} />
    </UserProvider>
  );
};

export default UploadContactsPage;

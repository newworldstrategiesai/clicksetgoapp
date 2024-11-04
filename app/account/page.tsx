// import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
// import EmailForm from '@/components/ui/AccountForms/EmailForm';
// import NameForm from '@/components/ui/AccountForms/NameForm';
// import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
// import { redirect } from 'next/navigation';
// import { createClient } from '@/app/server.server';
// import {
//   getUserDetails,
//   getSubscription,
//   getUser,
//   getApiKeys,  // Import the function to fetch API keys
// } from '@/utils/supabase/queries';
// import { useCountry } from '@/context/CountryContext';
// import AccountContent from '@/components/AccountContent';

// export default async function Account() {
//   const { defaultCountry, setDefaultCountry } = useCountry();

//   // Country code mapping
//   const countryCodes: Record<string, string> = {
//     US: "+1",
//     IN: "+91",
//     FR: "+33",
//     UK: "+44",
//     DE: "+49",
//     ES: "+34",
//     IT: "+39",
//     // Add additional countries here as needed
//   };
//   try {
//     const supabase = createClient();
//     const user = await getUser(supabase);

//     if (!user) {
//       return redirect('/signin');
//     }

//     // Fetch user details, subscription, and API keys after confirming the user is logged in
//     const [userDetails, subscription, apiKeys] = await Promise.all([
//       getUserDetails(supabase),
//       getSubscription(supabase),
//       getApiKeys(supabase, user.id) // Fetch API keys
//     ]);

//     const handleAccountCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
//       try {
//         const selectedCountry = event.target.value;
//         const countryCode = countryCodes[selectedCountry];
//         setDefaultCountry({ name: selectedCountry, code: countryCode });
    
//         // Store in Supabase
//         await supabase
//         // const { error } = await supabase
//           .from("user_country_settings")
//           .update({ default_country_name: selectedCountry, default_country_code: countryCode })
//           .eq("user_id", user.id);
//       } catch (error) {
//         console.error("Error updating country in Supabase:", error.message);
//         // console.error("Error updating country in Supabase:", {error:string}.message);
//         // Display an error message to the user
//         window.alert("Error updating country. Please try again.");
//       } 
//     };

//     return (
//       <section className="mb-32 bg-black">
//         <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8 mt-16 md:mt-8">
//           <div className="sm:align-center sm:flex sm:flex-col">
//             <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
//               Account
//             </h1>
//             <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
//               We partnered with Stripe for a simplified billing.
//             </p>
//           </div>
//         </div>
//         <div className="p-4">
//         <select value={defaultCountry.name} onChange={handleAccountCountryChange}>
//             <option value="US">United States</option>
//             <option value="IN">India</option>
//             <option value="FR">France</option>
//             <option value="UK">United Kingdom</option>
//             <option value="DE">Germany</option>
//             <option value="ES">Spain</option>
//             <option value="IT">Italy</option>
//             {/* Add more options here */}
//           </select>
//           {/* <CustomerPortalForm subscription={subscription} />
//           <NameForm userName={userDetails?.full_name ?? ''} userId={user.id} />
//           <EmailForm userEmail={user.email} />
//           <ApiKeysForm userId={user.id} apiKeys={apiKeys} /> // Pass API keys to the form */}
//           <AccountContent
//             user={user}
//             userDetails={userDetails}
//             subscription={subscription}
//             apiKeys={apiKeys}
//           />
//         </div>
//       </section>
//     );
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     return redirect('/signin');
//   }
// }
// page.tsx

import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';
import ApiKeysForm from '@/components/ui/AccountForms/ApiKeysForm';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/server.server';
import {
  getUserDetails,
  getSubscription,
  getUser,
  getApiKeys,
} from '@/utils/supabase/queries';
import AccountContent from '@/components/AccountContent';

export default async function Account() {
  try {
    const supabase = createClient();
    const user = await getUser(supabase);

    if (!user) {
      return redirect('/signin');
    }

    // Fetch user details, subscription, and API keys
    const [userDetails, subscription, apiKeys] = await Promise.all([
      getUserDetails(supabase),
      getSubscription(supabase),
      getApiKeys(supabase, user.id),
    ]);

    return (
      <section className="mb-32 bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8 mt-16 md:mt-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Account
            </h1>
            <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
              We partnered with Stripe for a simplified billing.
            </p>
          </div>
        </div>
        <div className="p-4">
          <AccountContent
            user={user}
            userDetails={userDetails}
            subscription={subscription}
            apiKeys={apiKeys}
          />
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error fetching user data:', error);
    return redirect('/signin');
  }
}
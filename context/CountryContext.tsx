// context/CountryContext.tsx
"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient"; // Import your Supabase client here
import { getUser } from "@/utils/supabase/queries";

type Country = {
  name: string;
  code: string;
};

type CountryContextType = {
  defaultCountry: Country;
  setDefaultCountry: (country: Country) => void;
  campaignCountry: Country | null;
  setCampaignCountry: (country: Country | null) => void;
  updateCountryStatus: (status: string) => void;
};

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({ children }: { children: ReactNode }) => {
  "use client"
  const [defaultCountry, setDefaultCountry] = useState<Country>({name: "", code: ""});
  const [campaignCountry, setCampaignCountry] = useState<Country | null>(null);

  useEffect(() => {
    const fetchCountrySettings = async () => {
      try {
        const user = await getUser(supabase);
        
        if (user) {
          const { data, error } = await supabase
            .from("user_country_settings")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching country settings:", error.message);
            return;
          }

          if (data) {
            setDefaultCountry({
              name: data.default_country_name,
              code: data.default_country_code
            });

            if (data.campaign_country_name && data.campaign_country_code) {
              setCampaignCountry({
                name: data.campaign_country_name,
                code: data.campaign_country_code
              });
            }
          }
        }
      } catch (error) {
        console.error("Error in fetchCountrySettings:", error);
      }
    };

    fetchCountrySettings();
  }, []);

  const updateCountryStatus = async (status: string) => {
    const user = await getUser(supabase);

    if (user) {
      const { error } = await supabase
        .from("user_country_settings")
        .update({ status })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating country status:", error.message);
      }
    }
  };

  return (
    <CountryContext.Provider
      value={{ defaultCountry, setDefaultCountry, campaignCountry, setCampaignCountry, updateCountryStatus }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};

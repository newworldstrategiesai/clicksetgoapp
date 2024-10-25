import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';
import { Database } from '@/types_db';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const cookieStore = req.cookies; // Access cookies from the request

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore[name] || null;
                },
                set(name: string, value: string, options: CookieOptions) {
                    res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly`);
                },
                remove(name: string, options: CookieOptions) {
                    res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0`);
                }
            }
        }
    );

    // Use your supabase client here...

    res.status(200).json({ message: "Success" });
};

export default handler;

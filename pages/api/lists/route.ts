import { NextResponse } from 'next/server';
import { supabase } from 'utils/supabaseClient'; // Adjust the path if necessary

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: lists, error } = await supabase
      .from('lists')
      .select('id, name')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching lists:', error);
      return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
    }

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

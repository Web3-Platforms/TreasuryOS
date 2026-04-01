'use server';

import { supabase } from '@/lib/supabase';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const organization = formData.get('organization') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !organization || !message) {
    return { error: 'All fields are required.' };
  }

  try {
    const { error } = await supabase
      .from('lead_contacts')
      .insert([
        { 
          full_name: name, 
          email: email, 
          organization: organization, 
          message: message,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Supabase Error:', error);
      return { error: 'Failed to submit the form. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Submission Error:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

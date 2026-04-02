'use server';

import { supabase } from '../../lib/supabase';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name')?.toString().trim() ?? '';
  const email = formData.get('email')?.toString().trim() ?? '';
  const organization = formData.get('organization')?.toString().trim() ?? '';
  const message = formData.get('message')?.toString().trim() ?? '';

  if (!name || !email || !organization || !message) {
    return { error: 'All fields are required.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid work email address.' };
  }

  try {
    const { error } = await supabase.from('lead_contacts').insert([
      {
        full_name: name,
        email,
        organization,
        message,
        created_at: new Date().toISOString(),
      },
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

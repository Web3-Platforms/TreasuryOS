'use server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? 'https://api.treasuryos.aicustombot.net';

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
    const res = await fetch(`${API_GATEWAY_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, organization, message }),
    });

    const data = (await res.json()) as { success?: boolean; error?: string };

    if (!res.ok || data.error) {
      console.error('Lead submission error:', data);
      return { error: data.error ?? 'Failed to submit. Please try again.' };
    }

    return { success: true };
  } catch (err) {
    console.error('Submission Error:', err);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}


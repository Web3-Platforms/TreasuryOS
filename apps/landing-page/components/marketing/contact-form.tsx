'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';

import { submitContactForm } from '@/app/actions/contact';

type ContactFormProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
};

export function ContactForm({
  title = 'Start the conversation',
  description = 'Tell us how your team operates today, what controls matter most, and where you want TreasuryOS to help first.',
  buttonLabel = 'Request a working session',
}: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = await submitContactForm(formData);

    if (result.error) {
      setStatus('error');
      setErrorMessage(result.error);
      return;
    }

    form.reset();
    setStatus('success');
  };

  return (
    <div className="surface-panel p-6 sm:p-8">
      <div className="max-w-xl">
        <span className="eyebrow">Engage TreasuryOS</span>
        <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
        <p className="mt-4 text-base leading-8 text-muted-foreground sm:text-lg">{description}</p>
      </div>

      <div className="mt-8">
        {status === 'success' ? (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-emerald-100">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Request received</h3>
                <p className="mt-2 max-w-lg text-sm leading-7 text-emerald-100/90">
                  We captured your details. Expect a follow-up from the TreasuryOS team to shape the right workshop or product walkthrough.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="mt-4 text-sm font-medium text-emerald-50 underline underline-offset-4"
                >
                  Send another request
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            {status === 'error' ? (
              <div className="sm:col-span-2 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
                  <p>{errorMessage}</p>
                </div>
              </div>
            ) : null}

            <label className="space-y-3">
              <span className="label-text">Full name</span>
              <input name="name" type="text" required className="input-shell" placeholder="Ada Lovelace" />
            </label>
            <label className="space-y-3">
              <span className="label-text">Work email</span>
              <input name="email" type="email" required className="input-shell" placeholder="ada@institution.com" />
            </label>
            <label className="space-y-3 sm:col-span-2">
              <span className="label-text">Organization</span>
              <input name="organization" type="text" required className="input-shell" placeholder="Institution or operating team" />
            </label>
            <label className="space-y-3 sm:col-span-2">
              <span className="label-text">What are you solving?</span>
              <textarea
                name="message"
                required
                rows={5}
                className="input-shell min-h-[170px] resize-y"
                placeholder="Tell us about the workflow, approval model, reporting pain, or rollout decision you want help with."
              />
            </label>
            <button type="submit" disabled={status === 'submitting'} className="button-primary sm:col-span-2 justify-center">
              {status === 'submitting' ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Sending request
                </>
              ) : (
                buttonLabel
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

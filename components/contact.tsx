"use client";

import * as React from "react";
import { Mail, MapPin, Phone, ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CONTACT_DETAILS = [
  { icon: Mail, label: "Email", value: "hello@clozy.com" },
  { icon: Phone, label: "Phone", value: "+880 1234 567890" },
  { icon: MapPin, label: "Office", value: "Dhaka, Bangladesh" },
] as const;

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(form: FormState) {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!form.message.trim()) errors.message = "Message can't be empty.";
  return errors;
}

export function ContactSection() {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    // No contact-message API yet — simulate sending.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setForm(INITIAL_FORM);
    }, 600);
  }

  return (
    <section className="w-full bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Contact Us
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            We'd love to hear from you
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Whether you have a question about an order, our products, or
            simply want to say hello, our team is always ready to help.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl border border-border">
          <div className="grid lg:grid-cols-[340px_1fr]">
            {/* Left side */}
            <div className="bg-foreground p-8 text-background sm:p-10">
              <h2 className="text-xl font-semibold">
                Let's start a conversation
              </h2>
              <p className="mt-3 text-sm text-background/70">
                Reach us anytime through the details below or send a message
                using the form.
              </p>

              <div className="mt-10 space-y-6">
                {CONTACT_DETAILS.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/10">
                      <detail.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-background/60">
                        {detail.label}
                      </p>
                      <p className="text-sm font-medium">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="bg-background p-6 sm:p-10">
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Message sent
                  </h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Thanks for reaching out — we'll get back to you within
                    1–2 business days.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setSent(false)}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) => updateField("subject", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      placeholder="Write your message..."
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && (
                      <p className="text-xs text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={submitting}
                  >
                    {submitting ? "Sending…" : "Send Message"}
                    {!submitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;

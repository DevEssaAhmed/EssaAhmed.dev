import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email is too long"),
  purpose: z.string().min(1, "Please select a purpose"),
  other_purpose: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(4000, "Message is too long"),
  honeypot: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const purposeOptions = [
  { value: "Industrial Engineering & Quality Analytics", label: "Industrial Engineering & Quality Analytics" },
  { value: "Operations & Supply Chain Analytics", label: "Operations & Supply Chain Analytics" },
  { value: "Power BI & Dashboard Solutions", label: "Power BI & Dashboard Solutions" },
  { value: "Automation & Python Scripting", label: "Automation & Python Scripting" },
  { value: "Full-time / Career Opportunity", label: "Full-time / Career Opportunity" },
  { value: "collaboration", label: "Collaboration" },
  { value: "other", label: "Other" },
];

const fieldClass =
  "bg-surface-container border-border text-foreground placeholder:text-ink-muted text-sm rounded-lg px-4 py-3 h-auto focus-visible:outline-none focus-visible:ring-0 focus-visible:border-champagne/60 transition-colors";
const labelClass = "font-mono text-[11px] uppercase tracking-wider text-ink-muted";

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      purpose: "",
      other_purpose: "",
      message: "",
      honeypot: "",
    },
  });

  const watchedPurpose = form.watch("purpose");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to send message. Please try again.");
      }

      toast.success("Message sent successfully. Thank you!");
      form.reset();
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 lg:p-10 rounded-2xl bg-surface-low border border-border shadow-xl">
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-10 h-10 rounded-lg bg-surface-high border border-border text-champagne flex items-center justify-center">
          <Send className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white tracking-tight">Send a Message</h3>
          <p className="text-xs text-ink-soft font-light mt-0.5">Direct inquiry — typically replies within 1–2 business days</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Honeypot field for bot protection */}
          <input
            type="text"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("honeypot")}
          />
          <div className="grid md:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sarah Jenkins" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Project Purpose / Engagement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {purposeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedPurpose === "other" && (
            <FormField
              control={form.control}
              name="other_purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Other Purpose</FormLabel>
                  <FormControl>
                    <Input placeholder="Tell me what this is about" className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Message / System Requirements</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Tell me about your project, current data stack, timeline, or key objectives..."
                    className={`${fieldClass} resize-none`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 h-auto rounded-lg bg-champagne text-[#090c13] text-sm font-semibold tracking-wide hover:bg-white transition-all shadow-[0_1px_16px_rgba(243,232,210,0.15)] gap-2 group mt-2"
          >
            <Send className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;

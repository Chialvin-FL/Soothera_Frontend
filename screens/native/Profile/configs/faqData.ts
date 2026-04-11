/**
 * FAQ questions and answers for Help / FAQs screens.
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What are your offered services?',
    answer:
      'Soothera offers a wide range of spa and wellness services including massage therapy (Swedish, deep tissue, hot stone, sports massage), facials, body wraps, aromatherapy, reflexology, manicure and pedicure, waxing, and specialized treatments like couples massage and prenatal massage. Each massage spa may offer a slightly different selection – browse the massage spa details to see their full menu.',
  },
  {
    question: 'Can you provide the list of your services with prices?',
    answer:
      'Service prices vary by massage spa, treatment type, and duration. To view the full list of services with prices:\n\n1. Open the Soothera app and tap on "Services" or "Explore"\n2. Select a massage spa from the list or use the search to find one near you\n3. Tap on the massage spa to view its profile\n4. Scroll to the "Services" section to see all treatments with descriptions and prices\n\nYou can also filter by service type or price range to find options that fit your budget.',
  },
  {
    question: 'Do you offer a home service?',
    answer:
      'Yes, many of our partner massage spas and therapists offer home service or mobile appointments. When booking, look for the "Home Service" or "Mobile" badge on the massage spa or therapist profile. You can filter search results by "Home service available" to see only providers who travel to your location. Home service may have an additional travel fee depending on your area.',
  },
  {
    question: 'Can I request a massage therapist?',
    answer:
      'Yes. When booking an appointment, you can specify a preferred therapist if the massage spa allows it. During the booking flow, look for the "Choose therapist" or "Preferred therapist" option. You can select from available therapists, view their specializations and ratings, and add special requests (e.g., focus on shoulders, avoid lower back) in the booking notes. Some massage spas may also accommodate therapist preferences if you contact them directly.',
  },
  {
    question: 'How do I book an appointment?',
    answer:
      'Booking is easy:\n\n1. Browse massage spas and services on the Home or Services tab\n2. Select a massage spa and choose your preferred service, date, and time\n3. Add any add-ons or special instructions\n4. Enter your details and payment information\n5. Confirm your booking\n\nYou will receive a confirmation email and push notification. Manage your upcoming appointments in the Bookings tab.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Soothera accepts major credit and debit cards (Visa, Mastercard, American Express), digital wallets (Apple Pay, Google Pay), and some massage spas may offer cash or card payments on-site. Payment is typically taken at the time of booking. Promo codes and gift cards can be applied at checkout. For refunds, please refer to our cancellation and refund policy.',
  },
  {
    question: 'What is your cancellation and refund policy?',
    answer:
      'Cancellations made more than 24 hours before your appointment are eligible for a full refund. Cancellations within 24 hours may incur a fee or forfeit the booking amount, depending on the massage spa\'s policy. No-shows are typically non-refundable. To cancel, go to the Bookings tab, select your appointment, and tap "Cancel booking". Refunds are processed within 5–10 business days. For special circumstances, contact our support team.',
  },
  {
    question: 'Can I request specific areas to be focused on or avoided?',
    answer:
      'Yes. When booking, use the "Special instructions" or "Notes" field to specify areas you want the therapist to focus on (e.g., neck, shoulders) or avoid (e.g., lower back, recent injury). You can also mention pressure preferences, allergies, or medical conditions. Therapists will do their best to accommodate your requests. For serious health concerns, please consult your doctor before your appointment.',
  },
];

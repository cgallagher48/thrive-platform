export const CALENDLY_URL = "https://calendly.com/thriveautomation";
export const CONTACT_EMAIL = "casey.gallagher@thriveautomation.agency";

export type System = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  benefit: string;
  comingSoon?: boolean;
};

// Always included with every build: the base every engine plugs into.
export const BASE: System[] = [
  {
    slug: "dashboard",
    name: "The Dashboard",
    tagline: "One place to see the whole business.",
    description:
      "Leads, jobs, money, and your schedule, all on one screen. No more piecing the picture together from a CRM, a spreadsheet, an inbox, and a whiteboard.",
    benefit:
      "You open one page and know exactly where the business stands, right now.",
  },
  {
    slug: "brain",
    name: "The Brain",
    tagline: "An AI assistant that knows your business.",
    description:
      "Ask it anything: “How many open quotes do we have?” “Who hasn’t paid?” “What needs me today?” It answers from your own data, not a canned script. Every morning it also sends a daily brief of what happened and what needs your attention.",
    benefit:
      "Answers that used to take digging through systems now take one question.",
  },
];

// The engines. Clients pick the ones their business needs.
export const ENGINES: System[] = [
  {
    slug: "speed-to-lead",
    name: "Speed-to-Lead",
    tagline: "Every inbound lead gets an instant response.",
    description:
      "Captures every inbound lead the moment it arrives, whether that's your website, a phone call, or a form. Qualifies it with AI and responds immediately, day or night.",
    benefit:
      "Leads stop going cold while they wait for a callback. The first business to respond usually wins the job.",
  },
  {
    slug: "follow-up",
    name: "Follow-Up Engine",
    tagline: "Nothing dies in an inbox.",
    description:
      "Every quote and inquiry gets persistent, personalized follow-up until it gets an answer: yes, no, or not yet.",
    benefit:
      "Work you already quoted stops slipping away because nobody circled back.",
  },
  {
    slug: "booking",
    name: "Booking Engine",
    tagline: "Ends phone tag for good.",
    description:
      "Leads book straight into your calendar. Reminders and rescheduling are handled automatically.",
    benefit:
      "No more back-and-forth to find a time, and fewer no-shows on the schedule.",
  },
  {
    slug: "reputation",
    name: "Reputation Engine",
    tagline: "Every completed job asks for its own review.",
    description:
      "Completed jobs automatically trigger review requests. If a negative review lands, you’re alerted immediately, and a drafted response is ready to go.",
    benefit:
      "Your review count grows from work you’re already doing, and bad reviews never sit unanswered.",
  },
  {
    slug: "money",
    name: "Money Engine",
    tagline: "Invoices go out on time and get chased until paid.",
    description:
      "Invoices are sent automatically when work completes. Unpaid invoices are followed up politely and persistently until they’re paid.",
    benefit:
      "You stop being the collections department for your own business.",
  },
  {
    slug: "reactivation-referral",
    name: "Reactivation + Referral",
    tagline: "Turns past customers into the next ones.",
    description:
      "Re-engages dormant customers and systematically asks happy ones for referrals, working the customer list you already have.",
    benefit:
      "New work from people who already know you, without buying more leads.",
  },
  {
    slug: "field-ops",
    name: "Field Ops",
    tagline: "Connects the office to the crew.",
    description:
      "Daily crew briefs, job photos turned into customer-facing reports, and automatic status updates as work progresses.",
    benefit:
      "Customers stop calling to ask “when are you coming?” They already know.",
  },
  {
    slug: "team-sync",
    name: "Team Sync",
    tagline: "One shared job record for the whole team.",
    description:
      "Sales, ops, and finance work from the same job record, so scope changes get billed and teams stop contradicting each other.",
    benefit:
      "The gap between what was sold, what was done, and what was billed closes.",
  },
  {
    slug: "trigger-campaigns",
    name: "Trigger Campaigns",
    tagline: "Event-driven outreach, configured for your industry.",
    description:
      "A storm hits a zip code and every past customer and lead in that area is contacted within hours. Seasonal and dormancy triggers are configured per industry.",
    benefit:
      "You’re first in the door at the exact moment your customers need you.",
  },
  {
    slug: "ai-receptionist",
    name: "AI Receptionist",
    tagline: "Will answer every inbound call, 24/7.",
    description:
      "In development. It will answer every inbound call around the clock, qualify the caller, and book the appointment.",
    benefit:
      "No missed call will go unanswered, even at 2 AM on a Sunday.",
    comingSoon: true,
  },
];

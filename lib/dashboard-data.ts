// All values on this file are illustrative sample data for the demo portal.
// Nothing here represents a real client, lead, job, or result.

export type ActivityItem = {
  label: string;
  detail: string;
};

export const TODAY_ACTIVITY: ActivityItem[] = [
  { label: "New leads answered", detail: "3 inbound leads, all responded to within a minute" },
  { label: "Invoices sent", detail: "2 invoices sent automatically on job completion" },
  { label: "Reviews requested", detail: "1 completed job triggered a review request" },
];

export type SampleLead = {
  name: string;
  source: string;
  status: string;
  time: string;
};

export const RECENT_LEADS: SampleLead[] = [
  { name: "Sample Customer — J. Rivera", source: "Website form", status: "Responded", time: "9:14 AM" },
  { name: "Sample Customer — M. Chen", source: "Phone call", status: "Quote sent", time: "11:02 AM" },
  { name: "Sample Customer — A. Patel", source: "Referral", status: "Follow-up scheduled", time: "1:47 PM" },
];

export type SampleBooking = {
  customer: string;
  service: string;
  time: string;
};

export const UPCOMING_BOOKINGS: SampleBooking[] = [
  { customer: "Sample Customer — D. Okafor", service: "Roof inspection", time: "Tomorrow, 10:00 AM" },
  { customer: "Sample Customer — L. Nguyen", service: "Install — follow-up", time: "Thu, 2:00 PM" },
];

export const BRAIN_DAILY_BRIEF =
  "Good morning. Here's a sample of what your daily brief would look like: 3 new leads came in overnight and all received an instant response. One quote from last week still hasn't gotten a reply — it's due for another follow-up today. Tomorrow's schedule has 2 bookings confirmed, no gaps.";

export type BrainMessage = {
  role: "user" | "assistant";
  text: string;
};

export const BRAIN_SAMPLE_CHAT: BrainMessage[] = [
  { role: "user", text: "How many open quotes do we have?" },
  { role: "assistant", text: "Sample answer: 4 open quotes right now, the oldest is 6 days old." },
  { role: "user", text: "Who hasn't paid yet?" },
  { role: "assistant", text: "Sample answer: 1 invoice is overdue — Sample Customer, 9 days past due." },
];

// Keyed by the engine `slug` values defined in lib/systems.ts
export const ENGINE_EXAMPLES: Record<string, string> = {
  "speed-to-lead":
    "Sample Lead — Jenna M. submitted a website form at 2:14 PM. Responded in 38 seconds.",
  "follow-up":
    "Sample Quote — Sample Customer, quote #1042, 3rd follow-up sent, no response yet.",
  booking:
    "Sample Booking — Sample Customer booked Tuesday 10:00 AM, confirmed automatically, reminder sent.",
  reputation:
    "Sample Job — Sample Customer's job marked complete, review request sent, 5-star review received.",
  money:
    "Sample Invoice — Sample Customer invoice #A-204 sent on completion, reminder sent on day 7.",
  "reactivation-referral":
    "Sample Customer (dormant 14 months) re-engaged; referral ask sent to a happy repeat customer.",
  "field-ops":
    "Sample Job — crew brief sent at 7:00 AM; job photos turned into a customer update at 1:00 PM.",
  "team-sync":
    "Sample Job — a scope change logged by ops synced automatically to the sales quote and the invoice.",
  "trigger-campaigns":
    "Sample Trigger — a storm in ZIP 30301 triggered outreach to 42 sample past customers and leads.",
};

// ---------------------------------------------------------------------------
// Customers — one shared sample roster reused across Inbox, Pipeline,
// Customers, Reviews, and Money so the demo tells one consistent story.
// ---------------------------------------------------------------------------

export type CustomerJob = { service: string; status: string; date: string };
export type CustomerMessage = { channel: string; preview: string; date: string };
export type CustomerInvoice = { id: string; amount: string; status: string; date: string };
export type CustomerReview = { rating: number; text: string; date: string };

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  since: string;
  jobs: CustomerJob[];
  messages: CustomerMessage[];
  invoices: CustomerInvoice[];
  reviews: CustomerReview[];
};

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Sample Customer — J. Rivera",
    phone: "(555) 010-1122",
    email: "j.rivera@example.com",
    since: "Mar 2025",
    jobs: [
      { service: "Roof inspection", status: "Done", date: "Jul 10, 2026" },
      { service: "Gutter repair", status: "Scheduled", date: "Jul 28, 2026" },
    ],
    messages: [
      { channel: "Web Form", preview: "Looking for a quote on gutter repair.", date: "Jul 22, 2026" },
      { channel: "Text", preview: "Thanks, that time works!", date: "Jul 22, 2026" },
    ],
    invoices: [{ id: "A-204", amount: "$1,240", status: "Paid", date: "Jul 12, 2026" }],
    reviews: [{ rating: 5, text: "Sample review: fast and professional.", date: "Jul 13, 2026" }],
  },
  {
    id: "c2",
    name: "Sample Customer — M. Chen",
    phone: "(555) 010-3344",
    email: "m.chen@example.com",
    since: "Nov 2024",
    jobs: [{ service: "Full re-roof", status: "Quoted", date: "Jul 20, 2026" }],
    messages: [
      { channel: "Phone Call", preview: "Missed call — left voicemail about quote.", date: "Jul 21, 2026" },
      { channel: "Email", preview: "Following up on the estimate we sent.", date: "Jul 22, 2026" },
    ],
    invoices: [{ id: "A-198", amount: "$8,900", status: "Outstanding", date: "Jul 20, 2026" }],
    reviews: [],
  },
  {
    id: "c3",
    name: "Sample Customer — A. Patel",
    phone: "(555) 010-5566",
    email: "a.patel@example.com",
    since: "Jan 2026",
    jobs: [{ service: "Chimney flashing", status: "New Lead", date: "Jul 22, 2026" }],
    messages: [{ channel: "Referral", preview: "Referred by D. Okafor, asking about flashing repair.", date: "Jul 22, 2026" }],
    invoices: [],
    reviews: [],
  },
  {
    id: "c4",
    name: "Sample Customer — D. Okafor",
    phone: "(555) 010-7788",
    email: "d.okafor@example.com",
    since: "Aug 2023",
    jobs: [{ service: "Roof inspection", status: "Scheduled", date: "Jul 23, 2026" }],
    messages: [{ channel: "Text", preview: "See you tomorrow at 10!", date: "Jul 22, 2026" }],
    invoices: [{ id: "A-190", amount: "$450", status: "Paid", date: "Jun 2, 2026" }],
    reviews: [{ rating: 5, text: "Sample review: on time, explained everything clearly.", date: "Jun 3, 2026" }],
  },
  {
    id: "c5",
    name: "Sample Customer — L. Nguyen",
    phone: "(555) 010-9900",
    email: "l.nguyen@example.com",
    since: "May 2025",
    jobs: [{ service: "Install — follow-up", status: "Scheduled", date: "Jul 25, 2026" }],
    messages: [{ channel: "Web Form", preview: "Can we push install to Thursday afternoon?", date: "Jul 21, 2026" }],
    invoices: [{ id: "A-201", amount: "$3,100", status: "Overdue", date: "Jul 1, 2026" }],
    reviews: [{ rating: 4, text: "Sample review: good work, a little behind schedule.", date: "Jun 18, 2026" }],
  },
  {
    id: "c6",
    name: "Sample Customer — R. Hastings",
    phone: "(555) 010-2233",
    email: "r.hastings@example.com",
    since: "Feb 2024",
    jobs: [{ service: "Storm damage repair", status: "Done", date: "Jul 5, 2026" }],
    messages: [{ channel: "Email", preview: "Invoice received, paying by Friday.", date: "Jul 15, 2026" }],
    invoices: [{ id: "A-203", amount: "$2,050", status: "Paid", date: "Jul 6, 2026" }],
    reviews: [{ rating: 3, text: "Sample review: good result, slow to schedule.", date: "Jul 8, 2026" }],
  },
];

// ---------------------------------------------------------------------------
// Inbox — one thread per customer, combining channels into a single view.
// ---------------------------------------------------------------------------

export type InboxMessage = {
  channel: "Web Form" | "Text" | "Missed Call" | "Email";
  direction: "in" | "out";
  text: string;
  time: string;
};

export type InboxThread = {
  id: string;
  customer: string;
  preview: string;
  time: string;
  unread?: boolean;
  messages: InboxMessage[];
};

export const INBOX_THREADS: InboxThread[] = [
  {
    id: "c2",
    customer: "Sample Customer — M. Chen",
    preview: "Following up on the estimate we sent.",
    time: "9:40 AM",
    unread: true,
    messages: [
      { channel: "Missed Call", direction: "in", text: "Missed call, no voicemail.", time: "Jul 21, 4:12 PM" },
      { channel: "Text", direction: "out", text: "Sorry we missed you! Calling back shortly.", time: "Jul 21, 4:13 PM" },
      { channel: "Email", direction: "out", text: "Here's the estimate for your full re-roof — let us know if you have questions.", time: "Jul 21, 5:02 PM" },
      { channel: "Email", direction: "in", text: "Following up on the estimate we sent.", time: "Jul 22, 9:40 AM" },
    ],
  },
  {
    id: "c3",
    customer: "Sample Customer — A. Patel",
    preview: "Referred by D. Okafor, asking about flashing repair.",
    time: "8:15 AM",
    unread: true,
    messages: [
      { channel: "Web Form", direction: "in", text: "Referred by D. Okafor, asking about flashing repair.", time: "Jul 22, 8:15 AM" },
    ],
  },
  {
    id: "c1",
    customer: "Sample Customer — J. Rivera",
    preview: "Thanks, that time works!",
    time: "Yesterday",
    messages: [
      { channel: "Web Form", direction: "in", text: "Looking for a quote on gutter repair.", time: "Jul 20, 2:03 PM" },
      { channel: "Text", direction: "out", text: "Happy to help — does Jul 28 at 10 AM work?", time: "Jul 20, 2:40 PM" },
      { channel: "Text", direction: "in", text: "Thanks, that time works!", time: "Jul 20, 2:44 PM" },
    ],
  },
  {
    id: "c5",
    customer: "Sample Customer — L. Nguyen",
    preview: "Can we push install to Thursday afternoon?",
    time: "2 days ago",
    messages: [
      { channel: "Web Form", direction: "in", text: "Can we push install to Thursday afternoon?", time: "Jul 21, 11:20 AM" },
      { channel: "Text", direction: "out", text: "No problem, moved to Thu 2:00 PM.", time: "Jul 21, 11:35 AM" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Today — the human-only action queue.
// ---------------------------------------------------------------------------

export type TodayTask = {
  id: string;
  category: "Call back" | "Approve quote" | "Respond to review";
  title: string;
  detail: string;
  actionLabel: string;
};

export const TODAY_TASKS: TodayTask[] = [
  {
    id: "t1",
    category: "Call back",
    title: "Call Sample Customer — M. Chen",
    detail: "Missed call yesterday about the full re-roof estimate. Ready when you are.",
    actionLabel: "Call now",
  },
  {
    id: "t2",
    category: "Approve quote",
    title: "Approve quote for Sample Customer — A. Patel",
    detail: "Chimney flashing repair, drafted quote is ready for your review.",
    actionLabel: "Review quote",
  },
  {
    id: "t3",
    category: "Respond to review",
    title: "Reply to a 3-star review",
    detail: "Sample Customer — R. Hastings left feedback about scheduling delays.",
    actionLabel: "Write reply",
  },
  {
    id: "t4",
    category: "Call back",
    title: "Confirm crew for tomorrow's inspection",
    detail: "Sample Customer — D. Okafor, 10:00 AM roof inspection.",
    actionLabel: "Confirm",
  },
];

// ---------------------------------------------------------------------------
// Pipeline — job board.
// ---------------------------------------------------------------------------

export const PIPELINE_STAGES = ["New Lead", "Quoted", "Scheduled", "Done", "Paid"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type PipelineJob = {
  id: string;
  customer: string;
  service: string;
  value: string;
  stage: PipelineStage;
};

export const PIPELINE_JOBS: PipelineJob[] = [
  { id: "j1", customer: "Sample Customer — A. Patel", service: "Chimney flashing", value: "$680", stage: "New Lead" },
  { id: "j2", customer: "Sample Customer — S. Brooks", service: "Gutter guards", value: "$1,150", stage: "New Lead" },
  { id: "j3", customer: "Sample Customer — M. Chen", service: "Full re-roof", value: "$8,900", stage: "Quoted" },
  { id: "j4", customer: "Sample Customer — T. Alvarez", service: "Skylight install", value: "$2,300", stage: "Quoted" },
  { id: "j5", customer: "Sample Customer — D. Okafor", service: "Roof inspection", value: "$450", stage: "Scheduled" },
  { id: "j6", customer: "Sample Customer — L. Nguyen", service: "Install — follow-up", value: "$3,100", stage: "Scheduled" },
  { id: "j7", customer: "Sample Customer — R. Hastings", service: "Storm damage repair", value: "$2,050", stage: "Done" },
  { id: "j8", customer: "Sample Customer — J. Rivera", service: "Gutter repair", value: "$1,240", stage: "Paid" },
];

// ---------------------------------------------------------------------------
// Calendar — a sample month of bookings, crew assignments, and reminders.
// Dates are fixed to July 2026 so the demo reads naturally regardless of
// when it's viewed.
// ---------------------------------------------------------------------------

export type CalendarEvent = {
  date: string; // YYYY-MM-DD
  time: string;
  title: string;
  type: "Booking" | "Crew" | "Follow-up";
};

export const CALENDAR_MONTH = { year: 2026, month: 7 }; // July 2026
export const CALENDAR_TODAY = "2026-07-22";

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { date: "2026-07-23", time: "10:00 AM", title: "Roof inspection — D. Okafor", type: "Booking" },
  { date: "2026-07-23", time: "7:00 AM", title: "Crew brief — Team A", type: "Crew" },
  { date: "2026-07-24", time: "9:00 AM", title: "Follow-up: quote #1042", type: "Follow-up" },
  { date: "2026-07-25", time: "2:00 PM", title: "Install follow-up — L. Nguyen", type: "Booking" },
  { date: "2026-07-28", time: "10:00 AM", title: "Gutter repair — J. Rivera", type: "Booking" },
  { date: "2026-07-28", time: "7:30 AM", title: "Crew brief — Team B", type: "Crew" },
  { date: "2026-07-30", time: "11:00 AM", title: "Follow-up: overdue invoice A-201", type: "Follow-up" },
  { date: "2026-07-15", time: "1:00 PM", title: "Storm damage repair — R. Hastings", type: "Booking" },
  { date: "2026-07-10", time: "10:00 AM", title: "Roof inspection — J. Rivera", type: "Booking" },
];

// ---------------------------------------------------------------------------
// Reviews.
// ---------------------------------------------------------------------------

export type Review = {
  id: string;
  customer: string;
  rating: number;
  text: string;
  date: string;
  responded: boolean;
};

export const SAMPLE_REVIEWS: Review[] = [
  { id: "r1", customer: "Sample Customer — J. Rivera", rating: 5, text: "Fast and professional, would recommend.", date: "Jul 13, 2026", responded: true },
  { id: "r2", customer: "Sample Customer — D. Okafor", rating: 5, text: "On time, explained everything clearly.", date: "Jun 3, 2026", responded: true },
  { id: "r3", customer: "Sample Customer — R. Hastings", rating: 3, text: "Good result, but scheduling took longer than expected.", date: "Jul 8, 2026", responded: false },
  { id: "r4", customer: "Sample Customer — L. Nguyen", rating: 4, text: "Good work, a little behind schedule.", date: "Jun 18, 2026", responded: true },
];

export const REVIEW_TREND: { month: string; avgRating: number }[] = [
  { month: "Feb", avgRating: 4.2 },
  { month: "Mar", avgRating: 4.3 },
  { month: "Apr", avgRating: 4.5 },
  { month: "May", avgRating: 4.4 },
  { month: "Jun", avgRating: 4.6 },
  { month: "Jul", avgRating: 4.5 },
];

// ---------------------------------------------------------------------------
// Money.
// ---------------------------------------------------------------------------

export const MONEY_SUMMARY = {
  outstanding: "$8,900",
  overdue: "$3,100",
  collectedThisMonth: "$5,740",
};

export type MoneyInvoice = {
  id: string;
  customer: string;
  amount: string;
  status: "Outstanding" | "Overdue" | "Paid";
  date: string;
};

export const SAMPLE_INVOICES: MoneyInvoice[] = [
  { id: "A-204", customer: "Sample Customer — J. Rivera", amount: "$1,240", status: "Paid", date: "Jul 12, 2026" },
  { id: "A-198", customer: "Sample Customer — M. Chen", amount: "$8,900", status: "Outstanding", date: "Jul 20, 2026" },
  { id: "A-201", customer: "Sample Customer — L. Nguyen", amount: "$3,100", status: "Overdue", date: "Jul 1, 2026" },
  { id: "A-203", customer: "Sample Customer — R. Hastings", amount: "$2,050", status: "Paid", date: "Jul 6, 2026" },
  { id: "A-190", customer: "Sample Customer — D. Okafor", amount: "$450", status: "Paid", date: "Jun 2, 2026" },
];

// ---------------------------------------------------------------------------
// Notifications.
// ---------------------------------------------------------------------------

export type NotificationItem = {
  id: string;
  type: "New Lead" | "Invoice Overdue" | "New Review" | "Booking Confirmed" | "Quote Follow-up";
  text: string;
  time: string;
};

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", type: "New Lead", text: "Sample Customer — A. Patel submitted a web form about chimney flashing.", time: "8:15 AM" },
  { id: "n2", type: "Quote Follow-up", text: "Follow-up sent to Sample Customer — M. Chen on quote #1042.", time: "9:40 AM" },
  { id: "n3", type: "Booking Confirmed", text: "Sample Customer — D. Okafor confirmed tomorrow's 10:00 AM inspection.", time: "Yesterday" },
  { id: "n4", type: "New Review", text: "New 3-star review from Sample Customer — R. Hastings.", time: "Jul 8, 2026" },
  { id: "n5", type: "Invoice Overdue", text: "Invoice A-201 for Sample Customer — L. Nguyen is 9 days overdue.", time: "Jul 10, 2026" },
  { id: "n6", type: "New Review", text: "New 5-star review from Sample Customer — J. Rivera.", time: "Jul 13, 2026" },
];

// ---------------------------------------------------------------------------
// Setup checklist.
// ---------------------------------------------------------------------------

export type SetupStep = { id: string; label: string; done: boolean };

export const SETUP_STEPS: SetupStep[] = [
  { id: "s1", label: "Connect your business phone number", done: true },
  { id: "s2", label: "Connect your website form", done: true },
  { id: "s3", label: "Add your Google Business profile", done: true },
  { id: "s4", label: "Connect your calendar", done: false },
  { id: "s5", label: "Connect invoicing / accounting", done: false },
  { id: "s6", label: "Invite your team", done: false },
];

// ---------------------------------------------------------------------------
// Analytics.
// ---------------------------------------------------------------------------

export const LEADS_PER_WEEK: { week: string; leads: number }[] = [
  { week: "Jun 1", leads: 9 },
  { week: "Jun 8", leads: 12 },
  { week: "Jun 15", leads: 10 },
  { week: "Jun 22", leads: 14 },
  { week: "Jun 29", leads: 13 },
  { week: "Jul 6", leads: 16 },
  { week: "Jul 13", leads: 15 },
  { week: "Jul 20", leads: 18 },
];

export const BOOKINGS_PER_MONTH: { month: string; bookings: number }[] = [
  { month: "Feb", bookings: 18 },
  { month: "Mar", bookings: 22 },
  { month: "Apr", bookings: 25 },
  { month: "May", bookings: 24 },
  { month: "Jun", bookings: 29 },
  { month: "Jul", bookings: 31 },
];

// `reviews` holds actual sample history; `projected` extends the same series
// as a dashed, clearly-labeled example forecast — not a real prediction.
export const REVIEW_GROWTH: { month: string; reviews?: number; projected?: number }[] = [
  { month: "Feb", reviews: 22 },
  { month: "Mar", reviews: 27 },
  { month: "Apr", reviews: 31 },
  { month: "May", reviews: 35 },
  { month: "Jun", reviews: 40 },
  { month: "Jul", reviews: 44, projected: 44 },
  { month: "Aug", projected: 49 },
  { month: "Sep", projected: 54 },
];

export const ENGINE_COMPARISON: { engine: string; actions: number }[] = [
  { engine: "Speed-to-Lead", actions: 62 },
  { engine: "Follow-Up", actions: 48 },
  { engine: "Booking", actions: 35 },
  { engine: "Reputation", actions: 21 },
  { engine: "Money", actions: 29 },
  { engine: "Reactivation", actions: 14 },
];

// ---------------------------------------------------------------------------
// Library — scanned/uploaded documents, auto-sorted into categories.
// Tied to the same sample-customer roster used elsewhere in the demo.
// ---------------------------------------------------------------------------

export const LIBRARY_CATEGORIES = [
  "Contracts",
  "Invoices",
  "Service Records",
  "Customer Intake",
  "Certificates",
] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export type LibraryDocument = {
  id: string;
  fileName: string;
  fileType: "pdf" | "image";
  category: LibraryCategory;
  customerName: string;
  extracted: {
    name: string;
    phone?: string;
    date: string;
    amount?: string;
  };
};

export const LIBRARY_DOCUMENTS: LibraryDocument[] = [
  {
    id: "d1",
    fileName: "Rivera_Service_Agreement.pdf",
    fileType: "pdf",
    category: "Contracts",
    customerName: "Sample Customer — J. Rivera",
    extracted: { name: "J. Rivera", phone: "(555) 010-1122", date: "Jul 10, 2026" },
  },
  {
    id: "d2",
    fileName: "Chen_Estimate_Signed.pdf",
    fileType: "pdf",
    category: "Contracts",
    customerName: "Sample Customer — M. Chen",
    extracted: { name: "M. Chen", phone: "(555) 010-3344", date: "Jul 20, 2026" },
  },
  {
    id: "d3",
    fileName: "Invoice_A204_Rivera.pdf",
    fileType: "pdf",
    category: "Invoices",
    customerName: "Sample Customer — J. Rivera",
    extracted: { name: "J. Rivera", phone: "(555) 010-1122", date: "Jul 12, 2026", amount: "$1,240" },
  },
  {
    id: "d4",
    fileName: "Invoice_A198_Chen.pdf",
    fileType: "pdf",
    category: "Invoices",
    customerName: "Sample Customer — M. Chen",
    extracted: { name: "M. Chen", phone: "(555) 010-3344", date: "Jul 20, 2026", amount: "$8,900" },
  },
  {
    id: "d5",
    fileName: "Invoice_A201_Nguyen.pdf",
    fileType: "pdf",
    category: "Invoices",
    customerName: "Sample Customer — L. Nguyen",
    extracted: { name: "L. Nguyen", phone: "(555) 010-9900", date: "Jul 1, 2026", amount: "$3,100" },
  },
  {
    id: "d6",
    fileName: "Okafor_Inspection_Report.pdf",
    fileType: "pdf",
    category: "Service Records",
    customerName: "Sample Customer — D. Okafor",
    extracted: { name: "D. Okafor", phone: "(555) 010-7788", date: "Jun 2, 2026" },
  },
  {
    id: "d7",
    fileName: "Hastings_StormDamage_Photos.jpg",
    fileType: "image",
    category: "Service Records",
    customerName: "Sample Customer — R. Hastings",
    extracted: { name: "R. Hastings", phone: "(555) 010-2233", date: "Jul 5, 2026" },
  },
  {
    id: "d8",
    fileName: "Patel_Intake_Form.pdf",
    fileType: "pdf",
    category: "Customer Intake",
    customerName: "Sample Customer — A. Patel",
    extracted: { name: "A. Patel", phone: "(555) 010-5566", date: "Jul 22, 2026" },
  },
  {
    id: "d9",
    fileName: "Nguyen_Intake_Form.pdf",
    fileType: "pdf",
    category: "Customer Intake",
    customerName: "Sample Customer — L. Nguyen",
    extracted: { name: "L. Nguyen", phone: "(555) 010-9900", date: "May 12, 2025" },
  },
  {
    id: "d10",
    fileName: "Rivera_Warranty_Certificate.pdf",
    fileType: "pdf",
    category: "Certificates",
    customerName: "Sample Customer — J. Rivera",
    extracted: { name: "J. Rivera", phone: "(555) 010-1122", date: "Jul 13, 2026" },
  },
  {
    id: "d11",
    fileName: "Okafor_Workmanship_Certificate.pdf",
    fileType: "pdf",
    category: "Certificates",
    customerName: "Sample Customer — D. Okafor",
    extracted: { name: "D. Okafor", phone: "(555) 010-7788", date: "Jun 3, 2026" },
  },
];

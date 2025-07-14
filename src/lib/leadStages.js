export const LEAD_STAGES_CONFIG = {
  'new': { label: 'New Lead', description: 'A lead that has just been added to the system and hasn’t been contacted yet.', color: 'bg-blue-500' },
  'contacted': { label: 'Contacted', description: 'Initial outreach has been made, but no meaningful discussion yet.', color: 'bg-cyan-500' },
  'discovery': { label: 'Discovery', description: 'You’re currently gathering information about the lead’s needs and goals.', color: 'bg-teal-500' },
  'qualified': { label: 'Qualified', description: 'The lead fits your ideal customer profile and is likely to buy.', color: 'bg-yellow-500' },
  'proposal': { label: 'Proposal Sent', description: 'You’ve sent a formal proposal outlining the offer and pricing.', color: 'bg-orange-500' },
  'negotiation': { label: 'Negotiation', description: 'The lead is reviewing or discussing terms before making a decision.', color: 'bg-purple-500' },
  'won': { label: 'Won', description: 'The deal is successfully closed — the lead has converted to a customer.', color: 'bg-green-500' },
  'lost': { label: 'Lost', description: 'The lead did not convert. No further engagement is planned.', color: 'bg-red-500' },
};

export const ORDERED_LEAD_STAGES = [
  { id: 'new', label: 'New Lead' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'proposal', label: 'Proposal Sent' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
];

export const STAGE_OPTIONS = Object.fromEntries(
  Object.entries(LEAD_STAGES_CONFIG).map(([key, { label }]) => [key, label])
);
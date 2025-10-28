// Shared article type data for outline prototypes
export const ARTICLE_TYPES = [
  {
    id: 'biography',
    name: 'Biography',
    outline: [
      { id: 'lead', title: 'Lead paragraph', guidance: 'Introduce the subject and summarize why they are notable.' },
      { id: 'early-life', title: 'Early life', guidance: 'Cover birth, upbringing, and formative experiences with citations.' },
      { id: 'career', title: 'Career', guidance: 'Highlight major roles, projects, and achievements using reliable sources.' },
      { id: 'recognition', title: 'Recognition', guidance: 'Document awards, honors, and coverage from independent outlets.' }
    ],
    tips: [
      'Use neutral tone and cite independent secondary sources.',
      'Avoid lists of trivial details; emphasize verifiable milestones.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(people)'
  },
  {
    id: 'organization',
    name: 'Organization',
    outline: [
      { id: 'overview', title: 'Overview', guidance: 'Explain what the organization does and why it matters.' },
      { id: 'history', title: 'History', guidance: 'Summarize founding, growth, and pivotal changes chronologically.' },
      { id: 'operations', title: 'Operations', guidance: 'Describe products, services, or programs with reliable sourcing.' },
      { id: 'impact', title: 'Impact and reception', guidance: 'Reference independent coverage discussing influence or criticism.' }
    ],
    tips: [
      'Cite at least two independent, reputable sources discussing the organization.',
      'Avoid promotional language and sourced claims directly from company materials only.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(organizations_and_companies)'
  },
  {
    id: 'event',
    name: 'Event',
    outline: [
      { id: 'overview', title: 'Overview', guidance: 'Introduce the event, location, timing, and key participants.' },
      { id: 'background', title: 'Background', guidance: 'Provide context leading up to the event using reliable sources.' },
      { id: 'details', title: 'Event details', guidance: 'Describe what happened with chronological clarity and citations.' },
      { id: 'aftermath', title: 'Aftermath', guidance: 'Explain outcomes, responses, and long-term significance.' }
    ],
    tips: [
      'Prioritize coverage from established publications or academic sources.',
      'Clarify disputed information with attribution to sources.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(events)'
  }
];

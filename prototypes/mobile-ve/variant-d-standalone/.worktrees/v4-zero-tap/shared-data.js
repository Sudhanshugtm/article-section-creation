// Shared article type data for outline prototypes
export const ARTICLE_TYPES = [
  {
    id: 'biography',
    name: 'Biography',
    outline: [
      { 
        id: 'lead', 
        title: 'Lead paragraph', 
        guidance: '[Full Name] (born [date]) is a [nationality] [profession] known for [major achievements].'
      },
      { 
        id: 'early-life', 
        title: 'Early life', 
        guidance: '[Name] was born in [location] on [date]. [Early background and education]...'
      },
      { 
        id: 'career', 
        title: 'Career', 
        guidance: '[Name] began their career in [year/field]. [Major roles and achievements]...'
      },
      { 
        id: 'recognition', 
        title: 'Recognition', 
        guidance: '[Name] has received [awards/honors] for [achievements]...'
      }
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
      { 
        id: 'overview', 
        title: 'Overview', 
        guidance: '[Organization Name] is a [type] based in [location] that [primary purpose/activity].'
      },
      { 
        id: 'history', 
        title: 'History', 
        guidance: '[Organization] was founded in [year] by [founders]. [Key milestones]...'
      },
      { 
        id: 'operations', 
        title: 'Operations', 
        guidance: '[Organization] provides [products/services]. [Key programs or activities]...'
      },
      { 
        id: 'impact', 
        title: 'Impact and reception', 
        guidance: '[Organization] has been recognized for [achievements]. [Coverage and criticism]...'
      }
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
      { 
        id: 'overview', 
        title: 'Overview', 
        guidance: 'The [Event Name] took place on [date] in [location]. [Key participants and purpose]...'
      },
      { 
        id: 'background', 
        title: 'Background', 
        guidance: 'The event was organized in response to [context]. [Leading circumstances]...'
      },
      { 
        id: 'details', 
        title: 'Event details', 
        guidance: 'On [date], [what happened]. [Key moments in chronological order]...'
      },
      { 
        id: 'aftermath', 
        title: 'Aftermath', 
        guidance: 'Following the event, [immediate outcomes]. [Long-term significance]...'
      }
    ],
    tips: [
      'Prioritize coverage from established publications or academic sources.',
      'Clarify disputed information with attribution to sources.'
    ],
    policyUrl: 'https://en.wikipedia.org/wiki/Wikipedia:Notability_(events)'
  }
];

export const ARTICLE_BLUEPRINT = {
  title: 'Tiger Cricket Academy',
  language: 'en',
  wikidataSummary: 'A fictional community cricket academy founded in 1998 in Mumbai, India.',
  keyFacts: [
    { label: 'Founded', value: '1998', source: 'Wikidata P571' },
    { label: 'Location', value: 'Mumbai, India', source: 'Wikidata P276' },
    { label: 'Founder', value: 'Asha Verma', source: 'Wikidata P112' }
  ],
  sisterArticle: {
    language: 'hi',
    quality: 'B-class',
    url: 'https://hi.wikipedia.org/wiki/Tiger_Cricket_Academy'
  },
  sectionOutline: [
    { id: 'lead', title: 'Lead', rationale: 'Seen in 100% of academy articles' },
    { id: 'history', title: 'History', rationale: '82% of academy articles include history' },
    { id: 'programs', title: 'Training programs', rationale: 'Highlights offerings' },
    { id: 'notable-alumni', title: 'Notable alumni', rationale: 'Shows impact' },
    { id: 'references', title: 'References', rationale: 'Required for verification' }
  ],
  references: [
    {
      title: 'Mumbai Mirror: Grassroots cricket academies on the rise',
      publisher: 'Mumbai Mirror',
      year: 2022,
      url: 'https://mumbaimirror.com/cricket-academies-rise'
    },
    {
      title: 'ESPN Cricinfo: Training the next generation in Mumbai',
      publisher: 'ESPN Cricinfo',
      year: 2021,
      url: 'https://www.espncricinfo.com/story/mumbai-next-gen-training'
    }
  ]
};

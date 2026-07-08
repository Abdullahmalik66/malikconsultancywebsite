export interface AspectData {
  title: string;
  leftLabel: string;
  rightLabel: string;
  score: number;
  status: string;
  percentile: string;
  signals: string[];
}

export interface FactorData {
  id: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  score: number;
  status: string;
  percentile: string;
  interpretation: string;
  aspects: AspectData[];
}

export const BEHAVIORAL_FACTORS: FactorData[] = [
  {
    id: 'agreeableness',
    title: 'AGREEABLENESS',
    leftLabel: 'Detached',
    rightLabel: 'Friendly',
    score: 8,
    status: 'Friendly',
    percentile: '84th - 93rd percentile',
    interpretation: 'A high score indicates an empathetic, friendly style in interactions. This profile tends to trust other people and their intentions, making collaboration easier. It is likely to be warm, soft-hearted, and consensus-seeking, which may also make it more reluctant to speak hard truths or enter into conflict.',
    aspects: [
      {
        title: 'COMPASSION',
        leftLabel: 'Indifferent',
        rightLabel: 'Soft-hearted',
        score: 6,
        status: 'Neither Indifferent nor Soft-hearted',
        percentile: '50th - 69th percentile',
        signals: [
          'Sometimes focused on the well-being of others',
          'Sometimes affected by others\' negative experiences'
        ]
      },
      {
        title: 'POLITENESS',
        leftLabel: 'Forthright',
        rightLabel: 'Polite',
        score: 7,
        status: 'Polite',
        percentile: '69th - 84th percentile',
        signals: [
          'Well-mannered and humble',
          'Avoids offending others and stays out of conflicts'
        ]
      },
      {
        title: 'TRUST',
        leftLabel: 'Sceptical',
        rightLabel: 'Trusting',
        score: 8,
        status: 'Trusting',
        percentile: '84th - 93rd percentile',
        signals: [
          'Easily trusts other people',
          'Usually assumes the best about others\' intentions'
        ]
      }
    ]
  },
  {
    id: 'conscientiousness',
    title: 'CONSCIENTIOUSNESS',
    leftLabel: 'Relaxed',
    rightLabel: 'Diligent',
    score: 7,
    status: 'Diligent',
    percentile: '69th - 84th percentile',
    interpretation: 'A high score indicates strong focus on achievement and responsibility. This profile tends to work hard to reach goals and live up to expectations, even when that means sacrificing pleasure or fun. It shows self-discipline and a tendency to work in a structured way at a high tempo.',
    aspects: [
      {
        title: 'GOAL-STRIVING',
        leftLabel: 'Easy-going',
        rightLabel: 'Industrious',
        score: 6,
        status: 'Neither Easy-going nor Industrious',
        percentile: '50th - 69th percentile',
        signals: [
          'About as goal-oriented as most other people',
          'Usually gets started with work tasks fairly easily'
        ]
      },
      {
        title: 'CAREFULNESS',
        leftLabel: 'Spontaneous',
        rightLabel: 'Careful',
        score: 7,
        status: 'Careful',
        percentile: '69th - 84th percentile',
        signals: [
          'Puts preparation into decisions',
          'Concerned about getting things right'
        ]
      },
      {
        title: 'ORDERLINESS',
        leftLabel: 'Unstructured',
        rightLabel: 'Organized',
        score: 6,
        status: 'Neither Unstructured nor Organized',
        percentile: '50th - 69th percentile',
        signals: [
          'Prefers order and structure but may not prioritize it',
          'Strives to keep some level of organization at work'
        ]
      }
    ]
  },
  {
    id: 'extraversion',
    title: 'EXTRAVERSION',
    leftLabel: 'Reserved',
    rightLabel: 'Outgoing',
    score: 7,
    status: 'Outgoing',
    percentile: '69th - 84th percentile',
    interpretation: 'A high score indicates an outgoing and sociable style with a high energy level. This profile often enjoys frequent discussion, visible activity, and can take the lead and assert a view in many settings.',
    aspects: [
      {
        title: 'ASSERTIVENESS',
        leftLabel: 'Accommodative',
        rightLabel: 'Assertive',
        score: 6,
        status: 'Neither Accommodative nor Assertive',
        percentile: '50th - 69th percentile',
        signals: [
          'Voices opinion when needed',
          'Sometimes takes the lead, but not routinely'
        ]
      },
      {
        title: 'SOCIABILITY',
        leftLabel: 'Solitary',
        rightLabel: 'Sociable',
        score: 7,
        status: 'Sociable',
        percentile: '69th - 84th percentile',
        signals: [
          'Likes being around other people',
          'Socially outgoing'
        ]
      },
      {
        title: 'ENERGY LEVEL',
        leftLabel: 'Low-key',
        rightLabel: 'Energetic',
        score: 7,
        status: 'Energetic',
        percentile: '69th - 84th percentile',
        signals: [
          'High energy level and lively appearance',
          'Need for activity and a high pace of life'
        ]
      }
    ]
  },
  {
    id: 'emotional_stability',
    title: 'EMOTIONAL STABILITY',
    leftLabel: 'Sensitive',
    rightLabel: 'Resilient',
    score: 7,
    status: 'Resilient',
    percentile: '69th - 84th percentile',
    interpretation: 'A high score indicates an even temper and a tendency to remain calm and stable. This profile is relatively unshaken by what is happening around it, remains effective under pressure, and tends to handle setbacks, stress, and worry well.',
    aspects: [
      {
        title: 'OPTIMISM',
        leftLabel: 'Heavy-hearted',
        rightLabel: 'Carefree',
        score: 7,
        status: 'Carefree',
        percentile: '69th - 84th percentile',
        signals: [
          'Gets past setbacks easily',
          'Optimistic in most situations'
        ]
      },
      {
        title: 'STABILITY',
        leftLabel: 'Hot-tempered',
        rightLabel: 'Even-tempered',
        score: 6,
        status: 'Neither Hot-tempered nor Even-tempered',
        percentile: '50th - 69th percentile',
        signals: [
          'Fairly even temper when not under pressure',
          'May get annoyed or upset at times but not too often'
        ]
      },
      {
        title: 'STRESS TOLERANCE',
        leftLabel: 'Concerned',
        rightLabel: 'Composed',
        score: 8,
        status: 'Composed',
        percentile: '84th - 93rd percentile',
        signals: [
          'Rarely experiences worry',
          'Usually remains calm even under high pressure'
        ]
      }
    ]
  },
  {
    id: 'openness',
    title: 'OPENNESS TO EXPERIENCE',
    leftLabel: 'Conventional',
    rightLabel: 'Innovative',
    score: 6,
    status: 'Neither Conventional nor Innovative',
    percentile: '50th - 69th percentile',
    interpretation: 'An average score indicates a balance between established methods and change-seeking. This profile can enjoy abstract discussion but also wants practical outcomes. It tends to balance novelty with realism.',
    aspects: [
      {
        title: 'CURIOSITY',
        leftLabel: 'Down-to-earth',
        rightLabel: 'Curious',
        score: 5,
        status: 'Neither Down-to-earth nor Curious',
        percentile: '31st - 50th percentile',
        signals: [
          'Has both concrete and intellectual interests',
          'May at times enjoy a theoretical problem'
        ]
      },
      {
        title: 'AESTHETIC ORIENTATION',
        leftLabel: 'Concrete',
        rightLabel: 'Artistic',
        score: 7,
        status: 'Artistic',
        percentile: '69th - 84th percentile',
        signals: [
          'Appreciates beauty in life and art',
          'Has a vivid imagination'
        ]
      },
      {
        title: 'CHANGE ORIENTATION',
        leftLabel: 'Conservative',
        rightLabel: 'Change oriented',
        score: 7,
        status: 'Change oriented',
        percentile: '69th - 84th percentile',
        signals: [
          'Has a strong need for variation',
          'Likes to try new things and change settings'
        ]
      }
    ]
  }
];

export const DEFAULT_KYC = 'DOC_KYC';

export const LITE_KYC = 'KYC-LITE';

export const RECEIVE_ONLY_KYC = 'RECEIVE_ONLY';

export const INSTANT_ACH_KYC = 'INSTANT-ACH';

export const KYB_STANDARD = 'KYB-STANDARD';

export const KYB_LITE = 'KYB-LITE';

export const KYB_RECEIVE_ONLY = 'RECEIVE_ONLY';

export const MAX_UPLOAD_FILE_SIZE = 20971520; // in bytes 20MB

export const PROCESSING_TYPES = [{
    value: 'STANDARD_ACH',
    label: 'STANDARD_ACH'
  },
  {
    value: 'SAME_DAY_ACH',
    label: 'SAME_DAY_ACH'
  }
];

export const KYC_ARRAY = [{
    value: 'DOC_KYC',
    label: 'DOC KYC'
  },
  {
    value: 'KYC-LITE',
    label: 'KYC Lite'
  },
  {
    value: 'RECEIVE_ONLY',
    label: 'Receive Only'
  },
  {
    value: 'INSTANT-ACH',
    label: 'Instant ACH'
  }
];

export const KYB_ARRAY = [{
    value: 'KYB-STANDARD',
    label: 'KYB Standard'
  },
  {
    value: 'KYB-LITE',
    label: 'KYB Lite'
  },
  {
    value: 'RECEIVE_ONLY',
    label: 'Receive Only'
  }
];

export const KYC_REGISTER_FIELDS_ARRAY = [{
    value: 'firstName',
    label: 'First Name'
  },
  {
    value: 'lastName',
    label: 'Last Name'
  },
  {
    value: 'email',
    label: 'Email'
  },
  {
    value: 'phone',
    label: 'Phone Number'
  },
  {
    value: 'dateOfBirth',
    label: 'Date of Birth'
  },
  {
    value: 'ssn',
    label: 'Social Security Number'
  },
  {
    value: 'address',
    label: 'Street Address'
  },
  {
    value: 'city',
    label: 'City'
  },
  {
    value: 'state',
    label: 'State'
  },
  {
    value: 'zip',
    label: 'ZIP'
  }
];

export const KYB_REGISTER_FIELDS_ARRAY = [{
    value: 'entity_name',
    label: 'Legal Company Name'
  },
  {
    value: 'doing_business_as',
    label: 'DBA',
  },
  {
    value: 'address',
    label: 'Street Address'
  },
  {
    value: 'city',
    label: 'City'
  },
  {
    value: 'state',
    label: 'State'
  },
  {
    value: 'zip',
    label: 'Zip Code'
  },
  {
    value: 'phone',
    label: 'Phone Number'
  },
  {
    value: 'ein',
    label: 'Employer ID Number'
  },
  {
    value: 'email',
    label: 'Business Email'
  },
  {
    value: 'business_website',
    label: 'Business Website'
  }
];

export const STATES_ARRAY = [{
    value: 'AL',
    label: 'Alabama'
  },
  {
    value: 'AK',
    label: 'Alaska'
  },
  {
    value: 'AZ',
    label: 'Arizona'
  },
  {
    value: 'AR',
    label: 'Arkansas'
  },
  {
    value: 'CA',
    label: 'California'
  },
  {
    value: 'CO',
    label: 'Colorado'
  },
  {
    value: 'CT',
    label: 'Connecticut'
  },
  {
    value: 'DE',
    label: 'Delaware'
  },
  {
    value: 'DC',
    label: 'District Of Columbia'
  },
  {
    value: 'FL',
    label: 'Florida'
  },
  {
    value: 'GA',
    label: 'Georgia'
  },
  {
    value: 'HI',
    label: 'Hawaii'
  },
  {
    value: 'ID',
    label: 'Idaho'
  },
  {
    value: 'IL',
    label: 'Illinois'
  },
  {
    value: 'IN',
    label: 'Indiana'
  },
  {
    value: 'IA',
    label: 'Iowa'
  },
  {
    value: 'KS',
    label: 'Kansas'
  },
  {
    value: 'KY',
    label: 'Kentucky'
  },
  {
    value: 'LA',
    label: 'Louisiana'
  },
  {
    value: 'ME',
    label: 'Maine'
  },
  {
    value: 'MD',
    label: 'Maryland'
  },
  {
    value: 'MA',
    label: 'Massachusetts'
  },
  {
    value: 'MI',
    label: 'Michigan'
  },
  {
    value: 'MN',
    label: 'Minnesota'
  },
  {
    value: 'MS',
    label: 'Mississippi'
  },
  {
    value: 'MO',
    label: 'Missouri'
  },
  {
    value: 'MT',
    label: 'Montana'
  },
  {
    value: 'NE',
    label: 'Nebraska'
  },
  {
    value: 'NV',
    label: 'Nevada'
  },
  {
    value: 'NH',
    label: 'New Hampshire'
  },
  {
    value: 'NJ',
    label: 'New Jersey'
  },
  {
    value: 'NM',
    label: 'New Mexico'
  },
  {
    value: 'NY',
    label: 'New York'
  },
  {
    value: 'NC',
    label: 'North Carolina'
  },
  {
    value: 'ND',
    label: 'North Dakota'
  },
  {
    value: 'OH',
    label: 'Ohio'
  },
  {
    value: 'OK',
    label: 'Oklahoma'
  },
  {
    value: 'OR',
    label: 'Oregon'
  },
  {
    value: 'PA',
    label: 'Pennsylvania'
  },
  {
    value: 'PR',
    label: 'Puerto Rico'
  },
  {
    value: 'RI',
    label: 'Rhode Island'
  },
  {
    value: 'SC',
    label: 'South Carolina'
  },
  {
    value: 'SD',
    label: 'South Dakota'
  },
  {
    value: 'TN',
    label: 'Tennessee'
  },
  {
    value: 'TX',
    label: 'Texas'
  },
  {
    value: 'UT',
    label: 'Utah'
  },
  {
    value: 'VT',
    label: 'Vermont'
  },
  {
    value: 'VA',
    label: 'Virginia'
  },
  {
    value: 'WA',
    label: 'Washington'
  },
  {
    value: 'WV',
    label: 'West Virginia'
  },
  {
    value: 'WI',
    label: 'Wisconsin'
  },
  {
    value: 'WY',
    label: 'Wyoming'
  }
];

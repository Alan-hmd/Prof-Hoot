import { TeksStandard } from './types';

export const TEKS_DATA: TeksStandard[] = [
  {
    id: '5.2A',
    code: '5.2(A)',
    category: 'Number & Operations',
    description: 'Represent the value of the digit in decimals through the thousandths.',
  },
  {
    id: '5.2B',
    code: '5.2(B)',
    category: 'Number & Operations',
    description: 'Compare and order two decimals to thousandths and represent comparisons using symbols.',
  },
  {
    id: '5.3E',
    code: '5.3(E)',
    category: 'Number & Operations',
    description: 'Solve for products of decimals to the hundredths.',
  },
  {
    id: '5.3K',
    code: '5.3(K)',
    category: 'Algebraic Reasoning',
    description: 'Add and subtract positive rational numbers fluently.',
  },
  {
    id: '5.4B',
    code: '5.4(B)',
    category: 'Algebraic Reasoning',
    description: 'Represent and solve multi-step problems involving the four operations.',
  },
  {
    id: '5.4H',
    code: '5.4(H)',
    category: 'Geometry & Measurement',
    description: 'Represent and solve problems related to perimeter and/or area and related to volume.',
  },
  {
    id: '5.5A',
    code: '5.5(A)',
    category: 'Geometry & Measurement',
    description: 'Classify two-dimensional figures in a hierarchy of sets and subsets using attributes.',
  },
  {
    id: '5.9A',
    code: '5.9(A)',
    category: 'Data Analysis',
    description: 'Represent categorical data with bar graphs or frequency tables.',
  },
  {
    id: '5.9C',
    code: '5.9(C)',
    category: 'Data Analysis',
    description: 'Solve one- and two-step problems using data from a frequency table, dot plot, bar graph, or stem-and-leaf plot.',
  }
];

export const INITIAL_PROGRESS = {
  completedLessons: [],
  quizScores: {},
  stars: 0,
  settings: {
    useTTS: true,
    bgMusic: false,
  }
};

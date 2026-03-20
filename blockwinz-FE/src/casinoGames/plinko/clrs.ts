export const colors = [
  "#FDC93A", // golden yellow – bright, readable
  "#FFB239", // deep golden orange – solid contrast
  "#FF9442", // strong orange – energetic
  "#FF7B2C", // classic Plinko orange
  "#FF5C3A", // warm coral – attention-grabbing
  "#F04545", // bold red – heat rising
  "#D7333D", // intense red – sharp and focused
  "#A7212A", // wine red – danger zone
  "#730F14", // dark crimson – final tier
];

export const ballColors: { [risk: string]: string } = {
  LOW: '#4FC3F7',     // calm sky blue – low risk, stands out softly
  MEDIUM: '#FDC93A',  // golden yellow – moderate risk (your choice)
  HIGH: '#F45D48',    // bold red-orange – high risk, energetic
};

export const PLINKO_OPTIONS = [
  { value: 'LOW', title: 'Low' },
  { value: 'MEDIUM', title: 'Medium' },
  { value: 'HIGH', title: 'High' },
];
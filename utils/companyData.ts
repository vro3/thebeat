
export const FORTUNE_500_TOP_100 = [
    "Walmart", "Amazon", "Apple", "CVS Health", "UnitedHealth Group", "Exxon Mobil", "Berkshire Hathaway", "Alphabet", "McKesson", "Chevron",
    "AmerisourceBergen", "Costco Wholesale", "Microsoft", "Cardinal Health", "Cigna", "Marathon Petroleum", "Phillips 66", "Valero Energy", "Ford Motor", "Home Depot",
    "General Motors", "Elevance Health", "JPMorgan Chase", "Kroger", "Centene", "Verizon Communications", "Walgreens Boots Alliance", "Fannie Mae", "Comcast", "AT&T",
    "Meta Platforms", "Bank of America", "Target", "Dell Technologies", "Archer Daniels Midland", "Citigroup", "United Parcel Service", "Pfizer", "Lowe's", "Johnson & Johnson",
    "FedEx", "Humana", "Energy Transfer", "State Farm Insurance", "Freddie Mac", "PepsiCo", "Wells Fargo", "Walt Disney", "ConocoPhillips", "Procter & Gamble",
    "General Electric", "Albertsons", "MetLife", "Goldman Sachs Group", "Sysco", "Raytheon Technologies", "Boeing", "StoneX Group", "Lockheed Martin", "Morgan Stanley",
    "Intel", "HP", "TD Synnex", "Prudential Financial", "Caterpillar", "Oracle", "Publix Super Markets", "American Express", "General Dynamics", "Nike",
    "Progressive", "Liberty Mutual Insurance Group", "Abbott Laboratories", "Tyson Foods", "Deere", "Cisco Systems", "Merck", "Delta Air Lines", "Nationwide", "TJX",
    "Allstate", "American Airlines Group", "Charter Communications", "Best Buy", "New York Life Insurance", "Salesforce", "HCA Healthcare", "Enterprise Products Partners", "TIAA", "Publix",
    "Philip Morris International", "Thermo Fisher Scientific", "Qualcomm", "Coca-Cola", "MassMutual", "Northrop Grumman", "Travelers", "Arrow Electronics", "Honeywell International", "Capital One Financial"
];

export const checkFortune500 = (companyName: string): boolean => {
    if (!companyName) return false;
    const normalizedInput = companyName.toLowerCase().replace(/inc\.?|corp\.?|corporation|llc|group|technologies/g, '').trim();
    
    return FORTUNE_500_TOP_100.some(f500 => {
        const normalizedF500 = f500.toLowerCase().replace(/inc\.?|corp\.?|corporation|llc|group|technologies/g, '').trim();
        return normalizedInput.includes(normalizedF500) || normalizedF500.includes(normalizedInput);
    });
};

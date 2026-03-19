import { Suspect, SuspectCardData } from "./types";

export const suspects: Suspect[] = [
  // ============================================================================
  // FINANCIAL CRIMES (1-10)
  // ============================================================================
  {
    id: "AX-7829",
    name: "Rajesh Kumar",
    age: 34,
    gender: "male",
    city: "Mumbai",
    address: "B-204, Lotus Apartments, Andheri West",
    phone: "98765-43210",
    occupation: "Senior Accountant",
    employer: "TechCorp Solutions Pvt Ltd",
    income: "₹18,00,000/year",
    maritalStatus: "Married",
    dependents: "Wife (Sunita, 31), Daughter (Aanya, 6)",
    priors: [
      { crime: "Petty Theft", year: 2019, outcome: "6 months probation", details: "Shoplifting electronics worth ₹15,000" }
    ],
    associates: [
      { name: "Deepak Verma", relationship: "Colleague", criminalRecord: false, notes: "Also works in accounts department", vulnerability: "Knows about the invoices, could be charged as accessory" },
      { name: "Sanjay Mehta", relationship: "Childhood friend", criminalRecord: true, notes: "Convicted of fraud in 2017", vulnerability: "Already has fraud conviction, any new association means jail" }
    ],
    currentCase: {
      crime: "Embezzlement",
      description: "Suspected of siphoning company funds through fake vendor invoices over 18 months",
      amount: "₹15,00,000",
      date: "January 2024 - Present",
      location: "TechCorp Solutions office, BKC",
      evidenceSummary: ["Bank transfer records", "Altered invoices", "Witness testimony"],
      evidence: [
        { id: "E1", type: "document", description: "Bank transfer records", strength: "strong", details: "47 transfers to shell company 'RK Enterprises' - company registered to suspect's cousin" },
        { id: "E2", type: "document", description: "Altered invoices", strength: "strong", details: "23 invoices with inflated amounts, original amounts found in email drafts" },
        { id: "E3", type: "testimony", description: "Witness testimony", strength: "moderate", details: "Colleague Deepak noticed discrepancies but was told to 'not worry about it'" },
        { id: "E4", type: "digital", description: "Email evidence", strength: "strong", details: "Emails to cousin discussing 'the arrangement' and 'your cut'" }
      ],
      maxSentence: "7 years imprisonment + full restitution",
      minSentence: "2 years + restitution"
    },
    personality: "Calm exterior, maintains composure, but hands shake when pressed on specifics",
    weakness: "His daughter Aanya - terrified of her finding out",
    interrogationNotes: "Likely to crack if family consequences are emphasized. May try to blame colleague Deepak."
  },
  {
    id: "BK-4521",
    name: "Priya Sharma",
    age: 28,
    gender: "female",
    city: "Delhi",
    address: "Flat 12, Greenview Society, Dwarka Sector 7",
    phone: "99887-76655",
    occupation: "Bank Teller",
    employer: "National Bank of India, Dwarka Branch",
    income: "₹4,80,000/year",
    maritalStatus: "Single",
    dependents: "Mother (Kamla, 62, diabetic)",
    priors: [],
    associates: [
      { name: "Rohit Malhotra", relationship: "Ex-boyfriend", criminalRecord: false, notes: "Branch manager, ended relationship 6 months ago", vulnerability: "As branch manager, negligence charges possible for oversight failure" }
    ],
    currentCase: {
      crime: "Theft",
      description: "Cash missing from her teller drawer over 3 months",
      amount: "₹2,50,000",
      date: "October 2024 - December 2024",
      location: "NBI Dwarka Branch",
      evidenceSummary: ["CCTV footage", "Cash count discrepancies", "Personal account deposits"],
      evidence: [
        { id: "E1", type: "digital", description: "CCTV footage", strength: "moderate", details: "Footage shows suspect at drawer during discrepancy times, but actual theft not captured" },
        { id: "E2", type: "document", description: "Cash count records", strength: "strong", details: "Shortages only occur on her shifts, never on days she's absent" },
        { id: "E3", type: "document", description: "Bank statements", strength: "strong", details: "₹2,35,000 deposited in cash to her account in small amounts over 3 months" },
        { id: "E4", type: "document", description: "Medical bills", strength: "moderate", details: "Mother's dialysis bills totaling ₹3,00,000 in past year" }
      ],
      maxSentence: "3 years imprisonment",
      minSentence: "1 year + restitution + termination"
    },
    personality: "Nervous, clearly scared, first time in trouble",
    weakness: "Mother's medical condition - stole to pay for treatment",
    interrogationNotes: "Sympathetic case. Will likely confess if shown understanding. Genuinely remorseful."
  },
  {
    id: "CM-9012",
    name: "Vikram Singh",
    age: 42,
    gender: "male",
    city: "Jaipur",
    address: "Singh Villa, Civil Lines",
    phone: "94140-12345",
    occupation: "Auto Dealer",
    employer: "Singh Motors (Owner)",
    income: "₹85,00,000/year (declared)",
    maritalStatus: "Married",
    dependents: "Wife, 2 sons (16, 14)",
    priors: [
      { crime: "Fraud", year: 2015, outcome: "2 years suspended sentence", details: "Sold cars with tampered odometers" },
      { crime: "Tax Evasion", year: 2018, outcome: "₹5,00,000 fine", details: "Underreported income by ₹40L" }
    ],
    associates: [
      { name: "Pappu Yadav", relationship: "Fixer", criminalRecord: true, notes: "Known for 'managing' legal troubles", vulnerability: "Multiple warrants pending, bringing him in would be easy" },
      { name: "DCP Rathore", relationship: "Connection", criminalRecord: false, notes: "Allegedly receives monthly payments", vulnerability: "Corruption investigation would end his career" }
    ],
    currentCase: {
      crime: "Hit and Run",
      description: "Struck pedestrian while driving luxury car, fled scene",
      victim: "Arun Patel, 67, retired teacher, critical condition in ICU",
      date: "15th January 2025, 11:45 PM",
      location: "MI Road, near Central Park",
      evidenceSummary: ["Damaged vehicle recovered", "Paint match", "Eyewitness"],
      evidence: [
        { id: "E1", type: "physical", description: "Vehicle damage", strength: "strong", details: "Front bumper damage consistent with pedestrian impact, blood traces being tested" },
        { id: "E2", type: "physical", description: "Paint analysis", strength: "strong", details: "Paint from victim's clothes matches suspect's BMW 5-series" },
        { id: "E3", type: "testimony", description: "Eyewitness", strength: "moderate", details: "Chai vendor saw BMW with JH-01 plates speeding away, partial plate match" },
        { id: "E4", type: "digital", description: "CCTV", strength: "strong", details: "Traffic camera shows his car 500m from accident at 11:43 PM" }
      ],
      maxSentence: "10 years if victim dies (304A IPC)",
      minSentence: "2 years + compensation",
      victimImpact: {
        emotional: "Arun Patel, 67, a retired teacher who spent his life educating children, now lies in ICU unable to recognize his own grandchildren",
        financial: "Family has spent ₹8,00,000 on ICU bills so far. His pension was the family's only income. Wife now dependent on neighbors for food",
        family: "His wife hasn't left the hospital in 2 weeks. Their son flew back from Dubai, losing his job. Grandchildren keep asking when Nana is coming home"
      }
    },
    personality: "Arrogant, entitled, thinks money can fix anything",
    weakness: "Business reputation, sons' future, press coverage",
    interrogationNotes: "Will try to bribe, threaten, name-drop. Press hard on victim's condition."
  },
  {
    id: "DL-3344",
    name: "Anil Kapoor",
    age: 55,
    gender: "male",
    city: "Pune",
    address: "Row House 7, Officers Colony, Kothrud",
    phone: "98220-54321",
    occupation: "Government Clerk",
    employer: "Pune Municipal Corporation",
    income: "₹7,20,000/year",
    maritalStatus: "Married",
    dependents: "Wife, 1 son (married), 1 daughter (college)",
    priors: [],
    associates: [
      { name: "Builder Consortium", relationship: "Bribe sources", criminalRecord: false, notes: "Multiple builders paid for permit fast-tracking" }
    ],
    currentCase: {
      crime: "Bribery & Corruption",
      description: "Accepting bribes to fast-track building permits",
      amount: "₹8,00,000 (recovered), estimated ₹25,00,000 total",
      date: "2022 - Present",
      location: "PMC Building Permissions Dept",
      evidenceSummary: ["Marked currency recovered", "Sting operation recording", "Disproportionate assets"],
      evidence: [
        { id: "E1", type: "physical", description: "Marked currency", strength: "strong", details: "₹2,00,000 in marked notes recovered from desk drawer during raid" },
        { id: "E2", type: "digital", description: "Sting recording", strength: "strong", details: "ACB sting shows him accepting ₹50,000, discussing rates for different permit types" },
        { id: "E3", type: "document", description: "Asset investigation", strength: "strong", details: "Owns 3 flats worth ₹2.5Cr, son's business funded with ₹40L - unexplained" },
        { id: "E4", type: "document", description: "Bank records", strength: "moderate", details: "Regular cash deposits of ₹30-50K, claims 'gifts from relatives'" }
      ],
      maxSentence: "7 years + dismissal + asset forfeiture",
      minSentence: "3 years + dismissal"
    },
    personality: "Defeated, knows he's caught, worried about pension",
    weakness: "30 years of service about to end in disgrace, pension forfeiture",
    interrogationNotes: "Close to breaking. Emphasize loss of pension and family shame. May give up others."
  },
  {
    id: "EF-8877",
    name: "Kavita Deshmukh",
    age: 38,
    gender: "female",
    city: "Nagpur",
    address: "201, Orange Tower, Dharampeth",
    phone: "97654-32100",
    occupation: "Insurance Agent",
    employer: "BharatLife Insurance",
    income: "₹12,00,000/year (commissions)",
    maritalStatus: "Divorced",
    dependents: "Son (12), lives with her",
    priors: [],
    associates: [
      { name: "Dr. Suresh Patil", relationship: "Accomplice", criminalRecord: false, notes: "Provided fake medical certificates", vulnerability: "Already confessed, medical license at stake" }
    ],
    currentCase: {
      crime: "Insurance Fraud",
      description: "Filing fake death claims using forged documents",
      amount: "₹45,00,000 (3 fraudulent claims)",
      date: "2023 - 2024",
      location: "Various",
      evidenceSummary: ["Forged death certificates", "Fake beneficiary accounts", "Doctor's confession"],
      evidence: [
        { id: "E1", type: "document", description: "Death certificates", strength: "strong", details: "3 certificates traced to same printer, 'deceased' persons found alive in villages" },
        { id: "E2", type: "document", description: "Bank accounts", strength: "strong", details: "Beneficiary accounts opened with fake IDs, funds withdrawn to her account" },
        { id: "E3", type: "testimony", description: "Doctor's statement", strength: "strong", details: "Dr. Patil confessed to providing fake certificates for ₹25,000 each" }
      ],
      maxSentence: "7 years + recovery",
      minSentence: "3 years"
    },
    personality: "Manipulative, plays victim, cries on cue",
    weakness: "Son's custody - ex-husband will use this against her",
    interrogationNotes: "Don't fall for tears. She's calculated. Mention impact on son."
  },

  // ============================================================================
  // VIOLENT CRIMES (6-15)
  // ============================================================================
  {
    id: "FG-2233",
    name: "Meera Reddy",
    age: 31,
    gender: "female",
    city: "Hyderabad",
    address: "Flat 8B, Cyber Heights, Madhapur",
    phone: "99000-11223",
    occupation: "Software Engineer",
    employer: "InfoTech Systems",
    income: "₹22,00,000/year",
    maritalStatus: "Single",
    priors: [],
    associates: [],
    currentCase: {
      crime: "Assault",
      description: "Attacked male colleague with scissors and stapler",
      victim: "Suresh Rao, 35, Team Lead - 12 stitches, minor injuries",
      date: "10th January 2025, 3:30 PM",
      location: "InfoTech office, 4th floor",
      evidenceSummary: ["CCTV footage", "Multiple witnesses", "Victim statement"],
      evidence: [
        { id: "E1", type: "digital", description: "CCTV", strength: "strong", details: "Full attack captured - she grabbed scissors, stabbed at his arm, then threw stapler at head" },
        { id: "E2", type: "testimony", description: "Witnesses", strength: "strong", details: "8 colleagues witnessed, all consistent accounts" },
        { id: "E3", type: "testimony", description: "Victim statement", strength: "moderate", details: "Claims attack was unprovoked, denies any harassment" },
        { id: "E4", type: "digital", description: "HR complaints", strength: "moderate", details: "3 harassment complaints filed by Meera against Suresh in past year - all marked 'inconclusive'" }
      ],
      maxSentence: "3 years (Section 324 IPC)",
      minSentence: "Fine + compensation",
      victimImpact: {
        emotional: "Suresh Rao, 35, says he can't sleep without seeing scissors coming at him. Diagnosed with PTSD. Afraid to return to office",
        financial: "₹1,50,000 in medical bills. Lost 3 weeks of work. May need counseling for months",
        family: "His wife is 7 months pregnant. She had a panic attack when she saw his injuries. Their first child will be born to a father afraid of his own workplace"
      }
    },
    personality: "Angry, defensive, feels completely justified",
    weakness: "The harassment she endured - she wants it acknowledged",
    interrogationNotes: "There's a backstory here. HR failed her. May have snapped after prolonged harassment."
  },
  {
    id: "GH-5566",
    name: "Rakesh Tiwari",
    age: 29,
    gender: "male",
    city: "Lucknow",
    address: "Old City, Chowk area",
    phone: "94150-67890",
    occupation: "Unemployed",
    employer: "Previously: Tiwari General Store (family)",
    income: "None (dependent on family)",
    maritalStatus: "Single",
    priors: [
      { crime: "Drunk & Disorderly", year: 2022, outcome: "₹2,000 fine", details: "Bar fight" },
      { crime: "Assault", year: 2023, outcome: "Case withdrawn", details: "Beat neighbor, settled out of court" }
    ],
    associates: [
      { name: "Pappu Gang", relationship: "Local gang", criminalRecord: true, notes: "Small-time criminals, extortion" }
    ],
    currentCase: {
      crime: "Aggravated Assault",
      description: "Beat shopkeeper with iron rod over ₹500 debt",
      victim: "Mohammad Irfan, 52, shopkeeper - fractured skull, arm, hospitalized",
      date: "18th January 2025, 9 PM",
      location: "Irfan Kirana Store, Aminabad",
      evidenceSummary: ["Weapon recovered", "Victim in hospital", "Eyewitnesses"],
      evidence: [
        { id: "E1", type: "physical", description: "Iron rod", strength: "strong", details: "Rod recovered from scene with blood and fingerprints matching suspect" },
        { id: "E2", type: "physical", description: "Victim injuries", strength: "strong", details: "Medical report: skull fracture, broken arm, multiple contusions - 3 weeks hospitalization" },
        { id: "E3", type: "testimony", description: "Eyewitnesses", strength: "strong", details: "5 people saw attack, all identify Rakesh, heard him shouting about money owed" },
        { id: "E4", type: "testimony", description: "Victim statement", strength: "strong", details: "Irfan gave statement from hospital bed - Rakesh demanded ₹500, attacked when refused" }
      ],
      maxSentence: "7 years (Section 326 IPC)",
      minSentence: "3 years",
      victimImpact: {
        emotional: "Mohammad Irfan, 52, a shopkeeper who's served the neighborhood for 25 years. Now flinches when anyone raises their voice. Can't sleep without nightmares",
        financial: "Shop closed for 3 weeks. ₹2,00,000 in hospital bills. Lost regular customers who are afraid to come back",
        family: "His 14-year-old son had to drop out of school to run the shop. Wife hasn't stopped crying since the attack"
      }
    },
    personality: "Aggressive, short fuse, no remorse visible",
    weakness: "His mother - she's been crying since arrest",
    interrogationNotes: "Violent history. Don't provoke physically. Mention mother's distress."
  },
  {
    id: "HI-7788",
    name: "Sunita Devi",
    age: 45,
    gender: "female",
    city: "Patna",
    address: "Village Rampur, Block Danapur",
    phone: "None (uses neighbor's phone)",
    occupation: "Agricultural Laborer",
    employer: "Daily wage work",
    income: "₹60,000/year approx",
    maritalStatus: "Widow",
    dependents: "3 children (18, 15, 12)",
    priors: [],
    associates: [],
    currentCase: {
      crime: "Murder",
      description: "Killed landlord who was harassing her for rent and making advances",
      victim: "Ramesh Prasad, 58, landlord - killed by sickle",
      date: "5th January 2025, evening",
      location: "Victim's house, Rampur",
      evidenceSummary: ["Weapon with fingerprints", "She turned herself in", "Confession"],
      evidence: [
        { id: "E1", type: "physical", description: "Murder weapon", strength: "strong", details: "Sickle with victim's blood and her fingerprints, recovered from scene" },
        { id: "E2", type: "testimony", description: "Confession", strength: "strong", details: "Turned herself in next morning, full confession given" },
        { id: "E3", type: "testimony", description: "Village testimony", strength: "moderate", details: "Multiple villagers aware of landlord's harassment, advances towards her" },
        { id: "E4", type: "document", description: "Rent demands", strength: "moderate", details: "Landlord had threatened eviction, was demanding 'other payment' according to neighbors" }
      ],
      maxSentence: "Life imprisonment (Section 302)",
      minSentence: "7 years (if provocation proven - Section 304)",
      victimImpact: {
        emotional: "Ramesh Prasad was killed by a sickle. His last moments were of terror and pain",
        financial: "His family depended on rental income. Property now tied up in legal proceedings",
        family: "His elderly mother collapsed when she heard. His children are demanding maximum punishment"
      }
    },
    personality: "Quiet, resigned, shows no regret",
    weakness: "Her children - terrified for their future",
    interrogationNotes: "Clear provocation case. She was desperate. Focus on getting full story for defense."
  },
  {
    id: "IJ-9900",
    name: "Farhan Sheikh",
    age: 24,
    gender: "male",
    city: "Mumbai",
    address: "Behrampada, Bandra East",
    phone: "98765-00112",
    occupation: "Delivery Driver",
    employer: "QuickDeliver App",
    income: "₹2,40,000/year",
    maritalStatus: "Single",
    priors: [
      { crime: "Rash Driving", year: 2023, outcome: "License suspended 3 months", details: "Multiple challans" }
    ],
    associates: [],
    currentCase: {
      crime: "Culpable Homicide",
      description: "Speeding on delivery, ran red light, killed cyclist",
      victim: "Ganesh Sawant, 22, college student - died at scene",
      date: "12th January 2025, 7:15 AM",
      location: "SV Road, Bandra",
      evidenceSummary: ["CCTV footage", "App data showing speed", "Eyewitnesses"],
      evidence: [
        { id: "E1", type: "digital", description: "CCTV", strength: "strong", details: "Clear footage of bike running red light at high speed, hitting cyclist" },
        { id: "E2", type: "digital", description: "App tracking data", strength: "strong", details: "GPS shows 65 km/h in 30 km/h zone, completing delivery in impossible time" },
        { id: "E3", type: "testimony", description: "Witnesses", strength: "strong", details: "Multiple witnesses confirm red light violation and speed" },
        { id: "E4", type: "document", description: "Delivery pressure", strength: "moderate", details: "App records show multiple 'late' warnings, pay cuts for slow deliveries" }
      ],
      maxSentence: "10 years (Section 304)",
      minSentence: "2 years",
      victimImpact: {
        emotional: "Ganesh Sawant, 22, was cycling to his morning college class. He died on the road, alone, before the ambulance arrived",
        financial: "His parents took a ₹10,00,000 education loan for his engineering degree. He was in final year, about to start earning",
        family: "His mother hasn't spoken since identifying the body. His father, an autorickshaw driver, can't work — just sits at the accident spot every morning"
      }
    },
    personality: "Devastated, keeps crying, clearly not a criminal",
    weakness: "Guilt is eating him alive - he's suicidal",
    interrogationNotes: "Handle with care. This is a tragedy, not a crime. System pushed him to speed."
  },
  {
    id: "JK-1122",
    name: "Manoj Pandey",
    age: 50,
    gender: "male",
    city: "Varanasi",
    address: "Assi Ghat Road, Lanka",
    phone: "94150-22334",
    occupation: "Priest/Tour Guide",
    income: "₹3,00,000/year (undeclared much higher)",
    maritalStatus: "Married",
    dependents: "Wife, 2 adult sons",
    priors: [
      { crime: "Fraud", year: 2018, outcome: "Case ongoing", details: "Cheating tourist - still in court" }
    ],
    associates: [
      { name: "Ghat Mafia", relationship: "Part of network", criminalRecord: true, notes: "Controls tourist scams at ghats" }
    ],
    currentCase: {
      crime: "Assault & Robbery",
      description: "Beat and robbed foreign tourist",
      victim: "James Morrison, 28, Australian tourist - robbed of ₹80,000, camera, phone",
      date: "20th January 2025, 10 PM",
      location: "Near Dashashwamedh Ghat",
      evidenceSummary: ["Victim identification", "Stolen items recovered", "Accomplice confession"],
      evidence: [
        { id: "E1", type: "testimony", description: "Victim ID", strength: "strong", details: "Morrison positively identified Pandey as the man who offered to guide him, then attacked" },
        { id: "E2", type: "physical", description: "Stolen items", strength: "strong", details: "Camera and phone recovered from Pandey's house during raid" },
        { id: "E3", type: "testimony", description: "Accomplice", strength: "strong", details: "Co-accused Raju confessed, says Pandey planned it, split was 60-40" }
      ],
      maxSentence: "10 years (Robbery with hurt)",
      minSentence: "5 years",
      victimImpact: {
        emotional: "James Morrison, 28, came to India to experience the culture. Left with a broken nose and fear of the country he once loved",
        financial: "Lost ₹80,000 cash, camera worth ₹1,50,000, phone worth ₹90,000. Trip ruined, no travel insurance",
        family: "His parents in Australia are demanding action through the embassy. This is becoming an international incident"
      }
    },
    personality: "Smooth talker, denies everything, plays the holy man",
    weakness: "His reputation in the religious community",
    interrogationNotes: "Professional criminal. Don't buy the priest act. Accomplice already flipped."
  },

  // ============================================================================
  // DUI & TRAFFIC CRIMES (11-15)
  // ============================================================================
  {
    id: "KL-3344",
    name: "Arjun Malhotra",
    age: 26,
    gender: "male",
    city: "Chandigarh",
    address: "Sector 17, House 234",
    phone: "98720-44556",
    occupation: "Marketing Executive",
    employer: "AdWorld Media",
    income: "₹10,00,000/year",
    maritalStatus: "Single",
    priors: [
      { crime: "Drunk Driving", year: 2023, outcome: "₹10,000 fine, license suspended 6 months", details: "0.12% BAC" }
    ],
    associates: [
      { name: "Party circle", relationship: "Friends", criminalRecord: false, notes: "Known for weekend parties" }
    ],
    currentCase: {
      crime: "DUI with Injury",
      description: "Drove drunk, hit scooter, seriously injured rider",
      victim: "Balwinder Kaur, 40, teacher - spinal injury, may be paralyzed",
      date: "25th January 2025, 1:30 AM",
      location: "Sector 22, near market",
      evidenceSummary: ["Blood alcohol 0.15%", "Victim in ICU", "Dashcam from another car"],
      evidence: [
        { id: "E1", type: "physical", description: "Blood test", strength: "strong", details: "BAC 0.15% - almost twice legal limit, tested 2 hours after accident" },
        { id: "E2", type: "physical", description: "Vehicle damage", strength: "strong", details: "His BMW shows clear impact damage consistent with scooter" },
        { id: "E3", type: "digital", description: "Dashcam footage", strength: "strong", details: "Following car's dashcam shows erratic driving before impact" },
        { id: "E4", type: "testimony", description: "Victim", strength: "strong", details: "Balwinder gave statement - he came from wrong side, she had no time to react" }
      ],
      maxSentence: "10 years (if permanent disability proven)",
      minSentence: "2 years",
      victimImpact: {
        emotional: "Balwinder Kaur, 40, a teacher beloved by her students. May never walk again. Lies in ICU staring at the ceiling, unable to feel her legs",
        financial: "₹12,00,000 in hospital bills and counting. She was the sole earner — husband is disabled. School has stopped her salary",
        family: "Her 16-year-old daughter bathes her mother in the hospital. Her disabled husband can't visit because the hospital has no wheelchair ramp"
      }
    },
    personality: "Entitled rich kid, thinks dad's money will fix it",
    weakness: "His father is a known businessman - reputation matters",
    interrogationNotes: "Second DUI offense makes this worse. Father already calling lawyers. Don't let him off easy."
  },
  {
    id: "LM-5566",
    name: "Ravi Shankar",
    age: 35,
    gender: "male",
    city: "Chennai",
    address: "Anna Nagar East, Block G",
    phone: "98410-77889",
    occupation: "Truck Driver",
    employer: "Freelance (owns truck)",
    income: "₹6,00,000/year",
    maritalStatus: "Married",
    dependents: "Wife, 3 children (10, 7, 4)",
    priors: [],
    associates: [],
    currentCase: {
      crime: "Fatal Accident - Negligence",
      description: "Truck crushed autorickshaw, killed 3 passengers",
      victim: "Auto driver + 2 passengers dead",
      date: "22nd January 2025, 6 AM",
      location: "OMR, near IT park",
      evidenceSummary: ["3 fatalities", "Truck had brake issues", "Fled scene initially"],
      evidence: [
        { id: "E1", type: "physical", description: "Vehicle inspection", strength: "strong", details: "Truck brakes found defective - hadn't been serviced in 8 months" },
        { id: "E2", type: "digital", description: "CCTV", strength: "strong", details: "Footage shows truck couldn't stop at signal, crushed auto" },
        { id: "E3", type: "testimony", description: "Fleeing", strength: "moderate", details: "He initially fled, turned himself in 6 hours later" },
        { id: "E4", type: "document", description: "Service records", strength: "strong", details: "No brake service in 8 months despite requirements" }
      ],
      maxSentence: "10 years (causing death by negligence)",
      minSentence: "3 years",
      victimImpact: {
        emotional: "Three people dead. The auto driver was 28, supporting his parents. One passenger was a mother of two. The other was a college student going to an exam",
        financial: "Three families destroyed financially. Combined dependents: 7 children, 4 elderly parents. Funeral costs alone are ₹3,00,000",
        family: "The auto driver's wife is 6 months pregnant — she'll raise the child alone. The college student's twin brother hasn't spoken since the funeral"
      }
    },
    personality: "Broken man, can't stop crying",
    weakness: "He's not a criminal - just cut corners to save money",
    interrogationNotes: "Genuine remorse. Family dependent on him. He knew brakes were bad but couldn't afford repair."
  },

  // ============================================================================
  // DRUGS & CONTRABAND (16-20)
  // ============================================================================
  {
    id: "MN-7788",
    name: "Bunty alias Satish Kumar",
    age: 32,
    gender: "male",
    city: "Delhi",
    address: "Jahangirpuri, Block E",
    phone: "Multiple numbers",
    occupation: "Unemployed (officially)",
    income: "Unknown (substantial cash lifestyle)",
    maritalStatus: "Unmarried",
    priors: [
      { crime: "Drug Possession", year: 2019, outcome: "2 years, released early", details: "50g charas" },
      { crime: "Drug Possession", year: 2022, outcome: "6 months", details: "Small quantity" }
    ],
    associates: [
      { name: "Johny Surat", relationship: "Supplier", criminalRecord: true, notes: "Major dealer, still at large", vulnerability: "Has ₹50 lakh bounty, giving his location means witness protection for Bunty" },
      { name: "Local network", relationship: "Distribution", criminalRecord: true, notes: "5-6 small pushers under him" }
    ],
    currentCase: {
      crime: "Drug Trafficking (NDPS)",
      description: "Caught with 2kg charas, commercial quantity",
      amount: "2.1 kg charas, street value ₹4,00,000",
      date: "28th January 2025",
      location: "Intercepted near Kashmiri Gate ISBT",
      evidenceSummary: ["Drugs recovered from car", "Cash seized", "Phone evidence"],
      evidence: [
        { id: "E1", type: "physical", description: "Drug seizure", strength: "strong", details: "2.1 kg charas found in hidden compartment in car boot" },
        { id: "E2", type: "physical", description: "Cash", strength: "strong", details: "₹1,80,000 cash seized, no explanation for source" },
        { id: "E3", type: "digital", description: "Phone records", strength: "strong", details: "WhatsApp messages discussing 'maal', quantities, payments - classic drug code" },
        { id: "E4", type: "testimony", description: "Informant", strength: "moderate", details: "Tip came from known informant, but identity protected" }
      ],
      maxSentence: "20 years (commercial quantity NDPS)",
      minSentence: "10 years"
    },
    personality: "Street smart, won't give up supplier easily",
    weakness: "Younger brother just started college - doesn't want him dragged in",
    interrogationNotes: "Third offense - looking at serious time. May flip on Johny Surat to reduce sentence."
  },
  {
    id: "NO-9900",
    name: "Pinky Sharma",
    age: 23,
    gender: "female",
    city: "Goa",
    address: "Calangute, tourist area",
    phone: "97640-11223",
    occupation: "Cafe Worker",
    employer: "Beach Shack",
    income: "₹1,80,000/year + tips",
    maritalStatus: "Single",
    priors: [],
    associates: [
      { name: "Mark (Russian)", relationship: "Boyfriend", criminalRecord: true, notes: "Known drug supplier to tourists, currently absconding", vulnerability: "Absconding, Interpol alert — her testimony is the only way to find him" }
    ],
    currentCase: {
      crime: "Drug Peddling",
      description: "Selling ecstasy to tourists at beach parties",
      amount: "50 MDMA pills seized",
      date: "26th January 2025",
      location: "Curlies Beach Shack party",
      evidenceSummary: ["Drugs found on person", "Caught in act", "Customer statements"],
      evidence: [
        { id: "E1", type: "physical", description: "Drug seizure", strength: "strong", details: "50 MDMA pills found in bag, 5 more in pocket mid-transaction" },
        { id: "E2", type: "testimony", description: "Undercover buyer", strength: "strong", details: "Undercover officer bought 3 pills, recorded transaction" },
        { id: "E3", type: "testimony", description: "Tourist statements", strength: "moderate", details: "3 tourists confirm buying from her previously" },
        { id: "E4", type: "digital", description: "Phone", strength: "strong", details: "Messages with 'Mark' discussing supplies, prices, party schedules" }
      ],
      maxSentence: "10 years (NDPS)",
      minSentence: "1 year (if cooperation)"
    },
    personality: "Scared, crying, claims boyfriend made her do it",
    weakness: "Genuinely seems like she was manipulated by boyfriend",
    interrogationNotes: "Small fish. Get her to give up Mark's network. She's not a hardened criminal."
  },

  // ============================================================================
  // DOMESTIC & FAMILY (21-25)
  // ============================================================================
  {
    id: "OP-1122",
    name: "Suresh Gaikwad",
    age: 48,
    gender: "male",
    city: "Kolhapur",
    address: "Rajarampuri, Near Temple",
    phone: "94230-55667",
    occupation: "Factory Supervisor",
    employer: "Gokul Sugar Mills",
    income: "₹5,40,000/year",
    maritalStatus: "Married (separated)",
    dependents: "Estranged wife (42), Daughter (20), Son (17)",
    priors: [
      { crime: "Domestic Violence", year: 2020, outcome: "Warning, case withdrawn", details: "Wife complained, later withdrew" }
    ],
    associates: [],
    currentCase: {
      crime: "Domestic Violence & Stalking",
      description: "Repeatedly beating wife, stalking after she left",
      victim: "Mangala Gaikwad (wife), daughter Pooja",
      date: "Ongoing - latest incident 29th January 2025",
      location: "Wife's parents' house (where she's staying)",
      evidenceSummary: ["Medical reports", "Restraining order violation", "Multiple complaints"],
      evidence: [
        { id: "E1", type: "document", description: "Medical reports", strength: "strong", details: "7 hospital visits by wife in past 2 years - fractures, bruises, burns" },
        { id: "E2", type: "document", description: "Protection order", strength: "strong", details: "Restraining order issued Dec 2024 - violated 4 times since" },
        { id: "E3", type: "testimony", description: "Wife's statement", strength: "strong", details: "Detailed account of 15 years of abuse, escalating violence" },
        { id: "E4", type: "testimony", description: "Daughter's statement", strength: "strong", details: "Pooja confirms abuse, says father threatened to kill mother" }
      ],
      maxSentence: "3 years (DV Act) + stalking charges",
      minSentence: "1 year + permanent restraining order",
      victimImpact: {
        emotional: "Mangala has been beaten for 15 years. She flinches when any man raises his hand. Daughter Pooja has nightmares every night",
        financial: "Mangala has no income, no skills, no savings. Everything is in his name. She and Pooja survive on her parents' pension",
        family: "Pooja dropped out of college to protect her mother. She sleeps with a cricket bat under her pillow. Their 17-year-old son is torn between parents"
      }
    },
    personality: "Alternates between rage and self-pity, blames wife",
    weakness: "Son still talks to him - doesn't want to lose that too",
    interrogationNotes: "Dangerous. He's escalating. Take threats seriously. Get confession for wife's safety."
  },
  {
    id: "PQ-3344",
    name: "Rekha Saxena",
    age: 52,
    gender: "female",
    city: "Kanpur",
    address: "Civil Lines, Old Kanpur",
    phone: "94150-88990",
    occupation: "Homemaker",
    income: "Husband's income (₹30,00,000/year)",
    maritalStatus: "Married",
    dependents: "Husband (55), Son (28, married)",
    priors: [],
    associates: [],
    currentCase: {
      crime: "Dowry Harassment & Abetment to Suicide",
      description: "Daughter-in-law committed suicide, blamed in-laws in note",
      victim: "Neha Saxena (daughter-in-law), 25 - suicide by hanging",
      date: "20th January 2025",
      location: "Family home",
      evidenceSummary: ["Suicide note naming accused", "Victim's family statements", "Previous complaints"],
      evidence: [
        { id: "E1", type: "document", description: "Suicide note", strength: "strong", details: "Note specifically names mother-in-law for constant taunts about dowry, says 'I can't take it anymore'" },
        { id: "E2", type: "testimony", description: "Victim's parents", strength: "strong", details: "Neha had complained to parents about dowry demands, ₹10L more demanded after marriage" },
        { id: "E3", type: "digital", description: "Messages", strength: "strong", details: "WhatsApp messages from Neha to friend detailing daily humiliation" },
        { id: "E4", type: "testimony", description: "Neighbor", strength: "moderate", details: "Heard frequent shouting, Neha crying, mother-in-law's taunts" }
      ],
      maxSentence: "10 years (304B IPC - Dowry death)",
      minSentence: "7 years (minimum under 304B)",
      victimImpact: {
        emotional: "Neha Saxena, 25, wrote in her suicide note: 'I tried everything. They won't stop. I can't breathe in this house.' She hanged herself in the bathroom",
        financial: "Neha's parents spent ₹15,00,000 on the wedding plus ₹10,00,000 in dowry demands after marriage. Now they're spending on lawyers instead of their retirement",
        family: "Neha's mother hasn't eaten in 4 days. Her father keeps reading the suicide note over and over. They had one child. Now they have none"
      }
    },
    personality: "Indignant, denies everything, plays victim herself",
    weakness: "Her son is also charged - she'll do anything to save him",
    interrogationNotes: "The suicide note is damning. She can't deny it. Push on son's involvement."
  },

  // ============================================================================
  // CYBER & FRAUD (26-30)
  // ============================================================================
  {
    id: "QR-5566",
    name: "Rohit Mehra",
    age: 27,
    gender: "male",
    city: "Noida",
    address: "Sector 62, IT hub area",
    phone: "99100-22334",
    occupation: "Freelance Developer",
    income: "Variable (₹8-15L/year)",
    maritalStatus: "Single",
    priors: [],
    associates: [
      { name: "Dark web contacts", relationship: "Online only", criminalRecord: true, notes: "Part of international fraud ring" }
    ],
    currentCase: {
      crime: "Cyber Fraud / Phishing",
      description: "Created fake bank websites, stole credentials of 200+ people",
      amount: "₹35,00,000 stolen from victims",
      date: "2024 - January 2025",
      location: "Online operations from home",
      evidenceSummary: ["Fake websites traced to him", "Stolen funds in crypto", "Victim complaints"],
      evidence: [
        { id: "E1", type: "digital", description: "Website hosting", strength: "strong", details: "3 fake bank sites traced to his hosting account, his code style identified" },
        { id: "E2", type: "digital", description: "Cryptocurrency wallet", strength: "strong", details: "₹22L in crypto traced to wallets he controls" },
        { id: "E3", type: "document", description: "Victim complaints", strength: "strong", details: "247 complaints across states, all link to his fake sites" },
        { id: "E4", type: "digital", description: "Dark web communications", strength: "moderate", details: "Forum posts selling 'fresh credentials' matched to his username" }
      ],
      maxSentence: "7 years (IT Act) + fraud charges",
      minSentence: "3 years"
    },
    personality: "Arrogant about skills, thinks he can't be caught",
    weakness: "Parents have no idea - respectable family",
    interrogationNotes: "Smart but cocky. He'll slip up. He's proud of his 'work' - use that."
  },
  {
    id: "RS-7788",
    name: "Anjali Verma",
    age: 34,
    gender: "female",
    city: "Bangalore",
    address: "HSR Layout, Sector 2",
    phone: "98450-44556",
    occupation: "HR Manager",
    employer: "TechStart Inc",
    income: "₹18,00,000/year",
    maritalStatus: "Single",
    priors: [],
    associates: [],
    currentCase: {
      crime: "Identity Theft & Fraud",
      description: "Used employee data to take loans in their names",
      amount: "₹28,00,000 (loans in 12 employees' names)",
      date: "2023 - 2024",
      location: "Company + various banks",
      evidenceSummary: ["Loan documents with forged signatures", "Access logs to employee data", "Money trail"],
      evidence: [
        { id: "E1", type: "document", description: "Loan applications", strength: "strong", details: "12 loans, all from employees who had recently joined, all money to accounts she controlled" },
        { id: "E2", type: "digital", description: "System access logs", strength: "strong", details: "She accessed these specific employees' Aadhaar, PAN from HR system" },
        { id: "E3", type: "document", description: "Money trail", strength: "strong", details: "Funds from 8 loan accounts transferred to her sister's account" },
        { id: "E4", type: "testimony", description: "Victims", strength: "strong", details: "12 employees confirm they never applied for loans, discovered via CIBIL alerts" }
      ],
      maxSentence: "7 years (identity theft, fraud, forgery)",
      minSentence: "3 years"
    },
    personality: "Polished, professional, maintains innocence calmly",
    weakness: "Career reputation, she's built a good life that's now ruined",
    interrogationNotes: "Very composed. The evidence is overwhelming though. She knows it."
  },
  {
    id: "ST-9900",
    name: "Mohammed Rizwan",
    age: 22,
    gender: "male",
    city: "Hyderabad",
    address: "Tolichowki, near ISB",
    phone: "99890-55667",
    occupation: "College Student",
    income: "Parents' support",
    maritalStatus: "Single",
    priors: [],
    associates: [
      { name: "College friends", relationship: "Co-accused", criminalRecord: false, notes: "3 others also arrested", vulnerability: "3 co-accused already arrested, they're talking — whoever cooperates first gets the best deal" }
    ],
    currentCase: {
      crime: "Exam Paper Leak",
      description: "Part of group that leaked university exam papers",
      amount: "₹5,000-15,000 charged per paper",
      date: "November 2024 - January 2025",
      location: "Online + campus",
      evidenceSummary: ["Leaked papers on his phone", "Payment receipts", "Buyer testimonies"],
      evidence: [
        { id: "E1", type: "digital", description: "Phone data", strength: "strong", details: "6 exam papers found in phone, WhatsApp groups with 400+ students" },
        { id: "E2", type: "digital", description: "Payment records", strength: "strong", details: "₹1,80,000 received via UPI in 3 months, all from students" },
        { id: "E3", type: "testimony", description: "Buyers", strength: "strong", details: "15 students already confessed to buying papers from him" },
        { id: "E4", type: "testimony", description: "Source", strength: "moderate", details: "Papers came from exam office - insider suspected but not identified" }
      ],
      maxSentence: "3 years (unfair means act)",
      minSentence: "1 year + expulsion"
    },
    personality: "Scared kid, didn't think this was serious",
    weakness: "Parents are devastated, he's from a good family",
    interrogationNotes: "Small player. Get him to identify the source inside exam office. That's the big fish."
  },
  {
    id: "UV-1122",
    name: "Deepak Sharma",
    age: 40,
    gender: "male",
    city: "Ahmedabad",
    address: "Satellite, near Iscon Temple",
    phone: "98250-77889",
    occupation: "Real Estate Agent",
    employer: "Self-employed",
    income: "₹25,00,000/year (declared)",
    maritalStatus: "Married",
    dependents: "Wife, 2 children (14, 11)",
    priors: [
      { crime: "Cheating", year: 2017, outcome: "Acquitted", details: "Case didn't hold up in court" }
    ],
    associates: [
      { name: "Builder nexus", relationship: "Business partners", criminalRecord: true, notes: "Multiple ongoing cases against them" }
    ],
    currentCase: {
      crime: "Cheating & Forgery",
      description: "Sold same plot to 4 different buyers using forged documents",
      amount: "₹2,40,00,000 (4 sales of same ₹60L plot)",
      date: "2022 - 2024",
      location: "Various (plot in Sanand)",
      evidenceSummary: ["4 sale deeds for same plot", "Forged NOCs", "Victim complaints"],
      evidence: [
        { id: "E1", type: "document", description: "Sale deeds", strength: "strong", details: "4 registered sale deeds, all signed by him as agent, same plot number" },
        { id: "E2", type: "document", description: "Forged documents", strength: "strong", details: "NOCs and clearances all forged - verified with original authorities" },
        { id: "E3", type: "testimony", description: "Victims", strength: "strong", details: "4 buyers, all paid full amount, none knew about others" },
        { id: "E4", type: "digital", description: "Bank records", strength: "strong", details: "All payments traced to his accounts, then cash withdrawals" }
      ],
      maxSentence: "7 years (Section 420 + forgery)",
      minSentence: "3 years + full restitution"
    },
    personality: "Smooth talker, trying to negotiate, offers to 'settle'",
    weakness: "His children - they don't know what their father does",
    interrogationNotes: "Repeat offender (even if acquitted before). This time evidence is solid. No settlement possible."
  },
  {
    id: "WX-3344",
    name: "Lakshmi Narayan",
    age: 62,
    gender: "male",
    city: "Coimbatore",
    address: "RS Puram, near VOC Park",
    phone: "94430-99001",
    occupation: "Retired Bank Manager",
    income: "Pension ₹60,000/month",
    maritalStatus: "Widower",
    dependents: "None (children abroad)",
    priors: [],
    associates: [
      { name: "Call center gang", relationship: "Recruited by them", criminalRecord: true, notes: "Organized fraud ring" }
    ],
    currentCase: {
      crime: "Money Laundering",
      description: "Bank account used to funnel scam money",
      amount: "₹1,20,00,000 passed through his accounts",
      date: "2024",
      location: "His bank accounts",
      evidenceSummary: ["Suspicious transactions", "Linked to known scam", "Large cash withdrawals"],
      evidence: [
        { id: "E1", type: "document", description: "Bank statements", strength: "strong", details: "₹1.2Cr credited and withdrawn in cash over 8 months - pattern matches known scam" },
        { id: "E2", type: "digital", description: "Scam link", strength: "strong", details: "Funds traced from victims of 'IRS scam' - they were told to transfer to his account" },
        { id: "E3", type: "testimony", description: "His statement", strength: "moderate", details: "Claims he was told it was 'investment scheme', kept 2% commission" },
        { id: "E4", type: "document", description: "Commission", strength: "strong", details: "₹2,40,000 retained by him - confirms knowing participation" }
      ],
      maxSentence: "7 years (PMLA) + 10 years (fraud)",
      minSentence: "3 years"
    },
    personality: "Confused old man act, but he knew what he was doing",
    weakness: "His reputation as former bank manager, community standing",
    interrogationNotes: "He's not innocent - he knew. Former bank manager understands suspicious transactions. Get him to identify the recruiters."
  }
];

// Helper function to get random suspect
export function getRandomSuspect(): Suspect {
  const index = Math.floor(Math.random() * suspects.length);
  return suspects[index];
}

// Helper to get suspect by ID
export function getSuspectById(id: string): Suspect | undefined {
  return suspects.find(s => s.id === id);
}

// Client-safe suspect card data
// This file contains minimal data for UI display - IDs must match suspects array

export const suspectCards: SuspectCardData[] = [
  // Financial Crimes
  {
    id: "AX-7829",
    name: "Rajesh Kumar",
    age: 34,
    gender: "Male",
    city: "Mumbai",
    occupation: "Senior Accountant",
    employer: "TechCorp Solutions",
    priorCount: 1,
    currentCrime: "Embezzlement",
    caseAmount: "₹15,00,000",
    maxSentence: "7 years",
  },
  {
    id: "BK-4521",
    name: "Priya Sharma",
    age: 28,
    gender: "Female",
    city: "Delhi",
    occupation: "Bank Teller",
    employer: "National Bank of India",
    priorCount: 0,
    currentCrime: "Theft",
    caseAmount: "₹2,50,000",
    maxSentence: "3 years",
  },
  {
    id: "CM-9012",
    name: "Vikram Singh",
    age: 42,
    gender: "Male",
    city: "Jaipur",
    occupation: "Auto Dealer",
    employer: "Singh Motors",
    priorCount: 2,
    currentCrime: "Hit and Run",
    maxSentence: "10 years",
  },
  {
    id: "DL-3344",
    name: "Anil Kapoor",
    age: 55,
    gender: "Male",
    city: "Pune",
    occupation: "Government Clerk",
    employer: "Pune Municipal Corporation",
    priorCount: 0,
    currentCrime: "Bribery & Corruption",
    caseAmount: "₹25,00,000",
    maxSentence: "7 years",
  },
  {
    id: "EF-8877",
    name: "Kavita Deshmukh",
    age: 38,
    gender: "Female",
    city: "Nagpur",
    occupation: "Insurance Agent",
    employer: "BharatLife Insurance",
    priorCount: 0,
    currentCrime: "Insurance Fraud",
    caseAmount: "₹45,00,000",
    maxSentence: "7 years",
  },
  // Violent Crimes
  {
    id: "FG-2233",
    name: "Meera Reddy",
    age: 31,
    gender: "Female",
    city: "Hyderabad",
    occupation: "Software Engineer",
    employer: "InfoTech Systems",
    priorCount: 0,
    currentCrime: "Assault",
    maxSentence: "3 years",
  },
  {
    id: "GH-5566",
    name: "Rakesh Tiwari",
    age: 29,
    gender: "Male",
    city: "Lucknow",
    occupation: "Unemployed",
    priorCount: 2,
    currentCrime: "Aggravated Assault",
    maxSentence: "7 years",
  },
  {
    id: "HI-7788",
    name: "Sunita Devi",
    age: 45,
    gender: "Female",
    city: "Patna",
    occupation: "Agricultural Laborer",
    priorCount: 0,
    currentCrime: "Murder",
    maxSentence: "Life imprisonment",
  },
  {
    id: "IJ-9900",
    name: "Farhan Sheikh",
    age: 24,
    gender: "Male",
    city: "Mumbai",
    occupation: "Delivery Driver",
    employer: "QuickDeliver App",
    priorCount: 1,
    currentCrime: "Culpable Homicide",
    maxSentence: "10 years",
  },
  {
    id: "JK-1122",
    name: "Manoj Pandey",
    age: 50,
    gender: "Male",
    city: "Varanasi",
    occupation: "Priest/Tour Guide",
    priorCount: 1,
    currentCrime: "Assault & Robbery",
    caseAmount: "₹80,000",
    maxSentence: "10 years",
  },
  // DUI & Traffic Crimes
  {
    id: "KL-3344",
    name: "Arjun Malhotra",
    age: 26,
    gender: "Male",
    city: "Chandigarh",
    occupation: "Marketing Executive",
    employer: "AdWorld Media",
    priorCount: 1,
    currentCrime: "DUI with Injury",
    maxSentence: "10 years",
  },
  {
    id: "LM-5566",
    name: "Ravi Shankar",
    age: 35,
    gender: "Male",
    city: "Chennai",
    occupation: "Truck Driver",
    priorCount: 0,
    currentCrime: "Fatal Accident - Negligence",
    maxSentence: "10 years",
  },
  // Drugs & Contraband
  {
    id: "MN-7788",
    name: "Bunty alias Satish Kumar",
    age: 32,
    gender: "Male",
    city: "Delhi",
    occupation: "Unemployed",
    priorCount: 2,
    currentCrime: "Drug Trafficking",
    caseAmount: "₹4,00,000",
    maxSentence: "20 years",
  },
  {
    id: "NO-9900",
    name: "Pinky Sharma",
    age: 23,
    gender: "Female",
    city: "Goa",
    occupation: "Cafe Worker",
    employer: "Beach Shack",
    priorCount: 0,
    currentCrime: "Drug Peddling",
    maxSentence: "10 years",
  },
  // Domestic & Family
  {
    id: "OP-1122",
    name: "Suresh Gaikwad",
    age: 48,
    gender: "Male",
    city: "Kolhapur",
    occupation: "Factory Supervisor",
    employer: "Gokul Sugar Mills",
    priorCount: 1,
    currentCrime: "Domestic Violence & Stalking",
    maxSentence: "3 years",
  },
  {
    id: "PQ-3344",
    name: "Rekha Saxena",
    age: 52,
    gender: "Female",
    city: "Kanpur",
    occupation: "Homemaker",
    priorCount: 0,
    currentCrime: "Dowry Harassment",
    maxSentence: "10 years",
  },
  // Cyber & Fraud
  {
    id: "QR-5566",
    name: "Rohit Mehra",
    age: 27,
    gender: "Male",
    city: "Noida",
    occupation: "Freelance Developer",
    priorCount: 0,
    currentCrime: "Cyber Fraud / Phishing",
    caseAmount: "₹35,00,000",
    maxSentence: "7 years",
  },
  {
    id: "RS-7788",
    name: "Anjali Verma",
    age: 34,
    gender: "Female",
    city: "Bangalore",
    occupation: "HR Manager",
    employer: "TechStart Inc",
    priorCount: 0,
    currentCrime: "Identity Theft & Fraud",
    caseAmount: "₹28,00,000",
    maxSentence: "7 years",
  },
  {
    id: "ST-9900",
    name: "Mohammed Rizwan",
    age: 22,
    gender: "Male",
    city: "Hyderabad",
    occupation: "College Student",
    priorCount: 0,
    currentCrime: "Exam Paper Leak",
    maxSentence: "3 years",
  },
  {
    id: "UV-1122",
    name: "Deepak Sharma",
    age: 40,
    gender: "Male",
    city: "Ahmedabad",
    occupation: "Real Estate Agent",
    priorCount: 1,
    currentCrime: "Cheating & Forgery",
    caseAmount: "₹2,40,00,000",
    maxSentence: "7 years",
  },
  {
    id: "WX-3344",
    name: "Lakshmi Narayan",
    age: 62,
    gender: "Male",
    city: "Coimbatore",
    occupation: "Retired Bank Manager",
    priorCount: 0,
    currentCrime: "Money Laundering",
    caseAmount: "₹1,20,00,000",
    maxSentence: "17 years",
  },
];

// Get random suspect card
export function getRandomSuspectCard(): SuspectCardData {
  const index = Math.floor(Math.random() * suspectCards.length);
  return suspectCards[index];
}


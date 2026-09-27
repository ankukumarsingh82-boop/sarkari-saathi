import type { Scheme } from "./types";

/**
 * Curated central-scheme knowledge base.
 * Summaries are original paraphrases. Figures appear only when read from the
 * cited official page on sourceCheckedOn. Nothing here is submitted to a portal.
 */
export const SOURCE_CHECKED_ON = "2026-09-27";

export const schemes: Scheme[] = [
  {
    id: "pm-kisan",
    nameHi: "पीएम किसान सम्मान निधि",
    nameEn: "PM-KISAN",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    benefitHi:
      "ज़मीन रखने वाले किसान परिवार को साल में 6,000 रुपये की आय सहायता मिलती है। यह रकम तीन बराबर किस्तों में 2,000 रुपये के रूप में, आधार से जुड़े बैंक खाते में सीधे आती है।",
    benefitEn:
      "A landholding farmer family receives income support of ₹6,000 a year, paid in three equal instalments of ₹2,000 into an Aadhaar-seeded bank account.",
    eligibilityHi: [
      "लाभ किसान परिवार को मिलता है, जिसके पास खेती की ज़मीन हो। परिवार का मतलब पति, पत्नी और नाबालिग बच्चे हैं।",
      "राज्य या केन्द्रशासित प्रदेश योजना के दिशा-निर्देशों के अनुसार पात्र परिवारों की पहचान करता है।",
      "ये लोग बाहर हैं: संस्थागत ज़मीन धारक; संवैधानिक पद, मंत्री, सांसद, विधायक, मेयर या ज़िला पंचायत अध्यक्ष (वर्तमान या पूर्व); सरकारी कर्मचारी और पेंशनभोगी (मल्टी-टास्किंग स्टाफ, क्लास IV और ग्रुप D को छोड़कर) जिनकी मासिक पेंशन 10,000 रुपये या अधिक हो; पिछले निर्धारण वर्ष में इनकम टैक्स भरने वाले; और प्रैक्टिस करने वाले डॉक्टर, इंजीनियर, वकील, चार्टर्ड अकाउंटेंट या आर्किटेक्ट।",
    ],
    eligibilityEn: [
      "Support is for a landholding farmer family. A family means husband, wife and minor children.",
      "States and UTs identify eligible families under the scheme guidelines.",
      "Excluded: institutional landholders; present or former holders of constitutional posts, ministers, MPs, MLAs, mayors and district panchayat chairpersons; government employees and pensioners (except MTS / Class IV / Group D) whose monthly pension is ₹10,000 or more; anyone who paid income tax in the last assessment year; and practising doctors, engineers, lawyers, chartered accountants and architects.",
    ],
    documentsHi: [
      "आधार",
      "खेती की ज़मीन का राजस्व रिकॉर्ड",
      "आधार से जुड़ा बैंक खाता",
      "ई-केवाईसी, जो पोर्टल पर अनिवार्य है",
    ],
    documentsEn: [
      "Aadhaar",
      "Cultivable land record",
      "Aadhaar-seeded bank account",
      "eKYC, which the portal marks as mandatory",
    ],
    summaryHi:
      "पीएम किसान उन परिवारों के लिए है जिनके पास खेती की ज़मीन है। साल में 6,000 रुपये, तीन किस्तों में, बैंक खाते में आते हैं। इनकम टैक्स भरने वाले और ऊपर लिखे उच्च-आय वर्ग इस योजना से बाहर हैं। ज़मीन का रिकॉर्ड राज्य जाँचता है।",
    summaryEn:
      "PM-KISAN is income support for families that hold cultivable land: ₹6,000 a year in three instalments. Income-tax payers and the other higher-status groups listed in the guidelines are excluded. The state checks the land record.",
    officialUrl: "https://www.pmkisan.gov.in/",
    sourceUrl: "https://www.pmkisan.gov.in/",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "pm-kisan", weight: 5 },
      { phrase: "pm kisan", weight: 5 },
      { phrase: "pmkisan", weight: 5 },
      { phrase: "kisan samman", weight: 5 },
      { phrase: "किसान सम्मान", weight: 5 },
      { phrase: "पीएम किसान", weight: 5 },
      { phrase: "किसान योजना", weight: 4 },
      { phrase: "kisan yojana", weight: 4 },
      { phrase: "kisaan", weight: 3 },
      { phrase: "kisan", weight: 3 },
      { phrase: "किसान", weight: 3 },
      { phrase: "kheti", weight: 2 },
      { phrase: "खेती", weight: 2 },
      { phrase: "farmer", weight: 3 },
      { phrase: "fasal", weight: 1 },
    ],
  },
  {
    id: "ab-pmjay",
    nameHi: "आयुष्मान भारत पीएम-जय",
    nameEn: "Ayushman Bharat PM-JAY",
    ministry: "National Health Authority, Ministry of Health and Family Welfare",
    benefitHi:
      "पात्र परिवार को साल में 5 लाख रुपये तक का स्वास्थ्य कवर मिलता है, अस्पताल में भर्ती के लिए। यह कवर पूरे परिवार पर है, परिवार के आकार या उम्र की कोई सीमा नहीं है, और पहले से मौजूद बीमारी भी पहले दिन से शामिल है। 70 वर्ष और उससे अधिक उम्र के वरिष्ठ नागरिकों को सामाजिक-आर्थिक स्थिति से अलग कवर में शामिल किया गया है।",
    benefitEn:
      "An eligible family gets a health cover of ₹5 lakh a year for hospitalisation, on a family-floater basis, with no cap on family size or age, and pre-existing diseases covered from day one. Senior citizens aged 70 years and above are covered irrespective of socio-economic status.",
    eligibilityHi: [
      "शुरुआती सूची सामाजिक-आर्थिक जाति जनगणना 2011 के अभाव और व्यवसाय मानदंडों पर बनी थी। लाभार्थी आधार बाद में बढ़ाया गया।",
      "70 वर्ष या उससे अधिक उम्र के वरिष्ठ नागरिक सामाजिक-आर्थिक स्थिति से अलग शामिल हैं।",
      "नाम योजना की लाभार्थी सूची में होना चाहिए। अंतिम जाँच आयुष्मान पोर्टल या अस्पताल में होती है।",
    ],
    eligibilityEn: [
      "The original list used SECC 2011 deprivation and occupational criteria. The beneficiary base was later expanded.",
      "Senior citizens aged 70 and above are included irrespective of socio-economic status.",
      "The person's name has to be on the beneficiary list. The final check is on the Ayushman portal or at an empanelled hospital.",
    ],
    documentsHi: [
      "आधार या योजना में मान्य पहचान पत्र",
      "मोबाइल नंबर, ई-केवाईसी के लिए",
      "आयुष्मान कार्ड, अगर पहले से बना हो",
    ],
    documentsEn: [
      "Aadhaar or an identity document accepted by the scheme",
      "Mobile number for eKYC",
      "Ayushman card, if already issued",
    ],
    summaryHi:
      "आयुष्मान भारत गरीब और कमज़ोर परिवारों के अस्पताल खर्च के लिए है। पात्र परिवार को साल में 5 लाख रुपये तक का कैशलेस इलाज मिल सकता है। 70 साल या उससे ऊपर की उम्र अपने आप इस कवर की ओर ले जाती है, फिर भी कार्ड पोर्टल पर ही बनता है।",
    summaryEn:
      "Ayushman Bharat covers hospital costs for poor and vulnerable families, up to ₹5 lakh a year. Age 70 or above brings a person into the cover regardless of income, but the card is still issued on the official portal.",
    officialUrl: "https://nha.gov.in/PM-JAY",
    sourceUrl: "https://nha.gov.in/PM-JAY",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "ayushman", weight: 5 },
      { phrase: "pmjay", weight: 5 },
      { phrase: "pm-jay", weight: 5 },
      { phrase: "आयुष्मान", weight: 5 },
      { phrase: "जन आरोग्य", weight: 4 },
      { phrase: "स्वास्थ्य बीमा", weight: 4 },
      { phrase: "health insurance", weight: 3 },
      { phrase: "अस्पताल", weight: 3 },
      { phrase: "इलाज", weight: 3 },
      { phrase: "ilaj", weight: 3 },
      { phrase: "hospital", weight: 2 },
      { phrase: "bimar", weight: 2 },
      { phrase: "बीमारी", weight: 2 },
      { phrase: "operation", weight: 1 },
    ],
  },
  {
    id: "pmay-g",
    nameHi: "प्रधानमंत्री आवास योजना (ग्रामीण)",
    nameEn: "PM Awas Yojana — Gramin",
    ministry: "Ministry of Rural Development",
    benefitHi:
      "पात्र ग्रामीण परिवार को पक्का मकान बनाने के लिए इकाई सहायता मिलती है: मैदानी इलाकों में 1.20 लाख रुपये, और पूर्वोत्तर राज्यों तथा पहाड़ी राज्यों (जम्मू-कश्मीर और लद्दाख सहित) में 1.30 लाख रुपये। शौचालय के लिए अन्य योजनाओं से 12,000 रुपये का अभिसरण भी बताया गया है।",
    benefitEn:
      "An eligible rural household gets unit assistance to build a pucca house: ₹1.20 lakh in plain areas and ₹1.30 lakh in North-Eastern states and hill states, including Jammu & Kashmir and Ladakh. Convergence support of ₹12,000 for a toilet is also described in the scheme material.",
    eligibilityHi: [
      "लक्ष्य वे ग्रामीण परिवार हैं जो बेघर हों, या जिनके कच्चे दीवार और कच्ची छत वाले घर में शून्य, एक या दो कमरे हों। पहचान एसईसीसी 2011 और आवास+ सर्वे पर होती है, फिर ग्राम सभा जाँच करती है।",
      "पक्का मकान पहले से हो तो यह सहायता नहीं बनती। शहर की आवास योजना अलग है।",
    ],
    eligibilityEn: [
      "The target is a rural household that is houseless, or living in a zero, one or two room house with kutcha walls and a kutcha roof. Identification uses SECC 2011 and the Awaas+ survey, followed by Gram Sabha verification.",
      "A household that already has a pucca house is not the target. The urban housing mission is a different scheme.",
    ],
    documentsHi: [
      "आधार",
      "ग्राम सभा या सर्वे में नाम का प्रमाण",
      "बैंक खाता",
      "जॉब कार्ड, जहाँ मज़दूरी का अभिसरण लागू हो",
    ],
    documentsEn: [
      "Aadhaar",
      "Proof of inclusion in the Gram Sabha or survey list",
      "Bank account",
      "Job card, where wage convergence applies",
    ],
    summaryHi:
      "पीएमएवाई ग्रामीण बेघर या कच्चे मकान वाले गाँव के परिवार के लिए पक्का घर बनाने की सहायता है। नाम सर्वे और ग्राम सभा से तय होता है। मैदान में 1.20 लाख और पहाड़ी या पूर्वोत्तर क्षेत्रों में 1.30 लाख रुपये की इकाई सहायता आधिकारिक सामग्री में दर्ज है।",
    summaryEn:
      "PMAY-G helps a rural family that is houseless or living in a kutcha house to build a pucca one. The name has to be on the survey and Gram Sabha list. Official material records unit assistance of ₹1.20 lakh in the plains and ₹1.30 lakh in hill and North-Eastern areas.",
    officialUrl: "https://pmayg.dord.gov.in/",
    sourceUrl: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2148468",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "pmay-g", weight: 5 },
      { phrase: "pmay", weight: 4 },
      { phrase: "awas yojana", weight: 5 },
      { phrase: "aawas", weight: 4 },
      { phrase: "आवास योजना", weight: 5 },
      { phrase: "प्रधानमंत्री आवास", weight: 5 },
      { phrase: "pm awas", weight: 4 },
      { phrase: "कच्चा मकान", weight: 4 },
      { phrase: "kachcha", weight: 3 },
      { phrase: "kaccha ghar", weight: 4 },
      { phrase: "मकान योजना", weight: 4 },
      { phrase: "ghar chahiye", weight: 3 },
      { phrase: "houseless", weight: 3 },
      { phrase: "बेघर", weight: 3 },
    ],
  },
  {
    id: "pmuy",
    nameHi: "प्रधानमंत्री उज्ज्वला योजना",
    nameEn: "PM Ujjwala Yojana",
    ministry: "Ministry of Petroleum and Natural Gas",
    benefitHi:
      "पात्र महिला के नाम पर एलपीजी कनेक्शन। आधिकारिक पृष्ठ के अनुसार आवेदन वही महिला कर सकती है, और घर में किसी तेल कंपनी का दूसरा एलपीजी कनेक्शन नहीं होना चाहिए।",
    benefitEn:
      "An LPG connection in the name of an eligible woman. The official page says the applicant must be that woman, and the household must not already have an LPG connection from an oil company.",
    eligibilityHi: [
      "आवेदक महिला हो और 18 वर्ष की उम्र पूरी कर चुकी हो।",
      "उसी घर में किसी तेल विपणन कंपनी का दूसरा एलपीजी कनेक्शन न हो।",
      "निर्धारित प्रारूप में वंचना घोषणा के आधार पर परिवार गरीब घराना हो।",
    ],
    eligibilityEn: [
      "The applicant must be a woman who has attained 18 years of age.",
      "There should be no other LPG connection from any oil marketing company in the same household.",
      "The adult woman must belong to a poor household on the basis of the prescribed deprivation declaration.",
    ],
    documentsHi: [
      "केवाईसी फ़ॉर्म",
      "आवेदक का आधार",
      "पते का प्रमाण, अगर आधार का पता वर्तमान पते से अलग हो",
      "राशन कार्ड या परिवार का राज्य प्रमाण",
      "बैंक खाता",
      "वंचना घोषणा",
    ],
    documentsEn: [
      "KYC form",
      "Aadhaar of the applicant",
      "Address proof if the Aadhaar address is not the current address",
      "Ration card or a state document of family composition",
      "Bank account",
      "Deprivation declaration",
    ],
    summaryHi:
      "उज्ज्वला गरीब घर की महिला के नाम पर रसोई गैस कनेक्शन है। उम्र कम से कम 18 साल होनी चाहिए और घर में पहले से एलपीजी कनेक्शन नहीं होना चाहिए। गरीबी की जाँच घोषणा पत्र से होती है।",
    summaryEn:
      "Ujjwala is an LPG connection in the name of a woman from a poor household. She must be at least 18, and the household must not already have an LPG connection. Poverty is recorded through the deprivation declaration.",
    officialUrl: "https://www.pmuy.gov.in/ujjwala2.html",
    sourceUrl: "https://www.pmuy.gov.in/ujjwala2.html",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    helpline: "1800-266-6696",
    keywords: [
      { phrase: "ujjwala", weight: 5 },
      { phrase: "ujwala", weight: 4 },
      { phrase: "उज्ज्वला", weight: 5 },
      { phrase: "उज्जवला", weight: 5 },
      { phrase: "lpg", weight: 4 },
      { phrase: "गैस कनेक्शन", weight: 5 },
      { phrase: "gas connection", weight: 4 },
      { phrase: "सिलेंडर", weight: 3 },
      { phrase: "cylinder", weight: 2 },
      { phrase: "चूल्हा", weight: 3 },
      { phrase: "chulha", weight: 3 },
      { phrase: "रसोई गैस", weight: 4 },
    ],
  },
  {
    id: "ssy",
    nameHi: "सुकन्या समृद्धि खाता",
    nameEn: "Sukanya Samriddhi Account",
    ministry: "Department of Economic Affairs / India Post and authorised banks",
    benefitHi:
      "बालिका के नाम पर छोटी बचत खाता। एक वित्तीय वर्ष में कम से कम 250 रुपये और अधिक से अधिक 1,50,000 रुपये जमा हो सकते हैं। जमा खाता खुलने से 15 वर्ष तक चल सकता है। परिपक्वता खाता खुलने के 21 वर्ष पर है।",
    benefitEn:
      "A small-savings account in a girl child's name. Deposits in a financial year are at least ₹250 and at most ₹1,50,000. Deposits can be made for up to 15 years from opening. Maturity is 21 years from the date of opening.",
    eligibilityHi: [
      "खाता अभिभावक, उस बालिका के नाम खोलता है जिसने खाता खोलने की तारीख को दस वर्ष की उम्र पूरी नहीं की हो।",
      "एक बालिका का एक ही खाता। एक परिवार में सामान्यतः दो बालिकाओं तक। जुड़वाँ या तीन बच्चों के मामले में शपथपत्र और जन्म प्रमाण के साथ अपवाद है।",
    ],
    eligibilityEn: [
      "A guardian opens the account for a girl who has not attained the age of ten on the date of opening.",
      "One account per girl. Normally up to two girls in a family, with an exception for twins or triplets supported by an affidavit and birth certificates.",
    ],
    documentsHi: [
      "बालिका का जन्म प्रमाण पत्र",
      "अभिभावक का पहचान और पते का प्रमाण",
      "खाता खोलने का फ़ॉर्म",
      "पहली जमा, कम से कम 250 रुपये",
    ],
    documentsEn: [
      "Birth certificate of the girl",
      "Guardian's identity and address proof",
      "Account opening form",
      "Initial deposit of at least ₹250",
    ],
    summaryHi:
      "सुकन्या समृद्धि दस साल से छोटी बालिका के नाम की बचत है। माँ या पिता डाकघर या अधिकृत बैंक में खाता खोलते हैं। साल में कम से कम 250 रुपये डालने होते हैं, और एक साल में 1.5 लाख से ज्यादा ब्याज वाली जमा नहीं बनती।",
    summaryEn:
      "Sukanya Samriddhi is a savings account for a girl who is still under ten. A parent opens it at a post office or an authorised bank. The year needs at least ₹250, and deposits above ₹1.5 lakh in a year do not earn interest.",
    officialUrl:
      "https://www.indiapost.gov.in/documents/offerings/schemesandservices/posb/SukanyaSamriddhiAccountScheme2019English.pdf",
    sourceUrl:
      "https://www.indiapost.gov.in/documents/offerings/schemesandservices/posb/SukanyaSamriddhiAccountScheme2019English.pdf",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "sukanya", weight: 5 },
      { phrase: "सुकन्या", weight: 5 },
      { phrase: "samriddhi", weight: 4 },
      { phrase: "समृद्धि", weight: 3 },
      { phrase: "beti", weight: 4 },
      { phrase: "बेटी", weight: 4 },
      { phrase: "girl child", weight: 4 },
      { phrase: "बालिका", weight: 3 },
      { phrase: "beti ki saving", weight: 4 },
      { phrase: "daughter savings", weight: 3 },
    ],
  },
  {
    id: "apy",
    nameHi: "अटल पेंशन योजना",
    nameEn: "Atal Pension Yojana",
    ministry: "Department of Financial Services",
    benefitHi:
      "60 वर्ष की उम्र पर गारंटीशुदा मासिक पेंशन। पेंशन का स्तर जुड़ते समय चुना जाता है और अंशदान उम्र तथा चुनी हुई पेंशन पर निर्भर करता है। अगर निवेश पर अनुमान से कम रिटर्न मिले तो कमी की भरपाई का प्रावधान योजना पत्र में है।",
    benefitEn:
      "A guaranteed monthly pension starts at age 60. The pension level is chosen at joining, and the contribution depends on age and the pension chosen. The scheme document provides for the gap to be funded if investment returns fall short of the estimate.",
    eligibilityHi: [
      "भारत के नागरिक जिनका बचत बैंक खाता हो। जुड़ने की न्यूनतम उम्र 18 वर्ष और अधिकतम 40 वर्ष है।",
      "1 अक्टूबर 2022 से, जो व्यक्ति इनकम-टैक्स दाता है या रह चुका है, वह अटल पेंशन योजना में नहीं जुड़ सकता।",
      "पेंशन 60 वर्ष की उम्र से शुरू होती है।",
    ],
    eligibilityEn: [
      "Indian citizens with a savings bank account. Minimum joining age is 18 years and maximum is 40 years.",
      "From 1 October 2022, a person who is or has been an income-tax payer cannot join APY.",
      "The pension starts at age 60.",
    ],
    documentsHi: [
      "बचत बैंक खाता और ऑटो-डेबिट सहमति",
      "आधार",
      "नामांकित व्यक्ति का विवरण",
    ],
    documentsEn: [
      "Savings bank account and auto-debit consent",
      "Aadhaar",
      "Nominee details",
    ],
    summaryHi:
      "अटल पेंशन 18 से 40 साल के बैंक खाताधारक के लिए है, बशर्ते वे इनकम टैक्स दाता न हों। अंशदान 60 साल की उम्र तक खाते से कटता है, और पेंशन उसके बाद शुरू होती है। अंशदान की रकम उम्र और चुनी हुई पेंशन पर निर्भर करती है, इसलिए रकम बैंक की तालिका से देखें।",
    summaryEn:
      "Atal Pension Yojana is for bank account holders aged 18 to 40 who are not income-tax payers. Contributions continue until 60, when the pension starts. The contribution depends on age and the pension chosen, so the figure should be read from the bank's table.",
    officialUrl: "https://jansuraksha.gov.in/Files/APY/ENGLISH/APY.pdf",
    sourceUrl: "https://jansuraksha.gov.in/Files/APY/ENGLISH/APY.pdf",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "atal pension", weight: 5 },
      { phrase: "अटल पेंशन", weight: 5 },
      { phrase: "apy", weight: 4 },
      { phrase: "pension yojana", weight: 3 },
      { phrase: "पेंशन योजना", weight: 3 },
      { phrase: "मासिक पेंशन", weight: 2 },
    ],
  },
  {
    id: "pmjjby",
    nameHi: "प्रधानमंत्री जीवन ज्योति बीमा योजना",
    nameEn: "PMJJBY",
    ministry: "Department of Financial Services",
    benefitHi:
      "किसी भी कारण से मृत्यु पर 2 लाख रुपये का जीवन बीमा। वार्षिक प्रीमियम 436 रुपये है। कवर एक वर्ष का है, 1 जून से 31 मई तक, और हर साल नवीनीकृत होता है।",
    benefitEn:
      "Life cover of ₹2 lakh on death due to any cause. The annual premium is ₹436. The cover runs for one year, from 1 June to 31 May, and is renewed each year.",
    eligibilityHi: [
      "भाग लेने वाले बैंक या डाकघर में व्यक्तिगत खाता हो, और उम्र 18 से 50 वर्ष के बीच हो।",
      "50 वर्ष से पहले जुड़ने पर नियमित प्रीमियम देकर जीवन जोखिम 55 वर्ष तक जारी रह सकता है।",
      "एक व्यक्ति एक ही खाते से योजना ले सकता है।",
    ],
    eligibilityEn: [
      "An individual account with a participating bank or post office, and age from 18 to 50 years.",
      "Someone who joins before 50 can continue the life cover up to age 55 by paying the premium.",
      "A person may join through only one account.",
    ],
    documentsHi: [
      "बैंक या डाकघर खाता",
      "आधार",
      "नामांकित व्यक्ति का विवरण",
      "ऑटो-डेबिट सहमति फ़ॉर्म",
    ],
    documentsEn: [
      "Bank or post-office account",
      "Aadhaar",
      "Nominee details",
      "Auto-debit consent form",
    ],
    summaryHi:
      "पीएम जीवन ज्योति किसी भी कारण से मृत्यु पर 2 लाख रुपये का कवर है। उम्र 18 से 50 साल और बैंक खाता चाहिए। साल का प्रीमियम 436 रुपये खाते से कटता है।",
    summaryEn:
      "PMJJBY pays ₹2 lakh on death from any cause. It needs a bank account and age from 18 to 50. The yearly premium of ₹436 is debited from the account.",
    officialUrl: "https://jansuraksha.gov.in/Files/PMJJBY/ENGLISH/FAQ.pdf",
    sourceUrl: "https://jansuraksha.gov.in/Files/PMJJBY/ENGLISH/FAQ.pdf",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "pmjjby", weight: 5 },
      { phrase: "jeevan jyoti", weight: 5 },
      { phrase: "जीवन ज्योति", weight: 5 },
      { phrase: "jivan bima", weight: 4 },
      { phrase: "जीवन बीमा", weight: 4 },
      { phrase: "life insurance", weight: 3 },
      { phrase: "436", weight: 2 },
    ],
  },
  {
    id: "pmsby",
    nameHi: "प्रधानमंत्री सुरक्षा बीमा योजना",
    nameEn: "PMSBY",
    ministry: "Department of Financial Services",
    benefitHi:
      "दुर्घटना बीमा। मृत्यु पर 2 लाख रुपये। दोनों आँखों, दोनों हाथों या दोनों पैरों की पूरी हानि, या एक आँख और एक हाथ या पैर की हानि पर भी 2 लाख। एक आँख या एक हाथ या एक पैर की पूरी हानि पर 1 लाख। वार्षिक प्रीमियम 20 रुपये।",
    benefitEn:
      "Accident insurance. ₹2 lakh on death. ₹2 lakh for total loss of both eyes, both hands or both feet, or loss of one eye and one hand or foot. ₹1 lakh for total loss of one eye or one hand or one foot. Annual premium ₹20.",
    eligibilityHi: [
      "भाग लेने वाले बैंक या डाकघर का व्यक्तिगत खाता, उम्र 18 से 70 वर्ष।",
      "एक व्यक्ति एक ही खाते से जुड़ सकता है। संयुक्त खाते में हर पात्र धारक अलग प्रीमियम देकर जुड़ सकता है।",
    ],
    eligibilityEn: [
      "An individual bank or post-office account, age 18 to 70 years.",
      "A person joins through one account only. In a joint account each eligible holder can join by paying a separate premium.",
    ],
    documentsHi: [
      "बैंक या डाकघर खाता",
      "आधार",
      "नामांकित व्यक्ति का विवरण",
      "ऑटो-डेबिट सहमति",
    ],
    documentsEn: [
      "Bank or post-office account",
      "Aadhaar",
      "Nominee details",
      "Auto-debit consent",
    ],
    summaryHi:
      "पीएम सुरक्षा बीमा सस्ता दुर्घटना कवर है। साल में 20 रुपये के प्रीमियम पर दुर्घटना में मृत्यु या पूरी विकलांगता पर 2 लाख, और एक अंग या एक आँख पर 1 लाख रुपये का प्रावधान आधिकारिक पृष्ठ पर है। उम्र 18 से 70 साल और बैंक खाता चाहिए।",
    summaryEn:
      "PMSBY is a low-cost accident cover. The official page provides ₹2 lakh for accidental death or total disability, and ₹1 lakh for loss of one eye or one limb, at a premium of ₹20 a year. Age must be 18 to 70, with a bank account.",
    officialUrl: "https://financialservices.gov.in/pmsby",
    sourceUrl: "https://financialservices.gov.in/pmsby",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "pmsby", weight: 5 },
      { phrase: "suraksha bima", weight: 5 },
      { phrase: "सुरक्षा बीमा", weight: 5 },
      { phrase: "accident bima", weight: 4 },
      { phrase: "दुर्घटना बीमा", weight: 5 },
      { phrase: "accident insurance", weight: 4 },
      { phrase: "duurghatna", weight: 3 },
      { phrase: "हादसा", weight: 2 },
    ],
  },
  {
    id: "pmmy",
    nameHi: "प्रधानमंत्री मुद्रा योजना",
    nameEn: "PM Mudra Yojana",
    ministry: "Department of Financial Services",
    benefitHi:
      "गैर-कृषि छोटे कारोबार के लिए बिना गिरवी ऋण। शिशु: 50,000 रुपये तक। किशोर: 50,000 से ऊपर और 5 लाख तक। तरुण: 5 लाख से ऊपर और 10 लाख तक। तरुण प्लस: 10 लाख से ऊपर और 20 लाख तक, केवल उनके लिए जिन्होंने तरुण श्रेणी का पिछला ऋण चुका दिया हो। यह सीमा 24 अक्टूबर 2024 से प्रभावी बताई गई है।",
    benefitEn:
      "Collateral-free credit for non-farm micro enterprises. Shishu: up to ₹50,000. Kishore: above ₹50,000 and up to ₹5 lakh. Tarun: above ₹5 lakh and up to ₹10 lakh. Tarun Plus: above ₹10 lakh and up to ₹20 lakh, only for entrepreneurs who have successfully repaid a previous Tarun loan. That limit is stated as effective from 24 October 2024.",
    eligibilityHi: [
      "ऋण आय कमाने वाले काम के लिए है: विनिर्माण, व्यापार, सेवा, और कृषि से जुड़ी गतिविधियाँ जैसे डेयरी या मुर्गी पालन।",
      "गिरवी नहीं माँगी जाती। ऋण बैंक या अन्य सदस्य ऋण संस्था देती है, यह अनुदान नहीं है।",
    ],
    eligibilityEn: [
      "The loan is for an income-generating activity in manufacturing, trading, services, or activities allied to agriculture such as dairy or poultry.",
      "Collateral is not required. A bank or another member lending institution gives the loan. It is not a grant.",
    ],
    documentsHi: [
      "पहचान और पते का प्रमाण",
      "बैंक खाता",
      "छोटे कारोबार का साधारण विवरण या कोटेशन",
      "फोटो",
    ],
    documentsEn: [
      "Identity and address proof",
      "Bank account",
      "A simple business note or quotation",
      "Photograph",
    ],
    summaryHi:
      "मुद्रा छोटे कारोबार का बिना गिरवी कर्ज़ है, अनुदान नहीं। नया कारोबार अक्सर शिशु श्रेणी से शुरू होता है, जो 50,000 रुपये तक है। 20 लाख तक का तरुण प्लस केवल उन्हें मिलता है जो तरुण ऋण चुका चुके हों। बैंक अंतिम मंज़ूरी देती है।",
    summaryEn:
      "Mudra is a collateral-free loan for a small non-farm business, not a grant. A new activity often starts in Shishu, up to ₹50,000. Tarun Plus, up to ₹20 lakh, is only for someone who has repaid a Tarun loan. The bank makes the final sanction.",
    officialUrl: "https://financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy",
    sourceUrl: "https://financialservices.gov.in/pradhan-mantri-mudra-yojana-pmmy",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "mudra", weight: 5 },
      { phrase: "मुद्रा", weight: 5 },
      { phrase: "pmmy", weight: 4 },
      { phrase: "shishu loan", weight: 3 },
      { phrase: "business loan", weight: 3 },
      { phrase: "व्यापार ऋण", weight: 4 },
      { phrase: "karobar", weight: 2 },
      { phrase: "कारोबार", weight: 2 },
      { phrase: "dukan", weight: 2 },
      { phrase: "दुकान", weight: 2 },
    ],
  },
  {
    id: "pm-vishwakarma",
    nameHi: "पीएम विश्वकर्मा",
    nameEn: "PM Vishwakarma",
    ministry: "Ministry of Micro, Small and Medium Enterprises",
    benefitHi:
      "पारंपरिक कारीगरों के लिए पहचान, कौशल प्रशिक्षण, बेहतर औज़ार, और बिना गिरवी ऋण। दिशा-निर्देशों में पहली किस्त 1 लाख रुपये तक और दूसरी किस्त 2 लाख रुपये तक लिखी है। पहली किस्त के लिए कौशल आकलन और बुनियादी प्रशिक्षण पूरा करना होता है।",
    benefitEn:
      "Recognition, skill training, better tools, and collateral-free credit for traditional artisans. The guidelines record a first tranche of up to ₹1 lakh and a second of up to ₹2 lakh. The first tranche requires a completed skill assessment and basic training.",
    eligibilityHi: [
      "हाथ और औज़ार से काम करने वाला कारीगर, जो योजना में दर्ज पारंपरिक व्यापार में स्व-रोज़गार हो। उदाहरण: बढ़ई, लोहार, सुनार, कुम्हार, मूर्तिकार, नाव बनाने वाला। पूरी सूची आधिकारिक दिशा-निर्देशों में है।",
      "पंजीकरण के समय उसी व्यापार में काम हो रहा हो। पिछले 5 वर्षों में पीएमईजीपी, पीएम स्वनिधि या मुद्रा जैसे समान ऋण योजना का लाभ न लिया हो। मुद्रा या स्वनिधि का ऋण पूरा चुका चुके लोग अपवाद हो सकते हैं।",
    ],
    eligibilityEn: [
      "An artisan working with hands and tools, self-employed in a traditional trade listed in the scheme, such as carpenter, blacksmith, goldsmith, potter, sculptor or boat maker. The full list is in the official guidelines.",
      "The person should be working in that trade at registration and should not have taken a similar credit scheme such as PMEGP, PM SVANidhi or Mudra in the past 5 years. People who have fully repaid a Mudra or SVANidhi loan can be an exception.",
    ],
    documentsHi: [
      "आधार",
      "बैंक खाता",
      "पारिवारिक या गुरु-शिष्य परम्परा में उस व्यापार का साधारण प्रमाण, जैसा पोर्टल माँगे",
      "मोबाइल नंबर",
    ],
    documentsEn: [
      "Aadhaar",
      "Bank account",
      "A simple proof of the family or guru-shishya trade, as the portal asks",
      "Mobile number",
    ],
    summaryHi:
      "पीएम विश्वकर्मा बढ़ई, लोहार, सुनार, कुम्हार जैसे पारंपरिक कारीगरों के लिए है। इसमें पहचान पत्र, ट्रेनिंग और दो चरण का ऋण है: पहले 1 लाख तक, फिर 2 लाख तक। व्यापार योजना की सूची में होना चाहिए।",
    summaryEn:
      "PM Vishwakarma is for traditional artisans such as carpenters, blacksmiths, goldsmiths and potters. It offers recognition, training and credit in two stages, up to ₹1 lakh and then up to ₹2 lakh. The trade has to be on the scheme list.",
    officialUrl: "https://pmvishwakarma.gov.in/",
    sourceUrl: "https://dic.py.gov.in/sites/default/files/pm-vishwakarma.pdf",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "vishwakarma", weight: 5 },
      { phrase: "विश्वकर्मा", weight: 5 },
      { phrase: "karigar", weight: 4 },
      { phrase: "कारीगर", weight: 4 },
      { phrase: "lohar", weight: 4 },
      { phrase: "लोहार", weight: 4 },
      { phrase: "badhai", weight: 3 },
      { phrase: "बढ़ई", weight: 4 },
      { phrase: "suthar", weight: 3 },
      { phrase: "kumhar", weight: 3 },
      { phrase: "कुम्हार", weight: 4 },
      { phrase: "sonar", weight: 3 },
      { phrase: "सुनार", weight: 4 },
      { phrase: "mistri", weight: 3 },
      { phrase: "मिस्त्री", weight: 3 },
      { phrase: "artisan", weight: 3 },
    ],
  },
  {
    id: "nsp",
    nameHi: "राष्ट्रीय छात्रवृत्ति पोर्टल",
    nameEn: "National Scholarship Portal",
    ministry: "Ministry of Electronics and IT, with scholarship-owning ministries",
    benefitHi:
      "एक पोर्टल पर कई केन्द्रीय और राज्य छात्रवृत्तियाँ। हर छात्रवृत्ति की राशि, अंतिम तारीख और शर्त अलग होती है। राशि यहीं नहीं लिखी गई, क्योंकि वह योजना-दर-योजना बदलती है।",
    benefitEn:
      "One portal lists many central and state scholarships. Each scholarship has its own amount, deadline and conditions. Amounts are not stated here because they differ by scheme.",
    eligibilityHi: [
      "आवेदक छात्र हो और उस छात्रवृत्ति की पढ़ाई, आय, वर्ग या अल्पसंख्यक शर्त पूरी करता हो जो वह चुनता है।",
      "एक ही पोर्टल पर गलत तरीके से एक से अधिक छात्रवृत्ति लेना उस छात्रवृत्ति के नियम से बाहर हो सकता है। पोर्टल पर चेतावनी पढ़ें।",
    ],
    eligibilityEn: [
      "The applicant is a student and meets the course, income, category or minority condition of the particular scholarship they choose.",
      "Taking more than one scholarship on the portal in a way that scheme forbids can make the application invalid. Read the warning on the portal.",
    ],
    documentsHi: [
      "आधार",
      "शिक्षण संस्थान का नामांकन या अंकतालिका",
      "बैंक खाता",
      "आय प्रमाण, जहाँ योजना माँगे",
      "जाति या अल्पसंख्यक प्रमाण, केवल जहाँ उस छात्रवृत्ति के लिए ज़रूरी हो",
      "निवास प्रमाण",
    ],
    documentsEn: [
      "Aadhaar",
      "Enrolment proof or marksheet from the institution",
      "Bank account",
      "Income certificate, where that scholarship asks for it",
      "Caste or minority certificate, only where that scholarship requires it",
      "Domicile proof",
    ],
    summaryHi:
      "नेशनल स्कॉलरशिप पोर्टल छात्रों के लिए एक जगह है, जहाँ कई सरकारी छात्रवृत्तियों का फ़ॉर्म भरते हैं। कौन सी छात्रवृत्ति मिलेगी, यह कक्षा, आय और वर्ग पर निर्भर है। एक संख्या सभी के लिए नहीं है, इसलिए पोर्टल पर उसी योजना का पृष्ठ पढ़ें।",
    summaryEn:
      "The National Scholarship Portal is where students apply for many government scholarships. Which one fits depends on the class, income and category. There is no single amount for everyone, so the scheme page on the portal has to be read.",
    officialUrl: "https://scholarships.gov.in/",
    sourceUrl: "https://scholarships.gov.in/",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "scholarship", weight: 5 },
      { phrase: "scholarships.gov", weight: 5 },
      { phrase: "छात्रवृत्ति", weight: 5 },
      { phrase: "स्कॉलरशिप", weight: 4 },
      { phrase: "nsp", weight: 3 },
      { phrase: "padhai", weight: 2 },
      { phrase: "पढ़ाई", weight: 2 },
      { phrase: "student scheme", weight: 3 },
      { phrase: "college fees", weight: 3 },
      { phrase: "फीस", weight: 1 },
    ],
  },
  {
    id: "eshram",
    nameHi: "ई-श्रम",
    nameEn: "e-Shram",
    ministry: "Ministry of Labour and Employment",
    benefitHi:
      "असंगठित कामगारों का राष्ट्रीय डेटाबेस। पंजीकरण पर यूनिवर्सल अकाउंट नंबर और ई-श्रम कार्ड मिलता है, ताकि कल्याण योजनाओं तक पहचान पहुँचे। ई-श्रम अपने आप नकद पेंशन नहीं है।",
    benefitEn:
      "A national database of unorganised workers. Registration issues a Universal Account Number and an e-Shram card so welfare schemes can identify the worker. e-Shram itself is not a cash pension.",
    eligibilityHi: [
      "असंगठित कामगार, जिसकी उम्र 16 से 59 वर्ष के बीच हो।",
      "ई-श्रम के प्रश्नोत्तर के अनुसार असंगठित कामगार वह है जो घर पर, स्व-रोज़गार या मज़दूरी पर असंगठित क्षेत्र में काम करे और ईएसआईसी या ईपीएफओ का सदस्य न हो।",
    ],
    eligibilityEn: [
      "An unorganised worker aged 16 to 59 years.",
      "The e-Shram FAQ describes an unorganised worker as a home-based worker, a self-employed worker or a wage worker in the unorganised sector who is not a member of ESIC or EPFO.",
    ],
    documentsHi: [
      "आधार",
      "आधार से जुड़ा मोबाइल नंबर",
      "बैंक खाता",
      "काम का प्रकार, जैसा फ़ॉर्म में चुनना हो",
    ],
    documentsEn: [
      "Aadhaar",
      "Mobile number linked to Aadhaar",
      "Bank account",
      "The occupation, as the form asks",
    ],
    summaryHi:
      "ई-श्रम असंगठित कामगार का कार्ड है, पेंशन नहीं। उम्र 16 से 59 साल हो और व्यक्ति ईपीएफ या ईएसआईसी का सदस्य न हो। कार्ड बाद में दूसरी योजनाओं से जुड़ने में काम आता है।",
    summaryEn:
      "e-Shram is an identity card for an unorganised worker, not a pension. Age must be 16 to 59, and the person should not already be an EPFO or ESIC member. The card is used later to link other schemes.",
    officialUrl: "https://eshram.gov.in/faqs",
    sourceUrl: "https://eshram.gov.in/faqs",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "e-shram", weight: 5 },
      { phrase: "eshram", weight: 5 },
      { phrase: "ई-श्रम", weight: 5 },
      { phrase: "ई श्रम", weight: 5 },
      { phrase: "shram card", weight: 4 },
      { phrase: "श्रम कार्ड", weight: 4 },
      { phrase: "unorganised", weight: 3 },
      { phrase: "असंगठित", weight: 3 },
      { phrase: "mazdoor card", weight: 3 },
      { phrase: "मजदूर कार्ड", weight: 4 },
    ],
  },
  {
    id: "pm-svanidhi",
    nameHi: "पीएम स्वनिधि",
    nameEn: "PM SVANidhi",
    ministry: "Ministry of Housing and Urban Affairs",
    benefitHi:
      "रेहड़ी-पटरी वालों के लिए बिना गिरवी कार्यशील पूँजी ऋण, तीन चरणों में: 15,000 रुपये तक (12 महीने), 25,000 रुपये तक (18 महीने) और 50,000 रुपये तक (36 महीने)। समय पर चुकाने पर 7 प्रतिशत वार्षिक ब्याज सब्सिडी का प्रावधान दिशा-निर्देशों में है।",
    benefitEn:
      "Collateral-free working-capital loans for street vendors, in three tranches: up to ₹15,000 (12 months), up to ₹25,000 (18 months) and up to ₹50,000 (36 months). The guidelines provide an interest subsidy of 7 percent a year for timely repayment.",
    eligibilityHi: [
      "शहरी रेहड़ी या पटरी वाला विक्रेता, जिसके पास वेंडिंग का प्रमाणपत्र या सिफ़ारिश पत्र हो।",
      "यह अनुदान नहीं, ऋण है। अगला चरण पिछले ऋण के समय पर भुगतान से जुड़ा है।",
    ],
    eligibilityEn: [
      "An urban street vendor with a certificate of vending or a letter of recommendation.",
      "This is a loan, not a grant. The next tranche is tied to timely repayment of the previous one.",
    ],
    documentsHi: [
      "आधार",
      "वेंडिंग सर्टिफिकेट या लेटर ऑफ़ रिकमेंडेशन",
      "बैंक खाता",
      "मोबाइल नंबर",
    ],
    documentsEn: [
      "Aadhaar",
      "Certificate of vending or letter of recommendation",
      "Bank account",
      "Mobile number",
    ],
    summaryHi:
      "पीएम स्वनिधि ठेले और रेहड़ी पर सामान बेचने वालों का छोटा ऋण है। पहली किस्त 15,000 रुपये तक हो सकती है। समय पर चुकाने वाले को अगली किस्त और 7 प्रतिशत ब्याज सब्सिडी का रास्ता दिशा-निर्देशों में है। शहरी स्थानीय निकाय सिफ़ारिश देता है।",
    summaryEn:
      "PM SVANidhi is a small working-capital loan for a street vendor. The first tranche can be up to ₹15,000. Timely repayment opens the next tranche and the 7 percent interest subsidy described in the guidelines. The urban local body recommends the vendor.",
    officialUrl: "https://pmsvanidhi.mohua.gov.in/",
    sourceUrl: "https://pmsvanidhi.mohua.gov.in/Default/ViewFile/?id=Scheme+Guidelines.pdf&path=MiscFiles",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "svanidhi", weight: 5 },
      { phrase: "swanidhi", weight: 4 },
      { phrase: "स्वनिधि", weight: 5 },
      { phrase: "street vendor", weight: 5 },
      { phrase: "rehri", weight: 4 },
      { phrase: "रेहड़ी", weight: 4 },
      { phrase: "thela", weight: 4 },
      { phrase: "ठेला", weight: 4 },
      { phrase: "patri", weight: 3 },
      { phrase: "पटरी", weight: 3 },
      { phrase: "pheriwala", weight: 3 },
      { phrase: "फेरी", weight: 3 },
    ],
  },
  {
    id: "jsy",
    nameHi: "जननी सुरक्षा योजना",
    nameEn: "Janani Suraksha Yojana",
    ministry: "Ministry of Health and Family Welfare, National Health Mission",
    benefitHi:
      "संस्थागत प्रसव को बढ़ावा देने के लिए नकद सहायता। रकम राज्य के निम्न या उच्च प्रदर्शन वर्ग और ग्रामीण या शहरी क्षेत्र के अनुसार अलग होती है। सटीक राशि स्वास्थ्य केन्द्र पर एनएचएम की वर्तमान तालिका से पुष्टि करें। इस सहायक में कोई प्रसव राशि नहीं गढ़ी गई है।",
    benefitEn:
      "Cash assistance to encourage institutional delivery. The package differs by low or high performing state and by rural or urban area. Confirm the current figure from the NHM table at the health centre. This assistant does not state a delivery amount.",
    eligibilityHi: [
      "गर्भवती महिला, जिसका प्रसव सरकारी अस्पताल या अधिकृत निजी अस्पताल में हो।",
      "उच्च प्रदर्शन वाले राज्यों में सहायता मुख्यतः बीपीएल, अनुसूचित जाति और अनुसूचित जनजाति की महिलाओं पर केन्द्रित रही है। निम्न प्रदर्शन वाले राज्यों में व्यापक कवर रहा है। अंतिम नियम स्थानीय एनएचएम इकाई लागू करती है।",
    ],
    eligibilityEn: [
      "A pregnant woman who delivers in a government hospital or an accredited private hospital.",
      "In high-performing states the assistance has focused on women from BPL, Scheduled Caste and Scheduled Tribe households. Low-performing states have had wider cover. The local NHM unit applies the current rule.",
    ],
    documentsHi: [
      "आधार या पहचान पत्र",
      "गर्भावस्था पंजीकरण कार्ड, एमसीपी कार्ड",
      "बैंक या डाकघर खाता",
      "बीपीएल, जाति या निवास प्रमाण, जहाँ केन्द्र माँगे",
    ],
    documentsEn: [
      "Aadhaar or identity proof",
      "Pregnancy registration, the MCP card",
      "Bank or post-office account",
      "BPL, caste or residence proof, where the centre asks",
    ],
    summaryHi:
      "जननी सुरक्षा योजना गर्भवती महिला को अस्पताल में प्रसव के लिए नकद सहायता है। कितने रुपये मिलेंगे, यह राज्य और गाँव या शहर पर निर्भर करता है, इसलिए आँकड़ा यहीं नहीं दिया गया। नज़दीकी आंगनवाड़ी, आशा या पीएचसी पर वर्तमान राशि पूछें।",
    summaryEn:
      "Janani Suraksha Yojana is cash assistance for a pregnant woman who gives birth in a hospital. The rupee amount depends on the state and on rural or urban area, so it is not stated here. Ask the anganwadi, ASHA or PHC for the current package.",
    officialUrl: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    sourceUrl: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "janani suraksha", weight: 5 },
      { phrase: "जननी सुरक्षा", weight: 5 },
      { phrase: "jsy", weight: 3 },
      { phrase: "garbhvati", weight: 4 },
      { phrase: "गर्भवती", weight: 5 },
      { phrase: "pregnant", weight: 4 },
      { phrase: "प्रसव", weight: 4 },
      { phrase: "delivery", weight: 2 },
      { phrase: "pregnancy scheme", weight: 4 },
      { phrase: "बच्चा होने", weight: 3 },
    ],
  },
  {
    id: "ignoaps",
    nameHi: "इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन (एनएसएपी)",
    nameEn: "IGNOAPS old-age pension under NSAP",
    ministry: "Ministry of Rural Development",
    benefitHi:
      "गरीबी रेखा से नीचे के वृद्ध व्यक्तियों को केन्द्रीय सहायता: 60 से 79 वर्ष की उम्र पर 200 रुपये प्रति माह, और 80 वर्ष या अधिक पर 500 रुपये प्रति माह। राज्य अपनी ओर से टॉप-अप जोड़ते हैं, इसलिए हाथ में आने वाली पेंशन राज्य पर निर्भर है।",
    benefitEn:
      "Central assistance for a person below the poverty line: ₹200 a month from age 60 to 79, and ₹500 a month from age 80. States add their own top-up, so the pension actually received depends on the state.",
    eligibilityHi: [
      "उम्र 60 वर्ष या उससे अधिक।",
      "परिवार गरीबी रेखा से नीचे हो।",
      "पहचान और भुगतान राज्य करता है। केन्द्रीय राशि के ऊपर राज्य की राशि अलग हो सकती है।",
    ],
    eligibilityEn: [
      "Age 60 years or above.",
      "The person belongs to a household below the poverty line.",
      "The state identifies beneficiaries and pays the pension. The state amount on top of the central share can differ.",
    ],
    documentsHi: [
      "उम्र का प्रमाण",
      "बीपीएल या राज्य की गरीबी सूची में नाम",
      "आधार",
      "बैंक या डाकघर खाता",
      "निवास प्रमाण",
    ],
    documentsEn: [
      "Age proof",
      "BPL or the state's poverty-list entry",
      "Aadhaar",
      "Bank or post-office account",
      "Residence proof",
    ],
    summaryHi:
      "एनएसएपी की वृद्धावस्था पेंशन 60 साल या उससे ऊपर के बीपीएल व्यक्ति के लिए है। केन्द्र 60 से 79 साल पर 200 रुपये महीना और 80 के बाद 500 रुपये महीना देता है। राज्य अक्सर इससे ज्यादा जोड़ता है, इसलिए असली रकम ज़िले के समाज कल्याण दफ़्तर पर पूछें।",
    summaryEn:
      "The NSAP old-age pension is for a person aged 60 or above from a BPL household. The Centre pays ₹200 a month from 60 to 79 and ₹500 a month from 80. States often add more, so the amount in hand should be checked at the district social welfare office.",
    officialUrl: "https://nsap.nic.in/",
    sourceUrl: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc2025117686801.pdf",
    sourceCheckedOn: SOURCE_CHECKED_ON,
    keywords: [
      { phrase: "ignoaps", weight: 5 },
      { phrase: "old age pension", weight: 5 },
      { phrase: "वृद्धावस्था पेंशन", weight: 5 },
      { phrase: "वृद्ध पेंशन", weight: 5 },
      { phrase: "बुढ़ापे की पेंशन", weight: 5 },
      { phrase: "budhape ki pension", weight: 5 },
      { phrase: "vriddha pension", weight: 4 },
      { phrase: "nsap", weight: 4 },
      { phrase: "indira gandhi pension", weight: 4 },
      { phrase: "इंदिरा गांधी पेंशन", weight: 4 },
      { phrase: "बुजुर्ग पेंशन", weight: 4 },
      { phrase: "buzurg pension", weight: 4 },
    ],
  },
];

export function getScheme(id: string): Scheme | undefined {
  return schemes.find((scheme) => scheme.id === id);
}

const HILL_STATES = new Set([
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura",
  "Himachal Pradesh",
  "Uttarakhand",
  "Jammu and Kashmir",
  "Ladakh",
]);

export function pmayAssistanceText(state: string | undefined, hi: boolean): string | null {
  if (!state) return null;
  const hill = HILL_STATES.has(state);
  if (hi) {
    return hill
      ? "आपके राज्य या केन्द्रशासित प्रदेश के लिए आधिकारिक सामग्री में इकाई सहायता 1.30 लाख रुपये दर्ज है।"
      : "मैदानी राज्यों के लिए आधिकारिक सामग्री में इकाई सहायता 1.20 लाख रुपये दर्ज है।";
  }
  return hill
    ? "Official material records unit assistance of ₹1.30 lakh for this state or union territory."
    : "Official material records unit assistance of ₹1.20 lakh for plain states.";
}

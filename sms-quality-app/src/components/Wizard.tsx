"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Languages,
  RotateCcw,
} from "lucide-react";

type Lang = "en" | "hi" | "ta";
type Step = "welcome" | "grade" | "inputs" | "result" | "askCarbon" | "carbon";
type GradeType = "N" | "D";

type GradeOption = {
  code: string;
  type: GradeType;
  note: string;
  className: string;
};

type ScrapTypeOption = {
  value: string;
  image: string;
};

const gradeOptions: GradeOption[] = [
  { code: "500N", type: "N", note: "N (Normal)", className: "border-slate-300 bg-slate-100" },
  { code: "550N", type: "N", note: "Yellow", className: "border-amber-300 bg-amber-100" },
  { code: "500D", type: "D", note: "Purple", className: "border-violet-300 bg-violet-100" },
  { code: "550D", type: "D", note: "Orange", className: "border-orange-300 bg-orange-100" },
  { code: "500D CRS", type: "D", note: "Pink", className: "border-pink-300 bg-pink-100" },
  { code: "550 Bright", type: "D", note: "Blue", className: "border-sky-300 bg-sky-100" },
  { code: "550D CRS", type: "D", note: "Green", className: "border-emerald-300 bg-emerald-100" },
];

const scrapTypeOptions: ScrapTypeOption[] = [
  { value: "HMS", image: "/scrap-types/hms.png" },
  { value: "CR Punching", image: "/scrap-types/cr-punching.png" },
  { value: "Kaichi Cutting", image: "/scrap-types/kaichi-cutting.png" },
  { value: "Import Boring", image: "/scrap-types/import-boring.png" },
];

const stepOrder: Step[] = ["welcome", "grade", "inputs", "result", "askCarbon", "carbon"];
const TARGET_C_BY_GRADE_TYPE: Record<GradeType, number> = { N: 0.22, D: 0.18 };
const C_TO_FEO_MASS_RATIO = 12.011 / 71.844;
const MIN_DIVISOR = 1e-6;

const translations = {
  en: {
    companyLine: "Suryadev",
    processTitle: "SMS Process Quality",
    stepLabel: "Step",
    reset: "Reset",
    instructionTitle: "What To Do",
    continueButton: "Continue",
    nextButton: "Next",
    backButton: "Back",
    calculateButton: "Calculation",
    yes: "Yes",
    no: "No",
    startNewHeat: "Start New Heat",

    welcomeTitle: "Welcome to Suryadev",
    welcomeText: "Please choose language and press Continue.",
    languageQuestion: "Do you want to continue in English / Hindi / Tamil?",

    gradeTypeTitle: "Select N (Normal) or D (Ductile)",
    gradeTypeText: "First choose type, then choose exact grade.",
    nType: "N (Normal) Grade",
    dType: "D (Ductile) Grade",
    gradeTitle: "Please select TMT grade",
    gradeText: "Tap one option and go next.",

    inputTitle: "Enter Heat Inputs",
    inputText: "Fill values carefully. These values are used for full calculation.",
    quantityTon: "Quantity in Tons",
    scrapShare: "Scrap Share",
    driShare: "DRI Share",
    scrapYield: "Scrap Yield",
    driYield: "DRI Yield",
    quickPreview: "Quick Preview",
    scrapNeeded: "Scrap Needed",
    driNeeded: "DRI Needed",
    expectedLiquid: "Expected LM per Heat",

    resultTitle: "Heat Result",
    resultText: "Check this output before moving to carbon calculation.",
    selectedGrade: "Selected Grade",
    chargeMix: "Charge Mix",
    yieldPerHeat: "Yield Per Heat",
    lmWeight: "Liquid Metal Weight",
    proceedCarbon: "Go to carbon question",

    askCarbonTitle: "Do you want to calculate carbon in your bath?",
    askCarbonText: "Choose Yes for carbon, P, S detailed chemistry calculation.",

    carbonTitle: "Carbon Chemistry Page",
    carbonText: "Enter DRI and Scrap chemistry. Then press Calculation.",
    scrapSection: "Scrap",
    driSection: "DRI",
    factorSection: "Process Factors",
    scrapType: "Scrap Type",
    scrapC: "Scrap C",
    scrapP: "Scrap P",
    scrapS: "Scrap S",
    driC: "DRI C",
    driP: "DRI P",
    driS: "DRI S",
    driFeM: "DRI Fe(m)",
    driFeT: "DRI Fe(T)",
    targetC: "Target C",
    reductionC: "Reduction Factor",
    secondBathReduction: "2nd Bath Reduction",
    dolocharAdded: "Dolochar Added",
    dolocharFC: "Dolochar FC",
    dolocharEff: "Dolochar Efficiency",
    dolocharP: "Dolochar P",
    dolocharS: "Dolochar S",

    carbonResultTitle: "Carbon Result",
    currentC: "Current C",
    currentP: "Current P",
    currentS: "Current S",
    driToAdd: "You Have To Add DRI",
    dolocharNeed: "Additional Dolochar",
    totalDolocharNeed: "Total Dolochar Required",

    instructionWelcome: "Select one language, then press Continue.",
    instructionGrade: "Select N (Normal) or D (Ductile) first, then choose one exact grade.",
    instructionInputs: "Enter quantity and split. Scrap + DRI should stay 100%.",
    instructionResult: "Read result carefully. Then move to carbon question.",
    instructionAskCarbon: "Press Yes for carbon chemistry page, No to start a new heat.",
    instructionCarbon: "Fill DRI/Scrap values and press Calculation button.",
  },
  hi: {
    companyLine: "सूर्यदेव",
    processTitle: "SMS प्रक्रिया गुणवत्ता",
    stepLabel: "स्टेप",
    reset: "रीसेट",
    instructionTitle: "क्या करना है",
    continueButton: "आगे बढ़ें",
    nextButton: "अगला",
    backButton: "पीछे",
    calculateButton: "कैलकुलेशन",
    yes: "हाँ",
    no: "नहीं",
    startNewHeat: "नई हीट शुरू करें",

    welcomeTitle: "सूर्यदेव में आपका स्वागत है",
    welcomeText: "कृपया भाषा चुनें और आगे बढ़ें।",
    languageQuestion: "कृपया बताएं, आप किस भाषा में आगे बढ़ना चाहते हैं?",

    gradeTypeTitle: "N (Normal) या D (Ductile) चुनें",
    gradeTypeText: "पहले टाइप चुनें, फिर सही ग्रेड चुनें।",
    nType: "N (Normal) ग्रेड",
    dType: "D (Ductile) ग्रेड",
    gradeTitle: "कृपया TMT ग्रेड चुनें",
    gradeText: "एक विकल्प चुनकर अगले पेज पर जाएं।",

    inputTitle: "हीट इनपुट भरें",
    inputText: "सभी वैल्यू ध्यान से भरें।",
    quantityTon: "मात्रा (टन)",
    scrapShare: "स्क्रैप प्रतिशत",
    driShare: "DRI प्रतिशत",
    scrapYield: "स्क्रैप यील्ड",
    driYield: "DRI यील्ड",
    quickPreview: "झटपट प्रीव्यू",
    scrapNeeded: "स्क्रैप आवश्यकता",
    driNeeded: "DRI आवश्यकता",
    expectedLiquid: "अपेक्षित LM प्रति हीट",

    resultTitle: "हीट परिणाम",
    resultText: "कार्बन पेज पर जाने से पहले परिणाम देखें।",
    selectedGrade: "चुना गया ग्रेड",
    chargeMix: "चार्ज मिक्स",
    yieldPerHeat: "प्रति हीट यील्ड",
    lmWeight: "लिक्विड मेटल वज़न",
    proceedCarbon: "कार्बन प्रश्न पर जाएँ",

    askCarbonTitle: "क्या आप अपने बाथ में कार्बन कैलकुलेट करना चाहते हैं?",
    askCarbonText: "Yes दबाएँ तो कार्बन, P, S की डिटेल कैलकुलेशन खुलेगी।",

    carbonTitle: "कार्बन केमिस्ट्री पेज",
    carbonText: "DRI और Scrap की वैल्यू भरें, फिर Calculation दबाएँ।",
    scrapSection: "स्क्रैप",
    driSection: "DRI",
    factorSection: "प्रोसेस फैक्टर",
    scrapType: "स्क्रैप टाइप",
    scrapC: "स्क्रैप C",
    scrapP: "स्क्रैप P",
    scrapS: "स्क्रैप S",
    driC: "DRI C",
    driP: "DRI P",
    driS: "DRI S",
    driFeM: "DRI Fe(m)",
    driFeT: "DRI Fe(T)",
    targetC: "टारगेट C",
    reductionC: "रिडक्शन फैक्टर",
    secondBathReduction: "दूसरा बाथ रिडक्शन",
    dolocharAdded: "डोलोचार डाला (kg)",
    dolocharFC: "डोलोचार FC",
    dolocharEff: "डोलोचार दक्षता",
    dolocharP: "डोलोचार P",
    dolocharS: "डोलोचार S",

    carbonResultTitle: "कार्बन परिणाम",
    currentC: "वर्तमान C",
    currentP: "वर्तमान P",
    currentS: "वर्तमान S",
    driToAdd: "जितना DRI डालना है",
    dolocharNeed: "अतिरिक्त डोलोचार",
    totalDolocharNeed: "कुल आवश्यक डोलोचार",

    instructionWelcome: "एक भाषा चुनें और Continue दबाएँ।",
    instructionGrade: "पहले N (Normal) या D (Ductile) चुनें, फिर एक ग्रेड चुनें।",
    instructionInputs: "मात्रा और प्रतिशत भरें। स्क्रैप + DRI = 100% रखें।",
    instructionResult: "परिणाम पढ़ें, फिर कार्बन प्रश्न पर जाएँ।",
    instructionAskCarbon: "Yes दबाएँ तो कार्बन पेज खुलेगा, No से नई हीट शुरू होगी।",
    instructionCarbon: "सभी वैल्यू भरकर Calculation दबाएँ।",
  },
  ta: {
    companyLine: "சூர்யதேவ்",
    processTitle: "SMS செயல்முறை தரம்",
    stepLabel: "படி",
    reset: "ரீசெட்",
    instructionTitle: "செய்ய வேண்டியது",
    continueButton: "தொடரவும்",
    nextButton: "அடுத்து",
    backButton: "பின்",
    calculateButton: "கணக்கிடு",
    yes: "ஆம்",
    no: "இல்லை",
    startNewHeat: "புதிய ஹீட் தொடங்கு",

    welcomeTitle: "சூர்யதேவுக்கு வரவேற்கிறோம்",
    welcomeText: "மொழியை தேர்வு செய்து தொடரவும்.",
    languageQuestion: "எந்த மொழியில் தொடர வேண்டும்?",

    gradeTypeTitle: "N (Normal) அல்லது D (Ductile) தேர்வு செய்யவும்",
    gradeTypeText: "முதலில் வகை தேர்வு செய்து, பின் கிரேடு தேர்வு செய்யவும்.",
    nType: "N (Normal) கிரேடு",
    dType: "D (Ductile) கிரேடு",
    gradeTitle: "TMT கிரேடு தேர்வு செய்யவும்",
    gradeText: "ஒரு விருப்பத்தைத் தேர்வு செய்து அடுத்த படிக்கு செல்லவும்.",

    inputTitle: "ஹீட் உள்ளீடுகளை நிரப்பவும்",
    inputText: "அனைத்து மதிப்புகளையும் கவனமாக உள்ளிடவும்.",
    quantityTon: "அளவு (டன்)",
    scrapShare: "ஸ்க்ராப் வீதம்",
    driShare: "DRI வீதம்",
    scrapYield: "ஸ்க்ராப் யீல்ட்",
    driYield: "DRI யீல்ட்",
    quickPreview: "விரைவு முன்னோட்டம்",
    scrapNeeded: "தேவையான ஸ்க்ராப்",
    driNeeded: "தேவையான DRI",
    expectedLiquid: "ஒரு ஹீட்டிற்கு LM",

    resultTitle: "ஹீட் முடிவு",
    resultText: "கார்பன் பக்கத்துக்கு செல்லும் முன் முடிவை சரிபார்க்கவும்.",
    selectedGrade: "தேர்ந்தெடுத்த கிரேடு",
    chargeMix: "சார்ஜ் கலவை",
    yieldPerHeat: "ஒரு ஹீட்டின் யீல்ட்",
    lmWeight: "திரவ உலோகம் எடை",
    proceedCarbon: "கார்பன் கேள்விக்கு செல்லவும்",

    askCarbonTitle: "உங்கள் பாத்தில் கார்பன் கணக்கிட வேண்டுமா?",
    askCarbonText: "ஆம் அழுத்தினால் கார்பன், P, S விவர கணக்கு திறக்கும்.",

    carbonTitle: "கார்பன் ரசாயன பக்கம்",
    carbonText: "DRI மற்றும் Scrap மதிப்புகளை உள்ளிட்டு கணக்கிடு அழுத்தவும்.",
    scrapSection: "ஸ்க்ராப்",
    driSection: "DRI",
    factorSection: "செயல்முறை காரணிகள்",
    scrapType: "ஸ்க்ராப் வகை",
    scrapC: "ஸ்க்ராப் C",
    scrapP: "ஸ்க்ராப் P",
    scrapS: "ஸ்க்ராப் S",
    driC: "DRI C",
    driP: "DRI P",
    driS: "DRI S",
    driFeM: "DRI Fe(m)",
    driFeT: "DRI Fe(T)",
    targetC: "இலக்கு C",
    reductionC: "குறைக்கும் காரணி",
    secondBathReduction: "2வது பாத் ரிடக்ஷன்",
    dolocharAdded: "சேர்த்த டோலோச்சார் (kg)",
    dolocharFC: "டோலோச்சார் FC",
    dolocharEff: "டோலோச்சார் திறன்",
    dolocharP: "டோலோச்சார் P",
    dolocharS: "டோலோச்சார் S",

    carbonResultTitle: "கார்பன் முடிவு",
    currentC: "தற்போதைய C",
    currentP: "தற்போதைய P",
    currentS: "தற்போதைய S",
    driToAdd: "சேர்க்க வேண்டிய DRI",
    dolocharNeed: "கூடுதல் டோலோச்சார்",
    totalDolocharNeed: "மொத்த தேவையான டோலோச்சார்",

    instructionWelcome: "மொழியைத் தேர்வு செய்து தொடரவும் அழுத்தவும்.",
    instructionGrade: "முதலில் N (Normal) அல்லது D (Ductile) தேர்வு செய்து பிறகு கிரேடு தேர்வு செய்யவும்.",
    instructionInputs: "அளவு மற்றும் வீதங்களை நிரப்பவும். ஸ்க்ராப் + DRI = 100% ஆக இருக்க வேண்டும்.",
    instructionResult: "முடிவை சரிபார்த்து கார்பன் கேள்விக்கு செல்லவும்.",
    instructionAskCarbon: "ஆம் அழுத்தினால் கார்பன் பக்கம் திறக்கும். இல்லை என்றால் புதிய ஹீட்.",
    instructionCarbon: "மதிப்புகளை நிரப்பி கணக்கிடு அழுத்தவும்.",
  },
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const clampPercent = (value: number) => clamp(value, 0, 100);
const toFraction = (value: number) => clampPercent(value) / 100;

const formatNumber = (value: number, digits = 2) => {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  return value.toFixed(digits);
};

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
  unit?: string;
  step?: string;
  min?: number;
  max?: number;
};

function NumberInput({
  label,
  value,
  onChange,
  unit,
  step = "0.01",
  min,
  max,
}: NumberInputProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{label}</span>
      <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(event) => {
            const parsed = Number(event.target.value);
            const next = Number.isFinite(parsed) ? parsed : 0;
            onChange(clamp(next, min ?? Number.NEGATIVE_INFINITY, max ?? Number.POSITIVE_INFINITY));
          }}
          className="h-11 w-full bg-transparent text-lg font-semibold text-slate-900 outline-none"
        />
        {unit ? <span className="pl-2 text-xs font-bold text-slate-500">{unit}</span> : null}
      </div>
    </label>
  );
}

type ResultTileProps = {
  title: string;
  value: string;
  hint?: string;
};

function ResultTile({ title, value, hint }: ResultTileProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(20,34,54,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-600">{hint}</p> : null}
    </div>
  );
}

export default function Wizard() {
  const [language, setLanguage] = useState<Lang>("en");
  const [step, setStep] = useState<Step>("welcome");

  const [gradeType, setGradeType] = useState<GradeType>("D");
  const [grade, setGrade] = useState("550D");

  const [quantityTon, setQuantityTon] = useState(30);
  const [scrapSharePct, setScrapSharePct] = useState(20);
  const [driSharePct, setDriSharePct] = useState(80);
  const [scrapYieldPct, setScrapYieldPct] = useState(94);
  const [driYieldPct, setDriYieldPct] = useState(85);

  const [scrapType, setScrapType] = useState("HMS");
  const [scrapCPct, setScrapCPct] = useState(0.3);
  const [scrapPPct, setScrapPPct] = useState(0.026);
  const [scrapSPct, setScrapSPct] = useState(0.016);

  const [driCPct, setDriCPct] = useState(0.25);
  const [driPPct, setDriPPct] = useState(0.048);
  const [driSPct, setDriSPct] = useState(0.018);
  const [driFeMPct, setDriFeMPct] = useState(83);
  const [driFeTPct, setDriFeTPct] = useState(90);

  const [targetCarbonPct, setTargetCarbonPct] = useState(0.18);
  const [reductionFactorPct, setReductionFactorPct] = useState(75);
  const [secondBathReductionPct, setSecondBathReductionPct] = useState(40);

  const [dolocharAddedKg, setDolocharAddedKg] = useState(500);
  const [dolocharFCPct, setDolocharFCPct] = useState(42);
  const [dolocharEffPct, setDolocharEffPct] = useState(70);
  const [dolocharPPct, setDolocharPPct] = useState(0.0035);
  const [dolocharSPct, setDolocharSPct] = useState(0.0058);

  const [carbonCalculated, setCarbonCalculated] = useState(false);

  const t = translations[language];
  const currentStep = stepOrder.indexOf(step) + 1;

  const filteredGrades = useMemo(
    () => gradeOptions.filter((item) => item.type === gradeType),
    [gradeType],
  );

  const selectedScrapTypeImage = useMemo(() => {
    return (
      scrapTypeOptions.find((option) => option.value === scrapType)?.image ??
      scrapTypeOptions[0].image
    );
  }, [scrapType]);

  const setScrapShare = (value: number) => {
    const next = clamp(value, 0, 100);
    setScrapSharePct(next);
    setDriSharePct(100 - next);
  };

  const setDriShare = (value: number) => {
    const next = clamp(value, 0, 100);
    setDriSharePct(next);
    setScrapSharePct(100 - next);
  };

  const resetAll = () => {
    setLanguage("en");
    setStep("welcome");
    setGradeType("D");
    setGrade("550D");

    setQuantityTon(30);
    setScrapSharePct(20);
    setDriSharePct(80);
    setScrapYieldPct(94);
    setDriYieldPct(85);

    setScrapType("HMS");
    setScrapCPct(0.3);
    setScrapPPct(0.026);
    setScrapSPct(0.016);

    setDriCPct(0.25);
    setDriPPct(0.048);
    setDriSPct(0.018);
    setDriFeMPct(83);
    setDriFeTPct(90);

    setTargetCarbonPct(0.18);
    setReductionFactorPct(75);
    setSecondBathReductionPct(40);

    setDolocharAddedKg(500);
    setDolocharFCPct(42);
    setDolocharEffPct(70);
    setDolocharPPct(0.0035);
    setDolocharSPct(0.0058);

    setCarbonCalculated(false);
  };

  const baseCalc = useMemo(() => {
    const targetLmKg = Math.max(quantityTon, 0) * 1000;
    const scrapShare = toFraction(scrapSharePct);
    const driShare = toFraction(driSharePct);
    const scrapYield = toFraction(scrapYieldPct);
    const driYield = toFraction(driYieldPct);
    const weightedYield = scrapShare * scrapYield + driShare * driYield;

    const totalKg = weightedYield > MIN_DIVISOR ? targetLmKg / weightedYield : 0;
    const scrapKg = totalKg * scrapShare;
    const driKg = totalKg * driShare;
    const lmKg = scrapKg * scrapYield + driKg * driYield;

    return {
      targetLmKg,
      totalKg,
      scrapKg,
      driKg,
      lmKg,
      weightedYieldPct: weightedYield * 100,
    };
  }, [quantityTon, scrapSharePct, driSharePct, scrapYieldPct, driYieldPct]);

  const carbonCalc = useMemo(() => {
    const reductionFraction = toFraction(reductionFactorPct);
    const secondBathReductionFraction = toFraction(secondBathReductionPct);
    const feoPct = Math.max(driFeTPct - driFeMPct, 0);
    const feoKg = baseCalc.driKg * toFraction(feoPct);
    const cForFeoReductionKg = feoKg * C_TO_FEO_MASS_RATIO * reductionFraction;

    const cFromScrapsKg = baseCalc.scrapKg * toFraction(scrapCPct);
    const cFromDrisKg = baseCalc.driKg * toFraction(driCPct);
    const effectiveCarbonPerKgDolochar = toFraction(dolocharFCPct) * toFraction(dolocharEffPct);
    const cFromDolocharKg = Math.max(dolocharAddedKg, 0) * effectiveCarbonPerKgDolochar;
    const cBalanceKg = cFromScrapsKg + cFromDrisKg + cFromDolocharKg - cForFeoReductionKg;

    const chemistryMassKg = Math.max(baseCalc.lmKg + cFromDolocharKg - cForFeoReductionKg, 0);
    const rawCPct = chemistryMassKg > MIN_DIVISOR ? (cBalanceKg / chemistryMassKg) * 100 : 0;
    const currentCPct = Math.max(rawCPct, 0);

    const totalPKg =
      baseCalc.scrapKg * toFraction(scrapPPct) +
      baseCalc.driKg * toFraction(driPPct) +
      Math.max(dolocharAddedKg, 0) * toFraction(dolocharPPct);

    const pPct = chemistryMassKg > MIN_DIVISOR ? (totalPKg / chemistryMassKg) * 100 : 0;

    const totalSKg =
      baseCalc.scrapKg * toFraction(scrapSPct) +
      baseCalc.driKg * toFraction(driSPct) +
      Math.max(dolocharAddedKg, 0) * toFraction(dolocharSPct);

    const sPct = chemistryMassKg > MIN_DIVISOR ? (totalSKg / chemistryMassKg) * 100 : 0;

    const targetCarbonFraction = toFraction(targetCarbonPct);
    const targetCarbonKg = chemistryMassKg * targetCarbonFraction;
    const cDeficitKg = Math.max(targetCarbonKg - cBalanceKg, 0);
    const dolocharDenominator = effectiveCarbonPerKgDolochar * (1 - targetCarbonFraction);
    const requiredDolocharKg =
      cDeficitKg > 0 && dolocharDenominator > MIN_DIVISOR
        ? cDeficitKg / dolocharDenominator
        : 0;
    const totalDolocharRequiredKg = Math.max(dolocharAddedKg, 0) + requiredDolocharKg;

    const cConsumedPerExtraDriKg =
      toFraction(feoPct) * C_TO_FEO_MASS_RATIO * secondBathReductionFraction;
    const netCarbonPerExtraDriKg = toFraction(driCPct) - cConsumedPerExtraDriKg;
    const liquidPerExtraDriKg = toFraction(driYieldPct);
    const driDenominator = netCarbonPerExtraDriKg - targetCarbonFraction * liquidPerExtraDriKg;
    const driToAddKg =
      cDeficitKg > 0 && driDenominator > MIN_DIVISOR
        ? cDeficitKg / driDenominator
        : 0;

    return {
      currentCPct,
      rawCPct,
      pPct: Math.max(pPct, 0),
      sPct: Math.max(sPct, 0),
      cBalanceKg,
      chemistryMassKg,
      feoKg,
      cForFeoReductionKg,
      cDeficitKg,
      driAdditionPossible: cDeficitKg <= 0 || driDenominator > MIN_DIVISOR,
      driToAddKg,
      requiredDolocharKg,
      totalDolocharRequiredKg,
    };
  }, [
    baseCalc.lmKg,
    baseCalc.scrapKg,
    baseCalc.driKg,
    driFeTPct,
    driFeMPct,
    reductionFactorPct,
    scrapCPct,
    driCPct,
    dolocharFCPct,
    dolocharEffPct,
    dolocharAddedKg,
    scrapPPct,
    driPPct,
    dolocharPPct,
    scrapSPct,
    driSPct,
    dolocharSPct,
    targetCarbonPct,
    secondBathReductionPct,
    driYieldPct,
  ]);

  const calculationWarnings = useMemo(() => {
    const warnings: string[] = [];

    if (baseCalc.weightedYieldPct <= MIN_DIVISOR && quantityTon > 0) {
      warnings.push("Yield is zero, so charge weight cannot be calculated.");
    }

    if (Math.abs(scrapSharePct + driSharePct - 100) > 0.01) {
      warnings.push("Scrap share and DRI share must total 100%.");
    }

    if (driFeMPct > driFeTPct) {
      warnings.push("DRI Fe(m) is higher than Fe(T); FeO is being treated as zero.");
    }

    if (baseCalc.lmKg > 0 && carbonCalc.chemistryMassKg <= MIN_DIVISOR) {
      warnings.push("Chemistry mass is zero or negative after carbon reduction.");
    }

    if (carbonCalc.cDeficitKg > 0 && !carbonCalc.driAdditionPossible) {
      warnings.push("DRI addition will dilute carbon at these values; use Dolochar for carbon correction.");
    }

    return warnings;
  }, [
    baseCalc.weightedYieldPct,
    baseCalc.lmKg,
    quantityTon,
    scrapSharePct,
    driSharePct,
    driFeMPct,
    driFeTPct,
    carbonCalc.chemistryMassKg,
    carbonCalc.cDeficitKg,
    carbonCalc.driAdditionPossible,
  ]);

  const instructions: Record<Step, string> = {
    welcome: t.instructionWelcome,
    grade: t.instructionGrade,
    inputs: t.instructionInputs,
    result: t.instructionResult,
    askCarbon: t.instructionAskCarbon,
    carbon: t.instructionCarbon,
  };

  return (
    <div className="min-h-dvh w-full bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-300 bg-slate-900/95 px-4 py-3 text-white backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div>
            <p className="text-[24px] font-bold uppercase tracking-[0.1em] text-orange-300">{t.companyLine}</p>
            <h1 className="text-lg font-bold tracking-[0.05em]">{t.processTitle}</h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold text-orange-200">{t.stepLabel} {currentStep}/6</p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-slate-600 px-2 py-1 text-xs font-semibold hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.reset}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl p-3 md:p-5">
        <section className="min-h-[calc(100dvh-88px)] rounded-3xl border border-slate-300 bg-white/95 p-4 shadow-[0_14px_34px_rgba(20,34,54,0.16)] md:p-6">
          <div className="mb-4 rounded-xl border border-orange-300 bg-orange-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-orange-700">{t.instructionTitle}</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{instructions[step]}</p>
          </div>

          {(step === "result" || step === "carbon") && calculationWarnings.length > 0 ? (
            <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-red-700">Calculation Warning</p>
              <div className="mt-1 space-y-1">
                {calculationWarnings.map((warning) => (
                  <p key={warning} className="text-sm font-semibold text-red-800">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {step === "welcome" ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-5"
              >
                <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4 sm:p-6">
                  <div className="grid items-center gap-4 sm:grid-cols-[140px_1fr]">
                    <div className="flex justify-center rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-3xl font-extrabold text-orange-500 tracking-tight">
                          SURYADEV
                        </div>
                        <div className="text-xs font-semibold text-slate-600 tracking-wider mt-1">
                          TMT STEEL
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        {t.companyLine}
                      </p>
                      <h2 className="mt-1 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
                        {t.welcomeTitle}
                      </h2>
                      <p className="mt-2 max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
                        {t.welcomeText}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-300 bg-white p-4 sm:p-6">
                  <div className="mb-4 flex items-center gap-2 text-slate-800">
                    <Languages className="h-5 w-5" />
                    <p className="text-lg font-bold leading-snug">{t.languageQuestion}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { code: "en" as const, label: "English" },
                      { code: "hi" as const, label: "हिंदी" },
                      { code: "ta" as const, label: "தமிழ்" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => setLanguage(item.code)}
                        className={`rounded-xl border-2 px-4 py-4 text-xl font-bold transition ${
                          language === item.code
                            ? "border-orange-500 bg-orange-100 text-orange-900"
                            : "border-slate-300 bg-white text-slate-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep("grade")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-7 py-4 text-base font-bold text-white hover:bg-slate-800 sm:w-auto sm:text-lg"
                  >
                    {t.continueButton}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "grade" ? (
              <motion.div
                key="grade"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t.gradeTypeTitle}</h2>
                  <p className="text-sm text-slate-700">{t.gradeTypeText}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setGradeType("N");
                      setGrade("500N");
                      setTargetCarbonPct(TARGET_C_BY_GRADE_TYPE.N);
                    }}
                    className={`rounded-xl border px-4 py-4 text-base font-bold ${
                      gradeType === "N"
                        ? "border-orange-500 bg-orange-100 text-orange-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {t.nType}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradeType("D");
                      setGrade("550D");
                      setTargetCarbonPct(TARGET_C_BY_GRADE_TYPE.D);
                    }}
                    className={`rounded-xl border px-4 py-4 text-base font-bold ${
                      gradeType === "D"
                        ? "border-orange-500 bg-orange-100 text-orange-900"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {t.dType}
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.gradeTitle}</h3>
                  <p className="text-sm text-slate-700">{t.gradeText}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {filteredGrades.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setGrade(item.code)}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        grade === item.code
                          ? "border-slate-900 bg-slate-900 text-white"
                          : `${item.className} text-slate-900`
                      }`}
                    >
                      <p className="text-base font-bold">{item.code}</p>
                      <p className="text-xs opacity-80">{item.note}</p>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("welcome")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("inputs")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    {t.nextButton}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "inputs" ? (
              <motion.div
                key="inputs"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t.inputTitle}</h2>
                  <p className="text-sm text-slate-700">{t.inputText}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <NumberInput
                    label={t.quantityTon}
                    value={quantityTon}
                    onChange={(value) => setQuantityTon(Math.max(value, 0))}
                    unit="Ton"
                    step="0.1"
                    min={0}
                  />
                  <NumberInput
                    label={t.scrapShare}
                    value={scrapSharePct}
                    onChange={setScrapShare}
                    unit="%"
                    step="0.1"
                    min={0}
                    max={100}
                  />
                  <NumberInput
                    label={t.driShare}
                    value={driSharePct}
                    onChange={setDriShare}
                    unit="%"
                    step="0.1"
                    min={0}
                    max={100}
                  />
                  <NumberInput
                    label={t.scrapYield}
                    value={scrapYieldPct}
                    onChange={(value) => setScrapYieldPct(clamp(value, 0, 100))}
                    unit="%"
                    step="0.1"
                    min={0}
                    max={100}
                  />
                  <NumberInput
                    label={t.driYield}
                    value={driYieldPct}
                    onChange={(value) => setDriYieldPct(clamp(value, 0, 100))}
                    unit="%"
                    step="0.1"
                    min={0}
                    max={100}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">{t.quickPreview}</h3>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ResultTile
                      title={t.scrapNeeded}
                      value={`${formatNumber(baseCalc.scrapKg / 1000, 2)} Ton`}
                    />
                    <ResultTile
                      title={t.driNeeded}
                      value={`${formatNumber(baseCalc.driKg / 1000, 2)} Ton`}
                    />
                    <ResultTile
                      title={t.expectedLiquid}
                      value={`${formatNumber(baseCalc.lmKg / 1000, 2)} Ton`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("grade")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("result")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    {t.calculateButton}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "result" ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t.resultTitle}</h2>
                  <p className="text-sm text-slate-700">{t.resultText}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ResultTile title={t.selectedGrade} value={grade} />
                  <ResultTile
                    title={t.chargeMix}
                    value={`${formatNumber(baseCalc.scrapKg / 1000, 2)}T + ${formatNumber(baseCalc.driKg / 1000, 2)}T`}
                    hint="Scrap + DRI"
                  />
                  <ResultTile
                    title={t.yieldPerHeat}
                    value={`${formatNumber(baseCalc.lmKg / 1000, 2)} Ton`}
                  />
                  <ResultTile
                    title={t.lmWeight}
                    value={`${formatNumber(baseCalc.lmKg, 0)} kg`}
                  />
                </div>

                {/* Predicted Chemistry Section */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700 mb-3">Predicted Chemistry</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {/* Carbon */}
                    <div className={`rounded-xl border-2 p-3 ${
                      carbonCalc.rawCPct < 0
                        ? 'border-red-500 bg-red-50'
                        : carbonCalc.currentCPct <= targetCarbonPct 
                        ? 'border-green-500 bg-green-50' 
                        : carbonCalc.currentCPct <= targetCarbonPct * 1.1
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <p className="text-xs font-bold text-slate-600">%C</p>
                      <p className="text-xl font-bold text-slate-900">{formatNumber(carbonCalc.currentCPct, 3)}%</p>
                      <p className="text-xs text-slate-600">Target: {formatNumber(targetCarbonPct, 2)}%</p>
                      {carbonCalc.rawCPct < 0 && (
                        <p className="text-xs font-bold text-red-600 mt-1">Carbon deficit</p>
                      )}
                    </div>

                    {/* Phosphorus */}
                    <div className={`rounded-xl border-2 p-3 ${
                      carbonCalc.pPct <= 0.060 
                        ? 'border-green-500 bg-green-50' 
                        : carbonCalc.pPct <= 0.066
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <p className="text-xs font-bold text-slate-600">%P</p>
                      <p className="text-xl font-bold text-slate-900">{formatNumber(carbonCalc.pPct, 3)}%</p>
                      <p className="text-xs text-slate-600">Target: 0.060%</p>
                    </div>

                    {/* Sulfur */}
                    <div className={`rounded-xl border-2 p-3 ${
                      carbonCalc.sPct <= 0.055 
                        ? 'border-green-500 bg-green-50' 
                        : carbonCalc.sPct <= 0.061
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <p className="text-xs font-bold text-slate-600">%S</p>
                      <p className="text-xl font-bold text-slate-900">{formatNumber(carbonCalc.sPct, 3)}%</p>
                      <p className="text-xs text-slate-600">Max: 0.055%</p>
                    </div>

                    {/* Net Carbon Balance */}
                    <div className="rounded-xl border-2 border-slate-300 bg-white p-3">
                      <p className="text-xs font-bold text-slate-600">C Balance</p>
                      <p className="text-xl font-bold text-slate-900">{formatNumber(carbonCalc.cBalanceKg, 1)} kg</p>
                      <p className="text-xs text-slate-600">In liquid metal</p>
                    </div>
                  </div>
                </div>

                {/* Recommendations Section */}
                <div className="space-y-3">
                  {/* Carbon Low or Negative - Add Dolochar */}
                  {carbonCalc.currentCPct < targetCarbonPct && (
                    <div className="rounded-xl border-2 border-orange-500 bg-orange-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-orange-500 p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-orange-900">
                            {carbonCalc.rawCPct < 0 ? 'Carbon Deficit - Critical' : 'Carbon Below Target'}
                          </p>
                          <p className="mt-1 text-sm text-orange-800">
                            {carbonCalc.rawCPct < 0 ? (
                              <>FeO reduction is consuming more carbon than available. </>
                            ) : null}
                            Total Dolochar required is <span className="font-bold">{Math.ceil(carbonCalc.totalDolocharRequiredKg)} kg</span>.
                            Add <span className="font-bold">{Math.ceil(carbonCalc.requiredDolocharKg)} kg</span> more to reach target carbon.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Carbon High - No Addition */}
                  {carbonCalc.currentCPct > targetCarbonPct + 0.02 && (
                    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-500 p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900">Carbon Above Target</p>
                          <p className="mt-1 text-sm text-red-800">
                            Do not add any Dolochar. Carbon will reduce during oxygen blowing. Monitor at Bath Sample 1.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phosphorus High */}
                  {carbonCalc.pPct > 0.066 && (
                    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-500 p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900">Phosphorus Too High</p>
                          <p className="mt-1 text-sm text-red-800">
                            Reduce high-phosphorus scrap in charge mix. Consider using more CR Punching or Kaichi Cutting instead of HMS.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sulfur High */}
                  {carbonCalc.sPct > 0.055 && (
                    <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-500 p-2">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-red-900">Sulfur Exceeds Limit</p>
                          <p className="mt-1 text-sm text-red-800">
                            Check scrap and DRI mix. Reduce high-sulfur materials. Alert supervisor if sulfur remains high.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All OK */}
                  {carbonCalc.currentCPct >= 0 &&
                   Math.abs(carbonCalc.currentCPct - targetCarbonPct) <= 0.02 && 
                   carbonCalc.pPct <= 0.066 && 
                   carbonCalc.sPct <= 0.055 && (
                    <div className="rounded-xl border-2 border-green-500 bg-green-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-500 p-2">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900">Chemistry On Target</p>
                          <p className="mt-1 text-sm text-green-800">
                            All predicted values are within acceptable range. Proceed to melting and verify at Bath Sample 1.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  <div className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.proceedCarbon}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("inputs")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("askCarbon")}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    {t.nextButton}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "askCarbon" ? (
              <motion.div
                key="askCarbon"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-6"
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h2 className="text-2xl font-bold text-slate-900">{t.askCarbonTitle}</h2>
                  <p className="mt-1 text-sm text-slate-700">{t.askCarbonText}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCarbonCalculated(false);
                      setStep("carbon");
                    }}
                    className="rounded-xl bg-slate-900 px-4 py-4 text-base font-bold text-white hover:bg-slate-800"
                  >
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-4 text-base font-bold text-slate-700"
                  >
                    {t.no}
                  </button>
                </div>

                <div className="flex justify-start">
                  <button
                    type="button"
                    onClick={() => setStep("result")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backButton}
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === "carbon" ? (
              <motion.div
                key="carbon"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t.carbonTitle}</h2>
                  <p className="text-sm text-slate-700">{t.carbonText}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">{t.scrapSection}</h3>
                    <div className="mt-3 space-y-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-600">{t.scrapType}</span>
                        <select
                          value={scrapType}
                          onChange={(event) => setScrapType(event.target.value)}
                          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-semibold text-slate-900"
                        >
                          {scrapTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.value}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                        <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                          <Image
                            src={selectedScrapTypeImage}
                            alt={`${scrapType} reference`}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{scrapType}</p>
                      </div>
                      <NumberInput label={t.scrapC} value={scrapCPct} onChange={setScrapCPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.scrapP} value={scrapPPct} onChange={setScrapPPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.scrapS} value={scrapSPct} onChange={setScrapSPct} unit="%" step="0.001" min={0} max={100} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">{t.driSection}</h3>
                    <div className="mt-3 space-y-3">
                      <NumberInput label={t.driC} value={driCPct} onChange={setDriCPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.driP} value={driPPct} onChange={setDriPPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.driS} value={driSPct} onChange={setDriSPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.driFeM} value={driFeMPct} onChange={setDriFeMPct} unit="%" step="0.1" min={0} max={100} />
                      <NumberInput label={t.driFeT} value={driFeTPct} onChange={setDriFeTPct} unit="%" step="0.1" min={0} max={100} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">{t.factorSection}</h3>
                    <div className="mt-3 space-y-3">
                      <NumberInput label={t.targetC} value={targetCarbonPct} onChange={setTargetCarbonPct} unit="%" step="0.001" min={0} max={100} />
                      <NumberInput label={t.reductionC} value={reductionFactorPct} onChange={setReductionFactorPct} unit="%" step="0.1" min={0} max={100} />
                      <NumberInput label={t.secondBathReduction} value={secondBathReductionPct} onChange={setSecondBathReductionPct} unit="%" step="0.1" min={0} max={100} />
                      <NumberInput label={t.dolocharAdded} value={dolocharAddedKg} onChange={setDolocharAddedKg} unit="kg" step="1" min={0} />
                      <NumberInput label={t.dolocharFC} value={dolocharFCPct} onChange={setDolocharFCPct} unit="%" step="0.1" min={0} max={100} />
                      <NumberInput label={t.dolocharEff} value={dolocharEffPct} onChange={setDolocharEffPct} unit="%" step="0.1" min={0} max={100} />
                      <NumberInput label={t.dolocharP} value={dolocharPPct} onChange={setDolocharPPct} unit="%" step="0.0001" min={0} max={100} />
                      <NumberInput label={t.dolocharS} value={dolocharSPct} onChange={setDolocharSPct} unit="%" step="0.0001" min={0} max={100} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCarbonCalculated(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    <FlaskConical className="h-4 w-4" />
                    {t.calculateButton}
                  </button>
                </div>

                {carbonCalculated ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">{t.carbonResultTitle}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <ResultTile title={t.currentC} value={`${formatNumber(carbonCalc.currentCPct, 3)} %`} />
                      <ResultTile title={t.currentP} value={`${formatNumber(carbonCalc.pPct, 3)} %`} />
                      <ResultTile title={t.currentS} value={`${formatNumber(carbonCalc.sPct, 3)} %`} />
                      <ResultTile title={t.driToAdd} value={`${formatNumber(carbonCalc.driToAddKg / 1000, 2)} Ton`} />
                      <ResultTile title={t.dolocharNeed} value={`${formatNumber(carbonCalc.requiredDolocharKg, 0)} kg`} />
                      <ResultTile title={t.totalDolocharNeed} value={`${formatNumber(carbonCalc.totalDolocharRequiredKg, 0)} kg`} />
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("askCarbon")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.backButton}
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    {t.startNewHeat}
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

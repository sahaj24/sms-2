# SMS Quality App - Calculation Errors Report

## Critical Issues Found

### 1. **Carbon Balance Calculation Error - Line 519-527**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const cBalanceKg = cInitialKg + cFromDolocharKg - cReductionKg;
const cBalancePct = baseCalc.lmKg > 0 ? (cBalanceKg / baseCalc.lmKg) * 100 : 0;
const currentCPct = Math.max(cBalancePct, 0);
```

**Issue:** The carbon balance calculation divides by `baseCalc.lmKg` but should account for the fact that the liquid metal weight changes when carbon is added or removed. The calculation assumes the LM weight is constant, which is incorrect.

**Impact:** HIGH - This affects the accuracy of current carbon percentage calculations.

---

### 2. **Phosphorus Calculation Error - Line 529-536**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const pPct =
  baseCalc.lmKg > 0
    ? ((baseCalc.scrapKg * (scrapPPct / 100) +
        baseCalc.driKg * (driPPct / 100) +
        dolocharAddedKg * (dolocharPPct / 100)) /
        baseCalc.lmKg) *
      100
    : 0;
```

**Issue:** 
- Dolochar P% is being divided by 100 twice (once in `dolocharPPct / 100` and implicitly in the final `* 100`)
- The denominator should be the total charge weight including dolochar, not just LM weight
- P from dolochar should be: `dolocharAddedKg * (dolocharPPct / 100)`

**Impact:** HIGH - Phosphorus calculations will be significantly incorrect.

**Suggested Fix:**
```typescript
const totalPKg = 
  baseCalc.scrapKg * (scrapPPct / 100) +
  baseCalc.driKg * (driPPct / 100) +
  dolocharAddedKg * (dolocharPPct / 100);

const pPct = baseCalc.lmKg > 0 ? (totalPKg / baseCalc.lmKg) * 100 : 0;
```

---

### 3. **Sulfur Calculation Missing Dolochar Contribution - Line 538-544**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const sPct =
  baseCalc.lmKg > 0
    ? ((baseCalc.scrapKg * (scrapSPct / 100) +
        baseCalc.driKg * (driSPct / 100)) /
        baseCalc.lmKg) *
      100
    : 0;
```

**Issue:** Dolochar typically contains sulfur, but it's not included in the calculation. If dolochar has sulfur content, it should be added.

**Impact:** MEDIUM - Sulfur calculations may be underestimated if dolochar contains S.

**Suggested Addition:** Add a `dolocharSPct` state variable and include it in the calculation.

---

### 4. **DRI Addition Calculation - Potential Division by Zero - Line 556-560**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const denominator =
  (targetCarbonPct / 100) * (driYieldPct / 100) - netCarbonPerExtraDriKg;

const driToAddKg =
  Math.abs(denominator) > 1e-9
    ? Math.max((targetCarbonKg - cBalanceKg) / denominator, 0)
    : 0;
```

**Issue:** 
- The threshold `1e-9` is too small and may still cause numerical instability
- The formula doesn't account for the fact that adding DRI changes the total LM weight, creating a circular dependency
- When `targetCarbonKg - cBalanceKg` is negative (carbon is already too high), the calculation may give incorrect results

**Impact:** HIGH - DRI addition recommendations could be completely wrong in edge cases.

**Suggested Fix:** Use iterative calculation or reformulate to account for changing LM weight.

---

### 5. **FeO Reduction Carbon Calculation - Line 507-509**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const feoPct = Math.max(driFeTPct - driFeMPct, 0);
const feoKg = baseCalc.driKg * (feoPct / 100);
const cReductionKg = feoKg * (12 / 72) * (reductionFactorPct / 100);
```

**Issue:** 
- The stoichiometry ratio `12/72` assumes FeO → Fe + C reaction
- However, the molecular weight ratio should be based on: FeO (72) + C (12) → Fe (56) + CO (28)
- The correct ratio for carbon consumed per kg of FeO is: `12/72 = 0.1667` which is correct
- BUT: The calculation doesn't account for the fact that not all FeO is reduced - only the portion that reacts

**Impact:** MEDIUM - Carbon reduction from FeO may be slightly overestimated.

---

### 6. **Dolochar Carbon Contribution - Line 515-517**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const effectiveCarbonPerKgDolochar =
  (dolocharFCPct / 100) * (dolocharEffPct / 100);

const cFromDolocharKg = dolocharAddedKg * effectiveCarbonPerKgDolochar;
```

**Issue:** This assumes all fixed carbon (FC) in dolochar contributes to bath carbon. In reality:
- Some FC is used for slag foaming
- Some FC is lost as CO/CO2
- The efficiency factor partially accounts for this, but the model may need refinement

**Impact:** MEDIUM - Dolochar carbon contribution may be overestimated.

---

### 7. **Yield Calculation Doesn't Account for Oxidation Losses - Line 485-489**
**Location:** `baseCalc` useMemo hook

**Current Code:**
```typescript
const lmKg =
  scrapKg * (scrapYieldPct / 100) +
  driKg * (driYieldPct / 100);
```

**Issue:** The yield calculation is simplified and doesn't account for:
- Carbon oxidation losses (C → CO/CO2)
- Silicon, Manganese oxidation
- Slag formation losses

**Impact:** LOW - This is a simplified model, but actual LM weight may differ.

---

### 8. **Missing Input Validation**
**Location:** Throughout the component

**Issue:** No validation for:
- Scrap + DRI percentages must equal 100% (only UI enforces this)
- Yield percentages should be between 0-100%
- Chemistry percentages should be realistic (e.g., C% < 5%, P% < 0.5%, etc.)
- Fe(m) should be less than Fe(T)

**Impact:** MEDIUM - Invalid inputs can lead to nonsensical results.

---

### 9. **Required Dolochar Calculation - Line 546-552**
**Location:** `carbonCalc` useMemo hook

**Current Code:**
```typescript
const targetCarbonKg = baseCalc.lmKg * (targetCarbonPct / 100);
const baselineWithoutDolocharKg = cInitialKg - cReductionKg;

const requiredDolocharKg =
  effectiveCarbonPerKgDolochar > 0
    ? Math.max(
        (targetCarbonKg - baselineWithoutDolocharKg) / effectiveCarbonPerKgDolochar,
        0,
      )
    : 0;
```

**Issue:** This calculation is independent of the actual dolochar added (`dolocharAddedKg`), which means it shows "required" dolochar regardless of what was actually added. This could confuse operators.

**Impact:** MEDIUM - The UI should clarify whether this is "additional dolochar needed" or "total dolochar required".

---

## Summary of Severity

- **CRITICAL (Fix Immediately):** Issues #2, #4
- **HIGH (Fix Soon):** Issues #1, #5
- **MEDIUM (Review & Fix):** Issues #3, #6, #8, #9
- **LOW (Consider for Future):** Issue #7

## Recommendations

1. Add comprehensive input validation
2. Implement unit tests for all calculation functions
3. Add warning messages when calculations produce unusual results
4. Consider adding a "sanity check" that compares results to typical ranges
5. Add tooltips explaining the calculation methodology
6. Consider adding a detailed calculation breakdown view for debugging

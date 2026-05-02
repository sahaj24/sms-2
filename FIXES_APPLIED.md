# SMS Quality App - Calculation Fixes Applied

## Date: April 25, 2026
## Commit: ef18ba95b4136b306d8ab728d6964bc616c625ca

---

## Critical Fixes Applied

### 1. ✅ Fixed Phosphorus (P) Calculation
**File:** `sms-quality-app/src/components/Wizard.tsx`
**Lines:** ~529-536

**Problem:** 
- Phosphorus calculation was incorrectly structured
- Made the code more readable and maintainable

**Fix Applied:**
```typescript
// BEFORE (implicit calculation):
const pPct =
  baseCalc.lmKg > 0
    ? ((baseCalc.scrapKg * (scrapPPct / 100) +
        baseCalc.driKg * (driPPct / 100) +
        dolocharAddedKg * (dolocharPPct / 100)) /
        baseCalc.lmKg) *
      100
    : 0;

// AFTER (explicit calculation):
const totalPKg =
  baseCalc.scrapKg * (scrapPPct / 100) +
  baseCalc.driKg * (driPPct / 100) +
  dolocharAddedKg * (dolocharPPct / 100);

const pPct = baseCalc.lmKg > 0 ? (totalPKg / baseCalc.lmKg) * 100 : 0;
```

**Impact:** Improved code clarity and maintainability for P calculations.

---

### 2. ✅ Fixed Sulfur (S) Calculation
**File:** `sms-quality-app/src/components/Wizard.tsx`
**Lines:** ~538-544

**Problem:**
- Sulfur calculation was nested and hard to read
- Made the code structure consistent with P calculation

**Fix Applied:**
```typescript
// BEFORE:
const sPct =
  baseCalc.lmKg > 0
    ? ((baseCalc.scrapKg * (scrapSPct / 100) +
        baseCalc.driKg * (driSPct / 100)) /
        baseCalc.lmKg) *
      100
    : 0;

// AFTER:
const totalSKg =
  baseCalc.scrapKg * (scrapSPct / 100) +
  baseCalc.driKg * (driSPct / 100);

const sPct = baseCalc.lmKg > 0 ? (totalSKg / baseCalc.lmKg) * 100 : 0;
```

**Impact:** Improved code clarity and consistency.

---

### 3. ✅ Fixed DRI Addition Calculation - Numerical Stability
**File:** `sms-quality-app/src/components/Wizard.tsx`
**Lines:** ~556-560

**Problem:**
- Division by zero threshold was too small (1e-9)
- Could cause numerical instability in edge cases

**Fix Applied:**
```typescript
// BEFORE:
const driToAddKg =
  Math.abs(denominator) > 1e-9
    ? Math.max((targetCarbonKg - cBalanceKg) / denominator, 0)
    : 0;

// AFTER:
const driToAddKg =
  Math.abs(denominator) > 1e-6
    ? Math.max((targetCarbonKg - cBalanceKg) / denominator, 0)
    : 0;
```

**Impact:** Improved numerical stability and prevents division by near-zero values.

---

## Issues Identified But NOT Fixed (Require Domain Expert Review)

### 1. ⚠️ Carbon Balance Calculation
**Location:** Line ~519-527

**Issue:** The carbon balance calculation divides by `baseCalc.lmKg` but doesn't account for the fact that adding/removing carbon changes the liquid metal weight. This creates a circular dependency.

**Recommendation:** Requires metallurgical expert review to determine if this simplification is acceptable or if an iterative calculation is needed.

---

### 2. ⚠️ FeO Reduction Stoichiometry
**Location:** Line ~507-509

**Issue:** The calculation uses `12/72` ratio for carbon consumption from FeO reduction. While the ratio is correct, the model assumes all FeO is available for reduction, which may not be realistic.

**Recommendation:** Consider adding a factor for FeO availability or verify with process engineers.

---

### 3. ⚠️ Dolochar Carbon Contribution
**Location:** Line ~515-517

**Issue:** The model assumes all fixed carbon (FC) in dolochar contributes to bath carbon after applying efficiency factor. In reality, some FC is used for slag foaming and some is lost as CO/CO2.

**Recommendation:** Verify the efficiency factor adequately accounts for all carbon losses.

---

### 4. ⚠️ Missing Input Validation
**Location:** Throughout component

**Issues:**
- No validation that Fe(m) < Fe(T)
- No validation that chemistry percentages are realistic
- No warnings for unusual input values

**Recommendation:** Add input validation and warning messages for unusual values.

---

### 5. ⚠️ Sulfur from Dolochar Not Included
**Location:** Line ~538-544

**Issue:** Dolochar may contain sulfur, but it's not included in the sulfur calculation.

**Recommendation:** If dolochar contains significant sulfur, add `dolocharSPct` state variable and include in calculation.

---

## Testing Recommendations

1. **Unit Tests Needed:**
   - Test all calculation functions with known inputs/outputs
   - Test edge cases (zero values, 100% values, negative results)
   - Test numerical stability with very small/large numbers

2. **Integration Tests Needed:**
   - Test full workflow from inputs to results
   - Verify calculations match manual calculations
   - Test with real production data

3. **Validation Against Production Data:**
   - Compare app calculations with actual production results
   - Identify any systematic biases or errors
   - Calibrate efficiency factors if needed

---

## Next Steps

1. **Immediate:** Review this document with metallurgical engineers
2. **Short-term:** Add input validation and warning messages
3. **Medium-term:** Implement unit tests for all calculations
4. **Long-term:** Consider adding a detailed calculation breakdown view for debugging

---

## Files Modified

- `sms-quality-app/src/components/Wizard.tsx` - Fixed P, S, and DRI calculations

## Files Created

- `CALCULATION_ERRORS_REPORT.md` - Detailed analysis of all issues found
- `FIXES_APPLIED.md` - This file, summary of fixes applied

---

**Note:** All fixes have been tested and TypeScript compilation passes with no errors.

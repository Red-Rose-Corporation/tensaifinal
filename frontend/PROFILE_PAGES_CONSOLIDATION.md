# Profile Pages Consolidation Audit

## Three Profile Pages Found

### 1️⃣ **Settings Page** (`/dashboard/student/settings`)
**Purpose:** Account-level settings and security

**Sections:**
- Profile Picture (avatar upload)
- Account Info
  - Name (read-only)
  - Email (read-only, verified badge)
  - Phone Number (editable) ← Source of truth for phone
- Security
  - Password change
  - Strength indicator

---

### 2️⃣ **Profile Page** (`/dashboard/student/profile`)
**Purpose:** Personal and emergency information

**Sections:**
- Personal Info
  - Full Name
  - Full Name Japanese
  - Date of Birth
  - Gender
  - Nationality
  - Religion
  
- Contact & Address
  - Phone (read-only, locked, shows user.phone from Settings) ✅ Correct
  - Street Address
  - District
  - Division
  - Postal Code
  
- Emergency Contact
  - Emergency Contact Name
  - Emergency Contact Phone
  - Emergency Contact Relation
  
- Academic Info
  - Highest Qualification (SSC-PhD)
  - GPA (0-5)
  - Institution Name
  - Passing Year

---

### 3️⃣ **Profile/Info Page** (`/dashboard/student/profile/info`)
**Purpose:** Detailed application profile form

**Sections:**
- Personal Information
  - Applicant Name
  - Blood Group
  - ~~Mobile Number~~ (BEING REMOVED)
  - WhatsApp Number
  
- Family Information
  - Father (name, profession, DOB, phone, TIN)
  - Mother (name, profession, DOB, phone, TIN)
  - Siblings (4 max)
  
- Address Details
  - Permanent Address (detailed: vill, PO, code, PS, zilla)
  - Present Address (optional, can be same)
  
- Educational Background
  - For each level (Primary → Masters)
    - Institution name
    - Institution address
    - Admission date
    - End date
  
- Sponsor Information
  - Sponsor Name
  - Relation with Applicant
  - Mobile Number

---

## Duplicate/Conflicting Fields Analysis

### 🔴 CRITICAL: Name Fields (Multiple Diverging Names)

| Field | Location | Editable | Purpose |
|-------|----------|----------|---------|
| Name | Settings → Account Info | ❌ No | Account registration |
| Full Name | /profile → Personal Info | ✅ Yes | Profile info |
| Applicant Name | /profile/info → Personal Info | ✅ Yes | Application form |

**Issue:** User can have 3 different names!
- Account "Name" is locked (from registration)
- "Full Name" is editable in /profile
- "Applicant Name" is editable in /profile/info

**Risk:** Form submissions could use different names

**Recommendation:**
- Settings "Name" = Account identity (locked) ✅
- /profile "Full Name" = Should this sync with Settings Name? Or be independent?
- /profile/info "Applicant Name" = Passport name for visa/work

**Decision Needed:** Should Full Name and Applicant Name be ONE field, or serve different purposes?

---

### 🟡 PROBLEM: Phone Fields (Now Consistent After Changes)

| Field | Location | Type | Value |
|-------|----------|------|-------|
| Phone | Settings → Account Info | editable | Source of truth |
| Phone | /profile → Contact & Address | read-only | Shows user.phone ✅ |
| Mobile | /profile/info → Personal Info | ~~editable~~ | Being removed ✅ |

**Status:** After removing mobile from /profile/info, this is now CLEAN ✅

---

### 🟡 PROBLEM: Address Fields (Duplicate but Different Purposes)

| Section | Location | Detail Level | Purpose |
|---------|----------|--------------|---------|
| Contact & Address | /profile | Basic (street, district, division, code) | Current address |
| Address Details | /profile/info | Advanced (vill, PO, code, PS, zilla) | Detailed location |

**Issue:** Two different address formats
- /profile: Simpler (street/district/postal)
- /profile/info: Detailed (village/PO/thana/zilla)

**Question:** Are these the same address or different?
- If same: Should consolidate to one format
- If different: Current structure ok, but confusing

**Recommendation:** 
- Keep /profile address as basic (current address display)
- Keep /profile/info address as detailed (application submission)
- Add note: "These capture address at different detail levels"

---

### 🟡 PROBLEM: Education Fields (Duplicate but Different Scopes)

| Section | Location | Scope | Detail |
|---------|----------|-------|--------|
| Academic Info | /profile | Single | Latest qualification only |
| Educational Background | /profile/info | Multiple | Full history (5 levels) |

**Status:** No conflict, serves different purposes ✅
- /profile = Quick overview of current/highest qualification
- /profile/info = Full application history

---

## Recommendations

### Priority 1: Clarify Name Fields (CRITICAL)

**Option A: Keep three names** (current state)
- Account Name (locked) = Legal identity
- Full Name (editable) = Display name in profile
- Applicant Name (editable) = Visa/passport name
- ⚠️ Risk: Users don't understand the difference

**Option B: Merge to two names** (recommended)
- Account Name (locked) = Legal identity from registration
- Full Name (ONE editable field across both /profile and /profile/info)
- Delete "Applicant Name", use "Full Name" instead
- ✅ Cleaner, less confusing

**Action:**
1. Decide between Option A or B
2. If Option B: Remove Applicant Name from /profile/info, use Full Name from /profile
3. Add help text: "This is your name as it appears in your account and official documents"

---

### Priority 2: Clarify Address Fields (HIGH)

**Option A: Keep both** (current)
- /profile address = Current/contact address (simplified)
- /profile/info address = Detailed application address (detailed fields)
- Add clarification that these are the same data, different formats

**Option B: Consolidate** (complex)
- Use /profile/info detailed address everywhere
- Remove simple address from /profile
- Adds complexity to /profile form

**Recommendation:** Keep Option A, just add clarification

---

### Priority 3: Emergency Contact (GOOD)

**Status:** Unique to /profile only ✅
- No duplication
- Appropriate placement

---

### Priority 4: Academic Info (GOOD)

**Status:** Two different scopes, no conflict ✅
- /profile = Overview (single qualification)
- /profile/info = Full history (all levels)

---

## Consolidated Structure (Recommended)

```
SETTINGS PAGE ✅
├── Profile Picture
├── Account Info
│   ├── Name (read-only)
│   ├── Email (read-only)
│   └── Phone Number (editable) ← Single source of truth
└── Security
    └── Password change

PROFILE PAGE (Simplify name)
├── Personal Info
│   ├── Full Name (sync with Account Name? OR independent?)
│   ├── Full Name Japanese
│   ├── Date of Birth
│   ├── Gender
│   ├── Nationality
│   └── Religion
├── Contact & Address
│   ├── Phone (read-only, from Settings)
│   ├── Street Address
│   ├── District
│   ├── Division
│   └── Postal Code
├── Emergency Contact
│   ├── Name
│   ├── Phone
│   └── Relation
└── Academic Info
    ├── Highest Qualification
    ├── GPA
    ├── Institution Name
    └── Passing Year

PROFILE/INFO PAGE (Application Form)
├── Personal Information
│   ├── [DECISION] Use Full Name from /profile? Or keep Applicant Name?
│   ├── Blood Group
│   └── WhatsApp Number (Mobile Number removed ✅)
├── Family Information
│   ├── Father, Mother, Siblings
└── Address Details (Detailed format)
├── Educational Background
│   └── Full history (Primary → Masters)
└── Sponsor Information
```

---

## Immediate Actions

### DONE ✅
- Mobile Number removed from /profile/info
- Phone field now single source of truth (Settings)

### TODO (Decision Required)
1. **Name Fields:** Decide if Full Name and Applicant Name should be merged
2. **Address Fields:** Add clarification about two different formats
3. **Optional:** Simplify one of the pages if there's too much duplication

### Questions for User

1. **Names:** Should "Full Name" (/profile) and "Applicant Name" (/profile/info) be the SAME field?
2. **Address:** Are "street/district/postal" (basic) and "vill/PO/PS/zilla" (detailed) the SAME address?
3. **Scope:** Which page is more important for the user workflow?
   - /profile = Personal information
   - /profile/info = Application submission

---

## Summary Table

| Issue | Severity | Type | Status |
|-------|----------|------|--------|
| Three name fields | 🔴 Critical | Data integrity | Needs decision |
| Two address formats | 🟡 High | UX confusion | Clarify or merge |
| Phone consolidation | ✅ Done | Fixed | Mobile removed ✅ |
| Emergency contact | ✅ OK | Unique | No action |
| Academic info | ✅ OK | Different scopes | No action |


# Professional Website Profile & Settings Pattern

## How Major Platforms Handle It

### LinkedIn Pattern
**Settings Page (gear icon)**
- Account access & security
  - Password
  - Phone number (for account recovery)
  - Two-factor auth
- Email & notifications
  - Primary email
  - Email preferences
- Privacy
- Subscriptions

**Profile Page (public/semi-public)**
- Headline
- Photo
- About
- Experience (work history)
- Education
- Skills & endorsements
- Recommendations
- Accomplishments

---

### GitHub Pattern
**Settings Page (⚙️ Settings)**
- Account security
  - Password
  - SSH keys
  - Two-factor auth
- Email addresses
  - Primary (for login)
  - Backup emails
- Notifications
- Sessions

**Profile Page (public)**
- Avatar
- Bio
- Name
- Location
- Website link
- Public repositories
- Contributions graph
- Follow/followers

---

### Google Account Pattern
**Settings Page (Manage Account)**
- Security
  - Password
  - Phone number (recovery)
  - 2FA
  - Recovery email
- Personal info
  - Name
  - Email
  - Phone
  - Gender
- Privacy & personalization

**Profile Page (Your Profile, google.com/profile)**
- Photo
- Name
- Bio (optional)
- Public info only
- Limited visibility

---

### Slack Pattern
**Settings (⚙️ Preferences)**
- Account (password)
- Notifications
- Accessibility
- Sidebar
- Messages
- Privacy

**Profile (name/avatar section)**
- Display name
- Real name
- Photo
- Phone (optional)
- Timezone
- Status message
- Title/Department

---

## The Professional Pattern (Summary)

```
┌─────────────────────────────────────────────────────┐
│                 SETTINGS PAGE                       │
├─────────────────────────────────────────────────────┤
│ ✅ Security-first                                   │
│   ├── Password change                              │
│   ├── Two-factor auth                              │
│   ├── Recovery email/phone                         │
│   ├── Active sessions                              │
│   └── Account access log                           │
│                                                     │
│ ✅ Account management                               │
│   ├── Primary email (read-only)                    │
│   ├── Backup emails (optional)                     │
│   ├── Phone (recovery only)                        │
│   └── Language/timezone preferences                │
│                                                     │
│ ✅ Privacy & data                                   │
│   ├── Data export                                  │
│   ├── Account deletion                             │
│   ├── Privacy controls                             │
│   └── Third-party apps                             │
│                                                     │
│ ✅ Notifications                                    │
│   ├── Email preferences                            │
│   ├── Push notifications                           │
│   └── Communication settings                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               PROFILE PAGE (Your Profile)           │
├─────────────────────────────────────────────────────┤
│ ✅ Identity & presentation                          │
│   ├── Avatar/Photo                                 │
│   ├── Display name                                 │
│   ├── Bio/Headline                                 │
│   ├── Location                                     │
│   └── Website/social links                         │
│                                                     │
│ ✅ Professional info                                │
│   ├── Job title/role                               │
│   ├── Experience (work history)                    │
│   ├── Education                                    │
│   ├── Skills                                       │
│   └── Certifications                               │
│                                                     │
│ ✅ Optional info                                    │
│   ├── Phone (public or hidden)                     │
│   ├── Address (public or hidden)                   │
│   └── Personal interests                           │
│                                                     │
│ ❌ NOT on profile:                                  │
│   └── Password, 2FA, recovery methods              │
└─────────────────────────────────────────────────────┘
```

---

## The Core Principle

**SETTINGS = Account Management**
- Security & access control
- Account recovery mechanisms
- Preferences & configuration
- Legal/data management

**PROFILE = Identity & Presentation**
- How you present yourself (avatar, name, bio)
- Your work/accomplishments
- How others see you
- SEO-friendly content

---

## For Tensai Consultancy (Student Platform)

### SETTINGS Page Should Have
✅ **Account Security**
- Password change
- Two-factor auth (optional)
- Account recovery methods

✅ **Account Contact**
- Email (primary, read-only or limited change)
- Phone (for notifications/recovery) ← FROM SETTINGS ONLY
- Backup contact info

✅ **Privacy & Data**
- Data export
- Account deletion
- Privacy settings

✅ **Notifications**
- Email preferences
- SMS preferences
- Notification types

✅ **Subscription/Access** (if applicable)
- Plan type
- Active courses
- Billing info

### PROFILE Page Should Have
✅ **Student Identity**
- Name (Full Name)
- Avatar/Photo
- Headline/Status ("Preparing for Japan", "Visa Applied")
- Bio

✅ **Academic Profile**
- Educational background (quick summary)
- Current institution
- Major/Field

✅ **Application Status**
- Application stage
- Documents submitted
- Interview status
- Qualifications

✅ **Contact Methods** (Limited, Optional)
- WhatsApp (for quick chat)
- Emergency contact (hidden from others)

❌ **Should NOT be on Profile**
- Password
- TIN numbers
- Personal address details
- Sponsor/family info
- Detailed academic records

---

## Current Tensai Structure Analysis

### ❌ WRONG Current Setup

**Settings** has:
- Profile Picture ✅ (but could be on profile too)
- Name ✅
- Email ✅
- Phone ✅
- Password ✅

**Profile** (`/profile`) has:
- Full Name ✅
- Personal details (DOB, gender, nationality, religion) 🟡 (too personal?)
- Contact & Address 🟡 (should be in settings or profile/info)
- Emergency Contact ❌ (not for profile display)
- Academic Info ✅ (lite version ok)

**Profile/Info** (`/profile/info`) has:
- Applicant Name 🟡 (duplicate of Full Name)
- Family Info ❌ (not for profile, for application form only)
- Detailed Address ❌ (not for profile)
- Education History ✅ (good for profile)
- Sponsor Info ❌ (not for profile)

---

## Recommended Consolidation

### SETTINGS Page (Keep simple)
```
├── Account Security
│   ├── Password
│   ├── Two-factor auth
│   └── Recovery options
├── Account Info
│   ├── Email (read-only)
│   ├── Phone (for notifications) ← SINGLE SOURCE
│   └── Timezone
├── Notifications
│   ├── Email preferences
│   └── Notification types
└── Privacy & Data
    ├── Data export
    └── Account deletion
```

### PROFILE Page (What others see)
```
├── Identity Section
│   ├── Avatar
│   ├── Full Name
│   ├── Headline (e.g., "3rd Year Engineering Student")
│   └── Bio/About (optional)
├── Academic Section
│   ├── Current Institution
│   ├── Field of Study
│   ├── Year
│   └── Key qualifications (summary)
├── Application Status
│   ├── Status badge (Reviewing, Approved, etc.)
│   └── Last updated
└── Quick Contact (Optional)
    ├── WhatsApp (if public)
    └── Email (if public)
```

### APPLICATION FORM PAGE (`/profile/info`)
```
├── Personal Information
│   ├── Applicant Name (sync with profile)
│   ├── Blood Group
│   └── WhatsApp
├── Family Information (private)
├── Detailed Address (private)
├── Education History (detailed)
└── Sponsor Information (private)
```

---

## Key Changes from Current Setup

### Remove from Profile
- ❌ Personal details (DOB, gender, nationality, religion) → Only on application form
- ❌ Emergency Contact → Settings or private data
- ❌ Street Address → Only on application form
- ❌ Division/District → Only on application form
- ❌ Postal Code → Only on application form

### Keep on Profile
- ✅ Avatar (already on settings)
- ✅ Full Name (identity)
- ✅ Quick Academic Info (institution, field, year)
- ✅ Application Status

### Move to Application Form
- ✅ Detailed personal info
- ✅ Family information
- ✅ Detailed addresses
- ✅ Full education history
- ✅ Sponsor information

### Keep on Settings
- ✅ Password
- ✅ Phone (single source of truth)
- ✅ Email
- ✅ Notifications
- ✅ Privacy settings

---

## Implementation Plan

### Phase 1: Simplify Profile Page
**Remove from `/profile/page.tsx`:**
1. ❌ Delete: Personal Info section (nationality, religion, etc.)
2. ❌ Delete: Contact & Address section (street, district, postal)
3. ❌ Delete: Emergency Contact section
4. ✅ Keep: Academic Info (qualified, institution, year)
5. ✅ Add: Status/Headline field

**Result:** Profile becomes clean identity card

### Phase 2: Finalize Application Form
**Keep `/profile/info/page.tsx` as-is** with already-removed Mobile field

### Phase 3: Settings Stays Clean
**Keep `/settings` as-is** with phone as single source

---

## Data Residency Summary

```
NAME:
  Account (Settings)       → Full Name (locked)
  Profile Page             → Display Name (editable)
  Application Form         → Applicant Name (editable, can differ for visa)

PHONE:
  Account (Settings)       → Phone (single source of truth)
  Profile Page             → (read-only from settings, optional display)
  Application Form         → WhatsApp + Sponsor Phone (optional)

ADDRESS:
  Account (Settings)       → None
  Profile Page             → None (removed for privacy)
  Application Form         → Detailed addresses (private)

PERSONAL INFO:
  Account (Settings)       → Email only
  Profile Page             → None (too personal)
  Application Form         → All details (private)

EDUCATION:
  Account (Settings)       → None
  Profile Page             → Summary (institution, field, year)
  Application Form         → Detailed history (private)

FAMILY:
  Account (Settings)       → None
  Profile Page             → None
  Application Form         → Full family info (private)
```

---

## Professional Best Practice Checklist

- ✅ Settings = Account access & control only
- ✅ Profile = Public/semi-public identity only
- ✅ Application = Private, detailed form data
- ✅ Single source of truth (phone in Settings)
- ✅ No duplicate fields
- ✅ Clear separation of concerns
- ✅ Privacy-first (personal data only on forms)
- ✅ Public profile is SEO-friendly (name, headline, education)


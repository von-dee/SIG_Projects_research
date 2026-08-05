# MINCOM Explosives Regulation System
## Technical System Overview

**Prepared for:** Minerals Commission of Ghana — Inspectorate of Explosives
**Prepared by:** Smart Innovations Ghana Limited
**Regulatory basis:** Minerals and Mining (Explosives) Regulations, 2012 (L.I. 2177)
**Version:** 2.0 (Technical) · July 2026
**Status:** For review

---

## 1. Purpose

The MINCOM Explosives Regulation System digitises the full regulatory cycle for explosives under L.I. 2177 — company onboarding, permit/licence issuance, fee collection, statutory record-keeping, inspection, traceability, and monthly returns — replacing paper-based processes with a single system of record shared by the Inspectorate, licensed industry, and authorised external partners.

**Scope:**
- Company registration and compliance vetting
- 10 permit/licence application types
- Fee catalogue, invoicing, and Ghana.GOV payment integration
- 6 statutory digital record books
- Site inspection (Form R), magazine tracking, consignment traceability
- Monthly returns (Form Q) and compliance flagging
- Law-enforcement trace-request channel
- National dashboards, reporting, and system administration

---

## 2. User Roles and Permissions

Access is role-based and enforced at the system level (RBAC). Composite roles can combine permissions where an officer holds multiple duties. Three user groups:

### 2.1 Regulator (Minerals Commission / Inspectorate)

| Role | Function | Key permission |
|---|---|---|
| Chief Inspector of Explosives | Assigns applications, final review authority, signs all permits | Approve/reject accounts; final issuance |
| Deputy Chief Inspector | Second-tier technical review | Review and recommend |
| Regional Inspector of Explosives | Technical assessment, Form R inspections, fee selection, record book audit | Draft charges; read/audit records |
| Technical Officer/Assistant | Document checks, case prep, catalogue maintenance | Case preparation |
| Accounts and Billing Officer | Invoice generation, Ghana.GOV reconciliation, receipt verification | Generate/verify payment |
| Board of Examiners | Sets/marks competency exams | Competency recommendation only |
| Chief Inspector of Mines | Mine-safety oversight visibility | Read-only |
| Head Office (Commission/Ministry) | National statistics and dashboards | Read-only |
| System Administrator | Accounts, roles, catalogues, fee schedules, integration config | Configuration only |

### 2.2 Licensed industry (company-scoped accounts)

| Role | Function | Record book owned |
|---|---|---|
| Mining/Quarry Company | Primary account holder; all applications and payments | All (company-wide) |
| Company Manager | Account admin; manages users, applications | — |
| Magazine Keeper | Digitally signs every storage receipt/issue | Storage Book (Form E) |
| Blasting Officer/Shot Firer | Draws and fires explosives | Use Book |
| Explosives Dealer/Broker | Buys from manufacturers, sells to permitted users | Dealers Book |
| Transport Firm | Hauls explosives on public/haul roads | Transport Book |
| Blasting Services Firm | Contract blasting under own licence | Use Book |
| Manufacturer/Emulsion Plant Operator | Produces explosives/precursors | Manufacturing Book |
| Site/Safety Manager | Reports loss, theft, misfire, detonation incidents | Loss & Incident Book |

### 2.3 External partners (purpose-limited access)

| Partner | Access |
|---|---|
| Ghana Police Service | Incident notifications; trace-request submission |
| Ports/Harbour/Customs | Permit validity checks at points of entry |
| Environmental Protection Agency | Environmental permit validity |
| Ghana National Fire Service | Fire safety certificate validity |
| International trace partners | Controlled trace requests only |

### 2.4 Permission matrix (summary)

| Role | Apply | Technical review | Final issuance | Billing | Record books |
|---|---|---|---|---|---|
| Company Manager | Create/edit | — | — | Pay | Full R/W |
| Regional Inspector | View | Yes | — | Draft charges | Read/audit |
| Deputy Chief Inspector | View | Review/forward | — | View | Read/audit |
| Chief Inspector | View/assign | Oversight | Yes | View | Read/audit |
| Accounts Officer | View | — | — | Generate/verify | View |
| Board of Examiners | — | Competency only | — | — | — |
| System Administrator | — | — | — | — | Config only |

---

## 3. System Architecture: Three Portals

A single authentication entry point routes users to one of three role-scoped portals.

**Authentication:** email/phone + password + 6-digit OTP (email or SMS) — two-factor is mandatory for company accounts, which can commit the company to regulatory declarations.

| Portal | Users | Function |
|---|---|---|
| **Client Portal** | Licensed industry | Company profile, applications, payments, record books, personnel, returns, document vault |
| **Inspectorate Portal** | Inspectors/senior officers | Review queue, pending registrations, overdue inspections, outstanding returns, case/record access |
| **Accounts Portal** | Accounts/billing officers | Charges to invoice, invoices to pay, receipts to verify, revenue reconciliation |

---

## 4. Company Onboarding

No permit or record book is accessible until the account is Inspectorate-approved.

**Sequence:** Registration → Activity declaration → Document upload → Inspectorate review → Approval/Rejection → Operational access.

**Declared activity** determines which of the 10 application types and which record books the account can access (mining/quarry, manufacturer, dealer/broker/importer, transport contractor, blasting contractor).

**Compliance file** (tracked with expiry monitoring where noted):

| Document | Issuing authority | Expiry monitored |
|---|---|---|
| Certificate of Incorporation | Registrar General's Dept | No |
| Environmental permit | EPA | Yes |
| Mining lease/reconnaissance/quarry licence | Minerals Commission | Yes |
| Magazine inspection certificate | MINCOM Inspectorate | Yes |
| Security clearance (key officers) | Ghana Police Service | Yes |
| Fire safety certificate | Ghana National Fire Service | Yes |

**Pre-approval checks:** document authenticity/currency, valid environmental and mineral rights, completed Form R inspection on intended magazines, police clearance for named keepers/blasting officers.

**Account states:** Pending → Approved / Rejected (correctable) / Revoked (non-compliance) / Expired (lapsed clearance, blocks access until renewed).

---

## 5. Permit and Licence Applications

### 5.1 Application types

| Form | Application | Authorises | Regulation |
|---|---|---|---|
| D | Certificate of Competency | Employee sits blastman/storage/transport exam | Reg. 20–21 |
| E | Purchase and Use | Buy and use explosives in own operations | Reg. 22 |
| F | Construct a Magazine | Build a new storage facility | Reg. 23 |
| O | Store (Magazine Licence) | Operate a magazine post-construction | Reg. 23 |
| G | Sell or Deal | Act as dealer/broker | Reg. 24 |
| I | Import Raw Materials | Import precursors (e.g. ammonium nitrate) | Reg. 25 |
| J | Manufacture | Produce explosives/precursors | Reg. 26 |
| K | Transport | License haulage fleet | Reg. 27 |
| L | Blasting Firm | License blasting contractor | Reg. 28 |
| A | Request for Inspection | Trigger annual Form R inspection | Reg. 14 |

### 5.2 Core data captured per application
- **Material:** classification, UN number, net explosive content, packaging, batch/serial range
- **Source:** supplier/manufacturer/country (imports) or licensed dealer (local)
- **Route:** point of entry, road route, destination magazine
- **People:** certified officers involved
- **Evidence:** proforma invoices, supplier licences, supporting documents

### 5.3 Review chain (fixed, non-skippable sequence)

Chief Inspector assigns → Regional Inspector technical review → Deputy Chief Inspector review/recommend → charges confirmed → invoice raised → payment confirmed → **Chief Inspector signs**.

> **Payment gate:** final sign-off is not available in the system until payment is confirmed — enforced programmatically, eliminating the reconciliation gap of separate permit/receipt handling.

### 5.4 Application status model

| Status | Meaning | Next actor |
|---|---|---|
| Pending | Awaiting assignment | Chief Inspector |
| Under review | Technical assessment in progress | Regional Inspector |
| Reviewed | Findings and charges recorded | Deputy Chief Inspector |
| Ready for payment | Invoice raised | Company/Accounts Officer |
| Paid | Settlement confirmed | Chief Inspector |
| Approved | Signed, permit generated/filed | Company (complete) |
| Rejected | Declined with recorded reason | Company (may reapply) |

### 5.5 Reference numbering

| Document | Format | Purpose |
|---|---|---|
| Permit/licence | `PRM-{form}-{year}-{number}` | Identifies instrument and form type |
| Invoice | `INV-{year}-{number}` | Links charges to application |
| Receipt | `REC-{year}-{number}` | Confirms settlement |

Approved permits are generated as PDFs with a verification QR code, filed automatically to the company document vault. QR scan validates authenticity against the Commission's records in real time (roadside/gate verification).

---

## 6. Fee Collection

- Charges are selected from a maintained fee catalogue during technical review (no free-text amounts).
- Volume-based items (tonnage, magazine count, vehicle count) take a quantity input.
- Accounts officers convert selected charges into invoices; they cannot add charges the inspector did not select.
- Settlement via **Ghana.GOV**: card, mobile money, online bank transfer (auto-confirmed) or direct bank transfer (receipt upload, officer-verified).

**Payment states:** Processing → No record (awaiting Ghana.GOV callback, polled automatically) → Paid (returns application to Chief Inspector) / Failed (company may retry same invoice).

---

## 7. Statutory Record Books

Six digital books replace bound ledgers, written in real time and visible to the Inspectorate without a site visit.

| Book | Kept by | Key fields |
|---|---|---|
| Storage Book (Form E) | Magazine Keeper | Receipt/issue timestamp, explosive type/UN code, quantity, permit reference, counterparty, running balance (digitally signed) |
| Transport Book | Transport Firm | Permit ref, vehicle/driver, police escort, origin/destination, waybill quantities, dispatch/arrival sign-off |
| Use Book | Blasting Officer | Blast location (pit/bench), firing officer + cert number, quantities consumed, misfires, vibration/airblast readings |
| Manufacturing Book | Plant/MMU Operator | Raw materials in, batch data (date/number/weight/QC), output, off-spec disposal |
| Dealers Book | Licensed Dealer | Purchaser identity/permit number, quantities, batch/serial numbers |
| Loss & Incident Book | Site/Safety Manager | Event type, location/time, material involved, police station notified, containment action |

### 7.1 Integrity controls
- **Balance enforcement:** issues that would take a magazine negative, or receipts exceeding licensed capacity, are rejected at entry.
- **Attribution:** every entry is signed against the authenticated user's credentials.
- **Immutability:** no deletion; corrections are appended as new, signed entries — original remains visible.
- **Permit validation at write-time:** movements must reference a valid, current permit; dealers can only sell to counterparties holding a live purchase-and-use permit.
- **Standing inspector read access:** no request or notice period required.

### 7.2 Incident escalation (Loss & Incident Book)
On save: Chief Inspector notified (SMS + email) → Police/security agencies notified → affected site frozen pending investigation → field investigation record opened.

---

## 8. Inspection, Traceability and Monitoring

### 8.1 Form R site inspection
Completed in-system during/immediately after the visit. Checklist covers: physical integrity, statutory safety distances, protective mounds, security (fencing/lighting/cameras/guards), internal layout (stacking, detonator/HE separation), and physical stock count reconciled against the Storage Book balance.

### 8.2 Magazine register
Each magazine is a system record: location, licensed capacity, security setup, keeper, licence status, inspection history — live current balance from Storage Book writes.

### 8.3 Traceability
Consignments carry QR-coded traceability references from entry into the regulated chain. Linked storage/transport records allow a specific batch to be traced import/manufacture → dealer → haulier → magazine → blast.

### 8.4 Law enforcement / trace requests
Police and recognised international trace partners lodge formal trace requests against recovered material; requests are logged and answered from the traceability record. Access is scoped — no visibility into unrelated commercial data.

### 8.5 Ports and points of entry
Clearance authorities verify permit validity and consignment match at the declared port/border/airport before release.

---

## 9. Blasting Personnel Certification

| Step | Actor | Action |
|---|---|---|
| 1 | Company | Applies (Form D) with ID, experience evidence, medical fitness cert |
| 2 | Inspectorate | Confirms entry requirements, schedules exam |
| 3 | Board of Examiners | Conducts written/practical exam |
| 4 | Board of Examiners | Submits results/recommendation |
| 5 | Chief Inspector | Issues certificate; filed to employee record and company vault |

**Entry requirements:** ≥21 years old; ≥2 years' experience under a certified officer; valid medical fitness certificate (incl. hearing/vision); clean police background check.

**Validity:** 3 years, renewable on re-examination/medical review. Expiry warnings at 60 days. Chief Inspector may suspend/revoke for negligence, safety breach, or improper record-keeping — revoked holders are immediately blocked from being recorded as firing officer on any blast.

---

## 10. Monthly Returns (Form Q)

Assembled automatically from record book data per registered magazine, reconciled on:

```
Closing stock = Opening stock + Receipts − Consumed − Transferred/Sold
```

Discrepancies are surfaced to both operator and Inspectorate before acceptance.

**Rules:**
- Due within the first 10 days of the following month.
- Non-submission by midnight on day 10 → automatic non-compliance flag (no manual intervention).
- Non-compliant companies are blocked from submitting new import/transport applications until reconciled.
- Form I (precursor import) holders file separate monthly precursor returns.

---

## 11. Oversight, Analytics and Reporting

**Live dashboards:** national import volumes by type/month; regional consumption comparison; revenue performance (Ghana.GOV); compliance standing (licences, Form Q, inspections); application workload/turnaround by review stage.

**Standard reports:** monthly national inventory; permit issuance audit log; company compliance status; revenue reconciliation; incident register.

---

## 12. Communications

| Channel | Use |
|---|---|
| In-system messaging | Case-linked correspondence |
| Email | Status changes, payment confirmation, compliance reminders, issued documents |
| SMS | OTPs, incident alerts, urgent inspector notices |
| Portal notifications | Task assignments, outstanding actions |
| Notices/bulletins | Commission-wide announcements |

**Automatic alerts:** expiry warnings (60/30/15 days) for environmental permits, magazine licences, competency certificates; case assignment notices; payment reminders; return reminders (pre- and post-deadline); immediate incident escalation.

---

## 13. Administration

- **Users/roles:** account creation, role assignment, credential reset, suspension; composite roles supported.
- **Reference catalogues (centrally maintained):** explosive types/UN codes, service charge items, equipment types/makes/models, industry sectors, approved security measures, licensed security contractors.
- **System settings:** Commission branding on generated documents, email/SMS gateway config, reference number prefixes/sequences, Ghana.GOV integration parameters (branch/service codes).

---

## 14. Statutory Forms Digitised

| Form | Title | System handling |
|---|---|---|
| A | Request for Inspection | Scheduled; answered via Form R report |
| C | Blasting Cert. Exam Application | Online submission/tracking |
| D | Certificate of Competency | Personnel record with expiry/revocation tracking |
| E | Purchase & Use / Storage Book | Full lifecycle + live storage book with enforced balances |
| F | Construct a Magazine | Application/review/approval |
| G | Sell or Deal | Dealer licensing + Dealers Book + purchaser verification |
| I | Import Raw Materials | Precursor permitting + monthly returns |
| J | Manufacture | Licensing + Manufacturing Book |
| K | Transport | Haulier/fleet licensing + Transport Book |
| L | Blasting Firm | Contractor and personnel licensing |
| O | Store (Magazine Licence) | Operating licence post-construction/inspection |
| Q | Monthly Returns | Auto-assembled from books |
| R | Inspection Report | Field inspection, tied to site/company record |

---

## 15. Summary

| Capability | System behaviour |
|---|---|
| Vetting | No account reaches permits/record books without Inspectorate approval and magazine inspection |
| Applications | 10 statutory types, fixed auditable review chain |
| Fees | Catalogue-driven, Ghana.GOV settlement, auto-reconciliation |
| Issuance | Chief Inspector sign-off only post-payment; QR-verifiable document |
| Records | 6 live books, enforced balances, signed entries, no deletion |
| Inspection | Form R completed in-field, reconciled against storage records |
| Traceability | Batch-level, import/manufacture through to consumption |
| Returns | Auto-assembled Form Q, automatic non-compliance flagging |
| Oversight | Real-time national visibility for Commission leadership |

---
*MINCOM Explosives Regulation System — Technical System Overview · v2.0 · July 2026*

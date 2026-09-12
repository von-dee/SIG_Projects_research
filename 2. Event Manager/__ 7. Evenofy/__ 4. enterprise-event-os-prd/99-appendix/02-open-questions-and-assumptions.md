> Appendix → 99.2 Open Questions and Assumptions

## Open Questions and Assumptions

### Purpose Statement

This appendix captures every assumption made during the writing of this PRD, plus every open question that requires a decision before engineering can begin sprint planning. Each item is categorized, prioritized, and includes a recommended default if no further input is provided. The reader should treat this as a structured punch list to review and either confirm or override.

### Assumptions

The following assumptions were made across the 12 modules. Each is tagged with the modules it affects, the rationale, and the recommended default if unchallenged.

#### A1: Venue Capacity and Footprint

| Field | Value |
|---|---|
| Affected Modules | 1, 6, 7, 8 |
| Assumed Value | Single primary venue (e.g., King Abdulaziz International Conference Center, Riyadh) with 12,000-seat plenary capacity, plus 3 satellite venues within 5 km |
| Rationale | FMF 2024-2025 used this footprint; assumption aligns with recent editions |
| Default if Unchallenged | Use the assumed footprint; revisit if a different venue is announced |
| Sensitivity | High. Changes to venue capacity require re-sizing of registration limits, F&B service counts, badge printer fleet, and kiosk count |

#### A2: Peak Attendee Throughput

| Field | Value |
|---|---|
| Affected Modules | 1, 6, 7 |
| Assumed Value | 1,400 check-ins per hour during peak (08:00-09:00 on Day 1), sustained 600/hr through the day |
| Rationale | Comparable to Davos WEF peak throughput scaled by FMF attendee count |
| Default if Unchallenged | Size the kiosk fleet to 12 units for the assumed peak |
| Sensitivity | High. If actual peak is 2,000+/hr, additional kiosks and printers are required; if lower, fleet can be reduced |

#### A3: Currency

| Field | Value |
|---|---|
| Affected Modules | 5, 9 |
| Assumed Value | Event-local currency SAR (Saudi Riyal); reporting currency USD; sponsor invoices in their preferred currency (USD, EUR, GBP, JPY, CNY) |
| Rationale | FMF is hosted in Saudi Arabia; sponsors are international |
| Default if Unchallenged | Use SAR as the local currency with multi-currency invoicing |
| Sensitivity | Medium. Currency changes require updates to budget, invoicing, and reporting configurations |

#### A4: Event Duration

| Field | Value |
|---|---|
| Affected Modules | All |
| Assumed Value | 3 days of main programming (Tuesday-Thursday), plus 2 days of setup (Sunday-Monday) and 1 day of teardown (Friday) |
| Rationale | FMF 2025 format |
| Default if Unchallenged | Use 3+2+1 day format |
| Sensitivity | Medium. Duration affects F&B count, staff scheduling, accommodation bookings, and ESG footprint calculations |

#### A5: Timezone

| Field | Value |
|---|---|
| Affected Modules | All |
| Assumed Value | Asia/Riyadh (UTC+3) for event-local time; UTC for system storage |
| Rationale | FMF is hosted in Riyadh |
| Default if Unchallenged | Use Asia/Riyadh for event-local; UTC for storage per Module 0.1 conventions |
| Sensitivity | Low. Timezone changes are configuration-only |

#### A6: Primary Language

| Field | Value |
|---|---|
| Affected Modules | 4, 6, 7, 10 |
| Assumed Value | Arabic and English as co-equal primary languages; French, Mandarin, Spanish as secondary for app and kiosk UI |
| Rationale | FMF's audience is primarily Arabic and English speaking; secondary languages cover major international delegations |
| Default if Unchallenged | Use Arabic + English as primary; add French, Mandarin, Spanish for app and kiosk |
| Sensitivity | Medium. Language additions require translation workflows and content review for each new language |

#### A7: Data Residency

| Field | Value |
|---|---|
| Affected Modules | 0, 9 |
| Assumed Value | Data residency in Saudi Arabia per NDMO (National Data Management Office) requirements; diplomatic PII may require on-premises or sovereign-cloud hosting |
| Rationale | FMF is subject to Saudi data residency regulations |
| Default if Unchallenged | Use AWS me-central-1 (UAE) as primary region with a sovereign-cloud fallback for diplomatic PII |
| Sensitivity | High. Data residency changes can require complete infrastructure re-architecture |

#### A8: Infrastructure Provider

| Field | Value |
|---|---|
| Affected Modules | 0 |
| Assumed Value | AWS as primary cloud provider, with Azure AD for identity |
| Rationale | Common enterprise pattern; AWS has me-central-1 region for Saudi-adjacent latency |
| Default if Unchallenged | Use AWS + Azure AD |
| Sensitivity | High. Cloud provider changes require re-architecting managed services (RDS, MSK, ElastiCache, etc.) |

#### A9: Sponsorship Revenue Target

| Field | Value |
|---|---|
| Affected Modules | 5, 9, 12 |
| Assumed Value | US$ 30M+ sponsorship revenue target across all tiers |
| Rationale | Informed by FMF 2024 reported figures |
| Default if Unchallenged | Use US$ 30M target; pacing tracked weekly |
| Sensitivity | Medium. Target changes affect sales pacing and resource allocation but not core data models |

#### A10: Deal Pipeline Tracking

| Field | Value |
|---|---|
| Affected Modules | 3, 5, 12 |
| Assumed Value | System tracks meetings tagged with "deal intent" and estimated deal value; aggregate pipeline visible to ED, SSL, FAL |
| Rationale | FMF 2024 announced US$ 9B+ in deals; tracking is essential for sponsor ROI and event impact reporting |
| Default if Unchallenged | Implement deal pipeline tracking in Module 3.4 and surface in Module 12.3 |
| Sensitivity | Medium. Some delegations may resist sharing deal values due to diplomatic sensitivity |

### Open Questions

The following questions require explicit decisions before engineering begins. Each is tagged with priority, the decision-maker, and the impact of not deciding.

#### Q1: Diplomatic PII Hosting

| Field | Value |
|---|---|
| Question | Should diplomatic PII (passport numbers, medical info, "do not mention" notes from Module 2.4) be hosted in a sovereign cloud, on-premises at the venue, or in a dedicated AWS region with enhanced access controls? |
| Priority | Critical |
| Decision-Maker | Event Director + CTO + Saudi NDMO + (potentially) foreign ministry representatives |
| Impact of Not Deciding | The System cannot be deployed; engineering work is blocked on Module 2 entirely |
| Recommended Default | Start with AWS me-central-1 with column-level encryption + dedicated KMS keys; plan for sovereign-cloud migration if required |

#### Q2: VIP Badge QR Code Rotation

| Field | Value |
|---|---|
| Question | Should VIP badges (protocol rank 1-3) use rotating QR codes (TOTP-like, rotated every 60 seconds via Bluetooth smart badge), or static QR codes with the same security model as standard badges? |
| Priority | High |
| Decision-Maker | Event Director + Security Lead + Protocol Officer |
| Impact of Not Deciding | Module 6.3 implementation cannot be finalized; badge procurement is blocked |
| Recommended Default | Use static QR codes for FMF 2026 (lower complexity); pilot rotating QR codes with a small group of protocol rank 1 attendees |

#### Q3: Matchmaking Algorithm Transparency

| Field | Value |
|---|---|
| Question | Should the matchmaking algorithm (Module 3.1) be transparent (participants can see why they were matched) or opaque (matches appear without explanation)? |
| Priority | Medium |
| Decision-Maker | Matchmaking Concierge + Event Director + Privacy Officer |
| Impact of Not Deciding | Module 3.1 UI cannot be finalized; legal review of GDPR "automated decision-making" provisions is required |
| Recommended Default | Default to transparent; allow participants to opt out of receiving match explanations if they prefer |

#### Q4: Multi-Tenant vs. Single-Tenant Deployment for FMF

| Field | Value |
|---|---|
| Question | Should the FMF instance of the System be deployed single-tenant (dedicated infrastructure for FMF only) or multi-tenant (shared with other events run by the same operator)? |
| Priority | High |
| Decision-Maker | CTO + Event Director |
| Impact of Not Deciding | Infrastructure sizing and cost model cannot be finalized |
| Recommended Default | Single-tenant for FMF 2026; multi-tenant architecture is in place (per P6) so future events can be added to the same deployment |

#### Q5: Live Stream Distribution Strategy

| Field | Value |
|---|---|
| Question | Should the System self-host the live stream (via Mux or AWS IVS) or rely on third-party platforms (YouTube Live, partner broadcaster)? |
| Priority | High |
| Decision-Maker | Content & Stage Manager + Marketing & PR Lead |
| Impact of Not Deciding | Module 4.3 implementation cannot be finalized; CDN and bandwidth contracts are blocked |
| Recommended Default | Hybrid: self-host for the mobile app and overflow rooms; simulcast to YouTube Live and partner broadcaster for broader reach |

#### Q6: Post-Event Data Retention

| Field | Value |
|---|---|
| Question | How long should attendee PII be retained post-event? Options: 1 year (minimal), 3 years (typical for sponsor ROI tracking), 7 years (audit/compliance), indefinite (with consent). |
| Priority | High |
| Decision-Maker | Legal + Compliance + DPO + Event Director |
| Impact of Not Deciding | Module 9.4 retention policies cannot be implemented; GDPR compliance review is blocked |
| Recommended Default | 7 years for audit log (per A1 in Module 9.4); 3 years for attendee PII (with consent-based extension); immediate deletion for non-consented PII after 90 days |

#### Q7: AI/LLM Usage for Narrative Generation

| Field | Value |
|---|---|
| Question | Which LLM provider(s) should be used for narrative generation in Module 12.4 (executive insights), Module 10.3 (press content), and Module 3.1 (matchmaking explanations)? |
| Priority | Medium |
| Decision-Maker | CTO + Legal + Security |
| Impact of Not Deciding | These features cannot ship; manual narrative workflows are required as a fallback |
| Recommended Default | OpenAI GPT-4 for non-sensitive content (press, executive summaries); Anthropic Claude for sensitive content (matchmaking explanations); both with explicit data processing agreements and EU/Saudi data residency options |

#### Q8: Offline Sync Window for Staff App

| Field | Value |
|---|---|
| Question | Should the staff app's offline sync window be 90 minutes (current assumption per Module 7.4) or extended to 4 hours for scenarios with sustained network outages? |
| Priority | Medium |
| Decision-Maker | Operations Lead + CTO |
| Impact of Not Deciding | Module 7.4 caching strategy cannot be finalized; device procurement (storage size) is blocked |
| Recommended Default | 90 minutes for the standard window; allow configuration up to 4 hours for specific device profiles (e.g., VIP Liaison app) |

#### Q9: Real-Time Translation for Meetings

| Field | Value |
|---|---|
| Question | Should the System provide real-time translation (live captions + spoken translation via DeepL or Microsoft Translator) for all B2B/G2G meetings, or only for meetings flagged as "translation required" by participants? |
| Priority | Medium |
| Decision-Maker | Matchmaking Concierge + Protocol Officer |
| Impact of Not Deciding | Module 3.3 implementation scope is unclear; translation vendor contracts are blocked |
| Recommended Default | On-demand: participants can enable translation in their meeting request; system provisions a translation stream when enabled |

#### Q10: ESG Baseline Year

| Field | Value |
|---|---|
| Question | What is the baseline year for ESG comparison in Module 11? Options: FMF 2024 (most recent), FMF 2023 (2 years prior), or industry benchmark. |
| Priority | Low |
| Decision-Maker | ESG Officer + Event Director |
| Impact of Not Deciding | Module 11.4 reporting templates cannot be finalized; comparison narratives are blocked |
| Recommended Default | Use FMF 2024 as the baseline if data is available; otherwise use industry benchmark (ISO 20121 typical event emissions) |

### Decision Log Convention

All decisions on the above assumptions and open questions should be recorded in a decision log maintained at `/home/z/my-project/enterprise-event-os-prd/DECISIONS.md` (to be created by the project manager post-PRD-approval). The log should capture:

| Field | Description |
|---|---|
| Decision ID | Sequential (D001, D002, ...) |
| Date | YYYY-MM-DD |
| Decision-Maker | Name + role |
| Question / Assumption | Reference to Q or A number above |
| Decision | The explicit choice made |
| Rationale | Brief explanation |
| Impact | Modules affected, engineering work required |

### Closing Note

This PRD is internally consistent and complete for sprint planning purposes given the assumptions above. However, the open questions, particularly Q1 (diplomatic PII hosting) and Q4 (deployment model), are blocking and should be resolved before engineering work begins. The recommended defaults are sensible starting points but should not be treated as final decisions without the appropriate stakeholder review.

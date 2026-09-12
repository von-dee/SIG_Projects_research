> Appendix → 99.1 Proposed Additional Modules

## Proposed Additional Modules

### Purpose Statement

The 12 modules defined in this PRD cover the operational, commercial, content, and analytical surfaces required to run an FMF-class event. However, during the writing of this PRD, three capability gaps emerged that are not cleanly covered by any of the 12 modules. Rather than silently expanding the scope of an existing module, this appendix proposes three additional modules as candidates for a future revision of the System. Each is presented with its gap analysis, rationale, proposed sub-sections, and a recommendation on whether to include it.

The reader should treat this appendix as a structured proposal, not as a commitment. A separate decision-making process (involving the Event Director, CTO, and Legal/Compliance) should determine which, if any, of these modules are added to the System scope for the next major release.

### Candidate Module 13A: Legal, Contracts & Insurance Management

#### The Gap

Across the 12 modules, contract and insurance artifacts appear in scattered locations: Module 5 (sponsorship contracts), Module 8.2 (vendor contracts and insurance certificates), Module 9.4 (audit trail of contract sign-offs), Module 9.2 (invoice terms rooted in contracts). None of these modules owns the contract lifecycle end-to-end. The result is that:

- Contract drafting, redlining, and negotiation happen outside the System (in Microsoft Word + email), with the System only capturing the final signed PDF.
- Insurance compliance (Module 8.2) tracks vendor insurance expiry but does not own the master insurance program for the event itself (event cancellation insurance, public liability, weather insurance, dignitary protection insurance).
- Force majeure clauses, indemnification, IP ownership, and venue use agreements are referenced but not modeled as first-class entities.
- Contract renewal and expiry tracking is inconsistent: sponsor contracts are managed in Module 5.1; vendor contracts in Module 8.2; speaker agreements in Module 4.2; venue use agreements nowhere.

#### Why the 12 Modules Do Not Cover This

The 12 modules were scoped around operational workflows. Legal and contract management is a horizontal capability that intersects every commercial and supplier-facing module. Trying to distribute it across the existing modules creates three problems: (1) inconsistent contract data models (sponsor contract in Module 5 has different fields than vendor contract in Module 8); (2) no unified contract repository for legal review and audit; (3) no owner for the event-level insurance program.

#### Proposed Sub-Sections

If added, this module would contain:

1. **13.1 Contract Lifecycle Management** — Drafting templates, clause library, redlining workflow, e-signature, version control, renewal tracking.
2. **13.2 Insurance & Risk Management** — Master insurance program (event cancellation, public liability, weather, dignitary protection), vendor insurance compliance aggregation, claims workflow.
3. **13.3 Legal Hold & Litigation Management** — When a legal dispute arises (e.g., a sponsor alleges breach), the system can place a "legal hold" on relevant records, suspending normal retention/deletion workflows.
4. **13.4 Regulatory Compliance Registry** — Per-jurisdiction regulatory requirements (e.g., Saudi NDMO for FMF data residency, EU GDPR, US state privacy laws), with automated compliance checks against System configuration.

#### Recommended Vendors (Indicative)

- **Contract Lifecycle:** DocuSign CLM, Icertis, Ironclad, Coupa Contract Management.
- **Insurance:** Aon Event Services, Marsh Affinity, Allianz Event Insurance, RSA Specialty.
- **Legal Hold:** Logikcull, Relativity Legal Hold, Zapproved.
- **Regulatory Compliance:** OneTrust, Securiti.ai, TrustArc.

#### Recommendation

**Include in the next major release.** Without a unified contract and insurance module, the System creates legal and financial exposure at FMF scale. The cost of building this module is moderate (estimated 6-8 sprints for an 8-engineer team), and the integration surface with existing modules is well-defined.

### Candidate Module 13B: Cybersecurity & Data Governance

#### The Gap

The 12 modules reference security and data governance in many places (audit logs, RBAC, PII encryption, GDPR workflows in Module 9.4), but no module owns the security operations center (SOC) workflow, the data governance policy engine, or the threat intelligence integration. Specifically:

- Module 9.4 captures audit events but does not own threat detection (e.g., anomaly detection on access patterns, brute force attempts, insider threat indicators).
- Module 0.1 describes encryption and secrets management as architectural principles but does not provide a security operations surface for the SOC team.
- Data governance (data classification, retention policies, data subject access requests) is partially handled in Module 9.4 but lacks a unified policy engine.
- The System has no surface for incident response workflows specific to cyber threats (as distinct from operational incidents in Module 1.2).

#### Why the 12 Modules Do Not Cover This

Cybersecurity and data governance are horizontal capabilities that span every module. Embedding them in each module would create duplication and inconsistent policy enforcement. The architectural principles (P5, P6 in the Executive Summary) establish the foundation, but a dedicated module is needed for operational security workflows.

#### Proposed Sub-Sections

1. **13.5 Security Operations Center (SOC) Console** — Real-time threat dashboard, SIEM integration (Splunk or Microsoft Sentinel), incident response workflows, on-call rotation for security engineers.
2. **13.6 Data Governance & Policy Engine** — Data classification (public, internal, confidential, restricted, secret), retention policies per data class, automated enforcement, data lineage tracking.
3. **13.7 Data Subject Access Requests (DSAR) Workflow** — End-to-end workflow for GDPR Article 15 (right of access), Article 17 (right to erasure), Article 20 (right to portability), and equivalent rights under other privacy laws (CCPA, Saudi PDPL).
4. **13.8 Penetration Testing & Vulnerability Management** — Scheduling of pentests, vulnerability tracking (Snyk, Dependabot, AWS Inspector), remediation SLAs, security posture reporting.

#### Recommended Vendors (Indicative)

- **SIEM/SOC:** Splunk Enterprise Security, Microsoft Sentinel, IBM QRadar, Exabeam.
- **Data Governance:** Collibra, Alation, Microsoft Purview, Informatica Axon.
- **DSAR Workflow:** OneTrust, TrustArc, Securiti.ai, BigID.
- **Vulnerability Management:** Snyk, Dependabot, AWS Inspector, Tenable Nessus, Qualys.

#### Recommendation

**Include in the next major release, before scaling to additional events.** The System processes PII for 10,000+ attendees including 350+ dignitaries; the absence of a unified security operations surface is an unacceptable risk for an FMF-class event. The cost of building this module is high (estimated 10-12 sprints for a 6-engineer team with security specialization), but the cost of a breach (reputational, regulatory, diplomatic) is far higher.

### Candidate Module 13C: Multi-Event & Multi-Tenant Administration

#### The Gap

The System is multi-tenant by default (per architectural principle P6), but no module owns the tenant lifecycle, event lifecycle within a tenant, or cross-event benchmarking. Specifically:

- Tenant onboarding (creating a new customer organization, configuring their data residency, branding, SSO) is not modeled.
- Event lifecycle (event creation, configuration, going live, archival, deletion) is partially handled in Module 0.1 but lacks a dedicated administrative surface.
- Cross-event analytics (comparing FMF 2025 to FMF 2026) is implicit in Module 12 but not a first-class capability.
- Multi-event operators (e.g., an organization running FMF, COP, and Davos) need cross-event benchmarking, shared supplier pools, and reusable configurations.

#### Why the 12 Modules Do Not Cover This

The 12 modules are scoped to single-event operations. Multi-event and multi-tenant administration is a platform capability that sits above the operational modules. Without it, the System can run one event well but cannot scale to running multiple events efficiently.

#### Proposed Sub-Sections

1. **13.9 Tenant Lifecycle Management** — Tenant onboarding, configuration (data residency, branding, SSO, feature flags), billing, offboarding.
2. **13.10 Event Lifecycle & Templates** — Event creation from template, configuration cloning, going live, archival, post-event data retention.
3. **13.11 Cross-Event Benchmarking** — Comparative analytics across events, shared supplier directories, reusable configuration libraries.
4. **13.12 Platform Health & SRE Console** — Infrastructure health across all tenants, capacity planning, multi-tenant SLA monitoring, disaster recovery orchestration.

#### Recommended Vendors (Indicative)

- **Multi-Tenant SaaS Billing:** Stripe Billing, Chargebee, Zuora.
- **Identity & SSO:** Azure AD B2C, Auth0, Okta, Workforce Identity.
- **Feature Flags:** LaunchDarkly, Split, Unleash.
- **SRE/Infrastructure:** Datadog, New Relic, Grafana Cloud, AWS CloudWatch.

#### Recommendation

**Defer to a future release, after the core 12 modules are validated in production.** Multi-event capabilities are valuable but not blocking for the first FMF-class event. The System's multi-tenant architecture (per P6) ensures the data model supports this module in the future, but the operational surface can be added later without rework.

### Summary of Recommendations

| Candidate Module | Gap Severity | Build Effort | Recommendation |
|---|---|---|---|
| 13A Legal, Contracts & Insurance | High (financial and legal exposure) | 6-8 sprints, 8 engineers | Include in next major release |
| 13B Cybersecurity & Data Governance | Critical (regulatory and reputational risk) | 10-12 sprints, 6 engineers | Include in next major release, before scaling |
| 13C Multi-Event & Multi-Tenant Admin | Medium (platform scaling) | 8-10 sprints, 6 engineers | Defer to future release |

### Closing Note

The decision to defer a module to a future release should not be read as a de-prioritization of its importance. It reflects the sequencing reality that the 12 modules in this PRD constitute a coherent, shippable System capable of running a single FMF-class event. The three candidates above are the natural next additions once the core System is proven in production.

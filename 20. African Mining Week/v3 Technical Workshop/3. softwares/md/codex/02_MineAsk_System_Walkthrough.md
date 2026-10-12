# MineAsk: System Walkthrough

## Purpose in the connected mine story

MineAsk is the evidence-backed assessment step. The product notes describe a query-and-assess workspace that can bring available mining, geospatial, environmental, regulatory, and market context into a structured review. The goal is to help a user prepare a more organized first-pass assessment and identify what still needs specialist or official verification.

> **Maturity note:** The source material groups features from multiple product stages and names. Some reporting, integrations, scheduled monitoring, and alerting are partial or planned. Demonstrate only functions present in the deployed version. MineAsk is a screening aid, not legal advice or an official regulatory decision.

## 1. Define the site or concession

**User goal:** Make the assessment about a clearly identified place and decision.

### Steps

1. Start a new assessment or project.
2. Identify the area using an available input: concession or permit identifier, coordinates, map pin, district, route, community, or uploaded boundary.
3. Inspect the name and geometry returned by the system.
4. Correct the boundary or location if the available workflow allows it.
5. State the decision the assessment should support, such as initial screening, due diligence, or field planning.
6. Save the project with a clear owner, date, and purpose.

**Expected result:** A saved assessment tied to a defined site or concession and a specific user question.

**Benefit:** Reduces ambiguity and repeated setup, making evidence and comparisons easier to interpret.

**Check before presenting:** Confirm whether each input method, boundary upload, and project-saving feature is supported in the current deployment.

## 2. Join mining and geospatial context

**User goal:** Bring the available evidence around the selected place into one review.

### Steps

1. Open the site's map or evidence workspace.
2. Select only layers relevant to the decision, such as cadastre/title, geology, terrain, water, roads, infrastructure, settlements, protected areas, satellite context, or weather.
3. Inspect source and date information when it is available.
4. Compare the project boundary with the selected layers.
5. Note missing coverage, conflicting records, apparent constraints, and items requiring field confirmation.
6. Save the selected layers and follow-up questions with the assessment.

**Expected result:** A site-specific view of the evidence available for the decision, with gaps and questions visible.

**Benefit:** Replaces repeated manual searches across separate sources and helps technical and nontechnical reviewers compare context.

**Check before presenting:** Coverage and freshness vary by source. Do not imply every listed layer is present for every site.

## 3. Ask a structured AI-assisted question

**User goal:** Turn an open concern into a focused, reviewable first-pass answer.

### Steps

1. Ask a narrow question tied to the selected site, for example: “What access and environmental issues should we verify before fieldwork?”
2. Review the answer and any sources, map features, or evidence references returned.
3. Separate sourced statements from the system's interpretation or summary.
4. Open the underlying evidence for any point that could affect a permit, investment, or field decision.
5. Mark unanswered or weakly supported points as open checks.
6. Assign those checks to a qualified analyst, counsel, field team, or relevant authority.

**Expected result:** A structured first-pass response with evidence to review and follow-up questions to resolve.

**Benefit:** Speeds early synthesis and helps users spend more time evaluating the evidence and less time collecting it manually.

**Check before presenting:** Treat generated answers as decision support. Do not present them as an official conclusion, legal opinion, or verified fact without checking the underlying evidence.

## 4. Review a site or concession scorecard

**User goal:** Compare sites or identify factors that need attention before progressing.

### Steps

1. Open the scorecard or screening view available for the project.
2. Review the dimensions shown, which may include geological, legal, access, ESG, and operational context.
3. Inspect the individual factors and their supporting evidence; do not rely only on an overall score.
4. Mark potential hard stops, weak evidence, and unknowns.
5. Compare candidate sites using consistent criteria and equivalent data coverage.
6. Record whether to stop, investigate further, or proceed to specialist review.

**Expected result:** A structured comparison that shows where a candidate appears stronger, weaker, or uncertain.

**Benefit:** Supports consistent prioritization and can expose possible deal-breakers earlier in the diligence process.

**Check before presenting:** Understand the score inputs, weights, and data gaps. A score is not a guarantee of suitability or investment performance.

## 5. Inspect licensing and regulatory context

**User goal:** Organize likely licensing steps and questions for formal confirmation.

### Steps

1. Open the jurisdiction-specific licensing or regulatory context available in the system.
2. Review the process steps, rules, or conditions shown.
3. Check the source and version date of the regulatory information, if displayed.
4. Convert likely requirements into a checklist for the project team.
5. Separate items supported by the platform from items requiring counsel or official confirmation.
6. Record the response from the responsible professional or authority in the project's approved record system.

**Expected result:** An organized list of likely process steps and questions to confirm for the site.

**Benefit:** Helps teams prepare for regulatory review and notice possible gaps earlier, reducing avoidable research and rework.

**Check before presenting:** Do not imply that MineAsk monitors every rule change in real time or guarantees compliance. Use official sources and qualified counsel for decisions.

## 6. Build and hand off an evidence dossier

**User goal:** Share a clear first-pass assessment with the next reviewer.

### Steps

1. Select the map views, findings, and open questions relevant to the decision.
2. Preserve source references, confidence, and version history where those functions are available.
3. Label each key item as evidence, interpretation, or verification needed.
4. Generate or share the dossier using the export and collaboration functions present in the deployed version.
5. Assign open items to named reviewers.
6. Update the assessment when verification returns, retaining the distinction between the original evidence and the new finding.

**Expected result:** A reviewable evidence pack with findings, sources, and unresolved questions organized for a handoff.

**Benefit:** Improves consistency, reviewability, and team handoffs; may reduce the time required to prepare a first-pass diligence pack.

**Check before presenting:** Export, collaboration, provenance, and automated report maturity varies across the source materials. Verify the exact functions in the current build.

## Suggested MineAsk demo sequence

1. Define a fictional concession or project location.
2. Add a small set of available context layers.
3. Ask one narrow site-specific question.
4. Open an evidence item and separate fact from interpretation.
5. Review a score or licensing checklist, if available.
6. End with an evidence dossier or a clearly labeled list of checks for the TerraPulse field workflow.

**Transition:** MineAsk organizes what is known and what still needs checking. TerraPulse focuses geological evidence to help prioritize exploration follow-up.

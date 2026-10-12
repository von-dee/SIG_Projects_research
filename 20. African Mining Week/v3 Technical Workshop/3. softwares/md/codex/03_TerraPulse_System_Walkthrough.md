# TerraPulse: System Walkthrough

## Purpose in the connected mine story

TerraPulse supports the exploration decision: where should a team focus its next survey, field visit, or drilling discussion? Its product notes describe a proposed workflow that combines satellite, geophysical, geochemical, and structural information in a shared geospatial environment to help identify, rank, and explain prospective targets.

> **Technical boundary:** TerraPulse supports geologists; it does not replace professional geological judgment, field validation, established 3D modeling tools, or formal resource and reserve reporting. Validate supported file formats, models, offline workflows, and exports in the deployed product.

## 1. Create a project and define the decision

**User goal:** Set up a focused exploration analysis around a place, commodity, and decision.

### Steps

1. Create a project for the concession or area of interest.
2. Set or confirm the project boundary.
3. State the decision to support, such as regional screening, follow-up survey planning, or target ranking.
4. Add the commodity or mineral-system context used by the technical team.
5. Identify the geologists and reviewers who will assess the results.
6. Save the project with a clear version, owner, and date.

**Expected result:** A project workspace with a defined geography and exploration question.

**Benefit:** Keeps analysis tied to a concrete decision and makes later handoffs and comparisons more repeatable.

**Check before presenting:** Confirm project permissions, client separation, and role controls in the live environment.

## 2. Ingest and harmonize supported data

**User goal:** Make available survey and geospatial inputs comparable for analysis.

### Steps

1. Add the supported geophysical grids, geochemistry tables, and satellite or geospatial files.
2. Check each input's coordinate reference system, units, date, and spatial coverage.
3. Align the inputs to the project area using the product's available workflow.
4. Review warnings, missing cells, offsets, and any transformations applied.
5. Exclude or flag data that is unsuitable or too incomplete for the question.
6. Preserve an input inventory so reviewers can see which evidence informed the analysis.

**Expected result:** A set of project layers aligned well enough for the intended comparison, with limitations visible to the technical reviewer.

**Benefit:** Reduces manual format conversion and spatial setup, giving geologists more time for interpretation.

**Check before presenting:** Confirm exact supported formats and harmonization behavior. Do not hide uncertainty caused by inconsistent surveys or incomplete coverage.

## 3. Inspect the unified map and compare layers

**User goal:** Look at relevant evidence together rather than relying on isolated static exports.

### Steps

1. Open the project's unified map or layer analysis view.
2. Toggle relevant evidence layers one at a time to understand their individual patterns.
3. Compare combinations of layers that matter to the mineral-system hypothesis.
4. Inspect patterns in their geological and structural context.
5. Mark areas where evidence converges, conflicts, or is absent.
6. Save the interpretation notes for technical review.

**Expected result:** A shared spatial view of the evidence and a set of candidate areas for closer evaluation.

**Benefit:** Gives the team common context and may reduce rework caused by passing static maps between tools and people.

**Check before presenting:** A visual coincidence is a hypothesis, not a confirmed mineral occurrence or discovery.

## 4. Rank prospectivity or anomalies

**User goal:** Prioritize candidate areas for expert review and possible field validation.

### Steps

1. Select the prospectivity or anomaly workflow available for the project.
2. Review the configured model or analysis settings, if exposed.
3. Inspect the candidate areas and their ranking or relative priority.
4. Compare the strongest candidates with contradictory or weaker evidence.
5. Ask a geologist to assess whether the ranking is geologically plausible.
6. Select targets for follow-up survey or field validation; do not move directly from ranking to a resource declaration.

**Expected result:** A prioritized list or map of candidate targets, ready for expert discussion and validation planning.

**Benefit:** Helps focus scarce sampling, survey, and drilling budgets on areas with stronger combined evidence.

**Check before presenting:** Ranking quality depends on input quality and model configuration. Do not claim guaranteed discovery or a specific probability unless validated evidence supports it.

## 5. Review explainability and the evidence matrix

**User goal:** Understand what supports or weakens a selected target and what information is missing.

### Steps

1. Open the evidence matrix or explanation for a candidate target.
2. Review the supporting factors and the source layers behind them.
3. Review evidence that weakens the target or conflicts with the interpretation.
4. Identify missing data, low-confidence areas, and assumptions that need testing.
5. Invite a technical reviewer to challenge the interpretation.
6. Record why the target is advanced, paused, or rejected.

**Expected result:** A target rationale that exposes supporting evidence, counter-evidence, and open questions.

**Benefit:** Allows expert review instead of blind acceptance and can reduce the risk of pursuing a poorly supported target.

**Check before presenting:** An explanation makes the model output easier to inspect; it does not eliminate uncertainty or substitute for geological expertise.

## 6. Create reports and target exports for field work

**User goal:** Hand reviewed targets and coordinates to the next team in a usable form.

### Steps

1. Select the approved target points or polygons.
2. Create the target summary and map using the available report workflow.
3. Export coordinates or target files in a format supported by the product.
4. Check coordinate reference, units, labels, and geometry before field use.
5. Add field-validation questions or observations the team should collect.
6. Return field findings to the project for the next interpretation cycle.

**Expected result:** A reviewed target package that can guide field planning and preserve why the target was selected.

**Benefit:** Reduces manual report assembly and coordinate transfer, supporting faster approval and field mobilization.

**Check before presenting:** Verify export fidelity and supported formats. Formal resource estimation and reserve reporting remain separate, governed workflows.

## Suggested TerraPulse demo sequence

1. Open a prepared project and state the exploration question.
2. Show the input inventory and explain the data checks.
3. Compare a small number of relevant layers.
4. Inspect a ranked target and its supporting and opposing evidence.
5. Show the field-validation checklist and target export, if confirmed in the current build.
6. Close by returning to the field team: their observations become new evidence for the next review.

**Transition:** TerraPulse helps focus the exploration question. MyMine gives mine teams a shared spatial view for discussing site plans and conditions.

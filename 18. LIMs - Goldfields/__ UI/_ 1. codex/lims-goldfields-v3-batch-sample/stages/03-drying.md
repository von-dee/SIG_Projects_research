# 03 — Drying

**Role:** Prep technician  
**Record:** [Drying log sheet](../forms/03-drying-log-sheet.md)  
**Outcome:** A dry, weighed sample linked to the oven run.

**Batch handling:** The drying run is a batch with explicit oven shelf positions. Completion, mass flags and holds are decided per sample, so an interrupted member does not hide the status of the rest of the oven load.

## User flow

1. Scan the accepted lab sample and confirm the drying method and container compatibility.
2. Load the sample into an identified oven and assigned shelf/position; start or join a drying run.
3. Set and record target temperature, start time, and planned duration according to the approved method.
4. At completion, unload safely, inspect the sample/container, and weigh it for dry mass using the qualified balance.
5. Record actual end time, dry mass, deviations, and technician sign-off. Mark the sample ready for crushing only when complete.

## Form fields entered

Lab sample ID, drying run ID, oven ID, shelf/position, target/actual temperature, start/end timestamps, duration, wet mass reference, dry mass, balance ID, condition/deviation notes, operator and completion status.

## Controls and hand-off

- The LIMS calculates and flags unusual wet-to-dry mass loss using configured limits.
- An interrupted run or abnormal mass requires a hold/review before crushing.

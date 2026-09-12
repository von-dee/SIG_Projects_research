# 05 — Pulverising

**Role:** Prep technician  
**Record:** [Pulverising & sieve QC form](../forms/05-pulverising-sieve-qc-form.md)  
**Outcome:** A pulp that passes the specified P80 fineness requirement.

**Batch handling:** The mill run records the shared mill/cleaning context. Each pulp has its own QC result and regrind history; a failed member is removed to regrind without stopping passing members.

## User flow

1. Scan the coarse working split, select the approved grind method, and identify the ring mill.
2. Pulverise the material, applying documented cleaning and contamination-control steps.
3. Take the defined sieve cut, perform the P80 fineness check, and record sieve ID, cut mass, and result.
4. If the result meets specification, assign the pulp ID and release it to charge weigh-out.
5. If it fails, put the pulp in regrind status, re-pulverise, and record the repeat QC event. Do not overwrite the failed result.

## Form fields entered

Coarse split ID, pulp ID, ring mill ID/run, grind method/time, sieve ID/mesh, test fraction mass, P80/percent passing result, specification, pass/fail, regrind reference, operator, timestamp, and notes.

## Controls and hand-off

- Only a passing, current QC result permits charge creation.
- Pulp remains traceable to the original interval and retained reject.

# 06 — Charge weigh-out

**Role:** Assay technician  
**Record:** [Charge weigh ticket](../forms/06-charge-weigh-ticket.md)  
**Outcome:** A toleranced assay charge and a locatable pulp archive.

## User flow

1. Scan the QC-passed pulp and verify selected assay method and nominal charge mass.
2. Use a qualified analytical balance to weigh the assay charge. Generate a unique charge ID and link it to the pulp.
3. Compare actual mass with method tolerance. Void and re-weigh any out-of-tolerance charge.
4. Bag/label the remaining pulp as archive and assign an exact shelf/box location.
5. Add the accepted charge to the next fusion batch queue.

## Form fields entered

Pulp ID, charge ID, assay method, nominal mass, actual mass, unit, tolerance and status, analytical balance ID, weighed timestamp/operator, void reason if relevant, archive pulp ID/mass/location.

## Controls and hand-off

- Each accepted charge is consumed only once in a furnace batch.
- Archive location is mandatory before the charge can move to fusion.

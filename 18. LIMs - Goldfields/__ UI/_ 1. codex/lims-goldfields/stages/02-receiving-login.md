# 02 — Receiving & login

**Role:** Receiving clerk  
**Record:** [Sample intake log (LIMS)](../forms/02-sample-intake-log.md)  
**Outcome:** The physical bag becomes a registered lab sample with a barcode.

## User flow

1. Receive the shipment and find the matching submission/COC entry.
2. Compare bag label, hole ID, and from–to depth with the submission; inspect seal and condition.
3. Scan or enter the field sample ID and create the lab sample ID/barcode. Preserve the link to the field sample and original interval.
4. Weigh the unopened/received bag as defined by the lab method and record gross wet mass and balance ID.
5. Record discrepancies, damage, missing information, or unsuitable condition. Place mismatches on intake hold.
6. Print/apply the lab barcode and route the accepted material to the drying queue and location.

## Form fields entered

Field sample ID, generated lab sample ID, barcode, received date/time, receiver, submission/COC reference, hole/interval verification, gross wet mass and unit, balance ID, condition, discrepancy code, intake status, and current location.

## Controls and hand-off

- Lab barcode is the primary operational identifier; the field identity remains immutable lineage metadata.
- Only accepted samples enter drying. Holds require an accountable resolution.

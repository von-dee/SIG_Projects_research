# MyMine AR Mine Digital Twin: System Walkthrough

## Purpose in the connected mine story

MyMine is the shared spatial review step. The source notes describe an augmented-reality digital twin, real-time streaming, multi-user collaboration, access from headsets plus tablet, phone, and web, and a hybrid edge-sync approach. The aim is to give on-site and remote teams a common visual context for discussing the mine.

> **Maturity note:** These capabilities are described as owner-stated; the source notes say no product specification or demo has yet confirmed deployment. Alignment accuracy, update process, supported devices, data sources, latency, concurrency, offline duration, and sync behavior must be validated. Several advanced overlays are explicitly unverified. MyMine is not a replacement for planning, fleet-management, SCADA, certified safety, or regulatory systems.

## 1. Open and orient the mine twin

**User goal:** Give the review team a common three-dimensional view of the site.

### Steps

1. Open the mine twin for the site or project.
2. Confirm the model and identify its source files and update date where available.
3. Orient the group using a recognizable landmark, such as a pit, access road, or facility.
4. Explain the model's known accuracy, coverage, and update limitations.
5. Navigate to the location relevant to the meeting's decision.
6. Keep the discussion tied to what the model actually represents.

**Expected result:** Participants can locate the relevant area in a shared three-dimensional view and understand which model version is under discussion.

**Benefit:** Makes spatial relationships easier to discuss than switching among separate 2D plans, screenshots, or verbal descriptions.

**Check before presenting:** The model build process, source files, and alignment accuracy are not confirmed in the product notes. Do not imply survey-grade precision without evidence.

## 2. Join the same session on multiple devices

**User goal:** Allow on-site and remote participants to share the same view.

### Steps

1. Start a shared review session.
2. Invite the relevant roles, such as planning, geotechnical, HSE, or maintenance staff.
3. Join using the device types supported by the deployed version: headset, tablet, phone, or web.
4. Confirm each participant sees the same area and model state.
5. Navigate to the question under review and allow participants to share their perspective.
6. Record decisions, owners, and follow-up actions in the approved system of record.

**Expected result:** Reviewers at different locations or on different supported devices can see a common mine model during the discussion.

**Benefit:** Reduces confusion about which plan or location is being discussed and can make remote specialist input easier to coordinate.

**Check before presenting:** Supported device models, feature parity, and concurrent user limits are unspecified and need testing.

## 3. Review streamed information in spatial context

**User goal:** Bring a confirmed live or refreshed data feed into a shared site review.

### Steps

1. Select a data source that has been confirmed as integrated with the current MyMine deployment.
2. Display its timestamp, units, and source label where available.
3. Navigate to the relevant area in the twin.
4. Compare the displayed value or status with the site context and the question being discussed.
5. Check for stale values, missing intervals, or visible latency.
6. Use the information to inform discussion and human review; do not trigger control actions from an unvalidated overlay.

**Expected result:** A confirmed stream or refreshed data item can be discussed alongside the 3D mine context.

**Benefit:** Helps a cross-functional team interpret a data point in relation to a physical location, rather than reviewing it without spatial context.

**Check before presenting:** The source materials do not specify the integrated feeds, data volume, latency, or reliability. This is not a claim of SCADA, fleet dispatch, or plant control.

## 4. Use edge sync where connectivity is weak

**User goal:** Test whether a site session remains useful through a planned period of poor connectivity.

### Steps

1. Work with site IT/OT to confirm the edge node, power, network, and security setup.
2. Start the session while connected and confirm the local model or data needed for the test is available.
3. Enter the planned low-connectivity or offline test period.
4. Observe which functions remain usable and record any missing or delayed information.
5. Reconnect and inspect synchronization, conflicts, and recovery behavior.
6. Document the tested duration and any limits before expanding operational use.

**Expected result:** A measured record of which MyMine functions continue locally and how the system synchronizes after reconnection.

**Benefit:** If validated, edge operation may support more reliable collaboration at remote sites with unreliable connectivity.

**Check before presenting:** Offline duration, sync conflict handling, hardware requirements, and recovery behavior are unverified. Do not promise an eight-hour offline shift until demonstrated in a pilot.

## 5. Run a collaborative mine-planning review

**User goal:** Use one shared view to discuss a specific spatial decision across roles.

### Steps

1. State one question for the meeting, such as: “Where does the proposed access route meet the area under review?”
2. Navigate all participants to the relevant part of the twin.
3. Invite each discipline to describe its evidence, constraints, and assumptions.
4. Distinguish actual product data from illustrative annotations or manually supplied context.
5. Record the decision, unresolved questions, action owners, and due dates in the approved record system.
6. Close the session by confirming who will update the source plan or follow up on each open item.

**Expected result:** A shared review in which participants discuss the same spatial context and leave with clearer decisions and follow-up responsibilities.

**Benefit:** Can improve shared understanding and meeting clarity; a pilot can measure review duration, preparation time, and participant clarity.

**Check before presenting:** Plan-versus-actual, grade, geofence, ground-movement, fleet, work-order, remote-assist, safety-training, and compliance overlays are listed as unverified. Use only functions shown and validated in the current build.

## Suggested MyMine demo sequence

1. Load a prepared mine twin and state its source and date.
2. Orient the audience using a recognizable landmark.
3. Show one confirmed shared session with a second supported device.
4. If a real integration is available, show one clearly timestamped stream; otherwise explain the integration concept without simulating a live feed.
5. Close with one planning question and the follow-up actions the team would record.

**Transition:** MyMine creates a common site-level view. The connected mine story continues by linking that review to verified planning, operational, environmental, and closure data as those integrations are established.

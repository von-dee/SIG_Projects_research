# Sentiment Analysis Features

## 1. Local Context Sentiment Engine

The sentiment engine should classify mentions as positive, negative, neutral, mixed, or uncertain while accounting for Ghanaian and wider African communication patterns.

Key capabilities:

- English and local-language sentiment detection for Twi, Akan, Ga, Ewe, Dagbani, Hausa, and French.
- Code-switching support where users mix English and local languages in the same sentence.
- Cultural nuance detection for sarcasm, indirect criticism, proverbs, praise-with-complaint, and community grievance language.
- Confidence scoring so low-certainty sentiment is routed for human review instead of silently polluting dashboards.
- Topic-level sentiment so the platform can distinguish between positive sentiment about jobs and negative sentiment about land compensation in the same conversation.

## 2. Emotion And Intent Detection

Beyond positive or negative scoring, the product should detect the emotional and practical meaning of each mention.

Emotion labels:

- Anger
- Fear
- Hope
- Trust
- Distrust
- Sadness
- Pride
- Frustration
- Urgency

Intent labels:

- Complaint
- Praise
- Question
- Protest signal
- Regulatory concern
- Environmental concern
- Employment request
- Compensation issue
- Safety issue
- Misinformation
- Competitor comparison
- Media inquiry

## 3. Community Risk Scoring

Each issue should receive a risk score that combines sentiment, source credibility, spread velocity, topic severity, and location.

Example score inputs:

- Sentiment intensity
- Mention volume change
- Number of unique sources
- Influence of source
- Whether the topic involves environment, land, jobs, safety, or compensation
- Whether the narrative appears across multiple channels
- Whether previous similar issues escalated

Example output:

| Risk Level | Meaning | Recommended Action |
|------------|---------|--------------------|
| Low | Isolated or low-impact mention | Monitor |
| Medium | Pattern forming around a topic | Assign owner and prepare response |
| High | Narrative spreading or tied to sensitive issue | Immediate engagement |
| Critical | Likely crisis or operational threat | Escalate to executive response team |

## 4. Multi-Channel Sentiment Tracking

The sentiment layer should support all existing BrandWatch Africa monitoring sources.

Channels:

- Social media posts and comments
- Online news articles
- Blogs and forums
- Radio transcripts
- Podcast and video transcripts
- Community field reports
- Survey responses
- Call center logs
- WhatsApp or SMS complaint exports where legally and ethically available
- Public regulator statements

Each channel should have its own sentiment baseline because radio callers, social media users, journalists, and field officers express sentiment differently.

## 5. Sentiment By Stakeholder Group

The platform should break sentiment down by stakeholder group so executives can see who is driving perception shifts.

Stakeholder groups:

- Host communities
- Traditional leaders
- Youth groups
- Women-led community organizations
- Local media
- National media
- Regulators
- Employees
- Contractors
- NGOs
- Investors
- Competitors

## 6. Sentiment Timeline And Narrative Shifts

Users should be able to see how sentiment changes over time and what caused each shift.

Core views:

- Daily, weekly, monthly, and quarterly sentiment trend charts
- Event annotations for incidents, CSR launches, regulator statements, and media reports
- Narrative shift detection when the dominant topic changes
- Before-and-after analysis for campaigns or community interventions
- Sentiment comparison between company, competitors, and industry baseline

## 7. Explainable Sentiment

Every score should include plain-language reasoning so users can trust and challenge the AI.

Example:

> Negative sentiment, high confidence. The speaker links the company to water pollution, uses urgent language, and references previous unresolved complaints from the same community.

This reduces the risk of black-box scoring and supports ESG reporting, legal review, and executive decision-making.

## 8. Action Recommendations

Sentiment should trigger recommended actions, not just dashboard charts.

Recommendation examples:

- "Assign to Community Relations: compensation topic rising in Tarkwa."
- "Prepare radio response: negative narrative repeated across 3 local stations."
- "Escalate to ESG Director: environmental concern has crossed high-risk threshold."
- "No action needed: low-influence duplicate mentions from the same source."
- "Human review needed: sarcasm detected with low model confidence."


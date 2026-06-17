# Metrics, Risks, And Moats

## Product Success Metrics

Core product metrics:

- Sentiment classification accuracy
- Human review agreement rate
- Percentage of mentions classified with high confidence
- Time from mention ingestion to insight
- Number of high-risk issues detected
- Alert precision
- Alert response time
- Reduction in manual reporting hours
- Dashboard weekly active users
- Report exports per customer

## Business Metrics

Commercial metrics:

- Pilot-to-paid conversion rate
- Monthly recurring revenue
- Annual contract value
- Gross margin by package
- Expansion revenue by customer
- Churn rate
- Sales cycle length
- Customer acquisition cost
- Payback period

## Customer Outcome Metrics

Outcome metrics to prove business value:

- Earlier detection of community issues
- Reduction in unresolved high-risk narratives
- Faster response to complaints
- Improved community sentiment trend after interventions
- Reduced executive reporting time
- Increased confidence in ESG reporting
- Improved competitor benchmark position

## Key Risks

### Model Accuracy Risk

Generic sentiment models may misread sarcasm, local-language nuance, or culturally indirect criticism.

Mitigation:

- Use confidence scoring.
- Keep humans in the loop.
- Build local labeled datasets.
- Track model performance by language, source, and topic.

### Data Access Risk

Some platforms restrict APIs or change access rules.

Mitigation:

- Diversify sources.
- Support customer-provided uploads.
- Prioritize owned, licensed, public, and compliant data sources.
- Build ingestion adapters that can be replaced without breaking the platform.

### Privacy And Trust Risk

Community sentiment data can be sensitive, especially when linked to location or identity.

Mitigation:

- Minimize personal data collection.
- Redact personally identifiable information where possible.
- Provide clear permissions and audit logs.
- Design ethical data-use policies for community reports.

### Over-Alerting Risk

If the system sends too many alerts, teams will ignore it.

Mitigation:

- Rank by risk and confidence.
- Let customers tune thresholds.
- Group duplicate mentions.
- Focus alerts on actionability, not raw volume.

### Enterprise Adoption Risk

Large companies may require procurement, security review, and integration work.

Mitigation:

- Start with paid pilots.
- Offer clear implementation packages.
- Provide exports and simple integrations first.
- Build enterprise controls as adoption grows.

## Defensibility And Moats

### Local Language Dataset

A proprietary labeled dataset of African business, community, and reputation sentiment will become a strong advantage over generic tools.

### Domain Taxonomy

A structured taxonomy for mining, ESG, community relations, telecoms, banking, and public-sector sentiment creates repeatable value.

### Historical Benchmarks

As the platform collects sentiment trends over time, it can benchmark brands against industry, region, and topic baselines.

### Workflow Integration

Once the product becomes part of ESG reporting, crisis response, and community relations workflows, switching costs increase.

### Human Review Feedback Loop

Human corrections improve customer-specific and domain-specific accuracy, creating a compounding model-quality advantage.

### Radio And Offline Coverage

Coverage of radio transcripts, local reports, and non-mainstream channels creates differentiation that global social listening tools struggle to replicate.


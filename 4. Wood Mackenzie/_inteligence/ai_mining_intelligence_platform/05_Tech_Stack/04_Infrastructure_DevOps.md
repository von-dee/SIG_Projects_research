# Infrastructure & DevOps Tech Stack

## Cloud Providers

| Provider | Role | Services Used |
|----------|------|---------------|
| **AWS** | Primary | EKS, RDS, S3, Lambda, Kinesis, CloudFront, Route 53, CloudWatch |
| **GCP** | Disaster Recovery | GKE, Cloud SQL, Cloud Storage, BigQuery (analytics backup) |
| **Cloudflare** | Edge | CDN, DDoS protection, Workers (edge compute), R2 (backup storage) |

---

## Container Orchestration

| Technology | Version | Purpose |
|------------|---------|---------|
| **Kubernetes (EKS)** | 1.30+ | Container orchestration |
| **Helm** | 3.15+ | Kubernetes package management |
| **ArgoCD** | 2.11+ | GitOps continuous delivery |
| **Istio** | 1.22+ | Service mesh (mTLS, traffic management) |

**Cluster Topology**:
- **Production**: 3 AZs, 6–20 nodes (auto-scaling), spot instances for non-critical workloads
- **Staging**: 2 AZs, 3–6 nodes
- **Development**: 1 AZ, 2–4 nodes

---

## Infrastructure as Code

| Technology | Version | Purpose |
|------------|---------|---------|
| **Terraform** | 1.8+ | Infrastructure provisioning |
| **Terragrunt** | 0.58+ | DRY Terraform configurations |
| **Pulumi** | 3.120+ | Infrastructure as code (Python) for complex logic |
| **AWS CDK** | 2.140+ | AWS-specific infrastructure |

---

## CI/CD Pipeline

| Technology | Purpose |
|------------|---------|
| **GitHub Actions** | CI/CD orchestration |
| **Turborepo** | Monorepo task runner, caching |
| **Changesets** | Version management, changelog generation |
| **semantic-release** | Automated versioning and releases |

**Pipeline Stages**:
1. **Lint & Type Check** — ESLint, Prettier, TypeScript, mypy, ruff
2. **Unit Tests** — Vitest, pytest (parallel, cached)
3. **Integration Tests** — Playwright, Postman/Newman
4. **Build & Push** — Docker image build, push to ECR
5. **Deploy to Staging** — ArgoCD sync
6. **Smoke Tests** — Health checks, critical path validation
7. **Deploy to Production** — Canary deployment (10% → 50% → 100%)
8. **Rollback** — Automated rollback on error rate threshold

---

## Monitoring & Observability

| Technology | Purpose |
|------------|---------|
| **Datadog** | APM, infrastructure monitoring, log management |
| **Grafana** | Custom dashboards (open-source alternative) |
| **Prometheus** | Metrics collection |
| **Loki** | Log aggregation |
| **Jaeger** | Distributed tracing |
| **PagerDuty** | Incident management, on-call scheduling |
| **Sentry** | Error tracking and performance monitoring |
| **LangSmith** | LLM observability (cost, latency, quality) |

**Key Metrics**:
- API response time (p50, p95, p99)
- AI agent latency (per-agent breakdown)
- Data freshness (time since last update per source)
- Query accuracy (human evaluation + automated checks)
- User engagement (DAU, queries per session, retention)
- System health (CPU, memory, disk, network)

---

## Security

| Technology | Purpose |
|------------|---------|
| **HashiCorp Vault** | Secret management |
| **AWS KMS** | Key management |
| **Snyk** | Dependency vulnerability scanning |
| **Trivy** | Container image scanning |
| **OWASP ZAP** | Web application security testing |
| **Cloudflare WAF** | Web application firewall |
| **AWS GuardDuty** | Threat detection |

**Compliance**:
- SOC 2 Type II (planned Year 1)
- GDPR (EU users)
- CCPA (California users)
- ISO 27001 (planned Year 2)

---

## Cost Optimization

| Strategy | Implementation |
|----------|----------------|
| **Spot Instances** | 60% of non-critical compute on AWS Spot |
| **Reserved Instances** | 1-year reserved for baseline compute |
| **S3 Intelligent-Tiering** | Automatic storage class optimization |
| **Lambda** | Serverless for variable workloads |
| **Right-sizing** | Monthly review of resource utilization |
| **FinOps Dashboard** | Real-time cloud spend tracking |

**Target Monthly Infrastructure Cost (Year 1)**:
- Compute: $8,000
- Storage: $3,000
- Database: $5,000
- Networking: $2,000
- AI/ML (API calls): $4,000
- Monitoring: $1,500
- **Total: ~$23,500/month**

---

*Document Version: 1.0 | Date: June 2026*

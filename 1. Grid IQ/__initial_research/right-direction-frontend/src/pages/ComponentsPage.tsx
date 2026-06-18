import { useState } from 'react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageShell } from '../components/layout/PageShell';
import { useToast } from '../context/ToastContext';

const faqs = [
  {
    title: 'How does the tracking system work?',
    body: 'The tracking view consumes telematics and route records through a typed data layer. The current mock API can be replaced with an HTTP client without changing page components.'
  },
  {
    title: 'What is truck capacity measured in?',
    body: 'Capacity is represented as loaded tons over maximum legal tonnage, then rendered as a percentage with visual and textual states.'
  },
  {
    title: 'How do dispatchers contact a driver?',
    body: 'Action buttons are colocated with selected-vehicle context and can be wired to voice, chat, or incident systems.'
  }
];

export function ComponentsPage() {
  const [openIndex, setOpenIndex] = useState(0);
  const { showToast } = useToast();

  return (
    <PageShell description="Reusable interface elements and behaviour patterns used across the frontend." eyebrow="Design System" title="UI Components Library">
      <div className="comp-section">
        <h2 className="comp-section-title">Typography</h2>
        <Card className="typo-card">
          <div className="h1">Heading Level 1</div>
          <div className="h2">Heading Level 2</div>
          <div className="h3">Heading Level 3</div>
          <p className="text-body">Standard body text for dense operational interfaces.</p>
          <p className="text-muted">Muted secondary text for supporting details.</p>
          <p className="text-small">Micro Label / Uppercase</p>
        </Card>
      </div>
      <div className="comp-section">
        <h2 className="comp-section-title">Buttons & Badges</h2>
        <div className="comp-grid">
          <Card>
            <div className="block-label">Buttons</div>
            <div className="component-row">
              <Button onClick={() => showToast('Primary action triggered', 'success')} variant="primary">
                Primary Action
              </Button>
              <Button onClick={() => showToast('Secondary action triggered')}>Secondary Action</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>
          <Card>
            <div className="block-label">Status Badges</div>
            <div className="component-row">
              <Badge tone="success" withDot>Success</Badge>
              <Badge tone="warning" withDot>Warning</Badge>
              <Badge tone="danger" withDot>Danger</Badge>
              <Badge tone="info" withDot>Info</Badge>
              <Badge>Neutral</Badge>
            </div>
          </Card>
        </div>
      </div>
      <div className="comp-section">
        <h2 className="comp-section-title">Accordions & Data Tables</h2>
        <div className="comp-grid">
          <Card className="accordion-card">
            {faqs.map((faq, index) => (
              <div className={`accordion-item ${openIndex === index ? 'open' : ''}`} key={faq.title}>
                <button className="accordion-header" onClick={() => setOpenIndex(openIndex === index ? -1 : index)} type="button">
                  {faq.title}
                  <span>⌄</span>
                </button>
                <div className="accordion-content">{faq.body}</div>
              </div>
            ))}
          </Card>
          <Card className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Thomas Hoffmann</td>
                  <td>SD - 752069247</td>
                  <td><Badge tone="success" withDot>On Route</Badge></td>
                  <td>4h 30m</td>
                </tr>
                <tr>
                  <td>Julia Schmidt</td>
                  <td>XR - 936383762</td>
                  <td><Badge tone="warning" withDot>Working</Badge></td>
                  <td>2h 15m</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

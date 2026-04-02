import type { LucideIcon } from 'lucide-react';
import {
  ArrowRightLeft,
  BadgeCheck,
  BarChart3,
  BookCheck,
  Building2,
  ClipboardCheck,
  FileSearch,
  FileSpreadsheet,
  Handshake,
  Landmark,
  Layers3,
  LayoutTemplate,
  LockKeyhole,
  Mail,
  Network,
  Radar,
  Scale,
  ShieldCheck,
  Sparkles,
  Waypoints,
  Workflow,
  Users2,
} from 'lucide-react';

export const portalUrl = 'https://treasuryos.aicustombot.net/login';

export type NavigationItem = {
  label: string;
  href: string;
};

export type MarketingAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
  external?: boolean;
};

export type ProductSummary = {
  slug: string;
  eyebrow: string;
  title: string;
  shortTitle: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
};

export type ProductPageContent = ProductSummary & {
  kicker: string;
  narrative: string;
  outcomes: string[];
  capabilities: Array<{
    title: string;
    description: string;
    icon: LucideIcon;
  }>;
  workflow: Array<{
    title: string;
    description: string;
  }>;
  teams: string[];
};

export type CompanyPageContent = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
  highlights: string[];
  sections: Array<{
    title: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: LucideIcon;
    }>;
  }>;
};

export const primaryNavigation: NavigationItem[] = [
  { label: 'Platform', href: '/#platform' },
  { label: 'Products', href: '/products' },
  { label: 'Company', href: '/company' },
  { label: 'Contact', href: '/company/contact' },
];

export const homeSignals = [
  'Pilot launch ready',
  'Compliance-first by design',
  'Phased Solana rollout',
];

export const customerSegments = [
  {
    title: 'Treasury leaders',
    description:
      'Run approvals, treasury motions, and operating checks without forcing teams to improvise outside the control plane.',
    icon: Landmark,
  },
  {
    title: 'Compliance teams',
    description:
      'Centralize entity records, policy context, review trails, and evidence packages in one workspace.',
    icon: Scale,
  },
  {
    title: 'Operations managers',
    description:
      'Coordinate governance, exceptions, and reporting workflows across internal operators and external stakeholders.',
    icon: Workflow,
  },
  {
    title: 'Audit and finance partners',
    description:
      'Present exportable, reviewable activity history for boards, auditors, banking partners, and regulators.',
    icon: FileSearch,
  },
];

export const platformPillars = [
  {
    title: 'One control plane for treasury execution',
    description:
      'Bring governance, reporting, and exception handling together so teams operate from the same state and context.',
    icon: Layers3,
  },
  {
    title: 'Evidence-first compliance workflows',
    description:
      'Capture who reviewed, why they approved, and which records support every treasury decision.',
    icon: ClipboardCheck,
  },
  {
    title: 'Deployment posture that matches reality',
    description:
      'Pilot scope stays honest: live KYC and live on-chain sync can phase in without forcing a redesign of the operating model.',
    icon: Radar,
  },
];

export const launchRoadmap = [
  {
    title: 'Launch now',
    description:
      'Governance, reporting, and treasury operations workflows for institutional pilot teams moving onto Solana rails.',
  },
  {
    title: 'Phase carefully',
    description:
      'Expand KYC, sync automation, and integrations as each control surface is validated for the customer profile.',
  },
  {
    title: 'Operate with confidence',
    description:
      'Keep one operating system as the platform matures from pilot workflows into broader institutional coverage.',
  },
];

export const productSummaries: ProductSummary[] = [
  {
    slug: 'treasury-control',
    eyebrow: 'Product 01',
    title: 'Treasury Control',
    shortTitle: 'Treasury Control',
    description:
      'Coordinate treasury motions, wallet governance, and approval responsibilities in a workflow designed for institutional teams.',
    highlights: ['Policy-aware approvals', 'Wallet governance context', 'Operator-ready control room'],
    icon: ArrowRightLeft,
  },
  {
    slug: 'compliance-command',
    eyebrow: 'Product 02',
    title: 'Compliance Command',
    shortTitle: 'Compliance Command',
    description:
      'Track onboarding evidence, review decisions, and audit-ready case history without breaking the operational rhythm of the team.',
    highlights: ['Entity record lifecycle', 'Review casework', 'Evidence capture'],
    icon: ShieldCheck,
  },
  {
    slug: 'reporting-studio',
    eyebrow: 'Product 03',
    title: 'Reporting Studio',
    shortTitle: 'Reporting Studio',
    description:
      'Turn treasury activity into structured reports, evidence packs, and stakeholder updates that are easy to review and share.',
    highlights: ['Scheduled reporting', 'Downloadable packs', 'Board and auditor context'],
    icon: FileSpreadsheet,
  },
];

export const productPages: Record<string, ProductPageContent> = {
  'treasury-control': {
    ...productSummaries[0],
    kicker: 'Run treasury operations with shared context, approvals, and institutional-grade visibility.',
    narrative:
      'Treasury Control gives treasury and operations teams one place to coordinate high-trust movements, governance reviews, and wallet decisions without scattering responsibility across spreadsheets, chats, and ad-hoc signoff loops.',
    outcomes: [
      'Reduce approval ambiguity before money moves',
      'Give signers the same context as operators and reviewers',
      'Create a cleaner operating record for every treasury action',
    ],
    capabilities: [
      {
        title: 'Approval routing with operational context',
        description:
          'Attach policy notes, reviewers, and supporting evidence to each treasury action so approvals are explainable, not just recorded.',
        icon: Workflow,
      },
      {
        title: 'Wallet governance that fits real teams',
        description:
          'Pair wallet requests and governance status with the institutional entity, role model, and downstream review path.',
        icon: LockKeyhole,
      },
      {
        title: 'Control-room visibility for operators',
        description:
          'See the operational status of requests, exceptions, and approvals in one interface designed for day-to-day treasury execution.',
        icon: LayoutTemplate,
      },
    ],
    workflow: [
      {
        title: 'Define the motion',
        description:
          'Capture the treasury action, the accountable entity, and the decision context before it enters a review queue.',
      },
      {
        title: 'Route through governance',
        description:
          'Send the request through the right operator, compliance, and signer sequence for your rollout posture.',
      },
      {
        title: 'Preserve the evidence',
        description:
          'Keep the final decision, rationale, and timeline available for future audit, review, and reporting.',
      },
    ],
    teams: ['Treasury leads', 'Operations managers', 'Approval signers', 'Governance administrators'],
  },
  'compliance-command': {
    ...productSummaries[1],
    kicker: 'Bring onboarding evidence, review workflows, and institutional oversight into one command layer.',
    narrative:
      'Compliance Command is built for teams that need audit-ready operational evidence, not just a status badge. It helps operators track what is known, what is pending, and what has already been approved across each institutional customer record.',
    outcomes: [
      'Keep entity context visible throughout the review lifecycle',
      'Make manual reviews easier to explain internally and externally',
      'Support phased rollout of deeper KYC and sync capabilities without reworking the core model',
    ],
    capabilities: [
      {
        title: 'Entity-centered review records',
        description:
          'Keep jurisdiction, risk signals, record status, and notes together so reviewers do not lose the narrative behind each decision.',
        icon: Building2,
      },
      {
        title: 'Exception handling with durable audit trails',
        description:
          'Preserve what triggered a review, who touched it, and why a final decision was made.',
        icon: BadgeCheck,
      },
      {
        title: 'Compliance context for downstream actions',
        description:
          'Use the compliance state to inform treasury workflows, reporting scope, and eventual on-chain synchronization posture.',
        icon: Network,
      },
    ],
    workflow: [
      {
        title: 'Capture the customer context',
        description:
          'Create the institutional record with the right legal, operational, and risk metadata for the rollout scope.',
      },
      {
        title: 'Review what matters',
        description:
          'Route manual review items and supporting notes without losing the thread between compliance and operations.',
      },
      {
        title: 'Hand off with confidence',
        description:
          'Move approved entities into treasury and reporting workflows with the right evidence still attached.',
      },
    ],
    teams: ['Compliance officers', 'KYB reviewers', 'Risk teams', 'Operations partners'],
  },
  'reporting-studio': {
    ...productSummaries[2],
    kicker: 'Make reporting part of the operating system, not a scramble at the end of the month or quarter.',
    narrative:
      'Reporting Studio converts TreasuryOS activity into stakeholder-ready outputs. It is designed for teams that need a dependable way to package treasury posture, operational evidence, and exceptions for executives, auditors, and external partners.',
    outcomes: [
      'Shorten the path from activity to stakeholder-ready output',
      'Keep operational evidence aligned with every report',
      'Support recurring reporting without losing flexibility for one-off requests',
    ],
    capabilities: [
      {
        title: 'Evidence-backed reporting templates',
        description:
          'Structure recurring reports around the same operational data and decision history the team already uses day to day.',
        icon: BookCheck,
      },
      {
        title: 'Downloadable data-room style outputs',
        description:
          'Package reports in formats that make sense for review, archiving, and executive communication.',
        icon: FileSpreadsheet,
      },
      {
        title: 'Operational insight alongside outcomes',
        description:
          'Show what changed, why it changed, and which controls or reviews shaped the result.',
        icon: BarChart3,
      },
    ],
    workflow: [
      {
        title: 'Define the reporting lens',
        description:
          'Choose whether the report is for internal leadership, audit readiness, or external oversight and package the right context.',
      },
      {
        title: 'Generate from the same source of truth',
        description:
          'Pull from live operational state instead of reassembling details across disconnected tools.',
      },
      {
        title: 'Distribute and archive cleanly',
        description:
          'Keep the report, inputs, and supporting artifacts easy to review again later.',
      },
    ],
    teams: ['Finance leaders', 'Audit partners', 'Operations managers', 'Executive stakeholders'],
  },
};

export const companySummaries = [
  {
    slug: 'about',
    eyebrow: 'Company',
    title: 'About TreasuryOS',
    description: 'The thesis, principles, and product philosophy behind the platform.',
    icon: Sparkles,
  },
  {
    slug: 'approach',
    eyebrow: 'Company',
    title: 'Delivery Approach',
    description: 'How we structure pilots, rollout decisions, and institutional implementation.',
    icon: Waypoints,
  },
  {
    slug: 'contact',
    eyebrow: 'Company',
    title: 'Contact & Engagement',
    description: 'Book a working session, architecture review, or launch-planning conversation.',
    icon: Mail,
  },
];

export const companyPages: Record<string, CompanyPageContent> = {
  about: {
    slug: 'about',
    eyebrow: 'Company / About',
    title: 'We design treasury infrastructure for institutions that need control, not chaos.',
    description:
      'TreasuryOS exists to help institutional teams move into digital-asset operations without abandoning governance, auditability, or operational discipline.',
    summary:
      'We are building the operating layer between treasury intent, compliance evidence, and on-chain execution so teams can scale their process before they scale their exposure.',
    highlights: ['Compliance-first product thinking', 'Pilot-first rollout discipline', 'Institutional operating model focus'],
    sections: [
      {
        title: 'Why we built TreasuryOS',
        description:
          'Most institutional teams do not fail because they lack ambition. They fail because their workflow stack is fragmented the moment treasury, compliance, and governance need to act together.',
        items: [
          {
            title: 'Shared operating truth',
            description:
              'We want operators, reviewers, and executives to work from the same state instead of translating between disconnected tools.',
            icon: Network,
          },
          {
            title: 'Trustworthy adoption path',
            description:
              'We believe rollout posture should be explicit so institutions can expand capability without pretending every control is already live.',
            icon: Handshake,
          },
          {
            title: 'Design for accountability',
            description:
              'Evidence trails, reviewer context, and role clarity are product features, not afterthoughts.',
            icon: BadgeCheck,
          },
        ],
      },
      {
        title: 'What guides the product',
        description:
          'TreasuryOS is shaped by the needs of treasury, compliance, and finance teams that must defend their operating model to more than one audience.',
        items: [
          {
            title: 'Clarity over noise',
            description:
              'Every surface should help teams understand what needs action now, what is blocked, and what is already defensible.',
            icon: LayoutTemplate,
          },
          {
            title: 'Progressive rollout',
            description:
              'We support phased capability activation so institutions can mature their posture without rebuilding the system around them.',
            icon: Radar,
          },
          {
            title: 'Operational dignity',
            description:
              'The people responsible for keeping the platform safe deserve tools that respect the complexity of their job.',
            icon: Users2,
          },
        ],
      },
    ],
  },
  approach: {
    slug: 'approach',
    eyebrow: 'Company / Approach',
    title: 'Pilot-first delivery, shaped for high-trust treasury teams.',
    description:
      'Our implementation approach is designed to help institutions move deliberately: align the control model, prove the workflow, then widen the rollout without losing operational coherence.',
    summary:
      'TreasuryOS is most effective when teams treat launch as an operating transition, not just a deployment event. The product, rollout plan, and stakeholder narrative need to move together.',
    highlights: ['Discovery around controls', 'Phased activation of capabilities', 'Shared launch runbooks and monitoring'],
    sections: [
      {
        title: 'How we structure a rollout',
        description:
          'The goal is to establish a trustworthy operating model before pushing every available feature into production.',
        items: [
          {
            title: 'Map the operating model',
            description:
              'Identify decision-makers, reviewers, and signers so the platform reflects how the institution really works.',
            icon: Workflow,
          },
          {
            title: 'Agree the live scope',
            description:
              'Define what goes live now, what stays preview-only, and what remains in a controlled pilot state.',
            icon: ClipboardCheck,
          },
          {
            title: 'Launch with instrumentation',
            description:
              'Use runbooks, health checks, and reporting surfaces to make the release observable and explainable.',
            icon: FileSearch,
          },
        ],
      },
      {
        title: 'What happens after pilot go-live',
        description:
          'Post-launch work focuses on deepening trust, not just adding surface area.',
        items: [
          {
            title: 'Harden the edges',
            description:
              'Tighten controls, review residual operational friction, and improve the audit and reporting experience.',
            icon: ShieldCheck,
          },
          {
            title: 'Expand responsibly',
            description:
              'Introduce richer automation, KYC depth, or on-chain sync only when the surrounding control model is ready.',
            icon: Waypoints,
          },
          {
            title: 'Keep the narrative honest',
            description:
              'Align product messaging with the true operational scope so teams never sell an assumption as a delivered control.',
            icon: BookCheck,
          },
        ],
      },
    ],
  },
};

export const contactTracks = [
  {
    title: 'Pilot launch workshop',
    description:
      'For teams deciding what should go live now, what stays phased, and how to align the operating narrative with the technical scope.',
    icon: Waypoints,
  },
  {
    title: 'Architecture & controls review',
    description:
      'For treasury, compliance, and engineering stakeholders who want to review workflow design, control ownership, and reporting posture.',
    icon: ShieldCheck,
  },
  {
    title: 'Commercial discovery',
    description:
      'For leadership teams evaluating fit, rollout expectations, and what a successful institutional adoption path looks like.',
    icon: Handshake,
  },
];

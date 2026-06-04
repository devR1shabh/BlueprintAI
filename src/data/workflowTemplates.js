/**
 * workflowTemplates.js
 * Static data file — six enterprise business process templates.
 * No imports, no logic, no side effects.
 *
 * Each template:
 *   { id, name, description, category, content }
 *
 * To add more templates: append to the array. No other file needs changing.
 */

export const WORKFLOW_TEMPLATES = [
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding',
    description: 'End-to-end new hire process',
    category: 'HR',
    content: `A new hire accepts the offer letter and HR initiates the onboarding workflow. The IT team provisions a laptop, email account, and system access credentials before the start date. On day one, the employee attends an orientation session covering company policies, culture, and compliance requirements. The direct manager conducts a role briefing and assigns a buddy from the team. The employee completes mandatory compliance training including data privacy, code of conduct, and security awareness. HR schedules 30-day, 60-day, and 90-day check-ins to track progress. Payroll is configured and the employee is enrolled in benefits. At the 90-day mark, the manager completes a probation review and either confirms permanent employment or extends the probation period.`,
  },
  {
    id: 'vendor-onboarding',
    name: 'Vendor Onboarding',
    description: 'Supplier registration and approval',
    category: 'Procurement',
    content: `The vendor submits a registration request via the supplier portal, including company registration documents, tax identification, and bank details. The procurement team performs an initial eligibility check and assigns a vendor category. The compliance team conducts due diligence including sanctions screening, anti-bribery checks, and financial health assessment. The legal team reviews and countersigns the master service agreement and non-disclosure agreement. Finance verifies bank account details and sets up payment terms in the ERP system. The procurement manager approves the vendor and assigns a vendor code. The vendor is notified of approval and granted portal access. Procurement schedules a kickoff call to align on delivery expectations and SLA requirements.`,
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    description: 'Employee leave request workflow',
    category: 'HR',
    content: `The employee submits a leave request through the HR portal, specifying leave type, start date, end date, and a brief reason. The system checks the employee's leave balance and flags any conflicts with existing team leave or critical project deadlines. The direct manager receives a notification and reviews the request within two business days. If approved, the system deducts the leave balance and sends calendar invites to the team. If rejected, the manager provides a written reason and the employee may resubmit with alternative dates. For leave exceeding ten consecutive days, HR Business Partner approval is additionally required. The payroll system is automatically updated to reflect approved leave. The employee receives a confirmation email with leave details and remaining balance.`,
  },
  {
    id: 'purchase-request',
    name: 'Purchase Request',
    description: 'Procurement approval and PO generation',
    category: 'Finance',
    content: `The requestor submits a purchase request in the procurement system, including item description, estimated cost, business justification, and preferred vendor. The system checks whether the request falls within the requestor's budget authority. Requests under five thousand dollars are auto-approved and routed to procurement for processing. Requests between five thousand and fifty thousand dollars require department manager approval. Requests above fifty thousand dollars require VP-level approval and finance review. Once approved, the procurement team validates vendor eligibility and raises a purchase order in the ERP. The vendor receives the PO and confirms acceptance. Goods or services are delivered and the requestor confirms receipt in the system. The three-way match process verifies PO, receipt, and invoice before finance releases payment.`,
  },
  {
    id: 'invoice-processing',
    name: 'Invoice Processing',
    description: 'Accounts payable end-to-end cycle',
    category: 'Finance',
    content: `The vendor submits an invoice via email or the supplier portal. The accounts payable team logs the invoice in the ERP and checks it against the corresponding purchase order and goods receipt note. If all three documents match, the invoice is approved for payment automatically. If discrepancies are found, the AP team flags the invoice and notifies the procurement team and vendor to resolve the mismatch. Disputed invoices are placed on hold and must be resolved within ten business days. Once approved, the system schedules payment according to agreed payment terms. The finance manager reviews and authorises the payment run. The bank transfer is executed and a remittance advice is sent to the vendor. The transaction is posted to the general ledger and the purchase order is closed.`,
  },
  {
    id: 'customer-complaint',
    name: 'Customer Complaint Resolution',
    description: 'Support escalation and resolution flow',
    category: 'Support',
    content: `The customer submits a complaint via phone, email, or the web portal. The system creates a complaint ticket and assigns a severity level based on the nature of the issue. A Tier 1 support agent contacts the customer within two hours to acknowledge receipt and gather additional information. The agent attempts to resolve the complaint within the first contact. If unable to resolve, the ticket is escalated to Tier 2 with full context and call notes. Tier 2 investigates the root cause, coordinates with relevant internal teams, and implements a resolution. The customer is kept informed of progress at each stage with regular status updates. Once resolved, the agent confirms the resolution with the customer and closes the ticket. A satisfaction survey is sent automatically 24 hours after closure. Complaints resulting in financial loss are reviewed by the quality team within five business days to prevent recurrence.`,
  },
]

export default WORKFLOW_TEMPLATES
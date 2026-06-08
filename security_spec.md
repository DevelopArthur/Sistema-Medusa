# Security Specification & Test Harness

## 1. Data Invariants
*   **Case Invariant**: All elements representing critical investigations must adhere strictly to predefined validation structures (valid ID and required properties with non-spoofed attributes).
*   **Alert Invariant**: System alerts indicating malicious transactions are system-generated and read-only or status-updatable only by verified authentication.
*   **Entity Invariant**: Financial institutions, individuals, and company profiles must enforce valid unique identifier ranges to prevent denial-of-wallet injections.
*   **Temporal Invariant**: Creation or modification of transaction details must strictly ensure size constraints and clean formats.

---

## 2. The "Dirty Dozen" Payloads (Vulnerability Scenarios)
1.  **Impersonated Administrator**: Creating a Case with arbitrary fields attempting to hijack other users.
2.  **Shadow Update Over-injection**: Injecting an extra system key (e.g. `isVerified: true`) into Entity records.
3.  **Invalid Case ID Size Injection**: Inserting a 50KB junk-character string as a document query key.
4.  **Malicious State Transition Bypass**: Escalating alerts directly to dismissed without verified privileges.
5.  **PII Direct Reading Violation**: Requesting plain text email addresses.
6.  **Unsigned-In Write**: Creating entities without explicit Firebase Auth token credentials.
7.  **Email Identity Spoofing**: Attempting reads using an unverified test login account.
8.  **Empty Payload Inject**: Passing empty JSON variables in ChatMessage updates.
9.  **Type-mismatched Risk Score**: Injecting a text block as `riskScore` within an investigation Case record.
10. **Huge Chat Payload Denial**: Attempting to insert a 4MB chat message string to exhaust Firestore storage.
11. **Negative Risk score range**: Setting investigation score range dynamically to `-505`.
12. **Status Spoofing**: Transitioning closed case states back to active without full parameter integrity.

---

## 3. Test Runner Configuration (Mock Assertions)
We enforce that all dirty payloads return `PERMISSION_DENIED` within our unit schemas and verify strict matches.

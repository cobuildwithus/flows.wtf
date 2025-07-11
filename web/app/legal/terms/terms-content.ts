export const TERMS_CONTENT = `
## Just Cobuild, Co. Terms of Service

**Effective Date:** July 11, 2025  
**Snapshot:** "Continuous funding for grassroots projects via streaming smart-contracts."  
**Commit Hash:** 0000000000000000000000000000000000000000

### IMPORTANT NOTICE

This Agreement includes a class-action waiver, jury-trial waiver, and a statement of blockchain-related risks. By accepting these terms, you waive your rights to participate in class actions and jury trials. This Agreement contains a binding arbitration clause (§15). By accepting you waive the right to a court trial except for small-claims or injunctive relief.

---

## 1. Introduction & Acceptance

### 1.1 Contracting Entity

Just Cobuild, Co., a Delaware C-Corporation ("Cobuild").

### 1.2 How You Accept

You accept this Agreement via wallet-connect signature, checking an acceptance box, or by continued use of our Services. If you continue to access the Services after the Effective Date, you are deemed to have accepted these Terms.

### 1.3 Right to Amend

Cobuild may unilaterally update these Terms with 30-day advance notice for material changes. Immaterial updates may be made immediately.

### 1.4 Contact Information

* Formal notices: [legal@justco.build](mailto:legal@justco.build)
* Security bugs: [security@justco.build](mailto:security@justco.build)

---

## 2. Eligibility & User Restrictions

### 2.1 Age Requirement

You must be at least 18 years old and legally able to contract. If the laws of your jurisdiction require you to be 18 or older to enter binding contracts, you must comply with that age.

### 2.2 Sanctions & Blocked Jurisdictions

You represent that you are not (a) the subject of economic or trade sanctions administered or enforced by any governmental authority, nor (b) located in, organized under the laws of, or ordinarily resident in a country or territory that is the subject of country-wide or territory-wide economic sanctions. You may not use Cobuild if located in jurisdictions subject to comprehensive sanctions or identified on the OFAC SDN list.

### 2.3 No Prohibited Persons

You represent you are not violating any sanctions or legal prohibitions by using Cobuild.

### 2.4 Export-Control Compliance

You agree to comply with U.S. export controls and trade sanctions. You may not export or re-export any Cobuild software except in compliance with U.S. Export Administration Regulations and similar regimes.

---
## 3. Defined Terms

The following terms have the meanings set forth below (listed alphabetically):  
- Baseline Pool – The distribution pool in the protocol that ensures all approved recipients (Builders) receive an even split of funds, providing a foundational level of continuous support to all contributors regardless of votes.  
- Bonus Pool – The distribution pool in the protocol where additional funds are allocated based on community votes (e.g., from Nouns DAO token holders), allowing for weighted rewards to high-impact projects beyond the baseline allocation.  
- Builder – An individual or entity that applies to receive streamed funding for grassroots projects; Builders must maintain Farcaster activity, comply with flow rules, and meet milestones to remain eligible.  
- Flow – The smart-contract protocol that enables continuous streaming of funds into baseline and bonus pools, governed by Nouns holders via L2 proofs, serving as an unstoppable growth engine for onchain projects.  
- Grant-Round Escrow – The temporary holding of funds by Cobuild during designated grant rounds for operators, subject to AML/KYC checks and OFAC screening; this is the limited exception to the non-custodial nature of the Services.  
- Interface – The frontend web application (flows.wtf) that provides a user interface for routing signed transactions to the underlying smart contracts, without custody of user assets.  
- Juicebox Sale – The process by which Tokens are minted and sold exclusively through integrated Juicebox or Revnet contracts; Cobuild does not directly sell Tokens.  
- Services – The Flows.wtf platform as a whole, including the Interface, smart contracts, and related tools for continuous funding, token sales via Juicebox, and community governance.  
- Smart Contract – Permissionless, on-chain contracts (e.g., Flow.sol, FlowTCR.sol, NounsFlow.sol) deployed on EVM-compatible networks like Base L2, which autonomously manage fund streaming, voting, and recipient curation.  
- Sponsor – A user who pays non-refundable application bonds to fund grant rounds or support projects, enabling Builders to join flows; Sponsors must abstain from illicit funding and comply with sanctions.  
- Stream – The mechanism for second-by-second accrual and distribution of funds to approved recipients using block.timestamp, claimable at any time via compatible EVM wallets, with unclaimed amounts persisting indefinitely.  
- Tokens – Digital assets (e.g., ERC20) minted and sold through Juicebox contracts for protocol use, such as bonding curves or fees; Tokens are not sold directly by Cobuild and carry no investment guarantees.  
- User – Any individual or entity accessing or interacting with the Services, including but not limited to Builders, Sponsors, and voters (e.g., Nouns holders).  
- Variable Fee – Administrative fees charged by Cobuild on streamed funds or escrowed grant programs, typically 2% deducted automatically, with rates disclosed in the Interface or per program.

---

## 4. Description of Services

### 4.1 Non-Custodial Interface

Cobuild never holds private keys or user funds.

### 4.2 Limited Custody Exception

Temporary escrow may occur during grant-round operations. Funds in escrow during grant-round operations are held for the duration of the grant round, typically up to 30 days, under the control of specified smart contracts as disclosed in the Interface.

### 4.3 Open-Source Code

Protocol and front-end code licensed under GPL-3.0.

### 4.4 Smart-Contract Persistence

Smart contracts remain active independently of Cobuild's web interface.

### 4.5 Upgrades & Forks

Protocol changes are community-driven with notices provided for material changes. Contract addresses may change as a result of upgrades, and users must verify addresses themselves.

---

## 5. Funding & Streaming Mechanics

### 5.1 Continuous Accrual

Funds accrue second-by-second using \`block.timestamp\`.

### 5.2 Claiming Streams

Streams can be claimed by any compatible EVM wallet; unclaimed funds persist indefinitely.

### 5.3 Token Sales

Token sales occur exclusively via Juicebox contracts; Cobuild does not sell tokens directly. We make no representations that Tokens are securities or investments; users assume all regulatory risks. Cobuild does not solicit investments and users must comply with applicable securities laws. We do not provide investment, financial, or tax advice; all trades are unsolicited and at your risk; Tokens are not securities or derivatives—consult advisors.

### 5.4 On-Chain Accuracy & Rounding

Cobuild disclaims liability for rounding errors, blockchain re-orgs, and mempool front-running. Cobuild does not provide MEV protection; transactions may be reordered by miners or block producers.

### 5.5 Variable Administrative Fee

Cobuild charges variable administrative fees on escrowed grant rounds, disclosed per program, not to exceed 5% of funds processed per grant round unless expressly disclosed on the Interface.

---

## 6. Fees, Refunds & Taxes

### 6.1 Non-Refundable Costs

Gas fees, bonding-curve deposits, application bonds, and network fees are non-refundable, except as required under EU consumer law or card-network rules.

### 6.2 Fee Disclosure & Deduction Method

Fees are transparently disclosed in the UI or contract parameters.

### 6.3 User Tax Obligations

Users are solely responsible for reporting and paying applicable taxes. All fees non-refundable except as required by law. We make no representations on tax implications; report/remit to authorities. Tax consequences (e.g., capital gains) are your sole responsibility—no advice provided.

---

## 7. User Obligations & Prohibited Conduct

### 7.1 General Conduct

Use the platform lawfully and in good faith.

### 7.2 Prohibited Activities

Includes sanctions evasion, Sybil attacks, rug pulls, malware, phishing, IP infringement, exploitation, hate speech, malicious reverse engineering beyond the scope permitted by the GPL license, data scraping, automated harvesting, market manipulation (e.g., wash trading, pumping/dumping), securities or derivatives violations, and sale of stolen/illegal property.

### 7.3 Wallet Security

Users maintain exclusive custody of their wallets. Cobuild is not liable for compromised keys.

---

## 8. Intellectual Property

### 8.1 Software Licence

GPL-3.0 license governs the protocol and front-end.

### 8.2 Trademarks & Branding

All trademarks and branding © 2023-2025 Just Cobuild, Co. ™.

### 8.3 User-Generated Content Licence

Cobuild holds a worldwide, non-exclusive right to display and sublicense to third-party indexers and front-ends publicly available on-chain and Farcaster data.

### 8.4 DMCA & Takedown Procedure

Report infringements via [legal@justco.build](mailto:legal@justco.build) or by mail to DMCA Agent, Just Cobuild Co., 131 Continental Dr Suite 305, Newark DE 19713.

---

## 9. Privacy & Data

### 9.1 Data Collected

Cobuild collects wallet addresses, on-chain activity, and minimal telemetry. We currently do not set tracking cookies or similar technologies. If that changes we will update this Notice before activation.

### 9.2 Use of Data

Collected data is used for analytics, security, and service improvements, based on legitimate interests for usage analytics.

### 9.3 Privacy Notice

See Cobuild’s Privacy Notice for GDPR and CCPA details.

---

## 10. Security & Vulnerability Reporting

### 10.1 Bug-Report Channel

Report bugs at [security@justco.build](mailto:security@justco.build).

### 10.2 No Formal Bounty Programme

Cobuild may offer discretionary rewards for reported vulnerabilities. Cobuild will not pursue legal action for good-faith discovery and 90-day coordinated disclosure of vulnerabilities.

### 10.3 Liability for Exploits

Cobuild is only liable for gross negligence or willful misconduct.

---

## 11. Disclaimers of Warranties

### 11.1 AS-IS / AS-AVAILABLE

All services provided without warranties of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, title, and non-infringement.

### 11.2 Blockchain Risks

You assume all blockchain-related risks including smart-contract bugs and volatility. Cobuild explicitly disclaims responsibility for Layer-2 bridges or wrapped assets.

### 11.3 Third-Party Services

Flows.wtf integrates with third-party services including Juicebox, Farcaster, and various wallet providers. You are responsible for reviewing their respective terms of service and privacy policies. Cobuild disclaims all liability for issues, outages, security breaches, or other problems arising from these third-party services.

### 11.4 Regulatory & Tax Disclaimer

Cobuild does not provide legal, tax, or investment advice.

---

## 12. Limitation of Liability

### 12.1 Total Waiver Limitation

Cobuild disclaims all liability for direct, indirect, incidental, or consequential damages. Nothing in this Section limits liability for fraud, intentional misconduct, or gross negligence where such limitation is unenforceable. Cobuild has no liability for third-party acts.

### 12.2 Statutory Fallback

If unenforceable, maximum aggregate liability per user, aggregate, is the greater of USD 100 or total fees paid by you in the 12 months preceding the claim, except where prohibited by applicable law, such as mandatory consumer rights in the EU.

### 12.3 No Fiduciary Duties

No fiduciary relationship is created between users and Cobuild.

---

## 13. Indemnification

### 13.1 User Duty to Indemnify

You indemnify Cobuild against claims arising from: (a) illegal use of the platform, (b) tax defaults or failures to meet tax obligations, (c) IP infringement including unauthorized use of copyrighted materials or trademarks, and (d) sanctions violations or prohibited transactions. Cobuild will promptly notify you of any claim and may assume exclusive defense.

### 13.2 Procedure

Provide notice, cooperate in defense, and no settlements without consent.

---

## 14. Termination & Suspension

### 14.1 Cobuild Termination Rights

Cobuild may suspend service immediately or after reasonable notice at its discretion for violations or legal obligations.

### 14.2 Effect of Termination

Interface access revoked, but smart contracts remain accessible.

### 14.3 Survival

Sections 8–13, 15-18 (including §16) survive termination.

---

## 15. Governing Law & Dispute Resolution

### 15.1 Governing Law

Delaware law governs.

### 15.2 Venue & Arbitration

Disputes shall be resolved through informal negotiation for 60 days, then by binding arbitration under JAMS Rules. Arbitration shall be confidential. The Federal Arbitration Act governs the interpretation and enforcement of this Section. Arbitration fees are set by the JAMS Consumer Rules; if deemed excessive Cobuild will pay the arbitrator's fees. You may opt out of arbitration by emailing legal@justco.build with subject line "Arbitration Opt-Out" within 30 days of first acceptance. Opt-out notices may also be mailed to: Just Cobuild – Legal, 131 Continental Dr Suite 305, Newark DE 19713, USA. Delaware courts have exclusive jurisdiction for injunctive relief and award enforcement. You retain the right to bring individual small-claims actions. If you are a consumer resident of California, arbitration will be held in California and governed by California law, with the right to small claims option and discovery rights.

### 15.3 Informal Negotiation

Mandatory 60-day negotiation period before arbitration.

### 15.4 Class-Action & Jury-Trial Waiver

Class actions and jury trials explicitly waived.

---

## 16. Changes to Terms & Notice

### 16.1 Versioning

Terms include git commit hash and update date.

### 16.2 Notice Mechanism

Notices via flows.wtf, in-app, email (if you have linked or provided one through the Interface), or RSS 30 days prior to changes.

### 16.3 Continued Use

Continued use constitutes acceptance.

---

## 17. Contact & Registered Agent

Just Cobuild, Co., 131 Continental Dr Suite 305, Newark DE 19713 USA. Email: [legal@justco.build](mailto:legal@justco.build), [security@justco.build](mailto:security@justco.build).

Service of process: Northwest Registered Agent LLC, 8 The Green, Suite B, Dover DE 19901.

---

## 18. Miscellaneous

Nothing in these Terms shall be construed to create a partnership, joint venture, agency, or fiduciary relationship. Includes assignment restrictions, entire agreement, severability, force majeure (including network partition, chain re-org, government regulation, court or DAO-level hard fork, act of God, war, pandemic, public-health emergency, and similar events), and headings convenience. Cobuild may freely assign its rights in connection with merger, acquisition, or asset sale.

Cobuild endeavours to make the Interface reasonably accessible and welcomes feedback at [legal@justco.build](mailto:legal@justco.build).

---

## 19. Plain-Language Summary (Non-Binding)

Self-custody, fees non-refundable, experimental tech, liability limited, Delaware jurisdiction. This summary is provided for convenience and does not override the Terms.
`

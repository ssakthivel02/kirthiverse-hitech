# KirthiVerse P11A UK / England Official Reference Guide

> **STATUS: REFERENCE GUIDE FOR EXTERNAL REVIEW — NOT LEGAL ADVICE OR APPROVAL**
>
> Last checked: 2026-09-10. The responsible reviewer/organisation must determine which guidance, duties and approvals actually apply to the intended pilot.

## 1. Keeping Children Safe in Education 2026

Official source:
https://www.gov.uk/government/publications/keeping-children-safe-in-education--2

The September 2026 version is in force from 1 September 2026 and sets out statutory safeguarding duties for schools and colleges in England.

For any school/college pilot, the responsible organisation should decide how the proposed KirthiVerse activity fits its safeguarding policies, designated safeguarding lead arrangements, staff responsibilities and escalation procedures.

KirthiVerse must not substitute its own software controls for the organisation's safeguarding process.

## 2. Department for Education — Data protection in schools

Official source:
https://www.gov.uk/guidance/data-protection-in-schools

The guidance was updated on 9 July 2026. The 2026 updates include changes reflecting the Data (Use and Access) Act 2025, a new EdTech procurement section, and existing dedicated guidance on generative AI and data protection in schools.

For a school/academy context, the responsible organisation should determine controller/processor roles, lawful processing arrangements, data-protection governance, security, retention, deletion, data-sharing and procurement requirements.

## 3. Department for Education — Data (Use and Access) Act 2025 update

Official source:
https://www.gov.uk/guidance/data-protection-in-schools/the-data-use-and-access-act-2025

DfE states that the Data (Use and Access) Act 2025 changes came into force on 8 July 2026. The Act does not replace existing data-protection legislation; it amends and builds on UK GDPR, the Data Protection Act 2018 and PECR.

For external review, the responsible organisation should confirm which 2026 changes affect the intended KirthiVerse pilot, including lawful-basis analysis, automated decision-making where applicable, accountability, transparency and complaint handling. This repository guide must not decide those questions itself.

## 4. Department for Education — Generative AI and data protection in schools

Official source:
https://www.gov.uk/guidance/data-protection-in-schools/generative-artificial-intelligence-ai-and-data-protection-in-schools

DfE guidance addresses protecting personal data when generative AI tools are used in schools and highlights transparency, approved-tool governance, age restrictions, data handling, accuracy/bias risks and consultation with responsible school roles.

The current baseline pilot keeps `liveAIEnabled=false`. Any proposal to enable live AI, profiling, automated decision-making, model-training data flows or a new AI provider is a material scope change and must be referred back for external review before use.

## 5. Department for Education — Procuring educational technology (EdTech)

Official source:
https://www.gov.uk/guidance/data-protection-in-schools/procuring-educational-technology-edtech

The EdTech procurement section added in July 2026 covers data protection by design/default, data minimisation, DPIAs for high-risk processing, controller/processor responsibilities, supplier contracts, sub-processors, retention/deletion, international storage considerations, security, incident handling and exit planning.

If a school or organisation adopts KirthiVerse as EdTech, the responsible procurement/data-protection process should evaluate these matters. Repository QA and local-first architecture do not substitute for that organisational assessment.

## 6. ICO Children's Code / Age Appropriate Design Code

Official source:
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/

Relevant standards include best interests of the child, data protection impact assessments, age-appropriate application, transparency, high-privacy defaults, data minimisation, data sharing, parental controls, profiling and online tools.

The current KirthiVerse controlled-pilot design intentionally keeps live AI and cloud child identity disabled and uses a local-first, data-minimised evidence model. That design choice does not itself establish compliance with the Children's Code.

## 7. ICO — Data Protection Impact Assessments for children's services

Official source:
https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/2-data-protection-impact-assessments/

The ICO states that a DPIA should assess and mitigate risks to children's rights and freedoms arising from data processing and should be embedded early in the design of an online service likely to be accessed by children.

The responsible reviewer/process must decide whether the intended pilot requires a DPIA and who is accountable for it. A KirthiVerse repository checklist or P10 structural validator is not a DPIA.

## 8. Review questions to resolve externally

At minimum, ask the responsible reviewer/organisation to decide:

- whether the intended activity is a school/college activity or a separate parent-controlled pilot;
- who is controller/processor for any personal data;
- which Data (Use and Access) Act 2025 changes are relevant to the actual processing model;
- whether the service falls within the Children's Code for the intended use;
- whether a DPIA is required and who owns it;
- what permission/consent/assent process is appropriate;
- what participant-facing transparency is required;
- what safeguarding escalation route applies;
- whether school/organisation approval is mandatory;
- whether research-ethics review is required for the actual evidence design;
- retention, deletion, withdrawal, export and breach handling;
- supplier/sub-processor, international-transfer and exit-plan requirements if external services are introduced;
- whether any future introduction of cloud child identity, live AI, analytics, profiling, automated decision-making or additional providers requires re-review.

## Evidence boundary

This guide is a navigation aid to current official sources. It is not a substitute for competent external review and must never be cited as proof that KirthiVerse is legally compliant, safeguarding-certified, school-approved or production-ready.

#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=[
  'EXTERNAL_PILOT_REVIEW_PACK.md',
  'PILOT_PARTICIPANT_INFORMATION_DRAFT.md',
  'PILOT_DATA_MINIMISATION_RETENTION_DRAFT.md',
  'PILOT_INCIDENT_ESCALATION_DRAFT.md',
  'PILOT_STOPPING_CRITERIA_DRAFT.md',
  'PILOT_METRICS_PROTOCOL_DRAFT.md',
  'PILOT_SPECIALIST_REVIEW_CHECKLIST.md',
  'PILOT_APPROVAL_REGISTER_TEMPLATE.md'
];
const docs=Object.fromEntries(files.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]));
for(const [f,s] of Object.entries(docs)){
  assert.ok(s.length>500,`${f} unexpectedly short`);
  assert.match(s,/DRAFT|TEMPLATE/,`${f} must visibly remain draft/template material`);
  assert.match(s,/not (legal advice|a compliance certification|legal\/safeguarding certification|evidence that consent|legal advice, consent)/i,`${f} needs an explicit non-certification/non-legal boundary`);
}
const index=docs['EXTERNAL_PILOT_REVIEW_PACK.md'];
for(const f of files.slice(1))assert.ok(index.includes(`\`${f}\``)||index.includes(f),`index missing ${f}`);
for(const marker of ['Repository presence is not approval','P4 owner-attested READY','Do not use placeholder references'])assert.ok(index.includes(marker),marker);
const participant=docs['PILOT_PARTICIPANT_INFORMATION_DRAFT.md'];
for(const marker of ['not designed, by itself, to prove learning improvement, retention','does not independently verify','Permission / consent process','Placeholder — must be replaced before use'])assert.ok(participant.includes(marker),marker);
const data=docs['PILOT_DATA_MINIMISATION_RETENTION_DRAFT.md'];
for(const marker of ['Do not collect','[DECIDE]','withdrawal/deletion','not tamper-evident'])assert.ok(data.includes(marker),marker);
const incident=docs['PILOT_INCIDENT_ESCALATION_DRAFT.md'];
for(const marker of ['Immediate operator rule','approved external incident record','Restart authority','REAL REFERENCE REQUIRED'])assert.ok(incident.includes(marker),marker);
const stop=docs['PILOT_STOPPING_CRITERIA_DRAFT.md'];
for(const marker of ['P4 readiness changes from READY to HOLD','Evidence-quality stop','Restart criteria','REAL REFERENCE REQUIRED'])assert.ok(stop.includes(marker),marker);
const metrics=docs['PILOT_METRICS_PROTOCOL_DRAFT.md'];
for(const marker of ['does **not**, by itself, support','seven-day retention','Do not infer learning improvement','Evidence source hierarchy','REAL REFERENCE REQUIRED'])assert.ok(metrics.includes(marker),marker);
const review=docs['PILOT_SPECIALIST_REVIEW_CHECKLIST.md'];
for(const marker of ['CHANGES REQUIRED — DO NOT START PILOT','NOT APPROVED — DO NOT START PILOT','checking boxes in a repository copy is not sufficient'.toUpperCase()]){}
assert.ok(review.includes('CHANGES REQUIRED — DO NOT START PILOT'));
assert.ok(review.includes('NOT APPROVED — DO NOT START PILOT'));
assert.match(review,/Checking boxes in a repository copy is not sufficient evidence of approval/i);
const register=docs['PILOT_APPROVAL_REGISTER_TEMPLATE.md'];
for(const marker of ['BLANK TEMPLATE — NO APPROVALS RECORDED','REAL REFERENCE REQUIRED','P4 transfer checklist','NOT APPROVED — TEMPLATE ONLY'])assert.ok(register.includes(marker),marker);
const unsafePositive=[
  /KirthiVerse is (?:legally )?compliant/i,
  /KirthiVerse is safeguarding certified/i,
  /consent has been obtained/i,
  /guardian identity (?:is|has been) verified/i,
  /production ready/i,
  /proves learning improvement/i,
  /proves retention/i
];
for(const [f,s] of Object.entries(docs))for(const re of unsafePositive){
  const matches=s.match(new RegExp(re.source,'ig'))||[];
  // Positive terms may appear inside explicit negation/list-of-things-not-provided. Reject only common unqualified assertions.
  for(const m of matches){
    const i=s.toLowerCase().indexOf(m.toLowerCase()),context=s.slice(Math.max(0,i-60),i+m.length+60).toLowerCase();
    assert.ok(/not|does not|no |without|never|isn't|is not/.test(context),`${f} contains unsafe unqualified assertion: ${m}`);
  }
}
console.log('EXTERNAL_PILOT_REVIEW_PACK_CONTRACT_PASS');
console.log(JSON.stringify({documents:files.length,status:'DRAFT_REVIEW_MATERIAL_ONLY',approvalCreated:false,legalCertification:false,safeguardingCertification:false,productionReady:false},null,2));

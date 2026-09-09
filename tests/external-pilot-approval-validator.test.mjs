#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const validator=path.join(root,'scripts','validate-external-pilot-approval.mjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kv-p10-'));
let seq=0;
const clone=x=>JSON.parse(JSON.stringify(x));

function approved(reference,scope='KV-PILOT-MATH-v1',extra={}){
  return {required:true,status:'approved_by_responsible_process',reference,authorityRoleOrOrganisation:'Independent review authority',reviewDate:'2026-09-08',scopeVersion:scope,conditions:'None recorded',...extra};
}
function notApplicable(reference,scope='KV-PILOT-MATH-v1'){
  return {required:false,status:'not_applicable_by_responsible_process',decisionReference:reference,decisionAuthorityRoleOrOrganisation:'Responsible pilot governance role',decisionDate:'2026-09-08',decisionRationale:'The responsible process determined this approval category is not required for this specific local controlled-pilot design.',scopeVersion:scope};
}
function validRecord(){
  return {
    schema:'kirthiverse.hitech.external-pilot-approval-record.v1',
    template:false,
    recordedDate:'2026-09-09',
    pilot:{pilotReference:'KV-PILOT-2026-001',ownerRole:'Controlled pilot owner',ageBand:'7–10',subject:'Mathematics',durationWeeks:2,cohortCeiling:8,scopeVersion:'KV-PILOT-MATH-v1',jurisdiction:'England, UK',organisationContext:'Small supervised controlled pilot'},
    approvals:{
      specialistReview:approved('EXT-SAFE-001'),
      participantInformationPermission:approved('EXT-PARTICIPANT-002'),
      dataMinimisationRetention:approved('EXT-DATA-003'),
      incidentEscalation:approved('EXT-INCIDENT-004'),
      stoppingRestart:approved('EXT-STOP-005','KV-PILOT-MATH-v1',{approvedSummary:'Pause or stop on an approved safety, privacy, scope, evidence-integrity or participant-withdrawal trigger; restart only after the responsible process authorises it.'}),
      metricsEvidence:approved('EXT-METRICS-006','KV-PILOT-MATH-v1',{approvedSummary:'Review only post-start descriptive activity, active-learning time, lesson completion and bounded observation-window evidence; do not infer learning improvement or retention.'}),
      organisationApproval:notApplicable('EXT-ORG-DECISION-007'),
      researchEthicsApproval:notApplicable('EXT-ETHICS-DECISION-008')
    },
    ownerAttestation:{referencesCorrespondToRealExternalRecords:true,allConditionsUnderstood:true,p4WillUseSamePilotScope:true,noProductionClaimAcknowledged:true,noLegalCertificationClaimAcknowledged:true}
  };
}
function run(record,flags=[]){
  const file=path.join(tmp,`case-${++seq}.json`);fs.writeFileSync(file,JSON.stringify(record,null,2));
  const p=spawnSync(process.execPath,[validator,file,...flags],{encoding:'utf8'});
  assert.ok(p.stdout,`validator emitted no stdout: ${p.stderr}`);
  let report;try{report=JSON.parse(p.stdout)}catch{throw new Error(`invalid validator JSON output: ${p.stdout}\n${p.stderr}`)}
  return {code:p.status,report,stderr:p.stderr,file};
}
const codes=r=>new Set(r.report.errors.map(x=>x.code));

// 1. Structurally complete record supports manual transfer into P4, but never P5 directly.
let r=run(validRecord());
assert.equal(r.code,0);assert.equal(r.report.status,'STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET');
assert.equal(r.report.claimGates.canProceedToP4OwnerAttestation,true);assert.equal(r.report.claimGates.canStartP5,false);
assert.equal(r.report.claimGates.canClaimExternalApproval,false);assert.equal(r.report.p4Transfer.reviewReference,'EXT-SAFE-001');
assert.equal(r.report.p4Transfer.stoppingCriteria.includes('Pause or stop'),true);
assert.equal(r.report.p4Transfer.metricsProtocol.includes('do not infer learning improvement or retention'),true);

// 2. Repository template itself must fail closed.
const template=JSON.parse(fs.readFileSync(path.join(root,'PILOT_EXTERNAL_APPROVAL_RECORD_TEMPLATE.json'),'utf8'));
r=run(template);assert.equal(r.code,1);assert.ok(codes(r).has('TEMPLATE_NOT_EVIDENCE'));

// 3. Placeholder/missing required reference fails.
let x=validRecord();x.approvals.specialistReview.reference='[REAL REFERENCE REQUIRED]';r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('REFERENCE_INVALID'));

// 4. Same external reference cannot be counted for two distinct approval rows silently.
x=validRecord();x.approvals.participantInformationPermission.reference=x.approvals.specialistReview.reference;r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('DUPLICATE_REFERENCE'));

// 5. Approval from another scope/version cannot be transferred into this P4 record.
x=validRecord();x.approvals.incidentEscalation.scopeVersion='OTHER-PILOT-v9';r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('SCOPE_MISMATCH'));

// 6. Review/decision dates cannot post-date the approval record itself.
x=validRecord();x.approvals.specialistReview.reviewDate='2026-09-10';r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('DATE_AFTER_RECORD'));

// 7. Conditional approval applicability must be explicitly decided.
x=validRecord();x.approvals.organisationApproval.required=null;r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('CONDITIONAL_REQUIRED_UNDECIDED'));

// 8. Operator policy may make organisation approval mandatory for a particular run.
r=run(validRecord(),['--require-organisation-approval']);assert.equal(r.code,1);assert.ok(codes(r).has('CLI_REQUIRED_APPROVAL_MISSING'));

// 9. Personal/sensitive fields are not allowed in this structural reference record.
x=validRecord();x.approvals.specialistReview.reviewerEmail='person@example.test';r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('SENSITIVE_FIELD_PRESENT'));

// 10. Approved summaries cannot smuggle positive outcome/compliance claims into P4.
x=validRecord();x.approvals.metricsEvidence.approvedSummary='This protocol proves retention and therefore establishes successful learning outcomes for the participants.';r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('UNSUPPORTED_POSITIVE_CLAIM'));

// 11. P4-aligned pilot bounds fail closed.
x=validRecord();x.pilot.ageBand='5–8';x.pilot.durationWeeks=13;x.pilot.cohortCeiling=101;r=run(x);assert.equal(r.code,1);assert.ok(codes(r).has('AGE_BAND_INVALID'));assert.ok(codes(r).has('DURATION_INVALID'));assert.ok(codes(r).has('COHORT_INVALID'));

// 12. A conditional organisation approval can satisfy strict policy when supplied for the same scope.
x=validRecord();x.approvals.organisationApproval=approved('EXT-ORG-APPROVAL-009');r=run(x,['--require-organisation-approval']);assert.equal(r.code,0);assert.equal(r.report.observations.organisationApprovalRequired,true);

console.log('EXTERNAL_PILOT_APPROVAL_VALIDATOR_TEST_PASS');
console.log(JSON.stringify({cases:12,status:'STRUCTURAL_GATE_ONLY',validStatus:'STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET',canStartP5Directly:false},null,2));

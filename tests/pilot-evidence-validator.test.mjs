#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const validator=path.join(root,'scripts','validate-pilot-evidence.mjs');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'kirthiverse-p6-'));
const clone=x=>JSON.parse(JSON.stringify(x));

const readinessRecord={
  schema:'kirthiverse.hitech.pilot-readiness.v1',
  ageBand:'7–10',subject:'Mathematics',durationWeeks:'2',cohortCeiling:'12',
  reviewReference:'SAFE-REVIEW-001',reviewDate:'2026-08-30',consentPackReference:'SAFE-PACK-001',
  dataPlanReference:'SAFE-DATA-001',incidentRouteReference:'SAFE-INCIDENT-001',
  stoppingCriteria:'Pause if the owner-attested readiness gate becomes HOLD.',
  metricsProtocol:'Use observed local P3/P5 metrics only; no retention or learning-improvement inference.',
  attestations:{specialistReviewComplete:true,consentMaterialsApproved:true,dataMinimisationReviewed:true,incidentRouteTested:true,stoppingCriteriaApproved:true,metricsProtocolApproved:true,noProductionClaimAcknowledged:true}
};
const readinessEvaluation={ready:true,status:'OWNER_ATTESTED_CONTROLLED_PILOT_READY',missing:[],unchecked:[],metricsAvailable:true,legalCertification:false,productionReady:false,externalReviewSelfVerified:false};

function baseEvidence(){return {
  schema:'kirthiverse.hitech.controlled-pilot-run-evidence.v1',
  exportedAt:'2026-09-08T00:05:00.000Z',
  run:{
    schema:'kirthiverse.hitech.pilot-run.v1',status:'ended',runId:'run-fixture-001',alias:'Pilot-A',targetEndDate:'2026-09-08',
    startedAt:'2026-09-01T00:00:00.000Z',endedAt:'2026-09-08T00:05:00.000Z',assistanceEnabledAtStart:false,
    operatorAcknowledgement:{statement:'fixture self-attestation',acknowledgedAt:'2026-09-01T00:00:00.000Z',mode:'self-attestation',adultIdentityVerified:false,legalConsentVerified:false},
    readinessAtStart:{capturedAt:'2026-09-01T00:00:00.000Z',evaluation:clone(readinessEvaluation),record:clone(readinessRecord)},
    readinessAtEnd:{capturedAt:'2026-09-08T00:05:00.000Z',evaluation:clone(readinessEvaluation),record:clone(readinessRecord)},
    finalSummary:{capturedAt:'2026-09-08T00:05:00.000Z',metrics:{
      schema:'kirthiverse.hitech.weekly-summary.v1',generatedAt:'2026-09-08T00:05:00.000Z',trackingStartedAt:'2026-09-01T00:00:00.000Z',
      observationDays:7,completeSevenDayWindow:true,activeSeconds:5550,activeMinutes:92.5,activeDays:4,
      lessonStarts:7,uniqueLessonsStarted:6,lessonCompletions:6,uniqueLessonsCompleted:5,quickSkillsSessions:4,diagnosticCompletions:1,answerChecks:8,
      evidenceBoundary:{localOnly:true,networkTelemetry:false,tamperEvident:false,backfilledHistory:false,productionResearchEvidence:false}
    },readiness:{capturedAt:'2026-09-08T00:05:00.000Z',evaluation:clone(readinessEvaluation),record:clone(readinessRecord)},evidenceBoundary:{localOnly:true,tamperEvident:false,auditedResearchEvidence:false}}
  },
  evidenceBoundary:{localOnly:true,adultIdentityVerified:false,legalConsentVerified:false,externalReviewIndependentlyVerified:false,tamperEvident:false,auditedResearchEvidence:false,productionReady:false}
}}

function writeJson(name,payload){const file=path.join(tmp,name);fs.writeFileSync(file,JSON.stringify(payload,null,2)+'\n');return file}
function writeRaw(name,text){const file=path.join(tmp,name);fs.writeFileSync(file,text);return file}
function invoke(file,args=[],expected=0){
  const r=spawnSync(process.execPath,[validator,file,...args],{encoding:'utf8'});
  assert.equal(r.status,expected,`validator exit mismatch for ${path.basename(file)}\nSTDOUT:\n${r.stdout}\nSTDERR:\n${r.stderr}`);
  const text=(r.stdout.trim()||r.stderr.trim());
  assert.ok(text,'validator produced no JSON output');
  return JSON.parse(text);
}
function hasCode(result,code){return [...(result.errors||[]),...(result.warnings||[])].some(x=>x.code===code)}

// 1. Complete, internally consistent seven-day local evidence.
const goodFile=writeJson('good-seven-day.json',baseEvidence());
const outputFile=path.join(tmp,'validated-good.json');
const good=invoke(goodFile,['--require-seven-day-window','--output',outputFile],0);
assert.equal(good.status,'STRUCTURALLY_VALID_LOCAL_PILOT_EVIDENCE');
assert.equal(good.claimGates.structurallyValid,true);
assert.equal(good.claimGates.canDescribeAsLocalControlledPilotEvidence,true);
assert.equal(good.claimGates.canDescribeCompletedSevenDayObservation,true);
for(const key of ['canClaimRetention','canClaimLearningImprovement','canClaimCohortOutcome','canClaimLegalCompliance','canClaimSafeguardingCertification','canClaimProductionReadiness','canClaimTamperEvidentAnalytics'])assert.equal(good.claimGates[key],false,key);
assert.match(good.sha256,/^[a-f0-9]{64}$/);
assert.equal(JSON.parse(fs.readFileSync(outputFile,'utf8')).sha256,good.sha256);

// 2. Early observation is structurally usable but must not be described as seven-day evidence.
const early=baseEvidence();
early.run.startedAt='2026-09-07T00:00:00.000Z';early.run.endedAt='2026-09-08T00:05:00.000Z';early.run.operatorAcknowledgement.acknowledgedAt=early.run.startedAt;
early.run.readinessAtStart.capturedAt=early.run.startedAt;early.run.finalSummary.metrics.trackingStartedAt=early.run.startedAt;
early.run.finalSummary.metrics.observationDays=1;early.run.finalSummary.metrics.activeDays=1;early.run.finalSummary.metrics.completeSevenDayWindow=false;
const earlyFile=writeJson('early-window.json',early);
const earlyResult=invoke(earlyFile,[],0);
assert.equal(earlyResult.status,'STRUCTURALLY_VALID_WITH_LIMITATIONS');
assert.equal(earlyResult.claimGates.canDescribeCompletedSevenDayObservation,false);
assert.ok(hasCode(earlyResult,'SEVEN_DAY_WINDOW_INCOMPLETE'));
const strictEarly=invoke(earlyFile,['--require-seven-day-window'],1);
assert.ok(hasCode(strictEarly,'SEVEN_DAY_WINDOW_REQUIRED'));

// 3. Invalid JSON fails closed.
const badJson=invoke(writeRaw('invalid.json','{"schema":'),[],1);
assert.equal(badJson.status,'INVALID_JSON');assert.match(badJson.sha256,/^[a-f0-9]{64}$/);

// 4. P4 HOLD at start is invalid funding evidence.
const notReady=baseEvidence();notReady.run.readinessAtStart.evaluation.ready=false;
const notReadyResult=invoke(writeJson('not-ready.json',notReady),[],1);
assert.ok(hasCode(notReadyResult,'P4_NOT_READY_AT_START'));

// 5. Secret/identity fields must not leak into exported evidence.
const secret=baseEvidence();secret.run.readinessAtStart.record.pinHash='DO_NOT_EXPORT';
const secretResult=invoke(writeJson('secret-leak.json',secret),[],1);
assert.ok(hasCode(secretResult,'SENSITIVE_FIELD_PRESENT'));

// 6. Positive compliance/identity claims fail closed.
const overclaim=baseEvidence();overclaim.evidenceBoundary.productionReady=true;
const overclaimResult=invoke(writeJson('production-overclaim.json',overclaim),[],1);
assert.ok(hasCode(overclaimResult,'BOUNDARY_OVERCLAIM'));assert.ok(hasCode(overclaimResult,'POSITIVE_CLAIM_PRESENT'));

// 7. A manually-added unsupported outcome claim is rejected even outside the known boundary object.
const claim=baseEvidence();claim.claims={retention:true};
const claimResult=invoke(writeJson('retention-overclaim.json',claim),[],1);
assert.ok(hasCode(claimResult,'POSITIVE_CLAIM_PRESENT'));

// 8. A seven-day flag cannot override contradictory run timestamps.
const fakeWindow=baseEvidence();fakeWindow.run.endedAt='2026-09-02T00:00:00.000Z';fakeWindow.run.readinessAtEnd.capturedAt=fakeWindow.run.endedAt;
const fakeWindowResult=invoke(writeJson('fake-seven-day.json',fakeWindow),[],1);
assert.ok(hasCode(fakeWindowResult,'SEVEN_DAY_WINDOW_INCONSISTENT'));
assert.equal(fakeWindowResult.claimGates.canDescribeCompletedSevenDayObservation,false);

// 9. Operator self-attestation cannot be silently upgraded to verified identity/consent.
const operatorOverclaim=baseEvidence();operatorOverclaim.run.operatorAcknowledgement.adultIdentityVerified=true;
const operatorResult=invoke(writeJson('operator-overclaim.json',operatorOverclaim),[],1);
assert.ok(hasCode(operatorResult,'OPERATOR_IDENTITY_OVERCLAIM'));assert.ok(hasCode(operatorResult,'POSITIVE_CLAIM_PRESENT'));

// 10. Invalid metric ranges fail rather than being coerced.
const badMetrics=baseEvidence();badMetrics.run.finalSummary.metrics.activeDays=8;badMetrics.run.finalSummary.metrics.activeMinutes='92.5';
const badMetricsResult=invoke(writeJson('bad-metrics.json',badMetrics),[],1);
assert.ok(hasCode(badMetricsResult,'ACTIVE_DAYS_INVALID'));assert.ok(hasCode(badMetricsResult,'ACTIVE_MINUTES_INVALID'));

console.log('PILOT_EVIDENCE_VALIDATOR_TEST_PASS');
console.log(JSON.stringify({cases:10,goodSha256:good.sha256,goodStatus:good.status,earlyStatus:earlyResult.status,strictEarlyStatus:strictEarly.status},null,2));

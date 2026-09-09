#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const script='scripts/validate-pilot-scope-freeze.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'kv-p11a-'));
const base={schema:'kirthiverse.p11a.pilot-scope-freeze.v1',template:false,pilotReference:'KV-PILOT-001',scopeVersion:'scope-v1',ownerRole:'Pilot owner',jurisdiction:'England, UK',organisationContext:'Small supervised non-school pilot',ageBand:'7–10',subject:'Mathematics',durationWeeks:2,cohortCeiling:5,supervisionModel:'Adult supervised sessions',deviceModel:'Dedicated browser profile on controlled device',dataModel:'Local-first browser storage with deliberate evidence export only',liveAIEnabled:false,cloudChildIdentityEnabled:false,externalServices:[],materialChangeRequiresReReview:true,ownerAcknowledgements:{scopeIsAccurate:true,noParticipantPIIInRecord:true,noUnreviewedFeatureExpansion:true,externalReviewStillRequired:true,notProductionReadiness:true}};
function run(name,mutate,expectOk,code){const obj=structuredClone(base);mutate?.(obj);const f=path.join(dir,`${name}.json`);fs.writeFileSync(f,JSON.stringify(obj,null,2));const r=spawnSync(process.execPath,[script,f],{encoding:'utf8'});const report=JSON.parse(r.stdout);assert.equal(r.status===0,expectOk,name);if(code)assert.ok(report.errors.some(e=>e.code===code),`${name} missing ${code}`);return report}
const good=run('good',null,true);assert.equal(good.status,'STRUCTURALLY_FROZEN_PILOT_SCOPE');assert.equal(good.claimGates.canSendToExternalReview,true);for(const k of ['canClaimExternallyApproved','canClaimLegalCompliance','canClaimSafeguardingCertification','canStartParticipantPilot','canClaimProductionReadiness'])assert.equal(good.claimGates[k],false,k);
run('template',o=>o.template=true,false,'TEMPLATE_NOT_EVIDENCE');
run('missing-ref',o=>o.pilotReference='[REQUIRED]',false,'REQUIRED_FIELD_MISSING');
run('bad-age',o=>o.ageBand='17–18',false,'AGE_BAND_INVALID');
run('bad-duration',o=>o.durationWeeks=13,false,'DURATION_INVALID');
run('bad-cohort',o=>o.cohortCeiling=0,false,'COHORT_INVALID');
run('live-ai',o=>o.liveAIEnabled=true,false,'UNREVIEWED_FEATURE_SCOPE');
run('cloud-id',o=>o.cloudChildIdentityEnabled=true,false,'UNREVIEWED_FEATURE_SCOPE');
run('no-re-review',o=>o.materialChangeRequiresReReview=false,false,'CHANGE_CONTROL_NOT_ACKNOWLEDGED');
run('sensitive-key',o=>o.parentEmail='person@example.com',false,'SENSITIVE_FIELD_PRESENT');
run('missing-ack',o=>o.ownerAcknowledgements.externalReviewStillRequired=false,false,'OWNER_ACKNOWLEDGEMENT_MISSING');
console.log('P11A_SCOPE_FREEZE_VALIDATOR_TEST_PASS');
console.log(JSON.stringify({cases:11,status:'STRUCTURAL_SCOPE_FREEZE_ONLY',canApprovePilot:false},null,2));

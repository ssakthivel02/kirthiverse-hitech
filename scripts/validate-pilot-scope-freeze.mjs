#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const args=process.argv.slice(2);
const input=args[0];
const outIndex=args.indexOf('--output');
const output=outIndex>=0?args[outIndex+1]:null;
if(!input){console.error('Usage: node scripts/validate-pilot-scope-freeze.mjs <scope.json> [--output report.json]');process.exit(2)}

const raw=fs.readFileSync(input,'utf8');
let data;
try{data=JSON.parse(raw)}catch(e){console.error('Invalid JSON');process.exit(2)}
const errors=[];
const add=(code,path,message)=>errors.push({code,path,message});
const text=(v)=>typeof v==='string'?v.trim():'';
const placeholder=/^\[.*\]$/;
const allowedAge=new Set(['3–6','7–10','11–13','14–16']);
const sensitiveKeys=/childname|participantname|parentname|guardianname|email|phone|mobile|dateofbirth|dob|schoolid|parentpin|pin(hash|salt)?/i;

function scanSensitive(value,path='root'){
  if(!value||typeof value!=='object')return;
  for(const [k,v] of Object.entries(value)){
    const p=`${path}.${k}`;
    if(sensitiveKeys.test(k)) add('SENSITIVE_FIELD_PRESENT',p,'Participant/parent identifying fields do not belong in the scope-freeze record.');
    scanSensitive(v,p);
  }
}
scanSensitive(data);

if(data.schema!=='kirthiverse.p11a.pilot-scope-freeze.v1') add('SCHEMA_INVALID','schema','Unexpected schema.');
if(data.template!==false) add('TEMPLATE_NOT_EVIDENCE','template','Working scope must explicitly set template=false only after the real scope is filled.');
for(const k of ['pilotReference','scopeVersion','ownerRole','jurisdiction','organisationContext','subject','supervisionModel','deviceModel','dataModel']){
  const v=text(data[k]);
  if(!v||placeholder.test(v)) add('REQUIRED_FIELD_MISSING',k,`${k} is required and must not be a placeholder.`);
}
if(!allowedAge.has(data.ageBand)) add('AGE_BAND_INVALID','ageBand','Use one P4-supported age band.');
const duration=Number(data.durationWeeks);
if(!Number.isInteger(duration)||duration<1||duration>12) add('DURATION_INVALID','durationWeeks','Duration must be an integer from 1 to 12 weeks.');
const cohort=Number(data.cohortCeiling);
if(!Number.isInteger(cohort)||cohort<1||cohort>100) add('COHORT_INVALID','cohortCeiling','Cohort ceiling must be an integer from 1 to 100.');
if(data.liveAIEnabled!==false) add('UNREVIEWED_FEATURE_SCOPE','liveAIEnabled','P11A pilot scope requires live AI to remain disabled unless a new review cycle explicitly replaces this baseline.');
if(data.cloudChildIdentityEnabled!==false) add('UNREVIEWED_FEATURE_SCOPE','cloudChildIdentityEnabled','P11A pilot scope requires cloud child identity to remain disabled unless a new review cycle explicitly replaces this baseline.');
if(!Array.isArray(data.externalServices)) add('EXTERNAL_SERVICES_INVALID','externalServices','externalServices must be an array, including an empty array when none are used.');
if(data.materialChangeRequiresReReview!==true) add('CHANGE_CONTROL_NOT_ACKNOWLEDGED','materialChangeRequiresReReview','Material scope changes must trigger re-review.');
const a=data.ownerAcknowledgements||{};
for(const k of ['scopeIsAccurate','noParticipantPIIInRecord','noUnreviewedFeatureExpansion','externalReviewStillRequired','notProductionReadiness']){
  if(a[k]!==true) add('OWNER_ACKNOWLEDGEMENT_MISSING',`ownerAcknowledgements.${k}`,`${k} must be explicitly acknowledged.`);
}

const ready=errors.length===0;
const report={
  schema:'kirthiverse.p11a.scope-freeze-validation.v1',
  status:ready?'STRUCTURALLY_FROZEN_PILOT_SCOPE':'HOLD',
  sourceSha256:crypto.createHash('sha256').update(raw).digest('hex'),
  pilotReference:text(data.pilotReference)||null,
  scopeVersion:text(data.scopeVersion)||null,
  errors,
  claimGates:{
    canSendToExternalReview:ready,
    canClaimExternallyApproved:false,
    canClaimLegalCompliance:false,
    canClaimSafeguardingCertification:false,
    canStartParticipantPilot:false,
    canClaimProductionReadiness:false
  },
  limitations:[
    'Structural validation does not verify reviewer competence, legal sufficiency, safeguarding approval, consent validity, school approval or research ethics.',
    'Any material scope change after review begins requires a new/revised externally governed review record.',
    'The SHA-256 digest is a traceability aid, not tamper-evident audit proof.'
  ]
};
const json=JSON.stringify(report,null,2)+'\n';
if(output)fs.writeFileSync(output,json);
process.stdout.write(json);
process.exit(ready?0:1);

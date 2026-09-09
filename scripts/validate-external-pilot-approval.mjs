#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const args=process.argv.slice(2);
const valueAfter=flag=>{const i=args.indexOf(flag);return i>=0?args[i+1]:null};
const input=args.find(x=>!x.startsWith('--'));
const output=valueAfter('--output');
const requireOrganisation=args.includes('--require-organisation-approval');
const requireEthics=args.includes('--require-research-ethics-approval');

if(!input){
  console.error('Usage: node scripts/validate-external-pilot-approval.mjs <record.json> [--require-organisation-approval] [--require-research-ethics-approval] [--output <report.json>]');
  process.exit(2);
}
if(args.includes('--output')&&!output){
  console.error('--output requires a file path');
  process.exit(2);
}

const raw=fs.readFileSync(input);
const sha256=crypto.createHash('sha256').update(raw).digest('hex');
let record;
try{record=JSON.parse(raw.toString('utf8'))}catch(err){
  const result={validator:'kirthiverse.p10.external-pilot-launch-gate.v1',status:'HOLD',recordSha256:sha256,errors:[{code:'INVALID_JSON',detail:String(err.message)}],warnings:[],claimGates:{canProceedToP4OwnerAttestation:false,canStartP5:false,canClaimExternalApproval:false,canClaimLegalCompliance:false,canClaimSafeguardingCertification:false,canClaimProductionReadiness:false}};
  const text=JSON.stringify(result,null,2);if(output)fs.writeFileSync(output,text+'\n');console.log(text);process.exit(1);
}

const errors=[],warnings=[];
const err=(code,detail)=>errors.push({code,detail});
const warn=(code,detail)=>warnings.push({code,detail});
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(`${v}T00:00:00Z`));
const placeholder=/\[(?:REQUIRED|REAL REFERENCE REQUIRED|DECIDE|NAME|ROLE|APPROVED CONTACT|APPROVED REFERENCE|IF APPLICABLE|OPTIONAL)[^\]]*\]|\bplaceholder\b|\bexample(?: only)?\b/i;
const cleanText=(v,min=3,max=240)=>typeof v==='string'&&v.trim().length>=min&&v.trim().length<=max&&!placeholder.test(v);
const day=v=>Date.parse(`${v}T00:00:00Z`);

if(record?.schema!=='kirthiverse.hitech.external-pilot-approval-record.v1')err('SCHEMA_MISMATCH','Expected kirthiverse.hitech.external-pilot-approval-record.v1');
if(!validDate(record?.recordedDate))err('RECORDED_DATE_INVALID','recordedDate must be YYYY-MM-DD');

const pilot=record?.pilot;
if(!isObj(pilot))err('PILOT_MISSING','pilot object is required');
const ageBands=new Set(['3–6','7–10','11–13','14–16']);
for(const [key,label,max] of [['pilotReference','pilot reference',120],['ownerRole','pilot owner role',120],['subject','subject',40],['scopeVersion','scope version',120],['jurisdiction','jurisdiction',120],['organisationContext','organisation context',160]]){
  if(!cleanText(pilot?.[key],3,max))err('PILOT_FIELD_INVALID',`${label} is missing, placeholder-like or out of bounds`);
}
if(pilot?.ageBand&&!ageBands.has(pilot.ageBand))err('AGE_BAND_INVALID','ageBand must match the P4 supported bands');
else if(!pilot?.ageBand)err('AGE_BAND_INVALID','ageBand is required');
const duration=Number(pilot?.durationWeeks),cohort=Number(pilot?.cohortCeiling);
if(!Number.isInteger(duration)||duration<1||duration>12)err('DURATION_INVALID','durationWeeks must be an integer from 1 to 12');
if(!Number.isInteger(cohort)||cohort<1||cohort>100)err('COHORT_INVALID','cohortCeiling must be an integer from 1 to 100');

const approvals=record?.approvals;
if(!isObj(approvals))err('APPROVALS_MISSING','approvals object is required');
const requiredKeys=[
  ['specialistReview','specialist safeguarding/privacy review'],
  ['participantInformationPermission','participant/parent information and permission process'],
  ['dataMinimisationRetention','data minimisation/retention/deletion plan'],
  ['incidentEscalation','incident/escalation route'],
  ['stoppingRestart','stopping/restart criteria'],
  ['metricsEvidence','metrics/evidence protocol']
];
const seenRefs=new Map();
const useRef=(ref,key)=>{const n=String(ref||'').trim().toLowerCase();if(!n)return;if(seenRefs.has(n))err('DUPLICATE_REFERENCE',`${key} reuses the same reference as ${seenRefs.get(n)}`);else seenRefs.set(n,key)};
const dateNotAfterRecord=(v,key)=>{if(validDate(v)&&validDate(record?.recordedDate)&&day(v)>day(record.recordedDate))err('DATE_AFTER_RECORD',`${key} date is after recordedDate`)};

function validateApprovedItem(key,label,item,requiredExpected=true){
  if(!isObj(item)){err('APPROVAL_ITEM_MISSING',`${label} is missing`);return}
  if(item.required!==requiredExpected)err('REQUIRED_FLAG_INVALID',`${label}.required must be ${requiredExpected}`);
  if(item.status!=='approved_by_responsible_process')err('APPROVAL_STATUS_INVALID',`${label} must have status approved_by_responsible_process`);
  if(!cleanText(item.reference,4,180))err('REFERENCE_INVALID',`${label} reference is missing or placeholder-like`);else useRef(item.reference,key);
  if(!cleanText(item.authorityRoleOrOrganisation,3,180))err('AUTHORITY_INVALID',`${label} authority role/organisation is required`);
  if(!validDate(item.reviewDate))err('REVIEW_DATE_INVALID',`${label} reviewDate must be YYYY-MM-DD`);else dateNotAfterRecord(item.reviewDate,`${label} review`);
  if(!cleanText(item.scopeVersion,3,120)||item.scopeVersion!==pilot?.scopeVersion)err('SCOPE_MISMATCH',`${label} scopeVersion must exactly match pilot.scopeVersion`);
  if(item.validUntil!==undefined&&item.validUntil!==null&&item.validUntil!==''){
    if(!validDate(item.validUntil))err('VALID_UNTIL_INVALID',`${label} validUntil must be YYYY-MM-DD when present`);
    else if(validDate(item.reviewDate)&&day(item.validUntil)<day(item.reviewDate))err('VALIDITY_ORDER_INVALID',`${label} validUntil precedes reviewDate`);
  }
}

for(const [key,label] of requiredKeys)validateApprovedItem(key,label,approvals?.[key],true);

function validateConditional(key,label,forceRequired){
  const item=approvals?.[key];
  if(!isObj(item)){err('CONDITIONAL_ITEM_MISSING',`${label} applicability decision is required`);return}
  if(typeof item.required!=='boolean'){err('CONDITIONAL_REQUIRED_UNDECIDED',`${label}.required must be explicitly true or false`);return}
  if(forceRequired&&item.required!==true)err('CLI_REQUIRED_APPROVAL_MISSING',`${label} is required by CLI policy for this validation run`);
  if(item.required){validateApprovedItem(key,label,item,true);return}
  if(item.status!=='not_applicable_by_responsible_process')err('NOT_APPLICABLE_STATUS_INVALID',`${label} must use not_applicable_by_responsible_process when required=false`);
  if(!cleanText(item.decisionReference,4,180))err('DECISION_REFERENCE_INVALID',`${label} needs a real decision reference when marked not applicable`);else useRef(item.decisionReference,key);
  if(!cleanText(item.decisionAuthorityRoleOrOrganisation,3,180))err('DECISION_AUTHORITY_INVALID',`${label} needs the responsible decision authority role/organisation`);
  if(!cleanText(item.decisionRationale,8,500))err('DECISION_RATIONALE_INVALID',`${label} needs a bounded non-placeholder rationale`);
  if(!validDate(item.decisionDate))err('DECISION_DATE_INVALID',`${label} decisionDate must be YYYY-MM-DD`);else dateNotAfterRecord(item.decisionDate,`${label} applicability decision`);
  if(!cleanText(item.scopeVersion,3,120)||item.scopeVersion!==pilot?.scopeVersion)err('SCOPE_MISMATCH',`${label} scopeVersion must exactly match pilot.scopeVersion`);
}
validateConditional('organisationApproval','organisation/school approval',requireOrganisation);
validateConditional('researchEthicsApproval','research ethics approval',requireEthics);

for(const [key,label] of [['stoppingRestart','stopping/restart criteria'],['metricsEvidence','metrics/evidence protocol']]){
  const summary=approvals?.[key]?.approvedSummary;
  if(!cleanText(summary,20,1000))err('APPROVED_SUMMARY_INVALID',`${label} approvedSummary must be 20–1000 characters and non-placeholder`);
  if(typeof summary==='string'){
    const unsafe=[/\bproves?\s+(?:retention|learning improvement|effectiveness)\b/i,/\bguarantees?\s+(?:learning|outcomes?|retention)\b/i,/\bproduction[- ]ready\b/i,/\blegally compliant\b/i,/\bsafeguarding certified\b/i];
    for(const re of unsafe){const m=summary.match(re);if(m){const i=summary.toLowerCase().indexOf(m[0].toLowerCase()),ctx=summary.slice(Math.max(0,i-50),i).toLowerCase();if(!/\b(?:not|no|does not|cannot|never|without)\b/.test(ctx))err('UNSUPPORTED_POSITIVE_CLAIM',`${label} summary contains unsupported positive claim: ${m[0]}`)}}
  }
}

const owner=record?.ownerAttestation;
if(!isObj(owner))err('OWNER_ATTESTATION_MISSING','ownerAttestation object is required');
for(const key of ['referencesCorrespondToRealExternalRecords','allConditionsUnderstood','p4WillUseSamePilotScope','noProductionClaimAcknowledged','noLegalCertificationClaimAcknowledged']){
  if(owner?.[key]!==true)err('OWNER_ATTESTATION_INCOMPLETE',`${key} must be explicitly true`);
}

const forbiddenKeys=new Set(['childName','participantName','parentName','guardianName','studentEmail','teacherEmail','email','phone','dateOfBirth','schoolId','pin','pinHash','pinSalt','reviewerEmail','reviewerPhone']);
function scan(v,path='$'){
  if(!v||typeof v!=='object')return;
  if(Array.isArray(v)){v.forEach((x,i)=>scan(x,`${path}[${i}]`));return}
  for(const [k,x] of Object.entries(v)){if(forbiddenKeys.has(k))err('SENSITIVE_FIELD_PRESENT',`Forbidden field ${path}.${k} is present`);scan(x,`${path}.${k}`)}
}
scan(record);

if(record?.template===true)err('TEMPLATE_NOT_EVIDENCE','Template records cannot pass P10');
const ready=errors.length===0;
const p4Transfer=ready?{
  ageBand:pilot.ageBand,
  subject:pilot.subject,
  durationWeeks:String(duration),
  cohortCeiling:String(cohort),
  reviewReference:approvals.specialistReview.reference.trim(),
  reviewDate:approvals.specialistReview.reviewDate,
  consentPackReference:approvals.participantInformationPermission.reference.trim(),
  dataPlanReference:approvals.dataMinimisationRetention.reference.trim(),
  incidentRouteReference:approvals.incidentEscalation.reference.trim(),
  stoppingCriteria:approvals.stoppingRestart.approvedSummary.trim(),
  metricsProtocol:approvals.metricsEvidence.approvedSummary.trim()
}:null;

const result={
  validator:'kirthiverse.p10.external-pilot-launch-gate.v1',
  validatedAt:new Date().toISOString(),
  sourceFile:input,
  recordSha256:sha256,
  digestMeaning:'SHA-256 identifies the exact record bytes only. It does not verify signatures, authenticity, approval authority or legal sufficiency.',
  status:ready?'STRUCTURALLY_COMPLETE_EXTERNAL_REFERENCE_SET':'HOLD',
  errors,warnings,
  observations:{pilotReference:cleanText(pilot?.pilotReference,4,120)?pilot.pilotReference:null,scopeVersion:cleanText(pilot?.scopeVersion,3,120)?pilot.scopeVersion:null,durationWeeks:Number.isInteger(duration)?duration:null,cohortCeiling:Number.isInteger(cohort)?cohort:null,organisationApprovalRequired:approvals?.organisationApproval?.required===true,researchEthicsApprovalRequired:approvals?.researchEthicsApproval?.required===true},
  claimGates:{
    canProceedToP4OwnerAttestation:ready,
    canStartP5:false,
    canClaimExternalApproval:false,
    canClaimLegalCompliance:false,
    canClaimSafeguardingCertification:false,
    canClaimProductionReadiness:false,
    canClaimVerifiedResearchEthicsApproval:false
  },
  p4Transfer,
  ownerAction:ready?'P10 found a structurally complete owner-supplied external reference set. The owner must still review the real records, enter/copy the same scope into P4 and personally complete P4 attestations. P5 may start only if P4 independently evaluates OWNER_ATTESTED_CONTROLLED_PILOT_READY and all real-world conditions remain satisfied.':'Resolve every P10 error before using this record to support P4 owner attestation.',
  interpretation:[
    'P10 validates structure, scope consistency, dates, placeholders and obvious claim/data-boundary defects only.',
    'P10 does not contact reviewers, validate signatures, establish legal consent, certify safeguarding, determine whether school/ethics approval is legally required, or make a production-readiness determination.',
    'Organisation/school and research-ethics applicability must be decided by the responsible external process; CLI flags can make either mandatory for a specific validation run.',
    'P4 remains the owner-attestation gate and P5 remains separately readiness-gated.'
  ]
};
const text=JSON.stringify(result,null,2);if(output)fs.writeFileSync(output,text+'\n');console.log(text);process.exit(ready?0:1);

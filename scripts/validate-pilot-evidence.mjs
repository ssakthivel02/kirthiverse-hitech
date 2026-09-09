#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';

const args=process.argv.slice(2);
const input=args.find(x=>!x.startsWith('--'));
const outputIndex=args.indexOf('--output');
const output=outputIndex>=0?args[outputIndex+1]:null;
const requireSeven=args.includes('--require-seven-day-window');

if(!input){
  console.error('Usage: node scripts/validate-pilot-evidence.mjs <evidence.json> [--require-seven-day-window] [--output <validated.json>]');
  process.exit(2);
}

const raw=fs.readFileSync(input);
const digest=crypto.createHash('sha256').update(raw).digest('hex');
let payload;
try{payload=JSON.parse(raw.toString('utf8'))}catch(err){console.error(JSON.stringify({status:'INVALID_JSON',error:String(err.message),sha256:digest},null,2));process.exit(1)}

const errors=[],warnings=[];
const addError=(code,detail)=>errors.push({code,detail});
const addWarning=(code,detail)=>warnings.push({code,detail});
const validDate=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));

if(payload?.schema!=='kirthiverse.hitech.controlled-pilot-run-evidence.v1')addError('SCHEMA_MISMATCH','Expected kirthiverse.hitech.controlled-pilot-run-evidence.v1');
const run=payload?.run;
if(!run||typeof run!=='object')addError('RUN_MISSING','Evidence bundle has no run object');
if(run?.status!=='ended')addError('RUN_NOT_ENDED','Funding evidence should be exported after the controlled run is ended/frozen');
if(!validDate(run?.startedAt))addError('START_TIME_INVALID','run.startedAt is missing or invalid');
if(!validDate(run?.endedAt))addError('END_TIME_INVALID','run.endedAt is missing or invalid');
if(validDate(run?.startedAt)&&validDate(run?.endedAt)&&Date.parse(run.endedAt)<Date.parse(run.startedAt))addError('TIME_ORDER_INVALID','run.endedAt precedes run.startedAt');

const startReady=run?.readinessAtStart?.evaluation?.ready===true;
const endReady=run?.readinessAtEnd?.evaluation?.ready===true;
if(!startReady)addError('P4_NOT_READY_AT_START','P5 must have started from a P4 READY snapshot');
if(!run?.readinessAtEnd?.evaluation)addError('P4_END_SNAPSHOT_MISSING','P4 readiness snapshot at run end is missing');
else if(!endReady)addWarning('P4_HOLD_AT_END','Run ended while current P4 readiness was not READY; explain the interruption/pause before external use');

const metrics=run?.finalSummary?.metrics;
if(!metrics||typeof metrics!=='object')addError('FINAL_METRICS_MISSING','Frozen final metrics summary is missing');
const observationDays=Number(metrics?.observationDays||0);
const activeDays=Number(metrics?.activeDays||0);
const activeMinutes=Number(metrics?.activeMinutes||0);
const lessonsCompleted=Number(metrics?.uniqueLessonsCompleted||0);
const fullWindow=metrics?.completeSevenDayWindow===true&&observationDays>=7;
if(!fullWindow)addWarning('SEVEN_DAY_WINDOW_INCOMPLETE',`Only ${observationDays||0} observation day(s) are represented; do not describe this as a completed seven-day observation window`);
if(requireSeven&&!fullWindow)addError('SEVEN_DAY_WINDOW_REQUIRED','--require-seven-day-window was supplied but a complete seven-day observation window is not present');
if(activeDays<=0)addWarning('NO_ACTIVE_DAYS','No measured active-learning day is present');
if(activeMinutes<=0)addWarning('NO_ACTIVE_MINUTES','No measured active-learning minutes are present');
if(lessonsCompleted<=0)addWarning('NO_COMPLETED_LESSONS','No post-start unique lesson completion is present');

const boundary=payload?.evidenceBoundary||{};
if(boundary.localOnly!==true)addError('LOCAL_ONLY_BOUNDARY_MISSING','evidenceBoundary.localOnly must be true');
for(const [key,label] of [['adultIdentityVerified','adult identity'],['legalConsentVerified','legal consent'],['externalReviewIndependentlyVerified','external review'],['tamperEvident','tamper evidence'],['auditedResearchEvidence','audited research evidence'],['productionReady','production readiness']]){
  if(boundary[key]!==false)addError('BOUNDARY_OVERCLAIM',`${label} must remain explicitly false in this local evidence format`);
}

const forbiddenKeys=new Set(['pin','pinHash','pinSalt','pinIterations','teacherEmail','studentEmail','schoolId']);
function scan(value,path='$'){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){value.forEach((v,i)=>scan(v,`${path}[${i}]`));return}
  for(const [k,v] of Object.entries(value)){
    if(forbiddenKeys.has(k))addError('SENSITIVE_FIELD_PRESENT',`Forbidden field ${path}.${k} is present`);
    scan(v,`${path}.${k}`);
  }
}
scan(payload);

const claimGates={
  structurallyValid:errors.length===0,
  canDescribeAsLocalControlledPilotEvidence:errors.length===0,
  canDescribeCompletedSevenDayObservation:errors.length===0&&fullWindow,
  canClaimRetention:false,
  canClaimLearningImprovement:false,
  canClaimCohortOutcome:false,
  canClaimLegalCompliance:false,
  canClaimSafeguardingCertification:false,
  canClaimProductionReadiness:false,
  canClaimTamperEvidentAnalytics:false
};

const result={
  validator:'kirthiverse.p6.pilot-evidence-validator.v1',
  validatedAt:new Date().toISOString(),
  sourceFile:input,
  sha256:digest,
  digestMeaning:'Content digest for file traceability only. A SHA-256 digest by itself does not make local evidence tamper-evident.',
  status:errors.length?'INVALID':warnings.length?'STRUCTURALLY_VALID_WITH_LIMITATIONS':'STRUCTURALLY_VALID_LOCAL_PILOT_EVIDENCE',
  errors,warnings,
  observations:{observationDays,activeDays,activeMinutes,uniqueLessonsCompleted:lessonsCompleted,completeSevenDayWindow:fullWindow,readyAtStart:startReady,readyAtEnd:endReady},
  claimGates,
  interpretation:[
    'This validator checks structure, evidence boundaries and obvious overclaims; it does not validate the truth of owner-supplied P4 references.',
    'A complete seven-day observation window does not by itself prove retention.',
    'Learning improvement requires an appropriate pre/post measurement design and cannot be inferred from activity counts alone.',
    'Local browser evidence is not audited research evidence, legal certification, or production-readiness evidence.'
  ]
};
const text=JSON.stringify(result,null,2);
if(output)fs.writeFileSync(output,text+'\n');
console.log(text);
process.exit(errors.length?1:0);

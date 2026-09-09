#!/usr/bin/env node
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

function usage(message){
  if(message)console.error(message);
  console.error('Usage: node scripts/validate-pilot-evidence.mjs <evidence.json> [--require-seven-day-window] [--output <validated.json>]');
  process.exit(2);
}

function parseArgs(argv){
  let input=null,output=null,requireSeven=false;
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(arg==='--require-seven-day-window'){requireSeven=true;continue}
    if(arg==='--output'){
      if(output)usage('Duplicate --output option.');
      const value=argv[++i];
      if(!value||value.startsWith('--'))usage('--output requires a file path.');
      output=value;continue;
    }
    if(arg.startsWith('--'))usage(`Unknown option: ${arg}`);
    if(input)usage('Exactly one evidence JSON input file is required.');
    input=arg;
  }
  if(!input)usage();
  return {input,output,requireSeven};
}

const {input,output,requireSeven}=parseArgs(process.argv.slice(2));
let raw;
try{raw=fs.readFileSync(input)}catch(err){
  console.error(JSON.stringify({status:'INPUT_READ_ERROR',error:String(err.message),sourceFile:input},null,2));
  process.exit(1);
}
const digest=crypto.createHash('sha256').update(raw).digest('hex');
let payload;
try{payload=JSON.parse(raw.toString('utf8'))}catch(err){
  console.error(JSON.stringify({status:'INVALID_JSON',error:String(err.message),sha256:digest,sourceFile:input},null,2));
  process.exit(1);
}

const errors=[],warnings=[];
const addError=(code,detail,path_=null)=>errors.push({code,detail,...(path_?{path:path_}:{})});
const addWarning=(code,detail,path_=null)=>warnings.push({code,detail,...(path_?{path:path_}:{})});
const validDate=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const finiteNumber=v=>typeof v==='number'&&Number.isFinite(v);
const nonNegativeNumber=v=>finiteNumber(v)&&v>=0;
const nonNegativeInteger=v=>Number.isInteger(v)&&v>=0;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const DAY_MS=86400000;
const WINDOW_TOLERANCE_MS=5*60*1000;

if(!object(payload))addError('ROOT_NOT_OBJECT','Evidence JSON root must be an object','$');
if(payload?.schema!=='kirthiverse.hitech.controlled-pilot-run-evidence.v1')addError('SCHEMA_MISMATCH','Expected kirthiverse.hitech.controlled-pilot-run-evidence.v1','$.schema');

const run=payload?.run;
if(!object(run))addError('RUN_MISSING','Evidence bundle has no run object','$.run');
if(run?.status!=='ended')addError('RUN_NOT_ENDED','Funding evidence should be exported only after the controlled run is ended/frozen','$.run.status');
if(typeof run?.runId!=='string'||!run.runId.trim())addError('RUN_ID_MISSING','run.runId is missing','$.run.runId');
if(typeof run?.alias!=='string'||!run.alias.trim())addError('ALIAS_MISSING','run.alias is missing; use a non-identifying pilot alias','$.run.alias');
else if(/[\s\S]*@[\s\S]*\.[\s\S]*/.test(run.alias))addWarning('ALIAS_LOOKS_LIKE_EMAIL','Pilot alias resembles an email address; use a non-identifying alias','$.run.alias');
if(!validDate(run?.startedAt))addError('START_TIME_INVALID','run.startedAt is missing or invalid','$.run.startedAt');
if(!validDate(run?.endedAt))addError('END_TIME_INVALID','run.endedAt is missing or invalid','$.run.endedAt');
let runDurationMs=null;
if(validDate(run?.startedAt)&&validDate(run?.endedAt)){
  runDurationMs=Date.parse(run.endedAt)-Date.parse(run.startedAt);
  if(runDurationMs<0)addError('TIME_ORDER_INVALID','run.endedAt precedes run.startedAt','$.run.endedAt');
}

const operator=run?.operatorAcknowledgement;
if(!object(operator))addError('OPERATOR_ACK_MISSING','Controlled-run operator acknowledgement is missing','$.run.operatorAcknowledgement');
else{
  if(operator.mode!=='self-attestation')addError('OPERATOR_ACK_MODE_INVALID','operator acknowledgement must remain self-attestation only','$.run.operatorAcknowledgement.mode');
  if(operator.adultIdentityVerified!==false)addError('OPERATOR_IDENTITY_OVERCLAIM','adultIdentityVerified must remain explicitly false','$.run.operatorAcknowledgement.adultIdentityVerified');
  if(operator.legalConsentVerified!==false)addError('OPERATOR_CONSENT_OVERCLAIM','legalConsentVerified must remain explicitly false','$.run.operatorAcknowledgement.legalConsentVerified');
  if(!validDate(operator.acknowledgedAt))addError('OPERATOR_ACK_TIME_INVALID','operator acknowledgement timestamp is missing or invalid','$.run.operatorAcknowledgement.acknowledgedAt');
}

const startSnapshot=run?.readinessAtStart,endSnapshot=run?.readinessAtEnd;
const startReady=startSnapshot?.evaluation?.ready===true;
const endReady=endSnapshot?.evaluation?.ready===true;
if(!object(startSnapshot))addError('P4_START_SNAPSHOT_MISSING','P4 readiness snapshot at run start is missing','$.run.readinessAtStart');
else{
  if(!object(startSnapshot.evaluation))addError('P4_START_EVALUATION_MISSING','P4 readiness evaluation at run start is missing','$.run.readinessAtStart.evaluation');
  if(!object(startSnapshot.record))addError('P4_START_RECORD_MISSING','Frozen P4 readiness record at run start is missing','$.run.readinessAtStart.record');
  if(!startReady)addError('P4_NOT_READY_AT_START','P5 must have started from a P4 READY snapshot','$.run.readinessAtStart.evaluation.ready');
}
if(!object(endSnapshot))addError('P4_END_SNAPSHOT_MISSING','P4 readiness snapshot at run end is missing','$.run.readinessAtEnd');
else{
  if(!object(endSnapshot.evaluation))addError('P4_END_EVALUATION_MISSING','P4 readiness evaluation at run end is missing','$.run.readinessAtEnd.evaluation');
  if(!object(endSnapshot.record))addError('P4_END_RECORD_MISSING','Frozen P4 readiness record at run end is missing','$.run.readinessAtEnd.record');
  if(object(endSnapshot.evaluation)&&!endReady)addWarning('P4_HOLD_AT_END','Run ended while P4 readiness was not READY; explain the pause/interruption before external use','$.run.readinessAtEnd.evaluation.ready');
}

const metrics=run?.finalSummary?.metrics;
if(!object(run?.finalSummary))addError('FINAL_SUMMARY_MISSING','Frozen final summary is missing','$.run.finalSummary');
if(!object(metrics))addError('FINAL_METRICS_MISSING','Frozen final metrics summary is missing','$.run.finalSummary.metrics');

const observationDays=metrics?.observationDays;
const activeDays=metrics?.activeDays;
const activeMinutes=metrics?.activeMinutes;
const lessonsCompleted=metrics?.uniqueLessonsCompleted;
if(!nonNegativeInteger(observationDays)||observationDays>7)addError('OBSERVATION_DAYS_INVALID','observationDays must be an integer from 0 to 7','$.run.finalSummary.metrics.observationDays');
if(!nonNegativeInteger(activeDays)||activeDays>7)addError('ACTIVE_DAYS_INVALID','activeDays must be an integer from 0 to 7','$.run.finalSummary.metrics.activeDays');
if(nonNegativeInteger(observationDays)&&nonNegativeInteger(activeDays)&&activeDays>observationDays)addError('ACTIVE_DAYS_EXCEED_OBSERVATION','activeDays cannot exceed observationDays','$.run.finalSummary.metrics.activeDays');
if(!nonNegativeNumber(activeMinutes))addError('ACTIVE_MINUTES_INVALID','activeMinutes must be a finite non-negative number','$.run.finalSummary.metrics.activeMinutes');
if(!nonNegativeInteger(lessonsCompleted))addError('LESSONS_COMPLETED_INVALID','uniqueLessonsCompleted must be a non-negative integer','$.run.finalSummary.metrics.uniqueLessonsCompleted');
if(typeof metrics?.completeSevenDayWindow!=='boolean')addError('SEVEN_DAY_FLAG_INVALID','completeSevenDayWindow must be boolean','$.run.finalSummary.metrics.completeSevenDayWindow');
if(!validDate(metrics?.trackingStartedAt))addError('METRICS_START_INVALID','trackingStartedAt is missing or invalid','$.run.finalSummary.metrics.trackingStartedAt');

const metricsBoundary=metrics?.evidenceBoundary;
if(!object(metricsBoundary))addError('METRICS_BOUNDARY_MISSING','Frozen metrics evidence boundary is missing','$.run.finalSummary.metrics.evidenceBoundary');
else{
  if(metricsBoundary.localOnly!==true)addError('METRICS_LOCAL_ONLY_MISSING','metrics evidenceBoundary.localOnly must be true','$.run.finalSummary.metrics.evidenceBoundary.localOnly');
  for(const key of ['networkTelemetry','tamperEvident','backfilledHistory','productionResearchEvidence']){
    if(metricsBoundary[key]!==false)addError('METRICS_BOUNDARY_OVERCLAIM',`${key} must remain explicitly false`,'$.run.finalSummary.metrics.evidenceBoundary.'+key);
  }
}

let durationSupportsSeven=false;
if(runDurationMs!==null&&runDurationMs>=0)durationSupportsSeven=runDurationMs+WINDOW_TOLERANCE_MS>=7*DAY_MS;
const metricsClaimsSeven=metrics?.completeSevenDayWindow===true&&observationDays===7;
if(metricsClaimsSeven&&!durationSupportsSeven)addError('SEVEN_DAY_WINDOW_INCONSISTENT','Metrics claim a complete seven-day window but run timestamps do not span approximately seven days','$.run.finalSummary.metrics.completeSevenDayWindow');
const fullWindow=metricsClaimsSeven&&durationSupportsSeven;
if(!fullWindow)addWarning('SEVEN_DAY_WINDOW_INCOMPLETE',`Validated evidence does not establish a complete seven-day observation window (${nonNegativeInteger(observationDays)?observationDays:0} observation day(s))`,'$.run.finalSummary.metrics.completeSevenDayWindow');
if(requireSeven&&!fullWindow)addError('SEVEN_DAY_WINDOW_REQUIRED','--require-seven-day-window was supplied but a validated complete seven-day observation window is not present');
if(nonNegativeInteger(activeDays)&&activeDays===0)addWarning('NO_ACTIVE_DAYS','No measured active-learning day is present','$.run.finalSummary.metrics.activeDays');
if(nonNegativeNumber(activeMinutes)&&activeMinutes===0)addWarning('NO_ACTIVE_MINUTES','No measured active-learning minutes are present','$.run.finalSummary.metrics.activeMinutes');
if(nonNegativeInteger(lessonsCompleted)&&lessonsCompleted===0)addWarning('NO_COMPLETED_LESSONS','No post-start unique lesson completion is present','$.run.finalSummary.metrics.uniqueLessonsCompleted');

const boundary=payload?.evidenceBoundary;
if(!object(boundary))addError('EVIDENCE_BOUNDARY_MISSING','Top-level evidenceBoundary object is missing','$.evidenceBoundary');
else{
  if(boundary.localOnly!==true)addError('LOCAL_ONLY_BOUNDARY_MISSING','evidenceBoundary.localOnly must be true','$.evidenceBoundary.localOnly');
  for(const [key,label] of [['adultIdentityVerified','adult identity'],['legalConsentVerified','legal consent'],['externalReviewIndependentlyVerified','external review'],['tamperEvident','tamper evidence'],['auditedResearchEvidence','audited research evidence'],['productionReady','production readiness']]){
    if(boundary[key]!==false)addError('BOUNDARY_OVERCLAIM',`${label} must remain explicitly false in this local evidence format`,'$.evidenceBoundary.'+key);
  }
}

const forbiddenKeys=new Set(['pin','pinHash','pinSalt','pinIterations','childName','displayName','teacherEmail','studentEmail','schoolId','schoolName','phone','phoneNumber','address','dateOfBirth','dob']);
const positiveClaimKeys=new Set(['retention','learningImprovement','cohortOutcome','legalCompliance','safeguardingCertification','productionReady','tamperEvident','auditedResearchEvidence','adultIdentityVerified','legalConsentVerified','externalReviewIndependentlyVerified']);
function scan(value,path_='$'){
  if(!value||typeof value!=='object')return;
  if(Array.isArray(value)){value.forEach((v,i)=>scan(v,`${path_}[${i}]`));return}
  for(const [k,v] of Object.entries(value)){
    const next=`${path_}.${k}`;
    if(forbiddenKeys.has(k))addError('SENSITIVE_FIELD_PRESENT',`Forbidden field ${next} is present`,next);
    if(positiveClaimKeys.has(k)&&v===true)addError('POSITIVE_CLAIM_PRESENT',`Unsupported positive claim ${next}=true is not allowed in P6 local pilot evidence`,next);
    scan(v,next);
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
  sourceFile:path.basename(input),
  sha256:digest,
  digestMeaning:'Content digest for file traceability only. A SHA-256 digest by itself does not make local evidence tamper-evident.',
  status:errors.length?'INVALID':warnings.length?'STRUCTURALLY_VALID_WITH_LIMITATIONS':'STRUCTURALLY_VALID_LOCAL_PILOT_EVIDENCE',
  errors,warnings,
  observations:{
    observationDays:nonNegativeInteger(observationDays)?observationDays:null,
    activeDays:nonNegativeInteger(activeDays)?activeDays:null,
    activeMinutes:nonNegativeNumber(activeMinutes)?activeMinutes:null,
    uniqueLessonsCompleted:nonNegativeInteger(lessonsCompleted)?lessonsCompleted:null,
    completeSevenDayWindow:fullWindow,
    readyAtStart:startReady,
    readyAtEnd:endReady,
    runDurationHours:runDurationMs!==null&&runDurationMs>=0?Number((runDurationMs/3600000).toFixed(2)):null
  },
  claimGates,
  interpretation:[
    'This validator checks structure, internal consistency, evidence boundaries and obvious overclaims; it does not validate the truth or legal sufficiency of owner-supplied P4 references.',
    'A complete seven-day observation window does not by itself prove retention.',
    'Learning improvement requires an appropriate pre/post measurement design and cannot be inferred from activity counts alone.',
    'Local browser evidence is not audited research evidence, legal certification, safeguarding certification, or production-readiness evidence.',
    'Preserve the original exported JSON unchanged after recording its digest; any edit will produce a different SHA-256 digest.'
  ]
};

const text=JSON.stringify(result,null,2);
if(output){
  try{fs.writeFileSync(output,text+'\n')}catch(err){
    console.error(JSON.stringify({status:'OUTPUT_WRITE_ERROR',error:String(err.message),outputFile:output,sha256:digest},null,2));
    process.exit(1);
  }
}
console.log(text);
process.exit(errors.length?1:0);

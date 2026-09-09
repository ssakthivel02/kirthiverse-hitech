#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

function usage(message){
  if(message)console.error(message);
  console.error('Usage: node scripts/build-pilot-evidence-pack.mjs <p5-evidence.json> [more.json ...] [--require-seven-day-window-all] [--output <pack.json>]');
  process.exit(2);
}

function parseArgs(argv){
  const inputs=[];let output=null,requireAllSeven=false;
  for(let i=0;i<argv.length;i++){
    const arg=argv[i];
    if(arg==='--require-seven-day-window-all'){requireAllSeven=true;continue}
    if(arg==='--output'){
      if(output)usage('Duplicate --output option.');
      const value=argv[++i];if(!value||value.startsWith('--'))usage('--output requires a file path.');
      output=value;continue;
    }
    if(arg.startsWith('--'))usage(`Unknown option: ${arg}`);
    inputs.push(arg);
  }
  if(!inputs.length)usage('At least one original P5 evidence JSON file is required.');
  return {inputs,output,requireAllSeven};
}

const {inputs,output,requireAllSeven}=parseArgs(process.argv.slice(2));
const here=path.dirname(fileURLToPath(import.meta.url));
const p6=path.join(here,'validate-pilot-evidence.mjs');
const errors=[],warnings=[],entries=[];
const addError=(code,detail,sourceFile=null)=>errors.push({code,detail,...(sourceFile?{sourceFile}:{})});
const addWarning=(code,detail,sourceFile=null)=>warnings.push({code,detail,...(sourceFile?{sourceFile}:{})});

function invokeP6(file){
  const r=spawnSync(process.execPath,[p6,file],{encoding:'utf8'});
  const text=(r.stdout.trim()||r.stderr.trim());
  if(!text)return {exitCode:r.status??1,result:null,error:'P6 produced no JSON output'};
  try{return {exitCode:r.status??1,result:JSON.parse(text),error:null}}
  catch(err){return {exitCode:r.status??1,result:null,error:`Could not parse P6 output: ${err.message}`}}
}

for(const input of inputs){
  const sourceFile=path.basename(input);
  let payload;
  try{payload=JSON.parse(fs.readFileSync(input,'utf8'))}
  catch(err){addError('SOURCE_JSON_INVALID',String(err.message),sourceFile);continue}

  const p6Result=invokeP6(input);
  if(p6Result.error){addError('P6_OUTPUT_INVALID',p6Result.error,sourceFile);continue}
  if(p6Result.exitCode!==0||p6Result.result?.claimGates?.canDescribeAsLocalControlledPilotEvidence!==true){
    addError('P6_VALIDATION_FAILED',`P6 status ${p6Result.result?.status||'UNKNOWN'}; source is not eligible for a P7 evidence pack`,sourceFile);
    continue;
  }

  const runId=payload?.run?.runId;
  if(typeof runId!=='string'||!runId.trim()){addError('RUN_ID_MISSING','Validated source has no usable runId',sourceFile);continue}
  const v=p6Result.result;
  if(requireAllSeven&&v.claimGates?.canDescribeCompletedSevenDayObservation!==true){
    addError('SEVEN_DAY_WINDOW_REQUIRED_FOR_ALL','--require-seven-day-window-all was supplied but this run lacks a validated completed seven-day observation window',sourceFile);
  }
  for(const w of v.warnings||[])addWarning(`P6_${w.code}`,w.detail,sourceFile);
  entries.push({
    runId,
    sourceFile,
    sourceSha256:v.sha256,
    p6Status:v.status,
    observationDays:v.observations?.observationDays??null,
    activeDays:v.observations?.activeDays??null,
    activeMinutes:v.observations?.activeMinutes??null,
    uniqueLessonsCompleted:v.observations?.uniqueLessonsCompleted??null,
    completeSevenDayWindow:v.claimGates?.canDescribeCompletedSevenDayObservation===true,
    readyAtStart:v.observations?.readyAtStart===true,
    readyAtEnd:v.observations?.readyAtEnd===true
  });
}

const seenRuns=new Map(),seenDigests=new Map();
for(const e of entries){
  if(seenRuns.has(e.runId))addError('DUPLICATE_RUN_ID',`runId ${e.runId} appears more than once (${seenRuns.get(e.runId)} and ${e.sourceFile})`,e.sourceFile);else seenRuns.set(e.runId,e.sourceFile);
  if(seenDigests.has(e.sourceSha256))addError('DUPLICATE_SOURCE_DIGEST',`source SHA-256 ${e.sourceSha256} appears more than once (${seenDigests.get(e.sourceSha256)} and ${e.sourceFile})`,e.sourceFile);else seenDigests.set(e.sourceSha256,e.sourceFile);
}

entries.sort((a,b)=>a.runId.localeCompare(b.runId)||a.sourceSha256.localeCompare(b.sourceSha256));
const sum=(key)=>entries.reduce((n,e)=>n+(typeof e[key]==='number'&&Number.isFinite(e[key])?e[key]:0),0);
const totals={
  validatedRuns:entries.length,
  runsWithCompletedSevenDayObservation:entries.filter(e=>e.completeSevenDayWindow).length,
  sumActiveDaysAcrossRuns:sum('activeDays'),
  sumActiveMinutesAcrossRuns:Number(sum('activeMinutes').toFixed(1)),
  sumUniqueLessonCompletionsAcrossRuns:sum('uniqueLessonsCompleted')
};
const canonicalEntries=entries.map(({runId,sourceSha256,p6Status,observationDays,activeDays,activeMinutes,uniqueLessonsCompleted,completeSevenDayWindow,readyAtStart,readyAtEnd})=>({runId,sourceSha256,p6Status,observationDays,activeDays,activeMinutes,uniqueLessonsCompleted,completeSevenDayWindow,readyAtStart,readyAtEnd}));
const manifestSha256=crypto.createHash('sha256').update(JSON.stringify(canonicalEntries)).digest('hex');
const allSeven=entries.length>0&&entries.every(e=>e.completeSevenDayWindow);
const structurallyValid=errors.length===0&&entries.length===inputs.length&&entries.length>0;

const claimGates={
  structurallyValid,
  canDescribeAsPackOfValidatedLocalRuns:structurallyValid,
  canDescribeAllRunsAsCompletedSevenDayObservation:structurallyValid&&allSeven,
  canClaimRetention:false,
  canClaimLearningImprovement:false,
  canClaimCohortOutcome:false,
  canClaimComparativeEffectiveness:false,
  canClaimLegalCompliance:false,
  canClaimSafeguardingCertification:false,
  canClaimProductionReadiness:false,
  canClaimTamperEvidentAnalytics:false
};

const result={
  packBuilder:'kirthiverse.p7.pilot-evidence-pack.v1',
  generatedAt:new Date().toISOString(),
  status:errors.length?'INVALID':warnings.length?'VALIDATED_LOCAL_RUN_PACK_WITH_LIMITATIONS':'VALIDATED_LOCAL_RUN_PACK',
  manifestSha256,
  digestMeaning:'Digest of the sorted P7 manifest entry content for traceability only. It is not a signature, trusted timestamp, chain of custody, or tamper-evident evidence system.',
  requestedFiles:inputs.length,
  totals,
  entries,
  errors,warnings,
  claimGates,
  interpretation:[
    'P7 re-runs P6 against every original P5 source file instead of trusting a separately edited validation report.',
    'Totals are descriptive sums across independently validated local runs; they are not cohort outcomes and do not establish retention or learning improvement.',
    'sumActiveDaysAcrossRuns is not a count of unique calendar days and must not be presented as one.',
    'Duplicate run IDs or source digests fail closed to reduce accidental double counting.',
    'External safeguarding, privacy, consent, legal and research-accountability requirements remain outside this local evidence pack.'
  ]
};

const text=JSON.stringify(result,null,2);
if(output){
  try{fs.writeFileSync(output,text+'\n')}catch(err){console.error(JSON.stringify({status:'OUTPUT_WRITE_ERROR',error:String(err.message),outputFile:output},null,2));process.exit(1)}
}
console.log(text);
process.exit(errors.length?1:0);

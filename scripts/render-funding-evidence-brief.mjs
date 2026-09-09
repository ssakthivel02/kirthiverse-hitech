#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function usage(message){
  if(message)console.error(message);
  console.error('Usage: node scripts/render-funding-evidence-brief.mjs <p7-pack.json> [--require-all-seven-day] [--output <brief.md>] [--json-output <brief.json>]');
  process.exit(2);
}
function parseArgs(argv){
  let input=null,output=null,jsonOutput=null,requireAllSeven=false;
  for(let i=0;i<argv.length;i++){
    const a=argv[i];
    if(a==='--require-all-seven-day'){requireAllSeven=true;continue}
    if(a==='--output'||a==='--json-output'){
      const v=argv[++i];if(!v||v.startsWith('--'))usage(`${a} requires a file path.`);
      if(a==='--output'){if(output)usage('Duplicate --output.');output=v}else{if(jsonOutput)usage('Duplicate --json-output.');jsonOutput=v}
      continue;
    }
    if(a.startsWith('--'))usage(`Unknown option: ${a}`);
    if(input)usage('Exactly one P7 evidence pack is required.');
    input=a;
  }
  if(!input)usage();return{input,output,jsonOutput,requireAllSeven};
}
const {input,output,jsonOutput,requireAllSeven}=parseArgs(process.argv.slice(2));
let pack;try{pack=JSON.parse(fs.readFileSync(input,'utf8'))}catch(err){console.error(JSON.stringify({generator:'kirthiverse.p8.claim-safe-funding-brief.v1',status:'INVALID_INPUT',errors:[{code:'INPUT_JSON_INVALID',detail:String(err.message)}]},null,2));process.exit(1)}
const errors=[],warnings=[];const err=(code,detail,path_=null)=>errors.push({code,detail,...(path_?{path:path_}:{})});const warn=(code,detail,path_=null)=>warnings.push({code,detail,...(path_?{path:path_}:{})});
const entries=Array.isArray(pack?.entries)?pack.entries:[];
if(pack?.packBuilder!=='kirthiverse.p7.pilot-evidence-pack.v1')err('P7_SCHEMA_MISMATCH','Expected kirthiverse.p7.pilot-evidence-pack.v1','$.packBuilder');
if(pack?.status==='INVALID'||!pack?.status)err('P7_STATUS_INVALID','P7 pack is invalid or has no status','$.status');
if(!entries.length)err('P7_ENTRIES_MISSING','P7 pack has no validated run entries','$.entries');
if(pack?.claimGates?.canDescribeAsPackOfValidatedLocalRuns!==true)err('P7_PACK_CLAIM_GATE_CLOSED','P7 does not permit describing this as a pack of validated local runs','$.claimGates.canDescribeAsPackOfValidatedLocalRuns');
const prohibitedGateKeys=['canClaimRetention','canClaimLearningImprovement','canClaimCohortOutcome','canClaimComparativeEffectiveness','canClaimLegalCompliance','canClaimSafeguardingCertification','canClaimProductionReadiness','canClaimTamperEvidentAnalytics'];
for(const k of prohibitedGateKeys)if(pack?.claimGates?.[k]!==false)err('P7_UNSAFE_CLAIM_GATE',`${k} must remain explicitly false`,'$.claimGates.'+k);
const prohibitedTrueKeys=new Set(['retention','learningImprovement','cohortOutcome','comparativeEffectiveness','legalCompliance','safeguardingCertification','productionReady','tamperEvidentAnalytics']);
const sensitiveKeys=new Set(['alias','childName','displayName','pin','pinHash','pinSalt','pinIterations','teacherEmail','studentEmail','schoolName','schoolId','phone','address','dateOfBirth','dob']);
function scan(v,p='$'){if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach((x,i)=>scan(x,`${p}[${i}]`));return}for(const[k,x]of Object.entries(v)){const n=`${p}.${k}`;if(sensitiveKeys.has(k))err('SENSITIVE_FIELD_PRESENT',`Sensitive field ${n} is not permitted in a P8 funding evidence source`,n);if(prohibitedTrueKeys.has(k)&&x===true)err('UNSUPPORTED_POSITIVE_CLAIM',`Unsupported positive claim ${n}=true`,n);scan(x,n)}}scan(pack);
const canonicalEntries=[...entries].sort((a,b)=>String(a.runId).localeCompare(String(b.runId))||String(a.sourceSha256).localeCompare(String(b.sourceSha256))).map(e=>({runId:e.runId,sourceSha256:e.sourceSha256,p6Status:e.p6Status,observationDays:e.observationDays,activeDays:e.activeDays,activeMinutes:e.activeMinutes,uniqueLessonsCompleted:e.uniqueLessonsCompleted,completeSevenDayWindow:e.completeSevenDayWindow,readyAtStart:e.readyAtStart,readyAtEnd:e.readyAtEnd}));
const recomputedManifestSha256=crypto.createHash('sha256').update(JSON.stringify(canonicalEntries)).digest('hex');
if(pack?.manifestSha256!==recomputedManifestSha256)err('MANIFEST_DIGEST_MISMATCH','P7 manifest content does not match manifestSha256; regenerate P7 from original P5 evidence','$.manifestSha256');
const runIds=new Set(),digests=new Set();for(const e of entries){if(typeof e.runId!=='string'||!e.runId.trim())err('RUN_ID_INVALID','Entry has no usable runId');else if(runIds.has(e.runId))err('DUPLICATE_RUN_ID',`Duplicate runId ${e.runId}`);else runIds.add(e.runId);if(!/^[a-f0-9]{64}$/.test(String(e.sourceSha256||'')))err('SOURCE_DIGEST_INVALID',`Invalid sourceSha256 for run ${e.runId||'unknown'}`);else if(digests.has(e.sourceSha256))err('DUPLICATE_SOURCE_DIGEST',`Duplicate source SHA-256 ${e.sourceSha256}`);else digests.add(e.sourceSha256)}
const n=x=>typeof x==='number'&&Number.isFinite(x)?x:0;const recomputedTotals={validatedRuns:entries.length,runsWithCompletedSevenDayObservation:entries.filter(e=>e.completeSevenDayWindow===true).length,sumActiveDaysAcrossRuns:entries.reduce((s,e)=>s+n(e.activeDays),0),sumActiveMinutesAcrossRuns:Number(entries.reduce((s,e)=>s+n(e.activeMinutes),0).toFixed(1)),sumUniqueLessonCompletionsAcrossRuns:entries.reduce((s,e)=>s+n(e.uniqueLessonsCompleted),0)};
for(const[k,v]of Object.entries(recomputedTotals))if(pack?.totals?.[k]!==v)err('TOTALS_MISMATCH',`P7 total ${k}=${pack?.totals?.[k]} does not match recomputed value ${v}`,'$.totals.'+k);
const allSeven=entries.length>0&&entries.every(e=>e.completeSevenDayWindow===true);if(pack?.claimGates?.canDescribeAllRunsAsCompletedSevenDayObservation!==allSeven)err('SEVEN_DAY_GATE_MISMATCH','P7 all-runs seven-day claim gate does not match manifest entries','$.claimGates.canDescribeAllRunsAsCompletedSevenDayObservation');if(requireAllSeven&&!allSeven)err('ALL_SEVEN_DAY_REQUIRED','--require-all-seven-day was supplied but not every validated run contains a completed seven-day observation window');
const holdAtEnd=entries.filter(e=>e.readyAtEnd!==true).length;if(holdAtEnd)warn('RUNS_ENDED_WITH_P4_HOLD',`${holdAtEnd} run(s) ended without P4 READY; preserve the associated P6/P7 limitation when discussing the pack`);
for(const w of pack?.warnings||[])warn(`P7_${w.code||'WARNING'}`,w.detail||'P7 limitation present');
if(errors.length){console.error(JSON.stringify({generator:'kirthiverse.p8.claim-safe-funding-brief.v1',status:'INVALID_P7_PACK',sourcePack:path.basename(input),recomputedManifestSha256,errors,warnings},null,2));process.exit(1)}
const totals=recomputedTotals;const allSevenStatement=allSeven?`All ${totals.validatedRuns} validated run${totals.validatedRuns===1?'':'s'} contain completed seven-day observation windows.`:`${totals.runsWithCompletedSevenDayObservation} of ${totals.validatedRuns} validated runs contain completed seven-day observation windows; the remaining runs must not be described as seven-day observations.`;
const approvedStatements=[`This evidence pack contains ${totals.validatedRuns} independently P6-validated local controlled-pilot run${totals.validatedRuns===1?'':'s'}.`,allSevenStatement,`Observed descriptive totals across the validated runs: ${totals.sumActiveMinutesAcrossRuns} active minutes, ${totals.sumActiveDaysAcrossRuns} summed active days across runs, and ${totals.sumUniqueLessonCompletionsAcrossRuns} summed unique lesson completions.`];
const prohibitedClaims=['retention or retention rate','learning improvement or efficacy','cohort outcome','comparative effectiveness','legal compliance/certification','safeguarding certification','production readiness','tamper-evident or audited analytics'];
const briefData={generator:'kirthiverse.p8.claim-safe-funding-brief.v1',generatedAt:new Date().toISOString(),sourcePack:path.basename(input),manifestSha256:recomputedManifestSha256,status:warnings.length?'CLAIM_SAFE_BRIEF_WITH_LIMITATIONS':'CLAIM_SAFE_BRIEF',totals,approvedStatements,prohibitedClaims,warnings,claimGates:{canUseApprovedStatements:true,canDescribeAllRunsAsCompletedSevenDayObservation:allSeven,canClaimRetention:false,canClaimLearningImprovement:false,canClaimCohortOutcome:false,canClaimComparativeEffectiveness:false,canClaimLegalCompliance:false,canClaimSafeguardingCertification:false,canClaimProductionReadiness:false,canClaimTamperEvidentAnalytics:false},sourceRuns:entries.map(e=>({runId:e.runId,sourceSha256:e.sourceSha256,p6Status:e.p6Status,observationDays:e.observationDays,completeSevenDayWindow:e.completeSevenDayWindow,readyAtEnd:e.readyAtEnd}))};
const md=[`# KirthiVerse Funding Evidence Brief`,``,`**Status:** ${briefData.status}  `,`**Source P7 manifest SHA-256:** \`${briefData.manifestSha256}\`  `,`**Validated local runs:** ${totals.validatedRuns}`,``,`## Evidence-supported statements`,...approvedStatements.map(x=>`- ${x}`),``,`## Descriptive totals`,`- Validated runs: **${totals.validatedRuns}**`,`- Runs with completed seven-day observation windows: **${totals.runsWithCompletedSevenDayObservation}**`,`- Summed active days across runs: **${totals.sumActiveDaysAcrossRuns}**`,`- Summed active minutes across runs: **${totals.sumActiveMinutesAcrossRuns}**`,`- Summed unique lesson completions across runs: **${totals.sumUniqueLessonCompletionsAcrossRuns}**`,``,`> These are descriptive sums across independently validated local runs. They are not cohort outcomes. Summed active days are not unique calendar days.`,``,`## Claims this evidence does not support`,...prohibitedClaims.map(x=>`- ${x}`),``,`## Traceability`,`| Run ID | Source SHA-256 | P6 status | Observation days | Seven-day window | P4 ready at end |`,`|---|---|---|---:|---|---|`,...briefData.sourceRuns.map(e=>`| ${e.runId} | \`${e.sourceSha256}\` | ${e.p6Status} | ${e.observationDays??'—'} | ${e.completeSevenDayWindow?'Yes':'No'} | ${e.readyAtEnd?'Yes':'No'} |`),``,`## Evidence boundary`,`This brief is generated only after rechecking the P7 manifest structure, digest, totals, duplicate boundaries and unsafe claim gates. It does not verify guardian identity, legal consent, external review quality, safeguarding approval, research ethics, school approval, or production readiness. The P7/P8 digests are traceability aids, not signatures or tamper-evident proof.`,``,...(warnings.length?[`## Limitations requiring human review`,...warnings.map(w=>`- **${w.code}:** ${w.detail}`),``]:[])].join('\n');
if(output)fs.writeFileSync(output,md+'\n');if(jsonOutput)fs.writeFileSync(jsonOutput,JSON.stringify(briefData,null,2)+'\n');console.log(md);process.exit(0);

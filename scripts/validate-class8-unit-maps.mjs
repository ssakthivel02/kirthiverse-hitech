/**
 * Class 8 NCERT unit-map metadata qualification.
 * This checks only the map contracts that are currently published on main:
 * it does NOT certify the 83 original lessons or 415 assessments, which are
 * still awaiting repository publication and content review.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const specs = [
  {
    file:'data/class8-math-part1-unit-map-v1.js',
    global:'KV_CLASS8_MATH_PART1_UNIT_MAP',
    subject:'Mathematics',part:1,count:7,
    url:'https://ncert.nic.in/textbook/pdf/hegp1ps.pdf',
    first:'A Square and A Cube',last:'Proportional Reasoning-1',sections:false
  },
  {
    file:'data/class8-math-part2-unit-map-v1.js',
    global:'KV_CLASS8_MATH_PART2_UNIT_MAP',
    subject:'Mathematics',part:2,count:7,
    url:'https://ncert.nic.in/textbook/pdf/hegp2ps.pdf',
    first:'Fractions in Disguise',last:'Area',sections:false
  },
  {
    file:'data/class8-science-unit-map-v1.js',
    global:'KV_CLASS8_SCIENCE_UNIT_MAP',
    subject:'Science',count:13,
    url:'https://ncert.nic.in/textbook/pdf/hecu1ps.pdf',
    first:'Exploring the Investigative World of Science',
    last:'Our Home: Earth, a Unique Life Sustaining Planet',sections:false
  },
  {
    file:'data/class8-social-science-part1-unit-map-v1.js',
    global:'KV_CLASS8_SOCIAL_SCIENCE_PART1_UNIT_MAP',
    subject:'Social Science',part:1,count:7,
    url:'https://ncert.nic.in/textbook/pdf/hees1ps.pdf',
    first:'Natural Resources and Their Use',last:'Factors of Production',sections:true
  },
  {
    file:'data/class8-social-science-part2-unit-map-v1.js',
    global:'KV_CLASS8_SOCIAL_SCIENCE_PART2_UNIT_MAP',
    subject:'Social Science',part:2,count:8,
    url:'https://ncert.nic.in/textbook/pdf/hees2ps.pdf',
    first:'World Geography: Some Glimpses',
    last:'Cultural Currents: 13th to 17th Centuries',sections:true
  }
];
let total=0;
for (const spec of specs) {
  const sandbox={window:{}};
  vm.createContext(sandbox);
  const code=fs.readFileSync(spec.file,'utf8');
  vm.runInContext(code,sandbox,{filename:spec.file,timeout:1000});
  const map=sandbox.window[spec.global];
  assert.ok(map,spec.file+': expected global missing');
  assert.equal(map.schemaVersion,'1.0.0');
  assert.equal(map.board,'CBSE');
  assert.equal(map.classLevel,8);
  assert.equal(map.subject,spec.subject);
  if (spec.part) assert.equal(map.part,spec.part);
  assert.equal(map.curriculumSession,'2026-27');
  assert.equal(map.status,'SOURCE_VERIFIED');
  assert.equal(map.source.authority,'NCERT');
  assert.equal(map.source.url,spec.url);
  assert.equal(map.source.rightsStatus,'NCERT_ALL_RIGHTS_RESERVED_METADATA_ONLY');
  assert.ok(map.source.title && map.source.isbn && map.source.edition);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(map.source.verifiedAt));
  assert.equal(map.units.length,spec.count,spec.file+': chapter count');
  assert.equal(map.units[0].title,spec.first);
  assert.equal(map.units.at(-1).title,spec.last);
  const chapters=new Set();
  for (let i=0;i<map.units.length;i++) {
    const u=map.units[i];
    assert.equal(u.chapter,i+1,spec.file+': sequential chapter numbering');
    assert.ok(!chapters.has(u.chapter));
    chapters.add(u.chapter);
    assert.ok(typeof u.title==='string' && u.title.trim());
    assert.equal(u.status,'SOURCE_VERIFIED');
    if(spec.subject==='Social Science') {
      assert.ok(u.theme && u.discipline,spec.file+': theme/discipline missing');
    }
  }
  assert.equal(map.contentBoundary.metadataOnly,true);
  assert.equal(map.contentBoundary.textbookProseCopied,false);
  assert.equal(map.contentBoundary.textbookExercisesCopied,false);
  assert.equal(map.contentBoundary.sectionMappingVerified,spec.sections);
  assert.equal(map.contentBoundary.originalKikiTeachingRequired,true);
  assert.equal(map.contentBoundary.originalAssessmentsRequired,true);
  assert.equal(map.contentBoundary.lessonPublicationRequiresQA,true);
  assert.ok(Object.isFrozen(map));
  assert.ok(Object.isFrozen(map.units));
  total+=map.units.length;
  console.log('CLASS8_MAP_PASS',spec.file,spec.count);
}
assert.equal(total,42);
console.log('CLASS8_ALL_FIVE_MAPS_PASS 5 maps / 42 chapters — metadata only');

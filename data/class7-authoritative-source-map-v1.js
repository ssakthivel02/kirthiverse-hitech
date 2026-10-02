/* KirthiVerse Class 7 authoritative source map v1.
   Source registry only. It does not claim lesson/chapter coverage or reproduce textbook content. */
window.KV_CLASS7_AUTHORITATIVE_SOURCE_MAP=Object.freeze({
  schemaVersion:'1.1.0',
  classLevel:7,
  curriculumSession:'2026-27',
  status:'SOURCE_REGISTRY_VERIFIED',
  authorities:Object.freeze([
    Object.freeze({id:'NCERT_SYLLABUS_ELEMENTARY',authority:'NCERT',kind:'syllabus',url:'https://ncert.nic.in/syllabus.php?class=7&ln=en',scope:'Elementary-stage syllabus gateway including Class VII'}),
    Object.freeze({id:'NCERT_TEXTBOOK_PORTAL',authority:'NCERT',kind:'textbook-catalog',url:'https://ncert.nic.in/textbook.php',scope:'Official Textbooks PDF portal for Classes I-XII'}),
    Object.freeze({id:'NCERT_PUBLICATION_CATALOG',authority:'NCERT',kind:'publication-catalog',url:'https://www.ncert.nic.in/division/pd/pdf/list_of_publication.pdf',scope:'Official publication catalogue identifying Class VII Science and Social Science titles'}),
    Object.freeze({id:'NCERT_GRADE7_MATH_PART1',authority:'NCERT',kind:'textbook-primary',url:'https://ncert.nic.in/textbook/pdf/gegp1ps.pdf',scope:'Ganita Prakash Grade 7 Part I direct official unit-map evidence'}),
    Object.freeze({id:'NCERT_GRADE7_SCIENCE_CURIOSITY',authority:'NCERT',kind:'textbook-primary',url:'https://ncert.nic.in/textbook/pdf/gecu1ps.pdf',scope:'Curiosity Grade 7 direct official 12-chapter unit-map evidence'}),
    Object.freeze({id:'CBSE_ACADEMICS_2026_27',authority:'CBSE',kind:'curriculum-context',url:'https://cbseacademic.nic.in/',scope:'Official CBSE academic portal for session 2026-27'})
  ]),
  subjects:Object.freeze({
    Mathematics:Object.freeze({state:'SOURCE_VERIFIED_UNIT_MAP_COMPLETE',unitMap:'data/class7-math-unit-map-v1.js',sourceRefs:['NCERT_GRADE7_MATH_PART1','NCERT_TEXTBOOK_PORTAL']}),
    Science:Object.freeze({state:'SOURCE_VERIFIED_UNIT_MAP_COMPLETE',unitMap:'data/class7-science-unit-map-v1.js',sourceRefs:['NCERT_GRADE7_SCIENCE_CURIOSITY','NCERT_TEXTBOOK_PORTAL']}),
    'Social Science':Object.freeze({state:'SOURCE_VERIFIED_UNIT_MAP_PENDING',sourceRefs:['NCERT_SYLLABUS_ELEMENTARY','NCERT_TEXTBOOK_PORTAL','NCERT_PUBLICATION_CATALOG']})
  }),
  evidencePolicy:Object.freeze({officialDomainsOnly:true,unitTitlesRequireDirectOfficialEvidence:true,lessonAuthoringBlockedUntilUnitMapVerified:true,noTextbookExerciseReproduction:true,noCoverageClaim:true}),
  verifiedAt:'2026-10-02'
});

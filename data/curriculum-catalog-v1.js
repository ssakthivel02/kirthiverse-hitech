/* KirthiVerse curriculum expansion catalog v1.
   Architecture only: this file does not claim textbook/chapter coverage that has not been authored and qualified. */
window.KV_CURRICULUM_CATALOG=Object.freeze({
  schemaVersion:'1.0.0',
  board:'CBSE',
  curriculumSession:'2026-27',
  supportedClasses:[6],
  expansionClasses:[7,8,9,10,11,12],
  subjects:Object.freeze({
    7:['Mathematics','Science','Social Science'],
    8:['Mathematics','Science','Social Science'],
    9:['Mathematics','Science','Social Science'],
    10:['Mathematics','Science','Social Science'],
    11:['Mathematics','Physics','Chemistry','Biology'],
    12:['Mathematics','Physics','Chemistry','Biology']
  }),
  status:Object.freeze({
    6:'QUALIFIED_EXISTING',
    7:'FOUNDATION_ONLY',8:'FOUNDATION_ONLY',9:'FOUNDATION_ONLY',10:'FOUNDATION_ONLY',11:'FOUNDATION_ONLY',12:'FOUNDATION_ONLY'
  }),
  contentPolicy:Object.freeze({
    canonicalOnly:true,
    noFabricatedCoverage:true,
    originalTeachingText:true,
    noTextbookExerciseReproduction:true,
    requireSourceRefs:true,
    requireRightsStatus:true,
    requireAssessmentQualification:true
  }),
  lessonContract:Object.freeze({
    required:['id','title','subject','topic','learningObjective','content','board','classLevel','curriculumSession','sourceRefs','rightsStatus','kikiTeaching','remediation'],
    identity:'{subject}.cbse{classLevel}.{book-or-course}.{chapter-or-unit}.{concept}.v{version}',
    lifecycle:['DRAFT','SOURCE_VERIFIED','ASSESSMENT_READY','QA_QUALIFIED']
  })
});
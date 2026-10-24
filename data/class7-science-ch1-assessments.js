/* Original, low-stakes Class 7 Science Chapter 1 formative checks. */
(()=>{
  window.KV_ASSESSMENTS=window.KV_ASSESSMENTS||[];
  const lessonId='science.cbse7.curiosity.ch1.science-as-process.v1';
  const rightsStatus='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
  const sourceRefs=['KVS-SCI7-CH1-ORIGINAL-2026-10'];
  const items=[
    {type:'multiple_choice',question:'A learner notices that one paper spinner falls more slowly than another. Which is the best next step for a fair investigation?',answer:'Ask a testable question and compare spinners while controlling other conditions.',explanation:'A fair test starts with a focused question and keeps relevant conditions consistent.',options:['Conclude that longer wings always fall more slowly.','Ask a testable question and compare spinners while controlling other conditions.','Change the paper, wing length and release height at once.','Choose whichever result matches a guess.']},
    {type:'short_answer',question:'What is the difference between an observation and an explanation?',answer:'An observation describes what was noticed; an explanation proposes why it happened.',explanation:'Record what was noticed before interpreting a possible cause.'},
    {type:'reasoning',question:'A first investigation gives results that do not fit a learner’s prediction. What is a scientific next step?',answer:'Review the method and evidence, then revise or retest the explanation.',explanation:'Evidence that disagrees with a prediction is a reason to check the investigation and reconsider the explanation.'},
    {type:'multiple_choice',question:'Which question is most directly testable in a short classroom investigation?',answer:'Does changing the length of a paper spinner wing affect its fall time from the same height?',explanation:'A testable question identifies a change and an observable outcome.',options:['Why is nature beautiful?','Does changing the length of a paper spinner wing affect its fall time from the same height?','Will this object always behave the same everywhere?','Which explanation feels most convincing?']},
    {type:'short_answer',question:'Why should a learner repeat measurements when practical?',answer:'Repeating measurements helps check whether a pattern is consistent.',explanation:'Repeated observations can reveal variability and reduce reliance on one result.'}
  ];
  window.KV_ASSESSMENTS.push(...items.map((x,i)=>({stableAssessmentId:`KV-CBSE7-SCI-${String(i+91).padStart(4,'0')}`,lessonId,assessmentType:x.type,questionActivity:x.question,correctAnswer:x.answer,hint:'Describe the evidence and use the investigation idea from the lesson.',explanation:x.explanation,options:x.options,subject:'Science',board:'CBSE',classLevel:7,chapter:1,rightsStatus,sourceRefs})));
})();

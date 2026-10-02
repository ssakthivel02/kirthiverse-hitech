/* KirthiVerse-original Class 7 Science Chapters 2–5 assessment bank. */
(()=>{
window.KV_ASSESSMENTS=window.KV_ASSESSMENTS||[];
const R='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
const lesson=(ch,slug)=>`science.cbse7.curiosity.ch${ch}.${slug}.v1`;
let n=1;
function A(ch,slug,type,q,a,e,options){return {stableAssessmentId:`KV-CBSE7-SCI-${String(n++).padStart(4,'0')}`,lessonId:lesson(ch,slug),assessmentType:type,questionActivity:q,correctAnswer:String(a),hint:'Use the evidence and the scientific rule from the lesson before deciding.',explanation:e,options:options||undefined,subject:'Science',board:'CBSE',classLevel:7,chapter:ch,rightsStatus:R,sourceRefs:[`KVS-SCI7-CH${ch}-ORIGINAL-2026-10`]};}
window.KV_ASSESSMENTS.push(
A(2,'acids-bases-indicators','reasoning','Why is tasting an unknown liquid an unsuitable way to decide whether it is acidic?','It is unsafe and does not provide a controlled scientific test.','Unknown substances should not be tasted; use a suitable indicator and known comparison instead.'),
A(2,'acids-bases-indicators','multiple_choice','What gives the strongest evidence for classifying an unknown sample in an indicator investigation?','Its observed response compared with the indicator’s known responses.','Classification should follow controlled evidence.',['Its brand name','Its container colour','Its observed response compared with the indicator’s known responses.','A guess from its smell']),
A(2,'acids-bases-indicators','short_answer','What is the purpose of a known neutral comparison sample?','It provides a baseline for comparing the indicator response.','A baseline makes interpretation more reliable.'),
A(2,'neutralisation-evidence','reasoning','Equal volumes of an acidic and a basic solution are mixed. Can you conclude the result is neutral from volume alone?','No','The chemical amounts and final evidence matter; equal volume alone is insufficient.'),
A(2,'neutralisation-evidence','short_answer','What observation should be checked before claiming neutralisation reached a neutral condition?','The final indicator evidence.','The conclusion should be tied to the measured final condition.'),
A(3,'closed-circuits','multiple_choice','A cell and lamp are connected but there is a gap in the conducting path. What is the best prediction?','The lamp will not operate because the path is incomplete.','A simple circuit requires a continuous path.',['The lamp must glow brighter','The lamp will not operate because the path is incomplete.','The gap supplies energy','The cell becomes a switch']),
A(3,'closed-circuits','short_answer','What does closing a switch do in a simple working circuit?','It completes the conducting path.','A closed switch provides continuity through its contacts.'),
A(3,'closed-circuits','reasoning','A lamp does not glow. Does this prove the lamp itself is faulty?','No','An open switch, poor connection or source problem could also explain the observation.'),
A(3,'components-conductors','short_answer','What role does a cell or battery have in a simple circuit?','It provides energy to the circuit.','The source supplies energy; other components have different roles.'),
A(3,'components-conductors','reasoning','A test material replaces a conducting link and the lamp stops operating. What cautious conclusion is supported?','The material did not provide sufficient conduction under the test conditions.','The conclusion should not be broader than the evidence.'),
A(4,'properties-evidence','multiple_choice','Which approach gives the strongest classification of an unfamiliar material?','Use several relevant property observations.','Multiple independent observations are stronger than one visual clue.',['Judge only by colour','Judge only by shine','Use several relevant property observations.','Use its price']),
A(4,'properties-evidence','reasoning','Is a shiny appearance alone enough to prove that a material is a metal?','No','Classification should use a pattern of properties because single clues can have exceptions.'),
A(4,'properties-evidence','short_answer','Why should the same test conditions be used when comparing two materials?','To make the comparison fair.','Consistent conditions reduce alternative explanations for differences.'),
A(4,'uses-properties','short_answer','Why is an electrical insulator useful around a conducting wire?','It helps prevent unintended electrical contact.','The outer material is selected for insulation rather than conduction.'),
A(4,'uses-properties','reasoning','Can one material be called the best material for every product?','No','Suitability depends on the properties required by a particular job and its constraints.'),
A(5,'physical-chemical-evidence','multiple_choice','Which question is most useful when deciding whether a change is chemical?','Is there evidence that new substance or substances formed?','Chemical-change reasoning centres on new-substance evidence.',['Was the change colourful?','Was it fast?','Is there evidence that new substance or substances formed?','Was a container used?']),
A(5,'physical-chemical-evidence','reasoning','A change cannot easily be reversed. Does that fact alone prove it is chemical?','No','Reversibility by itself is not a reliable definition; use evidence about substances formed.'),
A(5,'physical-chemical-evidence','short_answer','Melting changes which major physical property of a substance?','Its state.','A state change can occur without changing the substance identity.'),
A(5,'change-investigation','reasoning','Why is changing temperature, amount and container at the same time a weak comparison?','It becomes unclear which changed factor caused the observed difference.','Multiple simultaneous changes create confounding variables.'),
A(5,'change-investigation','short_answer','In a fair comparison, what should happen to factors that are not being investigated?','They should be kept as consistent as practical.','Controlling other factors strengthens cause-and-effect reasoning.')
);
})();

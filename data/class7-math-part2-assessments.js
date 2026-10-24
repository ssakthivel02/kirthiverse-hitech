/* KirthiVerse-original Class 7 Mathematics Part II Chapters 1–7 assessment bank.
   70 original assessments (stable IDs KV-CBSE7-MATH-0081 to 0150); no NCERT exercise/example reproduction.
   Answers are written so the learner answer normaliser (letters, digits, '.', '-') matches: plain numbers use an ASCII hyphen for negatives and carry no units. */
(()=>{
window.KV_ASSESSMENTS=window.KV_ASSESSMENTS||[];
const R='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
const P='math.cbse7.ganita-prakash.p2ch';
const lessons={1:['congruent-figures-correspondence','triangle-congruence-conditions'],2:['integer-add-subtract','integer-multiply-divide'],3:['prime-factors-and-hcf','lcm-and-hcf-relationship'],4:['decimal-multiplication','decimal-division'],5:['mean-median-outliers','statistical-questions-range-graphs'],6:['bisectors-perpendiculars-parallels','sixty-degrees-hexagons-tilings'],7:['equations-and-balance','forming-and-checking-equations']};
let n=81;
function A(ch,li,type,prompt,answer,explanation,options){const id=`KV-CBSE7-MATH-${String(n++).padStart(4,'0')}`,assessmentType=type.replaceAll('-','_');return {stableAssessmentId:id,lessonId:`${P}${ch}.${lessons[ch][li]}.v1`,assessmentType,questionActivity:prompt,correctAnswer:String(answer),hint:assessmentType==='multiple_choice'?'Compare every option using the lesson rule before choosing.':'State the relevant rule first, then apply it carefully.',explanation,options:options||undefined,subject:'Mathematics',board:'CBSE',classLevel:7,part:2,chapter:ch,rightsStatus:R,sourceRefs:[`KVS-MATH7-P2-CH${ch}-ORIGINAL-2026-10`]};}
window.KV_ASSESSMENTS.push(
/* Chapter 1 — Geometric Twins */
A(1,0,'short-answer','If △ABC ≅ △DEF, which side of △DEF corresponds to side BC? Write the side name.','EF','B matches E and C matches F, so BC corresponds to EF.'),
A(1,0,'multiple-choice','Two squares have sides 4 cm and 6 cm. Are they congruent?','No, they have different sizes','Congruent figures need the same shape and the same size; both squares share a shape but not a size.',['Yes, both are squares','No, they have different sizes','Yes, all angles are 90°','Only if one is turned']),
A(1,0,'short-answer','△PQR ≅ △XYZ and ∠Q = 65°. Which angle of △XYZ is also 65°? Write the angle letter.','Y','Q corresponds to Y, so ∠Y = ∠Q = 65°.'),
A(1,0,'reasoning','A mirror-image copy of a triangle is placed beside the original. Are the two triangles still congruent? Answer Yes or No.','Yes','A flip does not change any side length or angle, so the copy can still match the original part for part.'),
A(1,0,'short-answer','△ABC ≅ △LMN, AB = 7 cm and LN = 9 cm. Find AC in cm.','9','A matches L and C matches N, so AC corresponds to LN and AC = 9 cm.'),
A(1,1,'multiple-choice','Two triangles each have sides of 5 cm and 7 cm with a 50° angle between them. Which condition proves them congruent?','SAS','Two sides and the angle between them are equal, which is the SAS condition.',['SSS','SAS','ASA','RHS']),
A(1,1,'short-answer','Two angles of 40° and 60° and the 6 cm side between them are equal in two triangles. Name the condition.','ASA','Two angles with the side between them match, which is ASA.'),
A(1,1,'reasoning','Two triangles have two equal sides and an equal angle that is not between those sides. Does this guarantee they are congruent? Answer Yes or No.','No','SSA is not a valid condition; the free side can swing to two positions, giving two different triangles.'),
A(1,1,'short-answer','What is the measure of each angle of an equilateral triangle in degrees?','60','The three equal angles share a total of 180°, so each is 180° ÷ 3 = 60°.'),
A(1,1,'short-answer','In isosceles triangle ABC, AB = AC and ∠B = 50°. Find ∠C in degrees.','50','The angles opposite equal sides are equal, so ∠C = ∠B = 50°.'),
/* Chapter 2 — Operations with Integers */
A(2,0,'short-answer','Evaluate -7 + 12.','5','Start at -7 and move 12 steps right to reach 5.'),
A(2,0,'short-answer','What is the additive inverse of -9?','9','The additive inverse of -9 is the number that gives zero when added: -9 + 9 = 0.'),
A(2,0,'short-answer','Evaluate 4 - (-6).','10','Subtracting -6 is the same as adding 6, so 4 + 6 = 10.'),
A(2,0,'multiple-choice','Which value equals -3 - 5?','-8','Start at -3 and move 5 steps left to reach -8.',['2','-2','-8','8']),
A(2,0,'reasoning','A diver is at -12 m, rises 5 m and then descends 9 m. What is the final position in metres? Write the number.','-16','-12 + 5 = -7, and then -7 - 9 = -16.'),
A(2,1,'short-answer','Evaluate (-8) × 3.','-24','Unlike signs give a negative product: 8 × 3 = 24, so the answer is -24.'),
A(2,1,'short-answer','Evaluate (-7) × (-6).','42','Like signs give a positive product: 7 × 6 = 42.'),
A(2,1,'multiple-choice','What is -45 ÷ 9?','-5','Unlike signs give a negative quotient: 45 ÷ 9 = 5, so the answer is -5.',['5','-5','-405','9']),
A(2,1,'short-answer','Evaluate (-2) × (-3) × (-4).','-24','(-2) × (-3) = 6, and 6 × (-4) = -24.'),
A(2,1,'reasoning','The temperature falls 3 degrees each hour. Write the total change as an integer after 5 hours.','-15','Five falls of 3 degrees is 5 × (-3) = -15.'),
/* Chapter 3 — Finding Common Ground */
A(3,0,'multiple-choice','Which number is prime?','29','29 has only two factors, 1 and 29; the others have extra factors (21 = 3 × 7, 27 = 3 × 9, 33 = 3 × 11).',['21','27','29','33']),
A(3,0,'short-answer','What is the largest prime factor of 60?','5','60 = 2 × 2 × 3 × 5, so the largest prime factor is 5.'),
A(3,0,'short-answer','Find the HCF of 24 and 36.','12','24 = 2 × 2 × 2 × 3 and 36 = 2 × 2 × 3 × 3; the shared primes are 2, 2, 3, giving 12.'),
A(3,0,'short-answer','Find the HCF of 17 and 25.','1','17 and 25 share no prime factor, so they are co-prime and their HCF is 1.'),
A(3,0,'reasoning','Is 1 a prime number? Answer Yes or No.','No','A prime has exactly two factors; 1 has only one factor, itself.'),
A(3,1,'short-answer','Find the LCM of 8 and 12.','24','8 = 2 × 2 × 2 and 12 = 2 × 2 × 3; take three 2s and one 3: 24.'),
A(3,1,'short-answer','The HCF of two numbers is 4 and their LCM is 60. One number is 12. Find the other.','20','HCF × LCM = 4 × 60 = 240, and 240 ÷ 12 = 20.'),
A(3,1,'multiple-choice','Two lights blink every 6 s and every 8 s and start together. After how many seconds do they next blink together?','24','The first common multiple of 6 and 8 is their LCM, 24.',['14','24','48','2']),
A(3,1,'short-answer','Find the LCM of 5 and 7.','35','5 and 7 are co-prime, so their LCM is the product 35.'),
A(3,1,'reasoning','True or false: the LCM of two numbers can be smaller than one of the numbers.','False','The LCM is a multiple of both numbers, so it is at least as large as each of them.'),
/* Chapter 4 — Another Peek Beyond the Point */
A(4,0,'short-answer','Find 0.4 × 0.3.','0.12','4 × 3 = 12 and the factors have 2 decimal places in total, so the product is 0.12.'),
A(4,0,'short-answer','Find 1.5 × 2.4.','3.6','15 × 24 = 360 and the factors have 2 decimal places in total, giving 3.60 = 3.6.'),
A(4,0,'multiple-choice','Which product is less than 5?','5 × 0.9','Multiplying 5 by a number less than 1 gives a result less than 5; here 5 × 0.9 = 4.5.',['5 × 1.1','5 × 0.9','5 × 2','5 × 10']),
A(4,0,'short-answer','How many decimal places does the product 0.5 × 0.5 have? Write the number.','2','0.5 × 0.5 = 0.25, which has two decimal places.'),
A(4,0,'reasoning','Ribbon costs 12.5 rupees per metre. Find the cost in rupees of 0.8 m.','10','12.5 × 0.8 = 10.'),
A(4,1,'short-answer','Find 3.6 ÷ 10.','0.36','Dividing by 10 moves the decimal point one place left.'),
A(4,1,'short-answer','Find 7.2 ÷ 0.9.','8','Multiply both by 10: 72 ÷ 9 = 8.'),
A(4,1,'multiple-choice','Which whole-number division has the same value as 4.8 ÷ 0.06?','480 ÷ 6','Multiply both numbers by 100 to get 480 ÷ 6.',['48 ÷ 6','480 ÷ 6','480 ÷ 60','4.8 ÷ 6']),
A(4,1,'short-answer','Find 1.5 ÷ 0.25.','6','Multiply both by 100: 150 ÷ 25 = 6.'),
A(4,1,'reasoning','Does the decimal form of 1 ÷ 3 end after a few digits? Answer Yes or No.','No','1 ÷ 3 = 0.333... and the digit 3 repeats forever.'),
/* Chapter 5 — Connecting the Dots... */
A(5,0,'short-answer','Find the mean of 4, 8, 6, 10, 12.','8','The sum is 40 and there are 5 values, so the mean is 40 ÷ 5 = 8.'),
A(5,0,'short-answer','Find the median of 9, 3, 7, 5, 11.','7','Sorted: 3, 5, 7, 9, 11; the middle value is 7.'),
A(5,0,'short-answer','Find the median of 2, 4, 8, 10.','6','The two middle values are 4 and 8; halfway between them is 6.'),
A(5,0,'multiple-choice','In the data 5, 6, 6, 7, 52, which value is the outlier?','52','52 is far larger than the other values.',['5','6','7','52']),
A(5,0,'reasoning','Adding one outlier to a data set usually changes which value more, the mean or the median? Answer mean or median.','mean','The mean uses every value, so one extreme value pulls it a lot; the median only depends on the middle position.'),
A(5,1,'multiple-choice','Which is a statistical question?','How many hours does each student in our class sleep?','A statistical question expects different answers from different members of a group.',['How many pages does this book have?','What is the date today?','How many hours does each student in our class sleep?','What is 5 + 7?']),
A(5,1,'short-answer','Find the range of 14, 9, 21, 17, 12.','12','The maximum is 21 and the minimum is 9, so the range is 21 - 9 = 12.'),
A(5,1,'short-answer','A dot plot shows 3 dots above the value 5. How many times did 5 occur? Write the number.','3','Each dot stands for one observation.'),
A(5,1,'reasoning','Marks of 5 students are 6, 8, 8, 9, 14. Which is greater, the mean or the median? Answer mean or median.','mean','The mean is 45 ÷ 5 = 9, and the median is 8, so the mean is greater.'),
A(5,1,'short-answer','The mean of 6 numbers is 7. What is their sum?','42','Sum = mean × number of values = 7 × 6 = 42.'),
/* Chapter 6 — Constructions and Tilings */
A(6,0,'short-answer','At what angle in degrees does a perpendicular bisector meet the segment?','90','A perpendicular bisector meets the segment at a right angle.'),
A(6,0,'short-answer','Segment PQ is 10 cm long. Its perpendicular bisector meets it at M. Find PM in cm.','5','M is the midpoint, so PM = 10 ÷ 2 = 5 cm.'),
A(6,0,'short-answer','A 70° angle is bisected. Find each half in degrees.','35','Bisecting gives two equal parts: 70 ÷ 2 = 35.'),
A(6,0,'multiple-choice','To bisect an angle, the two arcs drawn from the points on its arms must have:','equal radii','Equal radii make the two small triangles congruent, which makes the two halves equal.',['different radii','equal radii','radius zero','radius equal to the angle']),
A(6,0,'reasoning','True or false: copying an angle so that corresponding angles are equal makes the new line parallel to the given line.','True','Equal corresponding angles are a test for parallel lines.'),
A(6,1,'short-answer','How many equilateral triangles fit around a point with no gaps? Write the number.','6','Each angle is 60° and 360 ÷ 60 = 6.'),
A(6,1,'short-answer','A regular hexagon has 120° angles. How many fit around a point in a tiling? Write the number.','3','360 ÷ 120 = 3.'),
A(6,1,'multiple-choice','Which regular shape cannot tile the plane by itself?','regular pentagon','Its angle is 108° and 360 is not a whole-number multiple of 108.',['equilateral triangle','square','regular hexagon','regular pentagon']),
A(6,1,'short-answer','A 60° angle is bisected. Find each part in degrees.','30','60 ÷ 2 = 30.'),
A(6,1,'short-answer','Four squares meet at a point. What is the total angle at that point in degrees?','360','Four angles of 90° make 360°.'),
/* Chapter 7 — Finding the Unknown */
A(7,0,'short-answer','Solve x + 9 = 15.','6','Subtract 9 from both sides: x = 6.'),
A(7,0,'short-answer','Solve 4x = 28.','7','Divide both sides by 4: x = 7.'),
A(7,0,'short-answer','Solve 2x + 3 = 11.','4','Subtract 3 to get 2x = 8, then divide by 2: x = 4.'),
A(7,0,'multiple-choice','Which value of x satisfies 5x - 4 = 16?','4','Add 4 to get 5x = 20, then divide by 5: x = 4.',['2','3','4','5']),
A(7,0,'reasoning','To solve x - 6 = 10 you add 6 to the left side only. Is the equation still balanced? Answer Yes or No.','No','Whatever is done to one side must be done to the other; otherwise the sides are no longer equal.'),
A(7,1,'short-answer','Twice a number increased by 5 is 17. Find the number.','6','Write 2n + 5 = 17, then 2n = 12 and n = 6.'),
A(7,1,'short-answer','The sum of three consecutive whole numbers is 33. Find the smallest.','10','n + (n + 1) + (n + 2) = 3n + 3 = 33, so n = 10.'),
A(7,1,'multiple-choice','A notebook costs 5 rupees more than a pen costing p rupees, and together they cost 17 rupees. Which equation fits?','2p + 5 = 17','Pen p plus notebook p + 5 equals 17, so 2p + 5 = 17.',['p + 5 = 17','2p + 5 = 17','2p = 17','p - 5 = 17']),
A(7,1,'short-answer','Solve 6x - 5 = 13.','3','Add 5 to get 6x = 18, then divide by 6: x = 3.'),
A(7,1,'reasoning','Is x = 5 a solution of 3x + 1 = 17? Answer Yes or No.','No','For x = 5 the left side is 3 × 5 + 1 = 16, which is not 17.')
);
})();

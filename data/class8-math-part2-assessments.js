/* KirthiVerse-original Class 8 Mathematics Part II Chapters 1–7 assessment bank.
   70 original assessments (stable IDs KV-CBSE8-MATH-0071 to 0140); no NCERT exercise/example reproduction.
   Answers are written so the learner answer normaliser (letters, digits, '.', '-') matches: plain numbers carry no units or powers. */
(()=>{
window.KV_ASSESSMENTS=window.KV_ASSESSMENTS||[];
const R='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
const P='math.cbse8.ganita-prakash.p2ch';
const lessons={1:['profit-loss-and-discount','simple-and-compound-interest'],2:['pythagoras-theorem','converse-triples-applications'],3:['pie-charts','inverse-proportion'],4:['solids-faces-edges-vertices','fractals-self-similarity'],5:['mean-as-fair-share','line-graphs'],6:['forming-equations','patterns-and-formulae'],7:['area-triangle-parallelogram','area-trapezium-rhombus']};
let n=71;
function A(ch,li,type,prompt,answer,explanation,options){const id=`KV-CBSE8-MATH-${String(n++).padStart(4,'0')}`,assessmentType=type.replaceAll('-','_');return {stableAssessmentId:id,lessonId:`${P}${ch}.${lessons[ch][li]}.v1`,assessmentType,questionActivity:prompt,correctAnswer:String(answer),hint:assessmentType==='multiple_choice'?'Compare every option using the lesson rule before choosing.':'State the relevant rule first, then apply it carefully.',explanation,options:options||undefined,subject:'Mathematics',board:'CBSE',classLevel:8,part:2,chapter:ch,rightsStatus:R,sourceRefs:[`KVS-MATH8-P2-CH${ch}-ORIGINAL-2026-10`]};}
window.KV_ASSESSMENTS.push(
/* Chapter 1 — Fractions in Disguise */
A(1,0,'short-answer','An article bought for 400 is sold for 460. What is the profit percentage?','15','The profit is 60, and 60 ÷ 400 × 100 = 15.'),
A(1,0,'multiple-choice','A shop gives 25% off on a jacket marked 800. What is the selling price?','600','The discount is 200, so the selling price is 800 − 200 = 600.',['200','600','775','1000']),
A(1,0,'short-answer','An item bought for 500 is sold at a loss of 12%. Find the selling price.','440','The loss is 12% of 500 = 60, so the selling price is 500 − 60 = 440.'),
A(1,0,'reasoning','A trader buys for 200 and sells for 250. Is the profit percentage calculated on the selling price? Answer Yes or No.','No','Profit per cent is always calculated on the cost price, which is 200 here.'),
A(1,0,'short-answer','The marked price of a bag is 1200 and it is sold at a 20% discount. Find the discount amount.','240','20% of 1200 = 240.'),
A(1,1,'short-answer','Find the simple interest on 2000 at 5% per year for 3 years.','300','SI = 2000 × 5 × 3 ÷ 100 = 300.'),
A(1,1,'multiple-choice','Find the amount on 1000 for 2 years at 10% per year, with interest added to the principal each year.','1210','Year 1 gives 1100 and year 2 gives 1100 × 1.1 = 1210.',['1200','1210','1100','1220']),
A(1,1,'short-answer','What is the compound interest on 1000 for 2 years at 10% per year?','210','The amount is 1210, so the compound interest is 1210 − 1000 = 210.'),
A(1,1,'reasoning','For the same principal, rate and 2 years, is compound interest more than simple interest? Answer Yes or No.','Yes','In the second year interest is earned on the first year interest as well, so compound interest is larger.'),
A(1,1,'short-answer','A sum earns 150 as simple interest in 3 years at 5% per year. Find the sum.','1000','P = 150 × 100 ÷ (5 × 3) = 1000.'),
/* Chapter 2 — The Baudhayana-Pythagoras Theorem */
A(2,0,'short-answer','The legs of a right triangle are 6 and 8. Find the hypotenuse.','10','c² = 36 + 64 = 100, so c = 10.'),
A(2,0,'multiple-choice','Which side of a right-angled triangle is the longest?','Hypotenuse','The hypotenuse, opposite the right angle, is always the longest side.',['Hypotenuse','Shorter leg','Longer leg','Any side']),
A(2,0,'short-answer','A right triangle has hypotenuse 13 and one leg 5. Find the other leg.','12','The other leg squared is 169 − 25 = 144, so the leg is 12.'),
A(2,0,'reasoning','Can a right triangle have sides 3, 4 and 6 with 6 as the hypotenuse? Answer Yes or No.','No','3² + 4² = 25, which is not 6² = 36.'),
A(2,0,'short-answer','Find the diagonal of a rectangle that is 9 long and 12 wide.','15','The diagonal squared is 81 + 144 = 225, so the diagonal is 15.'),
A(2,1,'short-answer','A 13 m ladder leans on a wall with its foot 5 m from the wall. How high up the wall does it reach, in metres?','12','The height squared is 169 − 25 = 144, so the height is 12.'),
A(2,1,'multiple-choice','Which set of numbers is a Pythagorean triple?','5, 12, 13','5² + 12² = 25 + 144 = 169 = 13². The other sets fail the test.',['4, 5, 6','5, 12, 13','6, 7, 8','7, 9, 11']),
A(2,1,'short-answer','Calculate 7² + 24² to test whether 7, 24, 25 is a Pythagorean triple.','625','49 + 576 = 625 = 25², so it is a triple.'),
A(2,1,'reasoning','If a² + b² = c² for the sides of a triangle, is the triangle right-angled? Answer Yes or No.','Yes','This is the converse of the theorem: the angle opposite the longest side c is a right angle.'),
A(2,1,'short-answer','The sides of a right triangle are in the ratio 3 : 4 : 5 and the shortest side is 9. Find the hypotenuse.','15','One part is 3, so the hypotenuse is 5 × 3 = 15.'),
/* Chapter 3 — Proportional Reasoning-2 */
A(3,0,'short-answer','In a survey of 40 students, 10 prefer cricket. What angle in degrees represents cricket on a pie chart?','90','10 ÷ 40 × 360 = 90.'),
A(3,0,'multiple-choice','The angles of all the sectors in a pie chart add up to how many degrees?','360','A pie chart is a full circle, and a full circle is 360°.',['90','180','360','720']),
A(3,0,'short-answer','A sector of 72 degrees in a pie chart of 50 students stands for how many students?','10','72 ÷ 360 × 50 = 10.'),
A(3,0,'reasoning','In a pie chart, does a larger sector angle mean a larger share of the total? Answer Yes or No.','Yes','The angle is proportional to the share, so a larger angle means a larger share.'),
A(3,0,'short-answer','A budget pie chart shows 15% spent on transport. What angle in degrees represents transport?','54','15% of 360 = 54.'),
A(3,1,'short-answer','6 workers finish a job in 12 days. How many days will 4 workers working at the same rate take?','18','The work is 6 × 12 = 72 worker-days, and 72 ÷ 4 = 18.'),
A(3,1,'multiple-choice','Which pair of quantities is in inverse proportion?','Speed and time for a fixed distance','For a fixed distance, doubling the speed halves the time, so their product stays constant.',['Speed and time for a fixed distance','Number of pens and total cost','Distance travelled and time at a fixed speed','Side of a square and its perimeter']),
A(3,1,'short-answer','A car at 60 km per hour takes 5 hours for a journey. How many hours will it take at 50 km per hour?','6','The distance is 300 km, and 300 ÷ 50 = 6.'),
A(3,1,'reasoning','If x and y are in inverse proportion, is the product x × y constant? Answer Yes or No.','Yes','Inverse proportion means the product of the two quantities stays the same.'),
A(3,1,'short-answer','8 men can build a wall in 15 days. How many days will 12 men take?','10','The work is 8 × 15 = 120 man-days, and 120 ÷ 12 = 10.'),
/* Chapter 4 — Exploring Some Geometric Themes */
A(4,0,'short-answer','How many edges does a cube have?','12','A cube has 12 edges: 4 on top, 4 on the bottom and 4 vertical.'),
A(4,0,'multiple-choice','Using V − E + F = 2, a solid has 6 vertices and 9 edges. How many faces does it have?','5','6 − 9 + F = 2 gives F = 5, which is a triangular prism.',['3','5','6','7']),
A(4,0,'short-answer','A square pyramid has 5 vertices and 8 edges. Use V − E + F = 2 to find the number of faces.','5','5 − 8 + F = 2, so F = 5.'),
A(4,0,'reasoning','A solid is claimed to have 7 faces, 12 edges and 8 vertices. Does it satisfy V − E + F = 2? Answer Yes or No.','No','8 − 12 + 7 = 3, not 2, so the counts cannot all be right.'),
A(4,0,'short-answer','How many square faces are in the net of a cube?','6','A cube has 6 faces and each face is a square.'),
A(4,1,'short-answer','In a Sierpinski pattern where each filled triangle is replaced by 3 smaller ones and stage 0 has 1 triangle, how many filled triangles are there at stage 3?','27','3 × 3 × 3 = 27.'),
A(4,1,'multiple-choice','What does self-similar mean for a fractal?','Smaller parts look like the whole shape','A fractal repeats its pattern at smaller scales, so a small part resembles the whole.',['Smaller parts look like the whole shape','All sides are equal','It has no pattern','It is always a circle']),
A(4,1,'short-answer','A Koch-type curve replaces every segment by 4 segments. Starting from 1 segment, how many segments are there after 2 stages?','16','4 × 4 = 16.'),
A(4,1,'reasoning','In the Sierpinski pattern that triples each stage, does stage 4 have 81 filled triangles? Answer Yes or No.','Yes','3 × 3 × 3 × 3 = 81.'),
A(4,1,'short-answer','A segment of length 9 is replaced by 4 segments each one third as long. What is the total length after this first step?','12','Each new segment is 3 long, and 4 × 3 = 12.'),
/* Chapter 5 — Tales by Dots and Lines */
A(5,0,'short-answer','Find the mean of 4, 7, 9 and 10.','7.5','The sum is 30, and 30 ÷ 4 = 7.5.'),
A(5,0,'multiple-choice','The mean of five numbers is 12. What is their sum?','60','Sum = mean × count = 12 × 5 = 60.',['17','48','60','72']),
A(5,0,'short-answer','The mean of five numbers is 12. Four of them are 10, 11, 12 and 14. Find the fifth number.','13','The total is 60 and the four known numbers add to 47, so the fifth is 13.'),
A(5,0,'reasoning','If every value in a data set increases by 5, does the mean also increase by 5? Answer Yes or No.','Yes','Every value moves up by 5, so the total rises by 5 times the count and the mean rises by 5.'),
A(5,0,'short-answer','Four friends have 3, 5, 8 and 8 stickers. If they share equally, how many does each get?','6','The total is 24, and 24 ÷ 4 = 6.'),
A(5,1,'short-answer','The temperature at 6 am, 9 am and noon is 22, 26 and 31 degrees. By how many degrees did it rise from 6 am to noon?','9','31 − 22 = 9.'),
A(5,1,'multiple-choice','On a line graph, which segment shows the fastest increase?','The steepest upward segment','The steeper the segment, the faster the quantity changes.',['The steepest upward segment','A flat segment','A downward segment','The first segment always']),
A(5,1,'short-answer','A plant is 4 cm, 7 cm and 10 cm tall in weeks 1, 2 and 3. If the same steady growth continues, what is its predicted height in cm in week 4?','13','It grows 3 cm each week, so week 4 is 10 + 3 = 13.'),
A(5,1,'reasoning','A flat horizontal segment on a line graph of savings means the savings did not change in that period. Answer Yes or No.','Yes','A horizontal segment means the value stayed the same.'),
A(5,1,'short-answer','Monthly sales were 20, 25, 25 and 30. What is the mean?','25','The total is 100, and 100 ÷ 4 = 25.'),
/* Chapter 6 — Algebra Play */
A(6,0,'short-answer','Thrice a number increased by 5 is 26. Find the number.','7','3x + 5 = 26, so 3x = 21 and x = 7.'),
A(6,0,'multiple-choice','Which equation represents "a number doubled and decreased by 4 equals 14"?','2x - 4 = 14','Doubling gives 2x and decreasing by 4 gives 2x − 4.',['2x - 4 = 14','2x + 4 = 14','x - 8 = 14','4 - 2x = 14']),
A(6,0,'short-answer','Solve 5x − 7 = 18.','5','5x = 25, so x = 5.'),
A(6,0,'reasoning','Rita is 4 years older than her brother and their ages add to 30. Is Rita 17? Answer Yes or No.','Yes','Brother b and Rita b + 4 give 2b + 4 = 30, so b = 13 and Rita is 17.'),
A(6,0,'short-answer','A father is 3 times as old as his son and their ages add to 48. Find the son\'s age.','12','x + 3x = 48, so 4x = 48 and x = 12.'),
A(6,1,'short-answer','The pattern 4, 7, 10, 13, … has nth term 3n + 1. Find the 20th term.','61','3 × 20 + 1 = 61.'),
A(6,1,'multiple-choice','Squares in a row use matchsticks: 1 square uses 4 sticks, 2 squares use 7 and 3 squares use 10. How many sticks do 5 squares need?','16','The rule is 3n + 1, so 5 squares need 16 sticks.',['14','15','16','20']),
A(6,1,'short-answer','Think of a number n, add 5, double the result and subtract 10. The final result is how many times n?','2','2(n + 5) − 10 = 2n.'),
A(6,1,'reasoning','Does the expression 2(n + 5) − 10 simplify to 2n? Answer Yes or No.','Yes','2n + 10 − 10 = 2n.'),
A(6,1,'short-answer','Using the rule 3n + 1, for which value of n is the term 31?','10','3n + 1 = 31 gives 3n = 30, so n = 10.'),
/* Chapter 7 — Area */
A(7,0,'short-answer','Find the area of a triangle with base 12 and height 7.','42','½ × 12 × 7 = 42.'),
A(7,0,'multiple-choice','A parallelogram has base 9 and perpendicular height 5. What is its area?','45','Area = base × height = 45.',['14','28','45','90']),
A(7,0,'short-answer','A triangle and a parallelogram have the same base and lie between the same parallel lines. The parallelogram has area 60. What is the area of the triangle?','30','The triangle has half the area of the parallelogram.'),
A(7,0,'reasoning','Is the area of a parallelogram equal to its base times its slanted side? Answer Yes or No.','No','The area is base times the perpendicular height, not the slanted side.'),
A(7,0,'short-answer','A triangle has area 48 and base 12. Find its height.','8','Height = 2 × 48 ÷ 12 = 8.'),
A(7,1,'short-answer','The parallel sides of a trapezium are 10 and 14 and the distance between them is 6. Find its area.','72','½ × (10 + 14) × 6 = 72.'),
A(7,1,'multiple-choice','The diagonals of a rhombus are 16 and 12. What is its area?','96','Area = ½ × 16 × 12 = 96.',['28','96','192','56']),
A(7,1,'short-answer','Find the side of a rhombus whose diagonals are 16 and 12.','10','Half-diagonals 8 and 6 form a right triangle with the side, so the side is √(64 + 36) = 10.'),
A(7,1,'reasoning','Can the area of a kite be found as half the product of its diagonals? Answer Yes or No.','Yes','The diagonals of a kite are perpendicular, so the area is ½ × d₁ × d₂.'),
A(7,1,'short-answer','A trapezium has area 90 and parallel sides 8 and 12. Find the distance between the parallel sides.','9','½ × 20 × h = 90, so h = 9.')
);
})();

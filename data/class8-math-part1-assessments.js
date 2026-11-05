/* KirthiVerse-original Class 8 Mathematics Part I Chapters 1–7 assessment bank.
   70 original assessments (stable IDs KV-CBSE8-MATH-0001 to 0070); no NCERT exercise/example reproduction.
   Answers are written so the learner answer normaliser (letters, digits, '.', '-') matches: negatives use an ASCII hyphen and answers carry no units or powers. */
(()=>{
window.KV_ASSESSMENTS=window.KV_ASSESSMENTS||[];
const R='KIRTHIVERSE_ORIGINAL_NO_TEXTBOOK_EXERCISE_REPRODUCTION';
const P='math.cbse8.ganita-prakash.ch';
const lessons={1:['squares-and-square-roots','cubes-and-cube-roots'],2:['laws-of-exponents','scientific-notation'],3:['place-value-and-zero','other-bases-binary'],4:['types-and-angle-sum','parallelogram-and-special-cases'],5:['divisibility-tests','digit-patterns-and-generalising'],6:['expanding-with-distributive-law','algebraic-identities'],7:['ratio-and-sharing','percentages-and-change']};
let n=1;
function A(ch,li,type,prompt,answer,explanation,options){const id=`KV-CBSE8-MATH-${String(n++).padStart(4,'0')}`,assessmentType=type.replaceAll('-','_');return {stableAssessmentId:id,lessonId:`${P}${ch}.${lessons[ch][li]}.v1`,assessmentType,questionActivity:prompt,correctAnswer:String(answer),hint:assessmentType==='multiple_choice'?'Compare every option using the lesson rule before choosing.':'State the relevant rule first, then apply it carefully.',explanation,options:options||undefined,subject:'Mathematics',board:'CBSE',classLevel:8,part:1,chapter:ch,rightsStatus:R,sourceRefs:[`KVS-MATH8-P1-CH${ch}-ORIGINAL-2026-10`]};}
window.KV_ASSESSMENTS.push(
/* Chapter 1 — A Square and A Cube */
A(1,0,'short-answer','What is the square root of 196?','14','14 × 14 = 196, so the square root of 196 is 14.'),
A(1,0,'multiple-choice','Which of these numbers cannot be a perfect square?','3087','A perfect square cannot end in 7. The other numbers are 39², 48² and 64².',['1521','2304','3087','4096']),
A(1,0,'short-answer','Using the pattern that n² is the sum of the first n odd numbers, what is the sum of the first 12 odd numbers?','144','The sum of the first 12 odd numbers is 12² = 144.'),
A(1,0,'reasoning','A learner says 2208 is a perfect square because it is even. Using units digits, can 2208 be a perfect square? Answer Yes or No.','No','A perfect square cannot end in 8, so 2208 is not a perfect square. Being even does not decide it.'),
A(1,0,'short-answer','The square root of 90 lies between two consecutive whole numbers. Write the smaller one.','9','81 < 90 < 100, so the root of 90 lies between 9 and 10.'),
A(1,1,'short-answer','What is the cube root of 2744?','14','14 × 14 × 14 = 2744, so the cube root is 14.'),
A(1,1,'multiple-choice','Which of these is a perfect cube?','729','729 = 9 × 9 × 9. The other numbers do not have prime factors in groups of three.',['500','729','900','1200']),
A(1,1,'short-answer','What is the units digit of 23³?','7','3³ = 27 ends in 7, and the units digit of a cube depends only on the units digit of the number.'),
A(1,1,'reasoning','The prime factorisation of 1620 is 2 × 2 × 3 × 3 × 3 × 3 × 5. Can 1620 be a perfect cube? Answer Yes or No.','No','Every prime must appear a multiple-of-three number of times. Here 2 appears twice, 3 four times and 5 once.'),
A(1,1,'short-answer','What is the smallest number by which 108 must be multiplied to make a perfect cube?','2','108 = 2² × 3³. Multiplying by 2 gives 2³ × 3³ = 216 = 6³.'),
/* Chapter 2 — Power Play */
A(2,0,'short-answer','Write 3⁴ × 3² as a single power of 3. What is the exponent?','6','When the base is the same, the exponents add: 4 + 2 = 6.'),
A(2,0,'multiple-choice','What is the value of 5⁰?','1','Any non-zero number raised to the power 0 equals 1.',['0','1','5','Not defined']),
A(2,0,'short-answer','Write 2⁻³ as a decimal.','0.125','2⁻³ = 1 ÷ 2³ = 1 ÷ 8 = 0.125.'),
A(2,0,'reasoning','Rahul writes (2³)² = 2⁵. Is he correct? Answer Yes or No.','No','A power of a power multiplies the exponents, so (2³)² = 2⁶, not 2⁵.'),
A(2,0,'short-answer','Evaluate (2⁵ × 2³) ÷ 2⁶.','4','The exponent is 5 + 3 − 6 = 2, and 2² = 4.'),
A(2,1,'short-answer','Write 3,200,000 in standard form a × 10ⁿ. What is n?','6','3,200,000 = 3.2 × 10⁶, so n = 6.'),
A(2,1,'multiple-choice','Which option is the standard form of 0.00045?','4.5 x 10^-4','Move the decimal point 4 places to the right to get 4.5, so the exponent is −4.',['4.5 x 10^-4','4.5 x 10^-3','45 x 10^-5','0.45 x 10^-3']),
A(2,1,'short-answer','A distance is 6 × 10⁴ km. Write it as an ordinary number.','60000','6 × 10⁴ = 6 × 10000 = 60000.'),
A(2,1,'reasoning','Is 12 × 10³ written in standard form? Answer Yes or No.','No','In standard form the first number must be at least 1 and less than 10; 12 is too large.'),
A(2,1,'short-answer','Write 0.0007 in standard form a × 10ⁿ. What is n? Use a hyphen for the minus sign.','-4','0.0007 = 7 × 10⁻⁴, so n = −4.'),
/* Chapter 3 — A Story of Numbers */
A(3,0,'short-answer','What is the value of the digit 7 in 5,702?','700','The 7 is in the hundreds place, so its value is 7 × 100 = 700.'),
A(3,0,'multiple-choice','Why is zero important in the Hindu-Arabic number system?','It acts as a placeholder that keeps other digits in the right positions','Zero holds an empty place so the other digits keep their place values.',['It acts as a placeholder that keeps other digits in the right positions','It is the largest digit','It makes every number even','It is only used for subtraction']),
A(3,0,'short-answer','Write the number for 6 × 1000 + 0 × 100 + 3 × 10 + 8 × 1.','6038','The digits are 6, 0, 3 and 8, giving 6038.'),
A(3,0,'reasoning','In the Hindu-Arabic system, do the digits 3 and 4 mean the same number in 34 and in 43? Answer Yes or No.','No','Position changes the value: 34 is 3 tens and 4 ones, while 43 is 4 tens and 3 ones.'),
A(3,0,'short-answer','If the zero is removed from 4,072 and the digits close up, what number do you get?','472','Removing the zero gives 472, a very different number, which shows why zero is needed as a placeholder.'),
A(3,1,'short-answer','Convert the binary number 1101 to decimal.','13','8 + 4 + 0 + 1 = 13.'),
A(3,1,'multiple-choice','Which binary number equals the decimal number 10?','1010','10 = 8 + 2, so the places 8 and 2 are used: 1010.',['1010','1001','1100','0110']),
A(3,1,'short-answer','Convert the decimal number 19 to binary.','10011','19 = 16 + 2 + 1, so the places 16, 2 and 1 are used: 10011.'),
A(3,1,'reasoning','Can the digit 2 appear in a binary number? Answer Yes or No.','No','Binary uses only the digits 0 and 1.'),
A(3,1,'short-answer','What is the place value, in decimal, of the leftmost digit of the binary number 10000?','16','The places are 1, 2, 4, 8, 16 from the right, so the leftmost place is 16.'),
/* Chapter 4 — Quadrilaterals */
A(4,0,'short-answer','Three angles of a quadrilateral are 95°, 80° and 110°. Find the fourth angle in degrees.','75','The angle sum is 360° and 95 + 80 + 110 = 285, so the fourth angle is 75°.'),
A(4,0,'multiple-choice','Which quadrilateral is certain to have all four sides equal?','Rhombus','A rhombus has four equal sides; a rectangle or parallelogram has only opposite sides equal.',['Rectangle','Rhombus','Parallelogram','Kite']),
A(4,0,'short-answer','How many diagonals does a quadrilateral have?','2','A quadrilateral has two diagonals, one from each pair of opposite vertices.'),
A(4,0,'reasoning','Can a quadrilateral have four angles of 100° each? Answer Yes or No.','No','The four angles must add up to 360°, but 4 × 100° = 400°.'),
A(4,0,'short-answer','The four angles of a quadrilateral are x, 2x, 3x and 4x degrees. Find x.','36','10x = 360, so x = 36.'),
A(4,1,'short-answer','One angle of a parallelogram is 65°. Find the angle next to it in degrees.','115','Adjacent angles of a parallelogram add up to 180°, so the angle is 115°.'),
A(4,1,'multiple-choice','Which of these always has diagonals that cross at right angles and bisect each other?','Rhombus','In a rhombus the diagonals bisect each other at right angles. A rectangle or general parallelogram does not have perpendicular diagonals.',['Rectangle','Rhombus','Trapezium','Parallelogram']),
A(4,1,'short-answer','The diagonals of a rectangle are 2x + 3 and 4x − 5 units long. Find x.','4','Equal diagonals give 2x + 3 = 4x − 5, so 8 = 2x and x = 4.'),
A(4,1,'reasoning','Is every square also a rhombus? Answer Yes or No.','Yes','A square has four equal sides, which is exactly what makes a rhombus.'),
A(4,1,'short-answer','In a parallelogram ABCD the diagonals meet at O and AC = 18 cm. Find AO in cm.','9','The diagonals bisect each other, so AO is half of AC, which is 9.'),
/* Chapter 5 — Number Play */
A(5,0,'short-answer','What is the smallest digit that can replace * so that 52*4 is divisible by 3?','1','The digit sum is 5 + 2 + 4 = 11 plus the missing digit. The smallest digit that makes a multiple of 3 is 1, giving 12.'),
A(5,0,'multiple-choice','Which number is divisible by 11?','3058','For 3058, (8 + 0) − (5 + 3) = 0 using alternate digits from the right, so it is divisible by 11. The other numbers do not give 0 or a multiple of 11.',['3058','3059','3062','3075']),
A(5,0,'short-answer','What is the smallest digit that can replace * so that 31* is divisible by 4?','2','The last two digits 1* must form a multiple of 4. 12 is the first one, so * = 2.'),
A(5,0,'reasoning','A number has a digit sum of 24. Is it divisible by 9? Answer Yes or No.','No','A number is divisible by 9 only if its digit sum is divisible by 9, and 24 is not (though it is divisible by 3).'),
A(5,0,'short-answer','What is the remainder when 2345 is divided by 9? Use the digit sum.','5','The digit sum is 14, and 14 leaves remainder 5 on division by 9.'),
A(5,1,'short-answer','Reverse the digits of 83 and subtract the smaller number from the larger. What is 83 − 38?','45','83 − 38 = 45, which is 9 × 5, matching 9(a − b) with a − b = 5.'),
A(5,1,'multiple-choice','A two-digit number has tens digit a and units digit b. Which expression represents the number?','10a + b','The tens digit is worth 10 times its value, so the number is 10a + b.',['10a + b','a + b','10b + a','100a + b']),
A(5,1,'short-answer','The sum of a two-digit number and its reverse is always a multiple of which number?','11','(10a + b) + (10b + a) = 11a + 11b = 11(a + b).'),
A(5,1,'reasoning','A two-digit number minus its reverse equals 27. Is the difference of its tens and units digits 3? Answer Yes or No.','Yes','The difference is 9(a − b). Setting 9(a − b) = 27 gives a − b = 3.'),
A(5,1,'short-answer','What is (62 + 26) ÷ 11?','8','62 + 26 = 88 = 11 × 8, matching 11(a + b) with a + b = 8.'),
/* Chapter 6 — We Distribute, Yet Things Multiply */
A(6,0,'short-answer','Expand 3(x + 4). What is the constant term?','12','3(x + 4) = 3x + 12, so the constant term is 12.'),
A(6,0,'multiple-choice','Expand (x + 2)(x + 5).','x^2 + 7x + 10','The products are x², 5x, 2x and 10; combining 5x and 2x gives 7x.',['x^2 + 7x + 10','x^2 + 10x + 7','x^2 + 7x + 7','x^2 + 3x + 10']),
A(6,0,'short-answer','After expanding and collecting like terms, what is the coefficient of x in (x + 3)(x + 4)?','7','(x + 3)(x + 4) = x² + 4x + 3x + 12 = x² + 7x + 12.'),
A(6,0,'reasoning','Rani expands (a + 2)(a + 3) as a² + 6. Is she correct? Answer Yes or No.','No','She missed the middle terms 3a and 2a. The correct result is a² + 5a + 6.'),
A(6,0,'short-answer','Find the value of (x + 1)(x + 2) when x = 3.','20','(3 + 1)(3 + 2) = 4 × 5 = 20.'),
A(6,1,'short-answer','Use (a + b)² to find 41².','1681','41² = (40 + 1)² = 1600 + 80 + 1 = 1681.'),
A(6,1,'multiple-choice','Which expression equals (a − b)(a + b)?','a^2 - b^2','The product of a sum and a difference is the difference of squares.',['a^2 - b^2','a^2 + b^2','a^2 - 2ab + b^2','a^2 + 2ab + b^2']),
A(6,1,'short-answer','Calculate 99 × 101 using (a − b)(a + b).','9999','99 × 101 = (100 − 1)(100 + 1) = 10000 − 1 = 9999.'),
A(6,1,'reasoning','Is (x + y)² equal to x² + y²? Answer Yes or No.','No','The correct expansion is x² + 2xy + y²; the middle term 2xy is missing.'),
A(6,1,'short-answer','If a + b = 10 and ab = 21, find a² + b².','58','(a + b)² = a² + 2ab + b², so 100 = a² + b² + 42 and a² + b² = 58.'),
/* Chapter 7 — Proportional Reasoning-1 */
A(7,0,'short-answer','Divide 120 in the ratio 3 : 5. What is the larger share?','75','There are 8 parts, so one part is 15 and the larger share is 5 × 15 = 75.'),
A(7,0,'multiple-choice','Which ratio is equivalent to 4 : 6?','2 : 3','Dividing both parts by 2 gives 2 : 3.',['2 : 3','3 : 2','8 : 10','6 : 4']),
A(7,0,'short-answer','A recipe uses 2 cups of rice for 5 cups of water. How many cups of water are needed for 6 cups of rice?','15','The rice is multiplied by 3, so the water is also multiplied by 3: 5 × 3 = 15.'),
A(7,0,'reasoning','Are the ratios 3 : 4 and 9 : 12 equivalent? Answer Yes or No.','Yes','Multiplying both parts of 3 : 4 by 3 gives 9 : 12.'),
A(7,0,'short-answer','Two numbers are in the ratio 7 : 4 and their difference is 21. Find the larger number.','49','The difference is 3 parts, so one part is 7 and the larger number is 7 × 7 = 49.'),
A(7,1,'short-answer','What is 35% of 240?','84','35 ÷ 100 × 240 = 84.'),
A(7,1,'multiple-choice','A price rises from 80 to 100. What is the percentage increase?','25','The change is 20 on an original of 80, and 20 ÷ 80 × 100 = 25.',['20','25','80','125']),
A(7,1,'short-answer','A shirt marked 600 is sold at a 15% discount. What is the selling price?','510','The discount is 90, so the selling price is 600 − 90 = 510.'),
A(7,1,'reasoning','A price rises by 50% and then falls by 50%. Is the final price the same as the original? Answer Yes or No.','No','Starting at 100, the price becomes 150 and then falls by 75 to 75, which is not 100.'),
A(7,1,'short-answer','A class has 40 students and 30% are absent. How many students are present?','28','30% of 40 is 12 absent, so 40 − 12 = 28 are present.')
);
})();

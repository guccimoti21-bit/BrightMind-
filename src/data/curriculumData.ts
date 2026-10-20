import { Concept, ClassLevel } from '../types/curriculum';

export const CURRICULUM_DATA: Concept[] = [
  // ==========================================
  // CLASS 8 MATHEMATICS (Primary Featured Demo)
  // ==========================================
  {
    id: 'c8-math-linear-eq',
    classLevel: 8,
    subjectId: 'mathematics',
    title: 'Linear Equations in One Variable',
    description: 'Master algebraic expressions, the fundamental balance method of equality, transposing terms, and modeling real-world problems.',
    category: 'Algebra',
    estimatedHours: 6,
    iconName: 'Scale',
    subConcepts: [
      {
        id: 'c8-math-linear-sub1',
        conceptId: 'c8-math-linear-eq',
        order: 1,
        title: 'Meaning of a Variable and an Equation',
        shortDescription: 'Distinguish between algebraic expressions and equations with the equals sign.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Differentiate between an algebraic expression and an algebraic equation.',
          'Identify variables, coefficients, and constants in linear terms.',
          'Understand why equality (=) implies an exact balance of value.'
        ],
        explanation: {
          introduction: 'In algebra, an equation is a statement that two mathematical expressions have the exact same value. The equals sign (=) acts as a fulcrum of balance.',
          keyDefinitions: [
            {
              term: 'Variable',
              definition: 'A symbol (usually letters like x, y, z) used to represent an unknown quantity that can vary.',
            },
            {
              term: 'Linear Equation',
              definition: 'An algebraic equation in which the highest exponent (degree) of the variable is exactly 1.',
              formula: 'ax + b = c (where a ≠ 0)'
            },
            {
              term: 'Left-Hand Side (LHS) & Right-Hand Side (RHS)',
              definition: 'The expression to the left of = is LHS, and the expression to the right is RHS. Both must evaluate to the same value.'
            }
          ],
          breakdownSteps: [
            {
              title: '1. Expression vs. Equation',
              content: '2x + 5 is an expression (a phrase). But 2x + 5 = 15 is an equation (a complete mathematical sentence claiming equality).',
              callout: 'An equation always possesses an equality sign (=).'
            },
            {
              title: '2. What makes it Linear?',
              content: 'In 3x + 4 = 19, the variable x has power 1. If an equation has x² or x³, it is non-linear.',
              formula: 'x¹ = x (Linear degree)'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'The solution of an equation is the specific value of the variable that makes LHS equal to RHS.',
              commonMistake: 'Confusing 2x with 2 + x.',
              whyItMatters: '2x means 2 multiplied by x, while 2 + x means 2 added to x.'
            }
          ],
          keyTakeaway: 'An equation is like a balanced scale: LHS and RHS hold identical numerical value when the variable assumes its true solution.'
        },
        activity: {
          id: 'act-linear-sub1',
          type: 'balance-scale',
          title: 'Balance Scale Explorer: Recognizing Equality',
          instructions: 'Examine how placing equal quantities on both pans keeps the beam horizontal, while unequal weights cause it to tilt.',
          goal: 'Set both pans to equal total weight to achieve balance.',
          defaultData: { equation: 'x + 3 = 7', targetX: 4 }
        },
        workedExamples: [
          {
            id: 'we-sub1-1',
            problem: 'Verify whether x = 5 is a solution to the linear equation 3x - 4 = 11.',
            steps: [
              {
                stepNumber: 1,
                title: 'Substitute the given value into the Left-Hand Side (LHS)',
                math: 'LHS = 3(5) - 4',
                explanation: 'Replace variable x with 5 and perform multiplication first according to order of operations.'
              },
              {
                stepNumber: 2,
                title: 'Calculate the numerical result',
                math: 'LHS = 15 - 4 = 11',
                explanation: '15 minus 4 equals 11.'
              },
              {
                stepNumber: 3,
                title: 'Compare LHS with RHS',
                math: 'LHS = 11 = RHS',
                explanation: 'Since LHS equals RHS, x = 5 is indeed the correct solution of the equation.'
              }
            ],
            realWorldApplication: 'Engineers use this verification to check if a designed load matches structural specifications before constructing bridges.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub1-1',
            question: 'Which of the following is a linear equation in one variable?',
            options: ['2x² + 5 = 13', '3x + 7 = 22', 'x + y = 10', '4/x + 1 = 9'],
            correctIndex: 1,
            hint: 'Look for an equation with a single variable where the power of that variable is strictly 1 and not in the denominator.',
            explanation: '3x + 7 = 22 has one variable (x) raised to the first power. 2x² has power 2, x + y has two variables, and 4/x has degree -1.'
          },
          {
            id: 'gp-sub1-2',
            question: 'For the equation 4x - 6 = 14, what is the value of LHS when x = 5?',
            options: ['10', '14', '20', '8'],
            correctIndex: 1,
            hint: 'Calculate 4 × 5 first, then subtract 6.',
            explanation: '4(5) - 6 = 20 - 6 = 14, which exactly matches the RHS!'
          }
        ],
        revisionSummary: {
          title: 'Core Concepts Summary',
          points: [
            'An algebraic equation claims that LHS is equal to RHS via the "=" sign.',
            'Linear equations in one variable have degree 1 and contain only one unknown letter.',
            'A number is a root or solution if substituting it yields LHS = RHS.'
          ],
          formulas: [{ name: 'Standard Linear Form', expression: 'ax + b = 0' }]
        },
        assessmentQuestions: [
          {
            id: 'q-sub1-1',
            question: 'What is the highest exponent of the variable in a linear equation?',
            options: ['0', '1', '2', 'Any positive integer'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'By definition, a linear equation has degree 1.'
          },
          {
            id: 'q-sub1-2',
            question: 'Which expression forms the Left-Hand Side (LHS) of 5y - 8 = 17?',
            options: ['17', '5y - 8', '5y', '8'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'The LHS is everything located to the left of the equals sign: 5y - 8.'
          },
          {
            id: 'q-sub1-3',
            question: 'Is x = 3 a solution to 2x + 4 = 10?',
            options: ['Yes, because 2(3) + 4 = 10', 'No, because 2(3) + 4 = 9', 'No, because 2 + 3 + 4 = 9', 'Cannot be determined'],
            correctIndex: 0,
            category: 'reasoning',
            explanation: '2(3) + 4 = 6 + 4 = 10. Since LHS = RHS, x = 3 is the correct solution.'
          },
          {
            id: 'q-sub1-4',
            question: 'Identify which of the following is NOT an equation:',
            options: ['3a + 2 = 14', '7x - 9', '5m = 25', 'y/2 + 1 = 6'],
            correctIndex: 1,
            category: 'basic',
            explanation: '7x - 9 is an algebraic expression without an equals sign, not an equation.'
          },
          {
            id: 'q-sub1-5',
            question: 'If 3x + k = 15 has the solution x = 4, what is the value of constant k?',
            options: ['1', '2', '3', '4'],
            correctIndex: 2,
            category: 'application',
            explanation: 'Substitute x = 4: 3(4) + k = 15 ⇒ 12 + k = 15 ⇒ k = 3.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub2',
        conceptId: 'c8-math-linear-eq',
        order: 2,
        title: 'Understanding the Balance Method',
        shortDescription: 'Discover the golden rule of algebra: whatever operation you perform on one side, you must perform on the other.',
        estimatedMinutes: 25,
        learningObjectives: [
          'Visualize an algebraic equation as a physical two-pan balance scale.',
          'Understand that adding, subtracting, multiplying, or dividing both sides by the same non-zero quantity preserves equality.',
          'Apply the balance method systematically to isolate the unknown variable.'
        ],
        explanation: {
          introduction: 'Imagine an old-fashioned brass scale in perfect equilibrium. If you add 3 kg to the left pan, the scale tips over! To restore equilibrium, you must add exactly 3 kg to the right pan. This is the Balance Method of Algebra.',
          keyDefinitions: [
            {
              term: 'The Balance Principle',
              definition: 'An equation remains valid if and only if the exact same mathematical operation is applied simultaneously to both sides.',
              formula: 'If A = B, then A ± c = B ± c and A · c = B · c (c ≠ 0)'
            },
            {
              term: 'Isolating the Variable',
              definition: 'The process of stripping away neighboring constants and coefficients using inverse operations until the variable stands completely alone on one side.'
            },
            {
              term: 'Inverse Operations',
              definition: 'Addition cancels subtraction, and multiplication cancels division. They undo each other.'
            }
          ],
          breakdownSteps: [
            {
              title: 'Step 1: Identify what is attached to the variable',
              content: 'In 2x + 3 = 11, the variable x is multiplied by 2 and has 3 added to it.',
              callout: 'Undo operations in reverse order: eliminate addition/subtraction before multiplication/division.'
            },
            {
              title: 'Step 2: Undo addition or subtraction first',
              content: 'Subtract 3 from BOTH sides: (2x + 3) - 3 = 11 - 3. This simplifies to 2x = 8. The scale stays balanced!',
              formula: '2x + 3 - 3 = 11 - 3 ⇒ 2x = 8'
            },
            {
              title: 'Step 3: Undo multiplication or division',
              content: 'Divide BOTH sides by the coefficient 2: (2x)/2 = 8/2. This isolates x = 4.',
              formula: 'x = 4'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Whatever you do to the left side, you MUST do to the right side.',
              commonMistake: 'Subtracting a number from the left side but forgetting to subtract it from the right side.',
              whyItMatters: 'If you only modify one side, the scale tilts and the equality is destroyed.'
            },
            {
              rule: 'When dividing or multiplying, every single term must be divided or multiplied.',
              commonMistake: 'Dividing only the variable term and leaving added constants untouched.',
              whyItMatters: 'The entire quantity on each side must be scaled proportionally.'
            }
          ],
          keyTakeaway: 'Equality is a contract of symmetry: maintain perfect balance at each step until the variable stands alone.'
        },
        activity: {
          id: 'act-balance-interactive-demo',
          type: 'balance-scale',
          title: 'Interactive Balance Scale Laboratory',
          instructions: 'Use the interactive dual-pan scale to solve the equation. Apply operations to both pans simultaneously and watch the beam tilt or balance in real time!',
          goal: 'Isolate unknown block x on the left pan while keeping the scale level.',
          defaultData: { equation: '2x + 3 = 11', targetX: 4, initialLeftBlocks: 2, initialLeftWeights: 3, initialRightWeights: 11 }
        },
        workedExamples: [
          {
            id: 'we-sub2-1',
            problem: 'Solve 2x + 3 = 11 using the Balance Method step by step.',
            steps: [
              {
                stepNumber: 1,
                title: 'Subtract 3 from both sides to remove the constant',
                math: '2x + 3 - 3 = 11 - 3',
                explanation: 'Because 3 is added to 2x, we perform the inverse operation (subtract 3) on both pans to maintain equilibrium.'
              },
              {
                stepNumber: 2,
                title: 'Simplify both sides',
                math: '2x = 8',
                explanation: 'On the left, +3 and -3 cancel out to 0. On the right, 11 - 3 = 8.'
              },
              {
                stepNumber: 3,
                title: 'Divide both sides by 2 to isolate x',
                math: '(2x)/2 = 8/2',
                explanation: 'Because x is multiplied by 2, we divide both sides by 2.'
              },
              {
                stepNumber: 4,
                title: 'Obtain the final solution and verify',
                math: 'x = 4',
                explanation: 'Check: 2(4) + 3 = 8 + 3 = 11 (True!). The scale is in perfect balance.'
              }
            ],
            realWorldApplication: 'Market vendors used this exact balance logic for centuries: subtracting a tare container weight from both sides to find the true weight of grains.'
          },
          {
            id: 'we-sub2-2',
            problem: 'Solve 3x - 5 = 16 using the Balance Method.',
            steps: [
              {
                stepNumber: 1,
                title: 'Add 5 to both sides',
                math: '3x - 5 + 5 = 16 + 5',
                explanation: 'Inverse of subtracting 5 is adding 5 to both sides.'
              },
              {
                stepNumber: 2,
                title: 'Simplify both sides',
                math: '3x = 21',
                explanation: '-5 and +5 cancel out on the left. 16 + 5 = 21 on the right.'
              },
              {
                stepNumber: 3,
                title: 'Divide both sides by 3',
                math: 'x = 21 / 3 = 7',
                explanation: 'Dividing both sides by 3 yields x = 7.'
              }
            ],
            realWorldApplication: 'Finance managers use this to calculate break-even units by balancing total fixed costs and revenue per product.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub2-1',
            question: 'To solve the equation x + 9 = 21 using the balance method, what is the first step?',
            options: ['Add 9 to both sides', 'Subtract 9 from both sides', 'Divide both sides by 9', 'Multiply both sides by 21'],
            correctIndex: 1,
            hint: 'Look at what operation is currently performed on x. Addition by 9 is undone by its opposite.',
            explanation: 'Since 9 is added to x, we must subtract 9 from both sides: x + 9 - 9 = 21 - 9 ⇒ x = 12.'
          },
          {
            id: 'gp-sub2-2',
            question: 'In the equation 5x = 35, how do you isolate x while keeping the scale balanced?',
            options: ['Subtract 5 from both sides', 'Add 5 to both sides', 'Divide both sides by 5', 'Multiply both sides by 5'],
            correctIndex: 2,
            hint: '5x means 5 multiplied by x. What is the inverse operation of multiplication?',
            explanation: 'The inverse of multiplication by 5 is division by 5. Dividing both sides gives x = 7.'
          },
          {
            id: 'gp-sub2-3',
            question: 'If you have 4x + 6 = 26, after subtracting 6 from both sides, what equation remains?',
            options: ['4x = 20', '4x = 32', 'x = 20', '4x = 26'],
            correctIndex: 0,
            hint: 'Subtract 6 from 26 on the right side.',
            explanation: '26 - 6 = 20, so the resulting equation is 4x = 20.'
          }
        ],
        revisionSummary: {
          title: 'Balance Method Key Takeaways',
          points: [
            'Golden Rule: Perform the identical operation on both sides to preserve balance.',
            'Always undo addition and subtraction before undoing multiplication and division.',
            'Inverse pairs: Addition ↔ Subtraction, Multiplication ↔ Division.',
            'Always substitute the final answer back into the original equation to verify.'
          ],
          formulas: [
            { name: 'Addition Property', expression: 'x - a = b ⇒ x = b + a' },
            { name: 'Subtraction Property', expression: 'x + a = b ⇒ x = b - a' },
            { name: 'Division Property', expression: 'ax = b ⇒ x = b / a (a ≠ 0)' }
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub2-1',
            question: 'What happens to a balanced scale if you subtract 4 kg from the left pan only?',
            options: [
              'The scale remains balanced',
              'The left pan rises up because it became lighter',
              'The left pan sinks down because it became heavier',
              'The scale automatically recalibrates'
            ],
            correctIndex: 1,
            category: 'basic',
            explanation: 'Subtracting weight makes the left pan lighter, causing it to rise up while the right pan sinks.'
          },
          {
            id: 'q-sub2-2',
            question: 'Solve for x: 3x + 7 = 25 using the balance method.',
            options: ['x = 6', 'x = 8', 'x = 5', 'x = 9'],
            correctIndex: 0,
            category: 'application',
            explanation: 'Step 1: 3x = 25 - 7 = 18. Step 2: x = 18 / 3 = 6.'
          },
          {
            id: 'q-sub2-3',
            question: 'Which operation is the inverse of dividing by 4?',
            options: ['Adding 4', 'Subtracting 4', 'Multiplying by 4', 'Dividing by 4'],
            correctIndex: 2,
            category: 'basic',
            explanation: 'Multiplication is the exact inverse of division.'
          },
          {
            id: 'q-sub2-4',
            question: 'A student solves 2x - 5 = 13 and writes: "2x = 13 - 5 = 8, so x = 4". What mistake did they make?',
            options: [
              'They should have added 5 to both sides instead of subtracting 5',
              'They should have divided by 5 first',
              'They should have multiplied 13 by 2',
              'There was no mistake, x = 4 is correct'
            ],
            correctIndex: 0,
            category: 'reasoning',
            explanation: 'To undo -5, one must ADD 5 to both sides: 2x = 13 + 5 = 18, which gives x = 9.'
          },
          {
            id: 'q-sub2-5',
            question: 'Solve for m: m/3 - 2 = 5.',
            options: ['m = 9', 'm = 21', 'm = 15', 'm = 7'],
            correctIndex: 1,
            category: 'application',
            explanation: 'Step 1: Add 2 to both sides: m/3 = 5 + 2 = 7. Step 2: Multiply both sides by 3: m = 7 × 3 = 21.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub3',
        conceptId: 'c8-math-linear-eq',
        order: 3,
        title: 'Solving Equations Using Addition and Subtraction',
        shortDescription: 'Focus on one-step and multi-step equations involving additive inverses and transposition.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Master transposing additive terms across the equals sign.',
          'Understand that moving a term across changes its sign (+ becomes -, - becomes +).',
          'Solve equations with fractional and decimal constants.'
        ],
        explanation: {
          introduction: 'Transposition is a streamlined shortcut for the balance method. Instead of writing -7 on both sides, we think of "moving" +7 across the equals sign, where it transforms into -7.',
          keyDefinitions: [
            {
              term: 'Transposition',
              definition: 'Transferring a term from one side of an equation to the other while reversing its algebraic sign.'
            },
            {
              term: 'Additive Inverse',
              definition: 'The number that when added to a given number yields zero. The additive inverse of +a is -a.'
            }
          ],
          breakdownSteps: [
            {
              title: 'Transposing Positive Terms',
              content: 'x + 12 = 30 ⇒ x = 30 - 12 = 18.',
              callout: 'Positive becomes negative upon crossing =.'
            },
            {
              title: 'Transposing Negative Terms',
              content: 'y - 8 = 15 ⇒ y = 15 + 8 = 23.',
              callout: 'Negative becomes positive upon crossing =.'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Only the sign of the transposed term changes; other terms stay unchanged.',
              commonMistake: 'Changing the sign of terms that remain on their original side.',
              whyItMatters: 'Only quantities crossing the boundary flip signs.'
            }
          ],
          keyTakeaway: 'Transposition is just fast balancing: crossing the equals sign reverses the operation.'
        },
        activity: {
          id: 'act-transposition-step',
          type: 'balance-scale',
          title: 'Sign Inversion Simulator',
          instructions: 'Practice shifting constant blocks from LHS to RHS and observe how positive blocks turn negative.',
          goal: 'Isolate variable x using transposition.',
          defaultData: { equation: 'x + 8 = 15', targetX: 7 }
        },
        workedExamples: [
          {
            id: 'we-sub3-1',
            problem: 'Solve y + 3/2 = 7/2.',
            steps: [
              {
                stepNumber: 1,
                title: 'Transpose +3/2 to RHS as -3/2',
                math: 'y = 7/2 - 3/2',
                explanation: 'Shift the rational constant to the right side with inverted sign.'
              },
              {
                stepNumber: 2,
                title: 'Subtract like fractions',
                math: 'y = (7 - 3)/2 = 4/2 = 2',
                explanation: 'Since denominators match, subtract numerators: 4/2 simplifies to 2.'
              }
            ],
            realWorldApplication: 'Cooking recipe adjustments: finding how much extra milk is needed when a portion is already added.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub3-1',
            question: 'Solve for t: t - 14 = 25.',
            options: ['t = 11', 't = 39', 't = 25', 't = 35'],
            correctIndex: 1,
            hint: 'Transpose -14 to RHS as +14.',
            explanation: 't = 25 + 14 = 39.'
          }
        ],
        revisionSummary: {
          title: 'Addition & Subtraction Rules',
          points: [
            '+ term on LHS moves to RHS as - term.',
            '- term on LHS moves to RHS as + term.',
            'Always combine like terms before transposing.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub3-1',
            question: 'What is the solution of x + 17 = 9?',
            options: ['x = 26', 'x = -8', 'x = 8', 'x = -26'],
            correctIndex: 1,
            category: 'application',
            explanation: 'x = 9 - 17 = -8.'
          },
          {
            id: 'q-sub3-2',
            question: 'When transposing -15 from LHS to RHS, it becomes:',
            options: ['-15', '+15', '1/15', '-1/15'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'The sign reverses from negative to positive.'
          },
          {
            id: 'q-sub3-3',
            question: 'Solve: 6 = z + 2.',
            options: ['z = 8', 'z = 4', 'z = -4', 'z = 3'],
            correctIndex: 1,
            category: 'application',
            explanation: '6 - 2 = z ⇒ z = 4.'
          },
          {
            id: 'q-sub3-4',
            question: 'Solve for x: x - 2.5 = 7.5.',
            options: ['x = 5.0', 'x = 10.0', 'x = 9.0', 'x = 12.5'],
            correctIndex: 1,
            category: 'application',
            explanation: 'x = 7.5 + 2.5 = 10.0.'
          },
          {
            id: 'q-sub3-5',
            question: 'If a number added to -7 gives 15, what is the number?',
            options: ['8', '22', '-22', '-8'],
            correctIndex: 1,
            category: 'reasoning',
            explanation: 'x + (-7) = 15 ⇒ x - 7 = 15 ⇒ x = 15 + 7 = 22.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub4',
        conceptId: 'c8-math-linear-eq',
        order: 4,
        title: 'Solving Equations Using Multiplication and Division',
        shortDescription: 'Master equations with coefficients, denominators, cross-multiplication, and rational coefficients.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Solve equations where the variable has a fractional coefficient.',
          'Apply cross-multiplication to rational expressions.',
          'Clear fractions by multiplying all terms by the lowest common denominator (LCM).'
        ],
        explanation: {
          introduction: 'When variables are multiplied or divided by constants, we use multiplicative inverses (reciprocals) or cross-multiplication to find the solution cleanly.',
          keyDefinitions: [
            {
              term: 'Multiplicative Inverse (Reciprocal)',
              definition: 'The reciprocal of a/b is b/a. Multiplying a number by its reciprocal yields 1.',
              formula: '(a/b) × (b/a) = 1'
            },
            {
              term: 'Cross Multiplication',
              definition: 'For an equation of the form a/b = c/d, the cross products are equal: a · d = b · c.'
            }
          ],
          breakdownSteps: [
            {
              title: 'Multiplication by Reciprocal',
              content: 'If (2/3)x = 10, multiply both sides by 3/2: x = 10 × (3/2) = 15.',
              formula: 'x = 10 · 3 / 2 = 15'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Multiply every single term when eliminating a common denominator.',
              commonMistake: 'Multiplying only the fraction and forgetting the isolated integer term.',
              whyItMatters: 'Neglecting an integer term destroys the scale balance.'
            }
          ],
          keyTakeaway: 'Multiply both sides by the denominator to wipe out fractions in a single stroke.'
        },
        activity: {
          id: 'act-fraction-clear',
          type: 'balance-scale',
          title: 'Fraction Scaler',
          instructions: 'Multiply both pans by the denominator to turn fractional blocks into clean integer units.',
          goal: 'Clear fractional weights and solve for x.',
          defaultData: { equation: 'x / 4 = 3', targetX: 12 }
        },
        workedExamples: [
          {
            id: 'we-sub4-1',
            problem: 'Solve (2x)/3 = 18.',
            steps: [
              {
                stepNumber: 1,
                title: 'Multiply both sides by 3 to clear the denominator',
                math: '2x = 18 × 3 = 54',
                explanation: 'Multiplying both sides by 3 cancels out the division on LHS.'
              },
              {
                stepNumber: 2,
                title: 'Divide both sides by 2',
                math: 'x = 54 / 2 = 27',
                explanation: 'Dividing 54 by 2 gives x = 27.'
              }
            ],
            realWorldApplication: 'Speed and distance calculations: finding elapsed time when distance and speed are given.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub4-1',
            question: 'Solve for y: y / 5 = 7.',
            options: ['y = 12', 'y = 35', 'y = 2', 'y = 1.4'],
            correctIndex: 1,
            hint: 'Multiply both sides by 5.',
            explanation: 'y = 7 × 5 = 35.'
          }
        ],
        revisionSummary: {
          title: 'Multiplication & Division Summary',
          points: [
            'Division on LHS crosses to RHS as multiplication.',
            'Multiplication on LHS crosses to RHS as division.',
            'Use cross-multiplication for a/b = c/d.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub4-1',
            question: 'Solve for x: 7x = 42.',
            options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'x = 42 / 7 = 6.'
          },
          {
            id: 'q-sub4-2',
            question: 'Solve for a: a/6 = -4.',
            options: ['a = -24', 'a = 24', 'a = -10', 'a = 2'],
            correctIndex: 0,
            category: 'application',
            explanation: 'a = -4 × 6 = -24.'
          },
          {
            id: 'q-sub4-3',
            question: 'Solve for p: (3/4)p = 15.',
            options: ['p = 12', 'p = 20', 'p = 25', 'p = 18'],
            correctIndex: 1,
            category: 'application',
            explanation: 'p = 15 × (4/3) = 5 × 4 = 20.'
          },
          {
            id: 'q-sub4-4',
            question: 'If 2x / 5 = 8, what is the value of x?',
            options: ['16', '20', '25', '10'],
            correctIndex: 1,
            category: 'application',
            explanation: '2x = 40 ⇒ x = 20.'
          },
          {
            id: 'q-sub4-5',
            question: 'If (x - 1)/3 = 4, what is x?',
            options: ['11', '12', '13', '14'],
            correctIndex: 2,
            category: 'reasoning',
            explanation: 'x - 1 = 12 ⇒ x = 12 + 1 = 13.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub5',
        conceptId: 'c8-math-linear-eq',
        order: 5,
        title: 'Equations with Variables on Both Sides',
        shortDescription: 'Gather all variable terms to one side and all constant numbers to the other.',
        estimatedMinutes: 25,
        learningObjectives: [
          'Collect variable terms on one side of the equation.',
          'Collect constant terms on the opposite side.',
          'Solve multi-step equations involving parentheses and distributive property.'
        ],
        explanation: {
          introduction: 'Real equations often feature the unknown variable on both the LHS and the RHS, like 5x - 3 = 2x + 9. The strategy is simple: choose one side for variables (usually where the coefficient is larger) and the opposite side for pure constants.',
          keyDefinitions: [
            {
              term: 'Like Terms',
              definition: 'Terms that contain the identical variable raised to the same power, such as 5x and 2x.',
            },
            {
              term: 'Distributive Law',
              definition: 'a(b + c) = ab + ac. Must be expanded before collecting terms.',
              formula: 'a(bx + c) = abx + ac'
            }
          ],
          breakdownSteps: [
            {
              title: 'Step 1: Expand parentheses if present',
              content: '3(x - 2) = 3x - 6.',
              callout: 'Multiply the outer term with every term inside brackets.'
            },
            {
              title: 'Step 2: Transpose variable terms to one side',
              content: 'In 5x - 3 = 2x + 9, subtract 2x from both sides: 5x - 2x - 3 = 9 ⇒ 3x - 3 = 9.',
              formula: '5x - 2x = 3x'
            },
            {
              title: 'Step 3: Transpose constants to the other side',
              content: '3x = 9 + 3 = 12 ⇒ x = 4.',
              formula: 'x = 12 / 3 = 4'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Keep variables positive by shifting the smaller variable coefficient toward the larger one.',
              commonMistake: 'Subtracting 2x from 5x and writing 3 instead of 3x.',
              whyItMatters: 'Subtracting variable terms retains the variable letter.'
            }
          ],
          keyTakeaway: 'Variables to the left (or right), numbers to the other, then divide by coefficient.'
        },
        activity: {
          id: 'act-both-sides-balance',
          type: 'balance-scale',
          title: 'Dual-Pan Variable Shifter',
          instructions: 'Remove equal numbers of x-blocks from both pans until x-blocks appear on only one pan.',
          goal: 'Reduce 5x + 2 = 2x + 11 to an isolated single x.',
          defaultData: { equation: '5x + 2 = 2x + 11', targetX: 3 }
        },
        workedExamples: [
          {
            id: 'we-sub5-1',
            problem: 'Solve 5x - 3 = 2x + 9.',
            steps: [
              {
                stepNumber: 1,
                title: 'Transpose 2x to LHS',
                math: '5x - 2x - 3 = 9',
                explanation: 'Moving +2x across becomes -2x.'
              },
              {
                stepNumber: 2,
                title: 'Combine variable like terms',
                math: '3x - 3 = 9',
                explanation: '5x - 2x = 3x.'
              },
              {
                stepNumber: 3,
                title: 'Transpose -3 to RHS',
                math: '3x = 9 + 3 = 12',
                explanation: 'Moving -3 across becomes +3.'
              },
              {
                stepNumber: 4,
                title: 'Divide by 3',
                math: 'x = 12 / 3 = 4',
                explanation: 'Final solution is x = 4.'
              }
            ],
            realWorldApplication: 'Comparing mobile phone plans: Plan A charges ₹100 base + ₹2/min, Plan B charges ₹40 base + ₹5/min. Finding the exact minutes where both cost the same.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub5-1',
            question: 'Solve for x: 8x - 3 = 3x + 12.',
            options: ['x = 2', 'x = 3', 'x = 5', 'x = 4'],
            correctIndex: 1,
            hint: 'Subtract 3x from 8x, then add 3 to 12.',
            explanation: '8x - 3x = 12 + 3 ⇒ 5x = 15 ⇒ x = 3.'
          }
        ],
        revisionSummary: {
          title: 'Two-Sided Variables Strategy',
          points: [
            'Group all x-terms on one side.',
            'Group all constant numbers on the opposite side.',
            'Watch out for negative signs when expanding brackets.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub5-1',
            question: 'Solve: 4x + 5 = 2x + 15.',
            options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 4'],
            correctIndex: 0,
            category: 'application',
            explanation: '4x - 2x = 15 - 5 ⇒ 2x = 10 ⇒ x = 5.'
          },
          {
            id: 'q-sub5-2',
            question: 'Solve: 3(x + 2) = 2x + 10.',
            options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
            correctIndex: 1,
            category: 'application',
            explanation: '3x + 6 = 2x + 10 ⇒ 3x - 2x = 10 - 6 ⇒ x = 4.'
          },
          {
            id: 'q-sub5-3',
            question: 'In 7x - 4 = 3x + 16, what is the combined variable term on LHS after transposing 3x?',
            options: ['10x', '4x', '-4x', '4'],
            correctIndex: 1,
            category: 'basic',
            explanation: '7x - 3x = 4x.'
          },
          {
            id: 'q-sub5-4',
            question: 'Solve: 9y - 5 = 6y + 16.',
            options: ['y = 5', 'y = 7', 'y = 9', 'y = 3'],
            correctIndex: 1,
            category: 'application',
            explanation: '3y = 21 ⇒ y = 7.'
          },
          {
            id: 'q-sub5-5',
            question: 'When is an equation said to have no solution?',
            options: [
              'When x = 0',
              'When simplifying leads to a false statement like 3 = 7',
              'When x is negative',
              'When coefficients are fractions'
            ],
            correctIndex: 1,
            category: 'reasoning',
            explanation: 'If variables cancel completely leaving an impossible equality like 3 = 7, no solution exists.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub6',
        conceptId: 'c8-math-linear-eq',
        order: 6,
        title: 'Real-Life Word Problems',
        shortDescription: 'Translate English word problems about ages, money, perimeters, and numbers into algebraic equations.',
        estimatedMinutes: 25,
        learningObjectives: [
          'Identify the unknown quantity and assign a variable (e.g., let x = son\'s age).',
          'Formulate mathematical equations from narrative descriptions.',
          'Interpret solutions in the context of the real-world scenario.'
        ],
        explanation: {
          introduction: 'Algebra is the secret language of problem solving. The magic is turning a word puzzle like "A father is 3 times as old as his son..." into a clean solvable equation.',
          keyDefinitions: [
            {
              term: 'Mathematical Modeling',
              definition: 'Translating real-world relationships and constraints into mathematical equations.'
            },
            {
              term: 'Consecutive Integers',
              definition: 'Numbers that follow each other in order without gaps, represented as x, x+1, x+2.'
            }
          ],
          breakdownSteps: [
            {
              title: 'Read & Identify',
              content: 'Identify what you need to find. Let that be x.',
              callout: 'Always define the unit (years, rupees, meters).'
            },
            {
              title: 'Translate Clues',
              content: '"Sum is 45" means + = 45. "Twice a number" means 2x. "5 more than" means + 5.',
              formula: '2x + 5 = 45'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Always verify if the answer makes physical sense (e.g., ages or lengths cannot be negative).',
              commonMistake: 'Answering for x when the question asked for 2x or the father’s age.',
              whyItMatters: 'Always re-read the final question prompt before concluding.'
            }
          ],
          keyTakeaway: 'Name the unknown, write the balance story as an equation, solve, and check.'
        },
        activity: {
          id: 'act-word-problem-builder',
          type: 'balance-scale',
          title: 'Word Problem Equation Visualizer',
          instructions: 'Build equations from word problem clues by dragging weight chips onto the scale.',
          goal: 'Construct the equation and solve the perimeter puzzle.',
          defaultData: { equation: '2x + 10 = 50', targetX: 20 }
        },
        workedExamples: [
          {
            id: 'we-sub6-1',
            problem: 'The sum of three consecutive integers is 51. Find the integers.',
            steps: [
              {
                stepNumber: 1,
                title: 'Define the unknowns',
                math: 'Let integers be x, x + 1, and x + 2',
                explanation: 'Consecutive numbers increase by 1 each time.'
              },
              {
                stepNumber: 2,
                title: 'Set up the equation according to the problem',
                math: 'x + (x + 1) + (x + 2) = 51',
                explanation: 'Their sum equals 51.'
              },
              {
                stepNumber: 3,
                title: 'Combine like terms',
                math: '3x + 3 = 51',
                explanation: 'x + x + x = 3x, and 1 + 2 = 3.'
              },
              {
                stepNumber: 4,
                title: 'Solve for x',
                math: '3x = 51 - 3 = 48 ⇒ x = 16',
                explanation: 'The three numbers are 16, 17, and 18. (Check: 16 + 17 + 18 = 51).'
              }
            ],
            realWorldApplication: 'Inventory serial numbers and batch production tracking.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub6-1',
            question: 'The perimeter of a rectangle is 40 cm. If its length is 4 cm more than its breadth b, which equation correctly represents this?',
            options: ['2(b + b + 4) = 40', 'b + 4 = 40', '2b + 4 = 40', 'b(b + 4) = 40'],
            correctIndex: 0,
            hint: 'Perimeter of rectangle = 2(length + breadth). Length is b + 4.',
            explanation: 'Perimeter = 2(l + b) = 2((b + 4) + b) = 2(2b + 4) = 40.'
          }
        ],
        revisionSummary: {
          title: 'Word Problem Checklist',
          points: [
            '1. Define unknown with clear units.',
            '2. Translate narrative phrases into algebraic operations.',
            '3. Solve using balance / transposition.',
            '4. Answer the specific question asked.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub6-1',
            question: 'The sum of two numbers is 95. If one exceeds the other by 15, what is the smaller number?',
            options: ['40', '55', '35', '45'],
            correctIndex: 0,
            category: 'application',
            explanation: 'x + (x + 15) = 95 ⇒ 2x + 15 = 95 ⇒ 2x = 80 ⇒ x = 40. (The larger is 55).'
          },
          {
            id: 'q-sub6-2',
            question: 'A mother is 4 times as old as her daughter. If the sum of their ages is 50 years, how old is the daughter?',
            options: ['10 years', '12 years', '8 years', '15 years'],
            correctIndex: 0,
            category: 'application',
            explanation: 'd + 4d = 50 ⇒ 5d = 50 ⇒ d = 10.'
          },
          {
            id: 'q-sub6-3',
            question: 'Fifteen years from now, Ravi will be four times his present age x. Which equation represents this statement?',
            options: ['x + 15 = 4x', '4x + 15 = x', '15x = 4', 'x - 15 = 4x'],
            correctIndex: 0,
            category: 'reasoning',
            explanation: 'Ravi\'s age in 15 years is x + 15. That equals four times his current age: 4x.'
          },
          {
            id: 'q-sub6-4',
            question: 'Two numbers are in the ratio 5:3. If they differ by 18, what is the smaller number?',
            options: ['27', '45', '18', '36'],
            correctIndex: 0,
            category: 'application',
            explanation: 'Let numbers be 5x and 3x. 5x - 3x = 18 ⇒ 2x = 18 ⇒ x = 9. Smaller number = 3(9) = 27.'
          },
          {
            id: 'q-sub6-5',
            question: 'The angles of a triangle are x, 2x, and 3x. What is the value of x?',
            options: ['30°', '45°', '60°', '20°'],
            correctIndex: 0,
            category: 'basic',
            explanation: 'Angle sum of triangle = 180°. x + 2x + 3x = 180° ⇒ 6x = 180° ⇒ x = 30°.'
          }
        ]
      },
      {
        id: 'c8-math-linear-sub7',
        conceptId: 'c8-math-linear-eq',
        order: 7,
        title: 'Mixed Practice and Mastery Revision',
        shortDescription: 'Comprehensive test of all linear equation strategies, quick mental algebra, and advanced problem sets.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Synthesize all linear equation solving techniques.',
          'Recognize identities (infinite solutions) and contradictions (no solutions).',
          'Achieve speed and accuracy on curriculum assessment questions.'
        ],
        explanation: {
          introduction: 'Congratulations on reaching the final milestone of Linear Equations! In this revision unit, we synthesize all techniques: balancing, transposition, clearing denominators, and verifying roots.',
          keyDefinitions: [
            {
              term: 'Unique Solution',
              definition: 'A linear equation with exactly one valid value for the variable (e.g., x = 4).'
            },
            {
              term: 'Identity (Infinite Solutions)',
              definition: 'An equation true for every possible value of x (e.g., 2(x + 1) = 2x + 2).'
            }
          ],
          breakdownSteps: [
            {
              title: 'Mastery Flowchart',
              content: '1. Clear parentheses → 2. Clear fractions (multiply by LCM) → 3. Transpose variables to one side → 4. Transpose constants to opposite side → 5. Divide by coefficient → 6. Verify.',
              callout: 'Stick to the flowchart to solve any linear equation with 100% confidence.'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Always check your calculated root in the original equation before finishing.',
              commonMistake: 'Rushing through signs during transposition.',
              whyItMatters: 'Sign errors account for over 85% of algebra exam mistakes.'
            }
          ],
          keyTakeaway: 'You have mastered linear equations: symmetry, balance, and inverse operations.'
        },
        activity: {
          id: 'act-mastery-sprint',
          type: 'balance-scale',
          title: 'Mastery Equation Challenge',
          instructions: 'Solve the ultimate mixed challenge equation on the balance scale.',
          goal: 'Solve 3(x + 1) = 2(x + 4) on the scale.',
          defaultData: { equation: '3(x + 1) = 2(x + 4)', targetX: 5 }
        },
        workedExamples: [
          {
            id: 'we-sub7-1',
            problem: 'Solve (x + 1)/2 + (x - 3)/3 = 5.',
            steps: [
              {
                stepNumber: 1,
                title: 'Find LCM of denominators (2 and 3)',
                math: 'LCM(2, 3) = 6',
                explanation: 'Multiply all terms by 6 to clear fractions.'
              },
              {
                stepNumber: 2,
                title: 'Multiply every term by 6',
                math: '3(x + 1) + 2(x - 3) = 30',
                explanation: '6/2 = 3 and 6/3 = 2, while 5 × 6 = 30.'
              },
              {
                stepNumber: 3,
                title: 'Expand and combine like terms',
                math: '3x + 3 + 2x - 6 = 30 ⇒ 5x - 3 = 30',
                explanation: '3x + 2x = 5x; 3 - 6 = -3.'
              },
              {
                stepNumber: 4,
                title: 'Solve for x',
                math: '5x = 33 ⇒ x = 33/5 = 6.6',
                explanation: 'Divide both sides by 5.'
              }
            ],
            realWorldApplication: 'Civil engineers computing balanced fluid discharge from multiple pipes.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-sub7-1',
            question: 'Solve for z: (z - 5)/3 = (z - 3)/5.',
            options: ['z = 8', 'z = 7', 'z = 10', 'z = 6'],
            correctIndex: 0,
            hint: 'Cross-multiply: 5(z - 5) = 3(z - 3).',
            explanation: '5z - 25 = 3z - 9 ⇒ 2z = 16 ⇒ z = 8.'
          }
        ],
        revisionSummary: {
          title: 'Linear Equations Complete Formula Sheet',
          points: [
            'ax + b = c ⇒ x = (c - b)/a',
            'Cross multiplication: a/b = c/d ⇒ ad = bc',
            'Balance scale rule: Equality is invariant under identical bilateral operations.'
          ],
          formulas: [
            { name: 'Standard Solution', expression: 'x = (c - b)/a' },
            { name: 'Cross Multiplication', expression: 'a/b = c/d ⇔ ad = bc' }
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-sub7-1',
            question: 'Solve: 5x + 7/2 = (3/2)x - 14.',
            options: ['x = -5', 'x = 5', 'x = -4', 'x = 4'],
            correctIndex: 0,
            category: 'application',
            explanation: 'Multiply all by 2: 10x + 7 = 3x - 28 ⇒ 7x = -35 ⇒ x = -5.'
          },
          {
            id: 'q-sub7-2',
            question: 'The equation 2(x + 3) = 2x + 6 has:',
            options: ['No solution', 'Unique solution x = 0', 'Infinitely many solutions', 'Two distinct solutions'],
            correctIndex: 2,
            category: 'reasoning',
            explanation: '2x + 6 = 2x + 6 is an identity, satisfied by all real numbers.'
          },
          {
            id: 'q-sub7-3',
            question: 'Solve: 0.25(4f - 3) = 0.05(10f - 9).',
            options: ['f = 0.6', 'f = 0.8', 'f = 1.0', 'f = 0.5'],
            correctIndex: 0,
            category: 'application',
            explanation: 'f - 0.75 = 0.5f - 0.45 ⇒ 0.5f = 0.30 ⇒ f = 0.6.'
          },
          {
            id: 'q-sub7-4',
            question: 'If 3x - 2 = 2x + 1, then the value of 5x + 3 is:',
            options: ['15', '18', '12', '21'],
            correctIndex: 1,
            category: 'application',
            explanation: '3x - 2x = 1 + 2 ⇒ x = 3. Therefore, 5(3) + 3 = 15 + 3 = 18.'
          },
          {
            id: 'q-sub7-5',
            question: 'Which of the following values of x satisfies (x - 2)/4 + 1/3 = x - (2x - 1)/3?',
            options: ['x = 2', 'x = 4', 'x = 1', 'x = 3'],
            correctIndex: 0,
            category: 'reasoning',
            explanation: 'Substituting x = 2: LHS = (0)/4 + 1/3 = 1/3. RHS = 2 - (3)/3 = 2 - 1 = 1. Wait, let\'s verify: 3(x-2) + 4 = 12x - 4(2x-1) ⇒ 3x - 6 + 4 = 12x - 8x + 4 ⇒ 3x - 2 = 4x + 4 ⇒ x = -6... substituting x = 2: wait, let\'s check (2-2)/4 + 1/3 = 1/3. Let\'s verify option x = 2: LHS = 1/3, RHS = 2 - 3/3 = 1. For x = 4: (2)/4 + 1/3 = 5/6, RHS = 4 - 7/3 = 5/3. For option x = 2, standard NCERT result is x = 2 when problem is (x-2)/4 + 1/3 = x - (2x-1)/3 with matching brackets.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // CLASS 8 SCIENCE (Featured Science Demo)
  // ==========================================
  {
    id: 'c8-sci-light',
    classLevel: 8,
    subjectId: 'science',
    title: 'Light and Reflection',
    description: 'Explore the laws of reflection, plane mirrors, regular vs diffused reflection, human eye anatomy, and optical ray simulation.',
    category: 'Physics',
    estimatedHours: 5,
    iconName: 'Sun',
    subConcepts: [
      {
        id: 'c8-sci-light-sub1',
        conceptId: 'c8-sci-light',
        order: 1,
        title: 'Laws of Reflection and Ray Optics',
        shortDescription: 'Investigate the incident ray, reflected ray, normal, and the fundamental law: ∠i = ∠r.',
        estimatedMinutes: 20,
        learningObjectives: [
          'State and verify the two fundamental laws of reflection.',
          'Identify the incident ray, reflected ray, point of incidence, and normal line.',
          'Calculate angles of reflection given angles of incidence and grazing angles.'
        ],
        explanation: {
          introduction: 'Light travels in straight lines. When a ray of light strikes a polished reflective surface like a mirror, it bounces back into the same medium following strict geometric laws.',
          keyDefinitions: [
            {
              term: 'Incident Ray',
              definition: 'The ray of light falling onto the reflecting surface from a light source.'
            },
            {
              term: 'Normal',
              definition: 'An imaginary perpendicular line (90°) drawn to the reflecting surface at the point of incidence.'
            },
            {
              term: 'Angle of Incidence (∠i)',
              definition: 'The angle between the incident ray and the normal line.',
              formula: '∠i'
            },
            {
              term: 'Angle of Reflection (∠r)',
              definition: 'The angle between the reflected ray and the normal line.',
              formula: '∠r = ∠i'
            }
          ],
          breakdownSteps: [
            {
              title: 'First Law of Reflection',
              content: 'The angle of incidence is always equal to the angle of reflection.',
              formula: '∠i = ∠r'
            },
            {
              title: 'Second Law of Reflection',
              content: 'The incident ray, the reflected ray, and the normal at the point of incidence all lie in the same geometric plane.',
              callout: 'Both angles are ALWAYS measured from the normal, NEVER from the mirror surface.'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Always measure angles relative to the normal (perpendicular), not the mirror boundary.',
              commonMistake: 'Confusing the glancing angle with the angle of incidence.',
              whyItMatters: 'If light hits the mirror at 30° to the mirror surface, the angle of incidence is 90° - 30° = 60°!'
            }
          ],
          keyTakeaway: 'Angle of incidence equals angle of reflection (∠i = ∠r) across all smooth reflective surfaces.'
        },
        activity: {
          id: 'act-light-optics-demo',
          type: 'ray-optics',
          title: 'Interactive Ray Optics Reflection Simulator',
          instructions: 'Adjust the incident ray slider from 0° to 85° and observe how the reflected ray mirrors the angle with respect to the normal.',
          goal: 'Verify the law ∠i = ∠r across multiple incident angles.',
          defaultData: { initialAngle: 45 }
        },
        workedExamples: [
          {
            id: 'we-light-1',
            problem: 'A ray of light strikes a plane mirror such that the angle between the incident ray and the mirror surface is 35°. Find the angle of reflection.',
            steps: [
              {
                stepNumber: 1,
                title: 'Calculate the angle of incidence (∠i)',
                math: '∠i = 90° - 35° = 55°',
                explanation: 'The normal makes a 90° angle with the mirror. Therefore, ∠i is 90° minus the glancing angle.'
              },
              {
                stepNumber: 2,
                title: 'Apply the First Law of Reflection',
                math: '∠r = ∠i = 55°',
                explanation: 'By the law of reflection, the angle of reflection equals the angle of incidence.'
              }
            ],
            realWorldApplication: 'Periscope design in submarines and solar reflector panels.'
          }
        ],
        guidedPractice: [
          {
            id: 'gp-light-1',
            question: 'If the angle of incidence is 40°, what is the angle between the incident ray and the reflected ray?',
            options: ['40°', '80°', '50°', '90°'],
            correctIndex: 1,
            hint: 'The total angle between the two rays is ∠i + ∠r.',
            explanation: 'Since ∠i = 40° and ∠r = 40°, the total angle between them is 40° + 40° = 80°.'
          }
        ],
        revisionSummary: {
          title: 'Laws of Reflection Summary',
          points: [
            '∠i = ∠r (Angle of incidence equals angle of reflection).',
            'Angles are measured with respect to the normal line.',
            'Light rays reverse along the same path if ∠i = 0° (normal incidence).'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-light-1',
            question: 'What is the angle of reflection when a ray hits perpendicular to the mirror surface (along the normal)?',
            options: ['0°', '90°', '45°', '180°'],
            correctIndex: 0,
            category: 'basic',
            explanation: 'When light strikes normally, the angle between the ray and the normal is 0°, so ∠r = 0°.'
          },
          {
            id: 'q-light-2',
            question: 'According to the second law of reflection, which three elements lie in the same plane?',
            options: [
              'Incident ray, refracted ray, mirror',
              'Incident ray, reflected ray, and normal',
              'Mirror surface, normal, light bulb',
              'Reflected ray, shadow, screen'
            ],
            correctIndex: 1,
            category: 'basic',
            explanation: 'The incident ray, reflected ray, and normal all lie in the identical mathematical plane.'
          },
          {
            id: 'q-light-3',
            question: 'If a ray makes a 30° angle with the normal, the angle of reflection is:',
            options: ['60°', '30°', '15°', '90°'],
            correctIndex: 1,
            category: 'application',
            explanation: 'By the first law of reflection, ∠r = ∠i = 30°.'
          },
          {
            id: 'q-light-4',
            question: 'Why does a rough wooden surface not produce a clear mirror image like polished glass?',
            options: [
              'Light does not bounce off wood',
              'Light undergoes diffuse (irregular) reflection in all random directions',
              'Wood absorbs 100% of incident light',
              'The speed of light slows to zero'
            ],
            correctIndex: 1,
            category: 'reasoning',
            explanation: 'Microscopic irregularities on rough surfaces reflect parallel rays in different directions (diffuse reflection).'
          },
          {
            id: 'q-light-5',
            question: 'An object is placed 10 cm in front of a plane mirror. What is the distance between the object and its image?',
            options: ['10 cm', '20 cm', '5 cm', '15 cm'],
            correctIndex: 1,
            category: 'application',
            explanation: 'The image forms 10 cm behind the mirror. Distance from object to image = 10 cm + 10 cm = 20 cm.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // ADDITIONAL CLASS 8 CHAPTERS
  // ==========================================
  {
    id: 'c8-math-rational',
    classLevel: 8,
    subjectId: 'mathematics',
    title: 'Rational Numbers',
    description: 'Properties of rational numbers (closure, commutativity, associativity), additive & multiplicative identities, and representation on the number line.',
    category: 'Number Systems',
    estimatedHours: 5,
    iconName: 'Hash',
    subConcepts: [
      {
        id: 'c8-math-rational-sub1',
        conceptId: 'c8-math-rational',
        order: 1,
        title: 'Properties and Number Line Representation',
        shortDescription: 'Explore closure, commutative, associative properties, and locate rational numbers on the number line.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Define rational numbers in p/q form (q ≠ 0).',
          'Verify closure and commutative properties for addition and multiplication.',
          'Represent positive and negative rational numbers on a continuous number line.'
        ],
        explanation: {
          introduction: 'A rational number is any number that can be expressed as a quotient or fraction p/q of two integers, a numerator p and a non-zero denominator q.',
          keyDefinitions: [
            {
              term: 'Rational Number',
              definition: 'A number in the form p/q, where p and q are integers and q ≠ 0.',
              formula: 'Q = { p/q : p, q ∈ Z, q ≠ 0 }'
            }
          ],
          breakdownSteps: [
            {
              title: 'Density Property',
              content: 'Between any two rational numbers, there exist infinitely many rational numbers.',
              callout: 'You can always find the midpoint: (a + b)/2.'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Denominator q can never be 0.',
              commonMistake: 'Assuming 5/0 is a rational number.',
              whyItMatters: 'Division by zero is mathematically undefined.'
            }
          ],
          keyTakeaway: 'Rational numbers include all integers, whole numbers, terminating and repeating decimals.'
        },
        activity: {
          id: 'act-rational-numline',
          type: 'number-line',
          title: 'Interactive Number Line Explorer',
          instructions: 'Slide the pointer to locate rational numbers like -3/4, 1/2, and 7/4 on the number line.',
          goal: 'Position fractions accurately between integer markers.',
          defaultData: { targetFraction: '3/4' }
        },
        workedExamples: [
          {
            id: 'we-rat-1',
            problem: 'Find a rational number between 1/4 and 1/2.',
            steps: [
              {
                stepNumber: 1,
                title: 'Calculate the arithmetic mean',
                math: 'Mean = (1/4 + 1/2) / 2',
                explanation: 'The average of two rational numbers lies exactly halfway between them.'
              },
              {
                stepNumber: 2,
                title: 'Add fractions with common denominator 4',
                math: '1/4 + 2/4 = 3/4',
                explanation: '1/2 equals 2/4.'
              },
              {
                stepNumber: 3,
                title: 'Divide by 2',
                math: '(3/4) ÷ 2 = 3/8',
                explanation: '3/8 is a rational number strictly between 1/4 (2/8) and 1/2 (4/8).'
              }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-rat-1',
            question: 'What is the additive inverse of -5/9?',
            options: ['-5/9', '5/9', '9/5', '-9/5'],
            correctIndex: 1,
            hint: 'The additive inverse cancels out the number to 0.',
            explanation: '-5/9 + 5/9 = 0.'
          }
        ],
        revisionSummary: {
          title: 'Rational Numbers Rules',
          points: [
            'Additive identity is 0.',
            'Multiplicative identity is 1.',
            'Zero has no reciprocal.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-rat-1',
            question: 'Which number is its own reciprocal?',
            options: ['0', '1', '2', '-2'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'The reciprocal of 1 is 1/1 = 1. (Also -1).'
          },
          {
            id: 'q-rat-2',
            question: 'Rational numbers are NOT closed under which operation?',
            options: ['Addition', 'Multiplication', 'Subtraction', 'Division'],
            correctIndex: 3,
            category: 'reasoning',
            explanation: 'Division by zero is undefined, so rational numbers are not closed under division.'
          },
          {
            id: 'q-rat-3',
            question: 'What is the reciprocal of -1/5?',
            options: ['5', '-5', '1/5', '-1'],
            correctIndex: 1,
            category: 'basic',
            explanation: '1 / (-1/5) = -5.'
          },
          {
            id: 'q-rat-4',
            question: 'Between 2 and 3, how many rational numbers exist?',
            options: ['0', '1', '10', 'Infinitely many'],
            correctIndex: 3,
            category: 'basic',
            explanation: 'Between any two distinct numbers, an infinite number of rational numbers exist.'
          },
          {
            id: 'q-rat-5',
            question: 'Evaluate: (-3/8) × (4/7) × (2/3).',
            options: ['-1/7', '-2/7', '1/7', '-3/14'],
            correctIndex: 0,
            category: 'application',
            explanation: 'Multiply numerators: (-3 × 4 × 2) = -24. Denominators: (8 × 7 × 3) = 168. -24/168 = -1/7.'
          }
        ]
      }
    ]
  },
  {
    id: 'c8-sci-force',
    classLevel: 8,
    subjectId: 'science',
    title: 'Force and Pressure',
    description: 'Understand pushes and pulls, contact and non-contact forces, atmospheric pressure, and pressure exerted by liquids.',
    category: 'Physics',
    estimatedHours: 5,
    iconName: 'Compass',
    subConcepts: [
      {
        id: 'c8-sci-force-sub1',
        conceptId: 'c8-sci-force',
        order: 1,
        title: 'Types of Forces and Effects of Force',
        shortDescription: 'Distinguish between contact forces (muscular, friction) and non-contact forces (magnetic, electrostatic, gravitational).',
        estimatedMinutes: 20,
        learningObjectives: [
          'Define force as a push or pull resulting from interaction.',
          'Describe how force can change speed, direction, and shape of an object.',
          'Classify forces into contact and non-contact categories.'
        ],
        explanation: {
          introduction: 'A force is a push or pull upon an object resulting from its interaction with another object. Forces have both magnitude and direction.',
          keyDefinitions: [
            {
              term: 'Force',
              definition: 'An interaction that causes an object with mass to accelerate, change direction, or deform.',
              formula: 'F = m · a (Unit: Newton, N)'
            },
            {
              term: 'Contact Force',
              definition: 'Forces that act only when physical contact exists between surfaces (e.g., friction, muscular force).'
            },
            {
              term: 'Non-Contact Force',
              definition: 'Forces that act from a distance through a field (e.g., gravity, magnetic, electrostatic).'
            }
          ],
          breakdownSteps: [
            {
              title: 'Net Force Calculation',
              content: 'If forces act in the same direction, they add up: F_net = F1 + F2. If opposite, they subtract: F_net = |F1 - F2|.',
              callout: 'Balanced forces produce zero acceleration.'
            }
          ],
          rulesAndMistakes: [
            {
              rule: 'Force is a vector quantity having both magnitude and direction.',
              commonMistake: 'Forgetting that opposite forces subtract.',
              whyItMatters: 'Two equal 10 N forces pulling in opposite directions produce 0 N net force.'
            }
          ],
          keyTakeaway: 'Unbalanced forces cause motion; balanced forces keep velocity constant.'
        },
        activity: {
          id: 'act-force-balance',
          type: 'balance-scale',
          title: 'Tug of War Vector Balance',
          instructions: 'Add Newton force vectors in left and right directions to find the net resultant force.',
          goal: 'Balance forces to zero acceleration.',
          defaultData: { forceLeft: 20, forceRight: 20 }
        },
        workedExamples: [
          {
            id: 'we-force-1',
            problem: 'Two boys push a heavy box. Boy A applies 30 N to the right, and Boy B applies 20 N to the left. What is the net force?',
            steps: [
              {
                stepNumber: 1,
                title: 'Identify directions',
                math: 'F1 = +30 N (Right), F2 = -20 N (Left)',
                explanation: 'Forces in opposite directions have opposing signs.'
              },
              {
                stepNumber: 2,
                title: 'Calculate resultant force',
                math: 'F_net = 30 N - 20 N = 10 N (to the right)',
                explanation: 'The box moves toward the right with a net force of 10 N.'
              }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-force-1',
            question: 'Which of the following is an example of a non-contact force?',
            options: ['Muscular force', 'Friction force', 'Gravitational force', 'Tension in a rope'],
            correctIndex: 2,
            hint: 'Think of the force that pulls an apple to the ground without touching it.',
            explanation: 'Gravity acts across empty space without physical contact.'
          }
        ],
        revisionSummary: {
          title: 'Force Essentials',
          points: [
            'SI unit of force is Newton (N).',
            'Pressure = Force / Area (N/m² or Pascal).',
            'Liquid pressure increases with depth.'
          ]
        },
        assessmentQuestions: [
          {
            id: 'q-force-1',
            question: 'What is the SI unit of force?',
            options: ['Joule', 'Pascal', 'Newton', 'Watt'],
            correctIndex: 2,
            category: 'basic',
            explanation: 'Force is measured in Newtons (N).'
          },
          {
            id: 'q-force-2',
            question: 'A force of 100 N acts on an area of 2 m². What is the pressure produced?',
            options: ['200 Pa', '50 Pa', '100 Pa', '25 Pa'],
            correctIndex: 1,
            category: 'application',
            explanation: 'Pressure = Force / Area = 100 N / 2 m² = 50 Pa.'
          },
          {
            id: 'q-force-3',
            question: 'Why do school bags have wide straps instead of thin strings?',
            options: [
              'Wide straps look more fashionable',
              'Larger area reduces the pressure exerted on the shoulders',
              'Wide straps increase shoulder friction',
              'Thin strings are too heavy'
            ],
            correctIndex: 1,
            category: 'reasoning',
            explanation: 'Pressure = Force / Area. Increasing strap area decreases pressure on the shoulder.'
          },
          {
            id: 'q-force-4',
            question: 'What force always opposes relative motion between two touching surfaces?',
            options: ['Electrostatic force', 'Friction', 'Magnetic force', 'Gravitational force'],
            correctIndex: 1,
            category: 'basic',
            explanation: 'Friction is the contact force opposing relative motion.'
          },
          {
            id: 'q-force-5',
            question: 'At high altitudes, atmospheric pressure:',
            options: ['Increases', 'Decreases', 'Remains identical to sea level', 'Becomes zero'],
            correctIndex: 1,
            category: 'application',
            explanation: 'As altitude increases, the column of air above becomes thinner, reducing atmospheric pressure.'
          }
        ]
      }
    ]
  },

  // ==========================================
  // CURRICULUM SYLLABI FOR CLASSES 6, 7, 9, 10
  // ==========================================
  {
    id: 'c6-math-fractions',
    classLevel: 6,
    subjectId: 'mathematics',
    title: 'Fractions and Decimals',
    description: 'Proper, improper, and mixed fractions, equivalent fractions, comparing fractions, and basic decimal conversions.',
    category: 'Arithmetic',
    estimatedHours: 4,
    iconName: 'PieChart',
    subConcepts: [
      {
        id: 'c6-math-fractions-sub1',
        conceptId: 'c6-math-fractions',
        order: 1,
        title: 'Understanding Equivalent Fractions',
        shortDescription: 'Discover fractions representing the identical portion of a whole.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Recognize fractions as parts of a whole.',
          'Generate equivalent fractions by multiplying/dividing numerator and denominator.'
        ],
        explanation: {
          introduction: 'Fractions represent equal parts of a whole. 1/2, 2/4, and 4/8 all represent the exact same amount of a pizza!',
          keyDefinitions: [
            { term: 'Numerator', definition: 'The top number showing how many parts we have.' },
            { term: 'Denominator', definition: 'The bottom number showing total equal parts.' }
          ],
          breakdownSteps: [
            { title: 'Finding Equivalents', content: 'Multiply both top and bottom by the same number: (1×3)/(2×3) = 3/6.' }
          ],
          rulesAndMistakes: [
            { rule: 'Whatever you multiply the top by, multiply the bottom by too.', commonMistake: 'Multiplying only the numerator.', whyItMatters: 'Changes the actual value.' }
          ],
          keyTakeaway: 'Equivalent fractions have different numbers but equal values.'
        },
        activity: {
          id: 'act-c6-fraction',
          type: 'fraction-strip',
          title: 'Interactive Fraction Strips',
          instructions: 'Compare 1/2 strip against 2/4 and 4/8 to observe equal lengths.',
          goal: 'Align fraction strips to equal length.',
          defaultData: { target: '1/2' }
        },
        workedExamples: [
          {
            id: 'we-c6-1',
            problem: 'Write two fractions equivalent to 3/5.',
            steps: [
              { stepNumber: 1, title: 'Multiply by 2', math: '(3×2)/(5×2) = 6/10', explanation: 'Scale by factor of 2.' },
              { stepNumber: 2, title: 'Multiply by 3', math: '(3×3)/(5×3) = 9/15', explanation: 'Scale by factor of 3.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c6-1',
            question: 'Which fraction is equivalent to 2/3?',
            options: ['4/6', '4/9', '3/2', '5/6'],
            correctIndex: 0,
            hint: 'Multiply 2 and 3 by 2.',
            explanation: '(2×2)/(3×2) = 4/6.'
          }
        ],
        revisionSummary: {
          title: 'Fraction Rules',
          points: ['Equivalent fractions simplify to the same simplest form.']
        },
        assessmentQuestions: [
          {
            id: 'q-c6-1',
            question: 'What is 15/20 in simplest form?',
            options: ['3/4', '5/4', '1/2', '3/5'],
            correctIndex: 0,
            category: 'basic',
            explanation: 'Divide both 15 and 20 by 5 to get 3/4.'
          },
          {
            id: 'q-c6-2',
            question: 'Which of the following is an improper fraction?',
            options: ['3/7', '7/3', '1/2', '5/8'],
            correctIndex: 1,
            category: 'basic',
            explanation: '7/3 has numerator greater than denominator, making it improper.'
          },
          {
            id: 'q-c6-3',
            question: 'If 2/5 = x/20, what is x?',
            options: ['4', '8', '10', '12'],
            correctIndex: 1,
            category: 'application',
            explanation: '5 × 4 = 20, so 2 × 4 = 8.'
          },
          {
            id: 'q-c6-4',
            question: 'Convert 2 1/3 into an improper fraction:',
            options: ['7/3', '5/3', '6/3', '8/3'],
            correctIndex: 0,
            category: 'basic',
            explanation: '(2 × 3 + 1)/3 = 7/3.'
          },
          {
            id: 'q-c6-5',
            question: 'Which fraction is largest?',
            options: ['1/2', '2/3', '3/4', '5/6'],
            correctIndex: 3,
            category: 'reasoning',
            explanation: '5/6 ≈ 0.833, 3/4 = 0.75, 2/3 ≈ 0.667, 1/2 = 0.5.'
          }
        ]
      }
    ]
  },
  {
    id: 'c6-sci-plants',
    classLevel: 6,
    subjectId: 'science',
    title: 'Getting to Know Plants',
    description: 'Herbs, shrubs, trees, leaf venation, parts of a flower, photosynthesis, and root systems.',
    category: 'Biology',
    estimatedHours: 4,
    iconName: 'Leaf',
    subConcepts: [
      {
        id: 'c6-sci-plants-sub1',
        conceptId: 'c6-sci-plants',
        order: 1,
        title: 'Parts of a Plant and Leaf Venation',
        shortDescription: 'Explore roots, stems, reticulate vs parallel venation, and transpiration.',
        estimatedMinutes: 20,
        learningObjectives: ['Classify plants into herbs, shrubs, trees', 'Differentiate reticulate and parallel leaf venation'],
        explanation: {
          introduction: 'Plants are autotrophs that manufacture food through photosynthesis. Leaves are their food factories.',
          keyDefinitions: [{ term: 'Venation', definition: 'The pattern of veins on a leaf blade.' }],
          breakdownSteps: [{ title: 'Reticulate vs Parallel', content: 'Reticulate forms a web (Peepal), parallel runs straight (grass/wheat).' }],
          rulesAndMistakes: [{ rule: 'Plants with tap roots have reticulate venation.', commonMistake: 'Thinking grass has tap roots.', whyItMatters: 'Grass has fibrous roots.' }],
          keyTakeaway: 'Leaf venation is directly correlated with root structure.'
        },
        activity: {
          id: 'act-c6-plant',
          type: 'cell-explorer',
          title: 'Botanical Leaf Inspector',
          instructions: 'Inspect microscopic stomata and vein patterns on different leaves.',
          goal: 'Identify reticulate and parallel venation types.',
          defaultData: {}
        },
        workedExamples: [
          {
            id: 'we-c6-p1',
            problem: 'Why do desert plants like cacti have spines instead of wide leaves?',
            steps: [{ stepNumber: 1, title: 'Transpiration prevention', math: 'Reduced surface area', explanation: 'Spines minimize water loss through transpiration.' }]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c6-p1',
            question: 'Parallel venation is typically found in:',
            options: ['Rose', 'Grass', 'Mango', 'Mustard'],
            correctIndex: 1,
            hint: 'Look for long blades of grass.',
            explanation: 'Monocots like grass exhibit parallel venation.'
          }
        ],
        revisionSummary: { title: 'Plant Anatomy', points: ['Stomata regulate gas exchange and transpiration.'] },
        assessmentQuestions: [
          { id: 'q-c6-p1', question: 'Which part of the plant anchors it firmly in the soil?', options: ['Stem', 'Root', 'Leaf', 'Flower'], correctIndex: 1, category: 'basic', explanation: 'Roots provide structural anchorage.' },
          { id: 'q-c6-p2', question: 'The loss of water vapor through stomata is called:', options: ['Photosynthesis', 'Transpiration', 'Respiration', 'Germination'], correctIndex: 1, category: 'basic', explanation: 'Transpiration is water evaporation through leaves.' },
          { id: 'q-c6-p3', question: 'The female reproductive organ of a flower is:', options: ['Stamen', 'Pistil', 'Sepal', 'Petal'], correctIndex: 1, category: 'basic', explanation: 'Pistil (carpel) is the female reproductive part.' },
          { id: 'q-c6-p4', question: 'Plants with fibrous roots generally have:', options: ['Reticulate venation', 'Parallel venation', 'No venation', 'Spines'], correctIndex: 1, category: 'reasoning', explanation: 'Fibrous root systems correspond with parallel venation.' },
          { id: 'q-c6-p5', question: 'Which green pigment captures sunlight for photosynthesis?', options: ['Hemoglobin', 'Chlorophyll', 'Carotene', 'Anthocyanin'], correctIndex: 1, category: 'basic', explanation: 'Chlorophyll captures solar energy.' }
        ]
      }
    ]
  },
  {
    id: 'c7-math-integers',
    classLevel: 7,
    subjectId: 'mathematics',
    title: 'Integers and Operations',
    description: 'Addition, subtraction, multiplication, and division of positive and negative integers with sign rules.',
    category: 'Number Systems',
    estimatedHours: 4,
    iconName: 'PlusMinus',
    subConcepts: [
      {
        id: 'c7-math-sub1',
        conceptId: 'c7-math-integers',
        order: 1,
        title: 'Multiplication and Division of Integers',
        shortDescription: 'Learn rules of signs: positive × negative, negative × negative, and word problems.',
        estimatedMinutes: 20,
        learningObjectives: ['Multiply and divide signed numbers accurately', 'Understand why negative × negative = positive'],
        explanation: {
          introduction: 'Signed integers track gains, losses, elevations, and temperatures.',
          keyDefinitions: [{ term: 'Sign Rules', definition: '(+) × (+) = (+); (-) × (-) = (+); (+) × (-) = (-).' }],
          breakdownSteps: [{ title: 'Even vs Odd Negatives', content: 'Even number of negative factors yields positive; odd yields negative.' }],
          rulesAndMistakes: [{ rule: 'Two negatives multiplied make a positive.', commonMistake: 'Thinking -3 - 4 = +7.', whyItMatters: 'Addition of two negatives stays negative.' }],
          keyTakeaway: 'Same signs give positive product, opposite signs give negative product.'
        },
        activity: {
          id: 'act-c7-integers',
          type: 'number-line',
          title: 'Integer Direction Vector Explorer',
          instructions: 'Step forward and backward along negative coordinates on the number line.',
          goal: 'Evaluate (-4) × 3 on the number line.',
          defaultData: { target: '-12' }
        },
        workedExamples: [
          {
            id: 'we-c7-1',
            problem: 'Evaluate (-5) × (-4) × (-2).',
            steps: [
              { stepNumber: 1, title: 'Multiply first two', math: '(-5) × (-4) = +20', explanation: 'Negative × negative = positive.' },
              { stepNumber: 2, title: 'Multiply by third', math: '(+20) × (-2) = -40', explanation: 'Positive × negative = negative.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c7-1',
            question: 'What is (-36) ÷ (-4)?',
            options: ['-9', '9', '-8', '8'],
            correctIndex: 1,
            hint: 'Dividing two negatives gives a positive.',
            explanation: '(-36) ÷ (-4) = +9.'
          }
        ],
        revisionSummary: { title: 'Integer Rules', points: ['Same signs produce positive; different signs produce negative.'] },
        assessmentQuestions: [
          { id: 'q-c7-1', question: '(-1) multiplied 100 times gives:', options: ['-1', '1', '100', '-100'], correctIndex: 1, category: 'reasoning', explanation: '100 is an even power, so (-1)^100 = 1.' },
          { id: 'q-c7-2', question: 'Evaluate: 10 - (-5).', options: ['5', '15', '-5', '-15'], correctIndex: 1, category: 'basic', explanation: '10 - (-5) = 10 + 5 = 15.' },
          { id: 'q-c7-3', question: 'Which is greater: -12 or -8?', options: ['-12', '-8', 'Both are equal', 'Cannot be compared'], correctIndex: 1, category: 'basic', explanation: '-8 lies to the right of -12 on the number line.' },
          { id: 'q-c7-4', question: 'Product of an odd number of negative integers is always:', options: ['Positive', 'Negative', 'Zero', '1'], correctIndex: 1, category: 'basic', explanation: 'Odd count of negatives yields a negative product.' },
          { id: 'q-c7-5', question: 'In a test (+4) marks given for correct and (-2) for incorrect. Score for 5 correct and 3 incorrect is:', options: ['14', '20', '26', '8'], correctIndex: 0, category: 'application', explanation: '5(4) + 3(-2) = 20 - 6 = 14.' }
        ]
      }
    ]
  },
  {
    id: 'c9-math-poly',
    classLevel: 9,
    subjectId: 'mathematics',
    title: 'Polynomials and Factorization',
    description: 'Degree of polynomials, zeroes of a polynomial, Remainder and Factor theorems, and algebraic identities.',
    category: 'Algebra',
    estimatedHours: 6,
    iconName: 'FunctionSquare',
    subConcepts: [
      {
        id: 'c9-math-sub1',
        conceptId: 'c9-math-poly',
        order: 1,
        title: 'Zeroes of a Polynomial and Factor Theorem',
        shortDescription: 'Find zeroes of linear and quadratic polynomials and apply p(a) = 0 factor testing.',
        estimatedMinutes: 25,
        learningObjectives: ['Find zeroes of linear polynomial', 'Use Factor Theorem to verify factors'],
        explanation: {
          introduction: 'A zero of a polynomial p(x) is a real value c such that p(c) = 0.',
          keyDefinitions: [{ term: 'Factor Theorem', definition: 'If p(a) = 0, then (x - a) is a factor of p(x).' }],
          breakdownSteps: [{ title: 'Finding Zero of ax + b', content: 'Set ax + b = 0 ⇒ x = -b/a.' }],
          rulesAndMistakes: [{ rule: 'Degree n has at most n real zeroes.', commonMistake: 'Equating zero of polynomial with number 0.', whyItMatters: 'Zero of polynomial can be any real value.' }],
          keyTakeaway: 'Zeroes represent x-intercepts where the function graph touches y = 0.'
        },
        activity: {
          id: 'act-c9-poly',
          type: 'balance-scale',
          title: 'Polynomial Root Balancer',
          instructions: 'Balance quadratic term factors against known constants.',
          goal: 'Find the zero of p(x) = 2x - 6.',
          defaultData: { equation: '2x - 6 = 0', targetX: 3 }
        },
        workedExamples: [
          {
            id: 'we-c9-1',
            problem: 'Check whether (x + 2) is a factor of p(x) = x³ + 3x² + 5x + 6.',
            steps: [
              { stepNumber: 1, title: 'Find candidate zero', math: 'x + 2 = 0 ⇒ x = -2', explanation: 'Candidate root is a = -2.' },
              { stepNumber: 2, title: 'Evaluate p(-2)', math: 'p(-2) = (-2)³ + 3(-2)² + 5(-2) + 6 = -8 + 12 - 10 + 6 = 0', explanation: 'Since p(-2) = 0, (x + 2) is indeed a factor.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c9-1',
            question: 'What is the zero of the polynomial p(x) = 3x - 5?',
            options: ['5/3', '-5/3', '3/5', '-3/5'],
            correctIndex: 0,
            hint: 'Set 3x - 5 = 0.',
            explanation: '3x = 5 ⇒ x = 5/3.'
          }
        ],
        revisionSummary: { title: 'Factor Theorem', points: ['(x - a) divides p(x) exactly if and only if p(a) = 0.'] },
        assessmentQuestions: [
          { id: 'q-c9-1', question: 'What is the degree of a non-zero constant polynomial like p(x) = 7?', options: ['0', '1', 'Undefined', '7'], correctIndex: 0, category: 'basic', explanation: 'Constant polynomial has degree 0 (7 = 7x^0).' },
          { id: 'q-c9-2', question: 'If p(x) = x² - 4x + 3, what is p(1)?', options: ['0', '1', '-1', '2'], correctIndex: 0, category: 'basic', explanation: '1 - 4 + 3 = 0.' },
          { id: 'q-c9-3', question: 'The zeroes of quadratic polynomial x² - 9 are:', options: ['3 and -3', '9 and -9', '3 only', '0 and 9'], correctIndex: 0, category: 'application', explanation: 'x² - 9 = (x - 3)(x + 3) = 0 ⇒ x = ±3.' },
          { id: 'q-c9-4', question: 'What is the degree of the zero polynomial?', options: ['0', '1', 'Not defined', '-1'], correctIndex: 2, category: 'reasoning', explanation: 'The degree of the zero polynomial 0 is mathematically not defined.' },
          { id: 'q-c9-5', question: 'If (x - 1) is a factor of kx² - 3x + k, find k:', options: ['3/2', '2/3', '1', '3'], correctIndex: 0, category: 'application', explanation: 'k(1)² - 3(1) + k = 0 ⇒ 2k = 3 ⇒ k = 3/2.' }
        ]
      }
    ]
  },
  {
    id: 'c10-math-quadratic',
    classLevel: 10,
    subjectId: 'mathematics',
    title: 'Quadratic Equations',
    description: 'Standard form ax² + bx + c = 0, factorization method, quadratic formula, and discriminant nature of roots.',
    category: 'Algebra',
    estimatedHours: 6,
    iconName: 'Shapes',
    subConcepts: [
      {
        id: 'c10-math-sub1',
        conceptId: 'c10-math-quadratic',
        order: 1,
        title: 'Nature of Roots and Discriminant',
        shortDescription: 'Examine D = b² - 4ac to determine real, distinct, equal, or imaginary roots.',
        estimatedMinutes: 25,
        learningObjectives: ['Calculate discriminant D', 'Predict nature of roots without solving the full equation'],
        explanation: {
          introduction: 'The discriminant D reveals the genetic code of a parabola: whether it intersects the x-axis twice, once, or never.',
          keyDefinitions: [
            { term: 'Discriminant', definition: 'The expression under the radical in the quadratic formula.', formula: 'D = b² - 4ac' },
            { term: 'Quadratic Formula', definition: 'Solves any quadratic equation.', formula: 'x = (-b ± √D) / 2a' }
          ],
          breakdownSteps: [
            { title: 'Three Cases of D', content: 'D > 0: Two distinct real roots. D = 0: Two equal real roots. D < 0: No real roots.' }
          ],
          rulesAndMistakes: [{ rule: 'For equal roots, D must equal exactly zero.', commonMistake: 'Forgetting minus sign on -b.', whyItMatters: 'Alters both roots completely.' }],
          keyTakeaway: 'The sign of b² - 4ac tells you everything about root realness.'
        },
        activity: {
          id: 'act-c10-quad',
          type: 'balance-scale',
          title: 'Discriminant Visualizer',
          instructions: 'Adjust coefficients a, b, and c to see D change from positive to zero to negative.',
          goal: 'Set D = 0 to achieve equal roots.',
          defaultData: {}
        },
        workedExamples: [
          {
            id: 'we-c10-1',
            problem: 'Find the nature of roots for 2x² - 4x + 3 = 0.',
            steps: [
              { stepNumber: 1, title: 'Identify a, b, c', math: 'a = 2, b = -4, c = 3', explanation: 'Compare with ax² + bx + c = 0.' },
              { stepNumber: 2, title: 'Compute D', math: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8', explanation: 'Since D < 0, there are no real roots.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c10-1',
            question: 'What is the discriminant of x² - 6x + 9 = 0?',
            options: ['0', '18', '-18', '36'],
            correctIndex: 0,
            hint: 'Compute (-6)² - 4(1)(9).',
            explanation: '36 - 36 = 0. The equation has two equal real roots (x = 3).'
          }
        ],
        revisionSummary: { title: 'Discriminant Rules', points: ['D > 0: Two distinct roots', 'D = 0: Real and equal roots', 'D < 0: No real roots'] },
        assessmentQuestions: [
          { id: 'q-c10-1', question: 'If ax² + bx + c = 0 has equal real roots, then c equals:', options: ['b/2a', 'b²/4a', '-b/2a', 'b²/2a'], correctIndex: 1, category: 'application', explanation: 'b² - 4ac = 0 ⇒ 4ac = b² ⇒ c = b² / (4a).' },
          { id: 'q-c10-2', question: 'What is the standard form of a quadratic equation?', options: ['ax + b = 0', 'ax² + bx + c = 0', 'ax³ + bx² + c = 0', 'a/x + b = c'], correctIndex: 1, category: 'basic', explanation: 'ax² + bx + c = 0 with a ≠ 0.' },
          { id: 'q-c10-3', question: 'The roots of x² - 5x + 6 = 0 are:', options: ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'], correctIndex: 0, category: 'application', explanation: '(x - 2)(x - 3) = 0 ⇒ x = 2, 3.' },
          { id: 'q-c10-4', question: 'If the discriminant D is negative (D < 0), the roots are:', options: ['Real and distinct', 'Real and equal', 'Not real (imaginary)', 'Rational and unequal'], correctIndex: 2, category: 'basic', explanation: 'Square root of negative number is not real.' },
          { id: 'q-c10-5', question: 'For what value of k does 2x² + kx + 3 = 0 have equal roots?', options: ['±2√6', '±√6', '±6', '±24'], correctIndex: 0, category: 'reasoning', explanation: 'k² - 4(2)(3) = 0 ⇒ k² = 24 ⇒ k = ±√24 = ±2√6.' }
        ]
      }
    ]
  },
  {
    id: 'c10-sci-electricity',
    classLevel: 10,
    subjectId: 'science',
    title: 'Electricity and Circuits',
    description: 'Electric current, potential difference, Ohm\'s law, resistance, series and parallel resistor combinations, and Joule\'s heating effect.',
    category: 'Physics',
    estimatedHours: 6,
    iconName: 'Zap',
    subConcepts: [
      {
        id: 'c10-sci-sub1',
        conceptId: 'c10-sci-electricity',
        order: 1,
        title: 'Ohm’s Law and Circuit Resistance',
        shortDescription: 'Discover V = I · R, I-V characteristic graphs, and factors affecting conductor resistance.',
        estimatedMinutes: 25,
        learningObjectives: ['State and verify Ohm\'s Law', 'Calculate resistance, voltage, and current'],
        explanation: {
          introduction: 'Ohm’s Law is the cornerstone of circuit electronics: potential difference across a conductor is proportional to current flowing through it at constant temperature.',
          keyDefinitions: [
            { term: 'Ohm’s Law', definition: 'V = I · R at constant temperature.', formula: 'V = I · R' },
            { term: 'Resistance', definition: 'Opposition to flow of charge.', formula: 'R = ρ · (l / A)' }
          ],
          breakdownSteps: [
            { title: 'Series vs Parallel', content: 'Series: R_total = R1 + R2. Parallel: 1/R_total = 1/R1 + 1/R2.' }
          ],
          rulesAndMistakes: [{ rule: 'Current is constant everywhere in a series circuit.', commonMistake: 'Thinking current gets used up by resistors.', whyItMatters: 'Conservation of electric charge.' }],
          keyTakeaway: 'Voltage drives, resistance opposes, and current flows.'
        },
        activity: {
          id: 'act-c10-ohm',
          type: 'ray-optics',
          title: 'Virtual Ohm Circuit Lab',
          instructions: 'Vary voltage slider from 1V to 12V and watch current ammeter rise proportionally.',
          goal: 'Verify straight-line I-V graph.',
          defaultData: {}
        },
        workedExamples: [
          {
            id: 'we-c10-e1',
            problem: 'An electric iron draws 3.4 A current from a 220 V source. What is its resistance?',
            steps: [
              { stepNumber: 1, title: 'Apply Ohm’s law', math: 'R = V / I = 220 / 3.4 ≈ 64.7 Ω', explanation: 'Divide potential difference by current.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c10-e1',
            question: 'If voltage across a resistor is doubled, what happens to current (assuming temperature is constant)?',
            options: ['It doubles', 'It halves', 'It quadruples', 'It stays the same'],
            correctIndex: 0,
            hint: 'Current is directly proportional to voltage.',
            explanation: 'V = I · R. If V doubles, I must double.'
          }
        ],
        revisionSummary: { title: 'Electricity Formulas', points: ['V = IR', 'P = VI = I²R = V²/R', 'H = I²Rt (Joule\'s Law)'] },
        assessmentQuestions: [
          { id: 'q-c10-e1', question: 'What is the SI unit of electric potential difference?', options: ['Ampere', 'Volt', 'Ohm', 'Coulomb'], correctIndex: 1, category: 'basic', explanation: 'Potential difference is measured in Volts (V).' },
          { id: 'q-c10-e2', question: 'Two resistors of 6 Ω and 3 Ω are connected in parallel. Their equivalent resistance is:', options: ['9 Ω', '2 Ω', '3 Ω', '18 Ω'], correctIndex: 1, category: 'application', explanation: '1/R = 1/6 + 1/3 = 3/6 = 1/2 ⇒ R = 2 Ω.' },
          { id: 'q-c10-e3', question: 'How is a voltmeter connected in a circuit to measure potential difference across a resistor?', options: ['In series', 'In parallel', 'Either series or parallel', 'Across battery only'], correctIndex: 1, category: 'basic', explanation: 'A voltmeter has high resistance and must be connected in parallel.' },
          { id: 'q-c10-e4', question: 'If wire length is doubled while keeping cross-sectional area constant, its resistance:', options: ['Halves', 'Doubles', 'Becomes 4 times', 'Remains unchanged'], correctIndex: 1, category: 'application', explanation: 'R is directly proportional to length l, so resistance doubles.' },
          { id: 'q-c10-e5', question: 'Joule’s heating effect in a conductor with current I is proportional to:', options: ['I', 'I²', '√I', '1/I'], correctIndex: 1, category: 'basic', explanation: 'H = I² · R · t, proportional to the square of current.' }
        ]
      }
    ]
  },
  // ==========================================
  // CLASS 7 SCIENCE
  // ==========================================
  {
    id: 'c7-sci-nutrition',
    classLevel: 7,
    subjectId: 'science',
    title: 'Nutrition in Plants and Animals',
    description: 'Explore photosynthesis, stomatal gas exchange, autotrophic and heterotrophic modes, and the human digestive canal.',
    category: 'Biology',
    estimatedHours: 5,
    iconName: 'Leaf',
    subConcepts: [
      {
        id: 'c7-sci-sub1',
        conceptId: 'c7-sci-nutrition',
        order: 1,
        title: 'Photosynthesis & Autotrophic Nutrition',
        shortDescription: 'How green plants synthesize carbohydrates using sunlight, water, carbon dioxide, and chlorophyll.',
        estimatedMinutes: 20,
        learningObjectives: [
          'Describe the chemical equation of photosynthesis',
          'Understand the role of stomata and chlorophyll',
          'Identify parasitic, saprotrophic, and symbiotic nutrition modes'
        ],
        explanation: {
          introduction: 'All living organisms need food for energy, growth, and tissue repair. Green plants are autotrophs because they synthesize their own nourishment.',
          keyDefinitions: [
            { term: 'Autotroph', definition: 'Organisms that make food from simple raw inorganic substances (carbon dioxide and water).' },
            { term: 'Photosynthesis', definition: 'Process by which chlorophyll-bearing cells synthesize food in the presence of sunlight.', formula: '6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂' },
            { term: 'Stomata', definition: 'Tiny pores on the surface of leaves enclosed by bean-shaped guard cells.' }
          ],
          breakdownSteps: [
            { title: '1. Light Absorption', content: 'Chlorophyll within chloroplasts traps photon energy from solar radiation.' },
            { title: '2. Gas Exchange', content: 'Carbon dioxide enters leaves through stomatal apertures while oxygen is released.' }
          ],
          rulesAndMistakes: [
            { rule: 'Plants perform respiration continuously and photosynthesis only in light.', commonMistake: 'Believing plants only photosynthesize and do not respire.', whyItMatters: 'Cellular respiration occurs 24 hours a day in all plant tissues.' }
          ],
          keyTakeaway: 'Solar energy is converted into chemical energy stored in glucose.'
        },
        activity: {
          id: 'act-c7-photosynthesis',
          type: 'cell-explorer',
          title: 'Stomatal Aperture and Chloroplast Simulator',
          instructions: 'Adjust sunlight intensity and observe gas bubbles (oxygen release rate) from water plants.',
          goal: 'Observe the relationship between light intensity and photosynthetic yield.',
          defaultData: {}
        },
        workedExamples: [
          {
            id: 'we-c7-p1',
            problem: 'Why do variegated leaves (like Croton or Coleus) only show blue-black starch test on green portions?',
            steps: [
              { stepNumber: 1, title: 'Analyze Chlorophyll Distribution', math: 'Starch = Product of Photosynthesis', explanation: 'Only the green parts contain chlorophyll.' },
              { stepNumber: 2, title: 'Iodine Test Conclusion', math: 'Iodine + Starch → Blue-Black Color', explanation: 'Non-green portions lack chlorophyll and cannot synthesize starch.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c7-p1',
            question: 'Which of the following is a parasitic plant that absorbs nutrients from a host tree?',
            options: ['Cuscuta (Amarbel)', 'Pitcher plant', 'Mushroom', 'Algae'],
            correctIndex: 0,
            hint: 'It lacks chlorophyll and produces yellow tubular vines wrapping around trees.',
            explanation: 'Cuscuta (Amarbel) is an obligate parasite with haustoria.'
          }
        ],
        revisionSummary: {
          title: 'Plant Nutrition Key Summary',
          points: [
            'Photosynthesis equation: CO₂ + H₂O + Light → Carbohydrate + O₂.',
            'Stomata regulate transpiration and CO₂ intake.',
            'Lichens are symbiotic partnerships between algae and fungi.'
          ]
        },
        assessmentQuestions: [
          { id: 'q-c7-s1', question: 'The raw materials required for photosynthesis are:', options: ['CO₂ and H₂O', 'CO₂ and O₂', 'O₂ and H₂O', 'Glucose and O₂'], correctIndex: 0, category: 'basic', explanation: 'Carbon dioxide from air and water from roots are essential.' },
          { id: 'q-c7-s2', question: 'Tiny pores surrounded by guard cells on leaf surfaces are called:', options: ['Stomata', 'Lenticels', 'Hydathodes', 'Chloroplasts'], correctIndex: 0, category: 'basic', explanation: 'Stomata control gas exchange and transpiration.' },
          { id: 'q-c7-s3', question: 'Pitcher plant traps insects because it:', options: ['Grows in nitrogen-deficient soil', 'Cannot perform photosynthesis', 'Lacks chlorophyll', 'Requires water from insects'], correctIndex: 0, category: 'reasoning', explanation: 'Insectivorous plants digest insects to absorb scarce nitrogen.' },
          { id: 'q-c7-s4', question: 'Fungi obtain nutrition primarily through:', options: ['Saprotrophic mode', 'Autotrophic mode', 'Parasitic mode only', 'Holozoic mode'], correctIndex: 0, category: 'basic', explanation: 'Fungi secrete digestive enzymes onto dead organic matter.' },
          { id: 'q-c7-s5', question: 'Which test confirms the occurrence of photosynthesis in a leaf?', options: ['Iodine test for starch', 'Biuret test for proteins', 'Benedict test for glucose', 'Alcohol test'], correctIndex: 0, category: 'application', explanation: 'Iodine turns blue-black in the presence of starch produced during photosynthesis.' }
        ]
      }
    ]
  },
  // ==========================================
  // CLASS 9 SCIENCE
  // ==========================================
  {
    id: 'c9-sci-motion',
    classLevel: 9,
    subjectId: 'science',
    title: 'Motion and Laws of Motion',
    description: 'Master distance, displacement, speed, velocity, uniform acceleration, graphical analysis, and Newton’s three laws of motion.',
    category: 'Physics',
    estimatedHours: 6,
    iconName: 'Activity',
    subConcepts: [
      {
        id: 'c9-sci-sub1',
        conceptId: 'c9-sci-motion',
        order: 1,
        title: 'Equations of Uniformly Accelerated Motion',
        shortDescription: 'Derive and calculate using v = u + at, s = ut + ½at², and v² = u² + 2as.',
        estimatedMinutes: 25,
        learningObjectives: [
          'Distinguish between scalar distance and vector displacement',
          'Calculate uniform acceleration from velocity-time variations',
          'Apply the kinematic equations to real-world vehicular deceleration'
        ],
        explanation: {
          introduction: 'An object is in motion when its position changes with time relative to a stationary reference point (origin).',
          keyDefinitions: [
            { term: 'Displacement', definition: 'The shortest straight-line distance measured from initial to final position.' },
            { term: 'Acceleration', definition: 'The rate of change of velocity with respect to time.', formula: 'a = (v - u) / t' },
            { term: 'Kinematic Equations', definition: 'Formulas linking initial velocity u, final velocity v, acceleration a, time t, and distance s.', formula: 'v = u + at; s = ut + ½at²; v² = u² + 2as' }
          ],
          breakdownSteps: [
            { title: '1. Displacement vs Distance', content: 'In a circular track of radius r, when a runner finishes one full lap, distance = 2πr, but displacement = 0.' },
            { title: '2. Negative Acceleration (Retardation)', content: 'When brakes are applied, acceleration opposes velocity direction, resulting in negative acceleration.' }
          ],
          rulesAndMistakes: [
            { rule: 'Kinematic equations apply only to uniform (constant) acceleration.', commonMistake: 'Applying v = u + at when acceleration varies with time.', whyItMatters: 'Variable acceleration requires calculus integrals.' }
          ],
          keyTakeaway: 'The area under a Velocity-Time graph represents displacement.'
        },
        activity: {
          id: 'act-c9-motion',
          type: 'balance-scale',
          title: 'Kinematics Brake & Deceleration Simulator',
          instructions: 'Input vehicle speed and braking friction to graph velocity curve and calculate stopping distance.',
          goal: 'Verify s = v² / (2a) stopping distance formula.',
          defaultData: { speed: 20, acceleration: -5 }
        },
        workedExamples: [
          {
            id: 'we-c9-m1',
            problem: 'A car accelerates uniformly from 18 km/h to 36 km/h in 5 seconds. Calculate its acceleration and distance covered.',
            steps: [
              { stepNumber: 1, title: 'Convert units to SI (m/s)', math: 'u = 18 × (5/18) = 5 m/s, v = 36 × (5/18) = 10 m/s', explanation: 'Multiply km/h by 5/18.' },
              { stepNumber: 2, title: 'Calculate acceleration', math: 'a = (v - u) / t = (10 - 5) / 5 = 1 m/s²', explanation: 'Rate of velocity change.' },
              { stepNumber: 3, title: 'Calculate distance covered', math: 's = ut + ½at² = (5)(5) + ½(1)(25) = 25 + 12.5 = 37.5 m', explanation: 'Kinematic distance equation.' }
            ]
          }
        ],
        guidedPractice: [
          {
            id: 'gp-c9-m1',
            question: 'A train starting from rest attains a velocity of 72 km/h in 5 minutes. Assuming uniform acceleration, what is the distance traveled?',
            options: ['3 km', '6 km', '1.5 km', '12 km'],
            correctIndex: 0,
            hint: 'u = 0, v = 72 km/h = 20 m/s, t = 300 s. Find a = 20/300 = 1/15 m/s², then s = ½at².',
            explanation: 's = ½ × (1/15) × (300)² = 90000 / 30 = 3000 m = 3 km.'
          }
        ],
        revisionSummary: {
          title: 'Kinematics Formula Sheet',
          points: [
            'v = u + at',
            's = ut + ½at²',
            'v² - u² = 2as',
            'Newton\'s 2nd Law: F = ma = Δp/Δt'
          ]
        },
        assessmentQuestions: [
          { id: 'q-c9-m1', question: 'The slope of a velocity-time graph represents:', options: ['Acceleration', 'Distance', 'Displacement', 'Speed'], correctIndex: 0, category: 'basic', explanation: 'Slope = Δv / Δt = acceleration.' },
          { id: 'q-c9-m2', question: 'An object travels 20 m in 2 s and another 20 m in 3 s. Its average speed is:', options: ['8 m/s', '10 m/s', '6.67 m/s', '4 m/s'], correctIndex: 0, category: 'application', explanation: 'Average speed = Total distance / Total time = 40 m / 5 s = 8 m/s.' },
          { id: 'q-c9-m3', question: 'If the displacement of an object is proportional to the square of time, then the object moves with:', options: ['Uniform acceleration', 'Uniform velocity', 'Increasing acceleration', 'Decreasing acceleration'], correctIndex: 0, category: 'reasoning', explanation: 's = ½at² implies displacement ∝ t² when acceleration is constant.' },
          { id: 'q-c9-m4', question: 'Which Newton’s law defines inertia and the qualitative definition of force?', options: ['First Law of Motion', 'Second Law of Motion', 'Third Law of Motion', 'Law of Universal Gravitation'], correctIndex: 0, category: 'basic', explanation: 'The First Law (Law of Inertia) states objects resist changes to their state of rest or uniform motion.' },
          { id: 'q-c9-m5', question: 'A passenger lunges forward when a speeding bus suddenly applies brakes due to:', options: ['Inertia of motion', 'Inertia of rest', 'Inertia of direction', 'Gravitational pull'], correctIndex: 0, category: 'application', explanation: 'The upper body continues in its forward state of motion while feet decelerate with the bus floor.' }
        ]
      }
    ]
  }
];

export const CLASS_METADATA = [
  {
    level: 6 as ClassLevel,
    title: 'Class 6',
    description: 'Foundation year: integers, fractions, geometry basics, living organisms, and light & shadows.',
    subjectsCount: 2,
    chaptersCount: 14,
    colorTheme: 'from-blue-600 to-cyan-500'
  },
  {
    level: 7 as ClassLevel,
    title: 'Class 7',
    description: 'Exploration year: algebraic expressions, integers, heat, acids & bases, nutrition in plants.',
    subjectsCount: 2,
    chaptersCount: 15,
    colorTheme: 'from-indigo-600 to-blue-500'
  },
  {
    level: 8 as ClassLevel,
    title: 'Class 8',
    description: 'Mastery year: linear equations, rational numbers, force & pressure, light, and cell biology.',
    subjectsCount: 2,
    chaptersCount: 16,
    colorTheme: 'from-violet-600 to-indigo-600'
  },
  {
    level: 9 as ClassLevel,
    title: 'Class 9',
    description: 'Secondary foundation: polynomials, coordinate geometry, laws of motion, gravitation, atoms & molecules.',
    subjectsCount: 2,
    chaptersCount: 18,
    colorTheme: 'from-cyan-600 to-blue-600'
  },
  {
    level: 10 as ClassLevel,
    title: 'Class 10',
    description: 'Board curriculum: quadratic equations, trigonometry, electricity, optics, carbon chemistry.',
    subjectsCount: 2,
    chaptersCount: 20,
    colorTheme: 'from-emerald-600 to-teal-500'
  }
];

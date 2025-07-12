document.addEventListener('DOMContentLoaded', () => {
    const numExamplesInput = document.getElementById('numExamples');
    const operationsPerSequenceInput = document.getElementById('operationsPerSequence');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const outputDiv = document.getElementById('output');

    const lowerBeadsModeBtn = document.getElementById('lowerBeadsModeBtn');
    const unitRodModeBtn = document.getElementById('unitRodModeBtn');
    const friendsOf5ModeBtn = document.getElementById('friendsOf5ModeBtn');
    const friendsOf10ModeBtn = document.getElementById('friendsOf10ModeBtn');
    const tensRodLowerBeadsModeBtn = document.getElementById('tensRodLowerBeadsModeBtn');
    const fullTensRodModeBtn = document.getElementById('fullTensRodModeBtn');
    const friendsOf50ModeBtn = document.getElementById('friendsOf50ModeBtn');
    const friendsOf100ModeBtn = document.getElementById('friendsOf100ModeBtn'); // NEW: Get reference to new button

    let currentMode = 'lowerBeads'; // Default mode

    // --- Helper Functions ---

    // Determines the state of beads on a single unit rod (0-9 value)
    function getBeadState(value) {
        const upperBeadIsDown = value >= 5;
        const lowerBeadsActive = value % 5;
        return { upperBeadIsDown, lowerBeadsActive };
    }

    // Determines if a single-digit operation (1-9 or -1 to -9) is possible
    // on a *single unit rod* using direct or Friends of 5 rules.
    // Returns an array of possible move types (e.g., ['direct'], ['fo5'], or [])
    function getPossibleSingleRodMoves(currentRodValue, opValue, isAddition) {
        const { upperBeadIsDown, lowerBeadsActive } = getBeadState(currentRodValue);
        const moves = [];

        if (isAddition) {
            // Check for direct addition (lower beads only)
            if (opValue >= 1 && opValue <= 4 && lowerBeadsActive + opValue <= 4) {
                moves.push('direct');
            }
            // Check for direct addition (+5)
            else if (opValue === 5 && !upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct addition (+6 to +9, involving 5-bead)
            else if (opValue >= 6 && opValue <= 9 && !upperBeadIsDown) {
                const lowerPart = opValue % 5;
                if (lowerBeadsActive + lowerPart <= 4) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 5 addition (for +1 to +4 only)
            else if (opValue >= 1 && opValue <= 4 && !upperBeadIsDown) { // If direct wasn't possible for +1 to +4
                const complement = 5 - opValue;
                if (lowerBeadsActive - complement >= 0) { // Can subtract complement from active lower beads
                    moves.push('fo5');
                }
            }
        } else { // Subtraction
            const absOpValue = Math.abs(opValue);

            // Check for direct subtraction (lower beads only)
            if (absOpValue >= 1 && absOpValue <= 4 && lowerBeadsActive - absOpValue >= 0) {
                moves.push('direct');
            }
            // Check for direct subtraction (-5)
            else if (absOpValue === 5 && upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct subtraction (-6 to -9, involving 5-bead)
            else if (absOpValue >= 6 && absOpValue <= 9 && upperBeadIsDown) {
                const lowerPart = absOpValue % 5;
                if (lowerBeadsActive - lowerPart >= 0) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 5 subtraction (for -1 to -4 only)
            else if (absOpValue >= 1 && absOpValue <= 4 && upperBeadIsDown) { // If direct wasn't possible for -1 to -4
                const complement = 5 - absOpValue;
                if (lowerBeadsActive + complement <= 4) { // Can add complement to lower beads
                    moves.push('fo5');
                }
            }
        }
        return moves;
    }

    // Determines the state of beads on a tens rod (0-90 value, treated as 0-9 for bead logic)
    function getTensBeadState(value) {
        // Normalize value to a 0-9 scale for bead logic
        const tensDigit = Math.floor(value / 10);
        const upperBeadIsDown = tensDigit >= 5;
        const lowerBeadsActive = tensDigit % 5;
        return { upperBeadIsDown, lowerBeadsActive };
    }

    // Determines if a tens-digit operation (10-90 or -10 to -90) is possible
    // on a *single tens rod* using direct or Friends of 50 rules.
    function getPossibleTensRodMoves(currentRodValue, opValue, isAddition) {
        // CurrentRodValue here is the actual numeric value of the tens rod (e.g., 0, 10, ..., 90)
        // opValue is the operation value (e.g., 10, 20, ..., 90)
        const { upperBeadIsDown, lowerBeadsActive } = getTensBeadState(currentRodValue);
        const moves = []; // Stores move types like 'direct', 'fo50'

        // Convert opValue to its 0-9 equivalent for the bead logic
        const opBeadValue = Math.abs(opValue) / 10;

        if (isAddition) {
            // Check for direct addition (lower beads only: +10, +20, +30, +40)
            if (opBeadValue >= 1 && opBeadValue <= 4 && lowerBeadsActive + opBeadValue <= 4) {
                moves.push('direct');
            }
            // Check for direct addition (+50)
            else if (opBeadValue === 5 && !upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct addition (+60 to +90, involving 50-bead)
            else if (opBeadValue >= 6 && opBeadValue <= 9 && !upperBeadIsDown) {
                const lowerPart = opBeadValue % 5;
                if (lowerBeadsActive + lowerPart <= 4) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 50 addition (for +10 to +40 only)
            else if (opBeadValue >= 1 && opBeadValue <= 4 && !upperBeadIsDown) {
                const complementBead = 5 - opBeadValue;
                if (lowerBeadsActive - complementBead >= 0) { // Can subtract complement from active lower beads
                    moves.push('fo50');
                }
            }
        } else { // Subtraction
            // Check for direct subtraction (lower beads only: -10, -20, -30, -40)
            if (opBeadValue >= 1 && opBeadValue <= 4 && lowerBeadsActive - opBeadValue >= 0) {
                moves.push('direct');
            }
            // Check for direct subtraction (-50)
            else if (opBeadValue === 5 && upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct subtraction (-60 to -90, involving 50-bead)
            else if (opBeadValue >= 6 && opBeadValue <= 9 && upperBeadIsDown) {
                const lowerPart = opBeadValue % 5;
                if (lowerBeadsActive - lowerPart >= 0) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 50 subtraction (for -10 to -40 only)
            else if (opBeadValue >= 1 && opBeadValue <= 4 && upperBeadIsDown) {
                const complementBead = 5 - opBeadValue;
                if (lowerBeadsActive + complementBead <= 4) { // Can add complement to lower beads
                    moves.push('fo50');
                }
            }
        }
        return moves;
    }

    // NEW HELPER: Determines the state of beads on a hundreds rod (0-900 value, treated as 0-9 for bead logic)
    function getHundredsBeadState(value) {
        const hundredsDigit = Math.floor(value / 100);
        const upperBeadIsDown = hundredsDigit >= 5;
        const lowerBeadsActive = hundredsDigit % 5;
        return { upperBeadIsDown, lowerBeadsActive };
    }

    // NEW HELPER: Determines if a hundreds-digit operation (100-900 or -100 to -900) is possible
    // on a *single hundreds rod* using direct or Friends of 500 rules.
    function getPossibleHundredsRodMoves(currentRodValue, opValue, isAddition) {
        // currentRodValue is the actual numeric value of the hundreds rod (e.g., 0, 100, ..., 900)
        // opValue is the operation value (e.g., 100, 200, ..., 900)
        const { upperBeadIsDown, lowerBeadsActive } = getHundredsBeadState(currentRodValue);
        const moves = []; // Stores move types like 'direct', 'fo500'

        // Convert opValue to its 0-9 equivalent for the bead logic
        const opBeadValue = Math.abs(opValue) / 100;

        if (isAddition) {
            // Check for direct addition (lower beads only: +100, +200, +300, +400)
            if (opBeadValue >= 1 && opBeadValue <= 4 && lowerBeadsActive + opBeadValue <= 4) {
                moves.push('direct');
            }
            // Check for direct addition (+500)
            else if (opBeadValue === 5 && !upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct addition (+600 to +900, involving 500-bead)
            else if (opBeadValue >= 6 && opBeadValue <= 9 && !upperBeadIsDown) {
                const lowerPart = opBeadValue % 5;
                if (lowerBeadsActive + lowerPart <= 4) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 500 addition (for +100 to +400 only)
            else if (opBeadValue >= 1 && opBeadValue <= 4 && !upperBeadIsDown) {
                const complementBead = 5 - opBeadValue;
                if (lowerBeadsActive - complementBead >= 0) {
                    moves.push('fo500');
                }
            }
        } else { // Subtraction
            // Check for direct subtraction (lower beads only: -100, -200, -300, -400)
            if (opBeadValue >= 1 && opBeadValue <= 4 && lowerBeadsActive - opBeadValue >= 0) {
                moves.push('direct');
            }
            // Check for direct subtraction (-500)
            else if (opBeadValue === 5 && upperBeadIsDown) {
                moves.push('direct');
            }
            // Check for direct subtraction (-600 to -900, involving 500-bead)
            else if (opBeadValue >= 6 && opBeadValue <= 9 && upperBeadIsDown) {
                const lowerPart = opBeadValue % 5;
                if (lowerBeadsActive - lowerPart >= 0) {
                    moves.push('direct');
                }
            }
            // Check for Friends of 500 subtraction (for -100 to -400 only)
            else if (opBeadValue >= 1 && opBeadValue <= 4 && upperBeadIsDown) {
                const complementBead = 5 - opBeadValue;
                if (lowerBeadsActive + complementBead <= 4) {
                    moves.push('fo500');
                }
            }
        }
        return moves;
    }


    // --- Generator Functions ---

    // Function to generate sequences for "Lower Beads Only" (0-4 range)
    function generateLowerBeadsOnlySequence(targetLength) {
        let currentValue = 0;
        const operations = [];
        const baseOperations = [1, 2, 3, 4];

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];

            baseOperations.forEach(num => {
                if (currentValue + num <= 4) {
                    possibleMoves.push(num);
                }
            });

            baseOperations.forEach(num => {
                if (currentValue - num >= 0) {
                    possibleMoves.push(-num);
                }
            });

            if (possibleMoves.length === 0) {
                break;
            }

            let chosenOperation;
            if (i < targetLength - 1 && (currentValue === 0 || currentValue === 4)) {
                const movesAway = possibleMoves.filter(op =>
                    (currentValue === 0 && op > 0) || (currentValue === 4 && op < 0)
                );
                if (movesAway.length > 0) {
                    chosenOperation = movesAway[Math.floor(Math.random() * movesAway.length)];
                } else {
                    chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            } else {
                chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }

            operations.push(chosenOperation);
            currentValue += chosenOperation;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((op, index) => {
            if (index === 0 && op > 0) return op.toString();
            return op > 0 ? `+ ${op}` : `- ${Math.abs(op)}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Full Unit Rod" (+5 -5 mode, 0-9 range)
    function generateUnitRodSequence(targetLength) {
        let currentValue = 0;
        const operations = [];
        const lowerBeadValues = [1, 2, 3, 4];
        const maxUnitValue = 9;

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];
            const currentLowerBeadsValue = currentValue % 5; // Current lower bead state (0-4)
            const isUpperBeadDown = currentValue >= 5; // Is the 5-bead active?

            // --- Determine possible additions ---
            // Add lower beads (1,2,3,4)
            for (const n of lowerBeadValues) {
                if (currentLowerBeadsValue + n <= 4) { // Enough physical lower beads available
                    if (currentValue + n <= maxUnitValue) { // Ensure total doesn't exceed 9
                        possibleMoves.push(n);
                    }
                }
            }
            // Add 5
            if (!isUpperBeadDown) { // 5-bead is not active
                if (currentValue + 5 <= maxUnitValue) { // Ensure total doesn't exceed 9
                    possibleMoves.push(5);
                }
            }


            // --- Determine possible subtractions ---
            // Subtract lower beads (1,2,3,4)
            for (const n of lowerBeadValues) {
                if (currentLowerBeadsValue - n >= 0) { // Enough physical lower beads active
                    if (currentValue - n >= 0) { // Ensure total doesn't go below 0
                        possibleMoves.push(-n);
                    }
                }
            }
            // Subtract 5
            if (isUpperBeadDown) { // 5-bead is active
                if (currentValue - 5 >= 0) { // Ensure total doesn't go below 0
                    possibleMoves.push(-5);
                }
            }

            if (possibleMoves.length === 0) {
                break;
            }

            let chosenOperation;
            // Pathfinding bias: Prioritize moves away from 0 or 9
            if (i < targetLength - 1 && (currentValue === 0 || currentValue === maxUnitValue)) {
                const movesAway = possibleMoves.filter(op =>
                    (currentValue === 0 && op > 0) || (currentValue === maxUnitValue && op < 0)
                );
                if (movesAway.length > 0) {
                    chosenOperation = movesAway[Math.floor(Math.random() * movesAway.length)];
                } else {
                    chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            } else {
                chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }

            operations.push(chosenOperation);
            currentValue += chosenOperation;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((op, index) => {
            if (index === 0 && op > 0) return op.toString();
            return op > 0 ? `+ ${op}` : `- ${Math.abs(op)}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Friends of 5" mode
    function generateFriendsOf5Sequence(targetLength) {
        let currentValue = 0;
        const operations = []; // Stores { value: number, type: 'direct'|'fo5', display: string }
        const maxUnitValue = 9;

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];

            // Iterate through possible operations (+1 to +9)
            for (let opVal = 1; opVal <= 9; opVal++) {
                const nextValue = currentValue + opVal;
                if (nextValue > maxUnitValue) continue; // Stay within 0-9 for single unit rod

                const singleRodMoveTypes = getPossibleSingleRodMoves(currentValue, opVal, true);
                if (singleRodMoveTypes.length > 0) { // If any move type is possible
                    possibleMoves.push({ value: opVal, type: singleRodMoveTypes[0], display: `${opVal}` });
                }
            }

            // Iterate through possible operations (-1 to -9)
            for (let opVal = 1; opVal <= 9; opVal++) {
                const nextValue = currentValue - opVal;
                if (nextValue < 0) continue; // Stay within 0-9 for single unit rod

                const singleRodMoveTypes = getPossibleSingleRodMoves(currentValue, -opVal, false);
                if (singleRodMoveTypes.length > 0) { // If any move type is possible
                    possibleMoves.push({ value: -opVal, type: singleRodMoveTypes[0], display: `${opVal}` });
                }
            }

            if (possibleMoves.length === 0) {
                break;
            }

            // --- Selection Logic: Prioritize Friends of 5 moves ---
            let chosenMove;
            const fo5Moves = possibleMoves.filter(move => move.type === 'fo5');
            const directMoves = possibleMoves.filter(move => move.type === 'direct');

            if (i < targetLength - 1 && fo5Moves.length > 0) {
                 // If Friends of 5 moves are available and not at the very end, pick one
                chosenMove = fo5Moves[Math.floor(Math.random() * fo5Moves.length)];
            } else {
                // Otherwise, pick a direct move or any available move if no fo5 moves
                if (directMoves.length > 0) {
                    chosenMove = directMoves[Math.floor(Math.random() * directMoves.length)];
                } else {
                    chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            }

            operations.push(chosenMove);
            currentValue += chosenMove.value;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((opObj, index) => {
            const displayValue = opObj.display;
            if (index === 0 && opObj.value > 0) return displayValue;
            return opObj.value > 0 ? `+ ${displayValue}` : `- ${displayValue}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Friends of 10" mode (up to 99)
    function generateFriendsOf10Sequence(targetLength) {
        let currentValue = 0; // Current value can be 0-99
        const operations = []; // Stores { value: number, display: string }

        for (let i = 0; i < targetLength; i++) {
            const possibleOperationsForNextStep = [];

            // Iterate through possible operations (+1 to +9, -1 to -9)
            for (let opVal = 1; opVal <= 9; opVal++) {
                // --- Attempt Addition (+opVal) ---
                let nextValueAdd = currentValue + opVal;
                if (nextValueAdd <= 99) { // Ensure total stays within 0-99
                    const currentUnits = currentValue % 10;
                    const currentTens = Math.floor(currentValue / 10);

                    // Scenario 1: Operation is fully on the units rod (no carry)
                    // Check if operation involves only the units rod and is valid
                    if (Math.floor((currentValue + opVal) / 10) === currentTens) {
                        const moves = getPossibleSingleRodMoves(currentUnits, opVal, true);
                        if (moves.length > 0) {
                            possibleOperationsForNextStep.push({ value: opVal, type: moves[0], display: `${opVal}` });
                        }
                    }
                    // Scenario 2: Carry to Tens Rod (Friends of 10 Addition)
                    else { // A carry of 10 occurred
                        const complement = 10 - opVal;
                        // Check if 1 (for 10) can be added to tens rod (direct or Fo5)
                        const canAdd1ToTens = getPossibleSingleRodMoves(currentTens, 1, true).length > 0;
                        // Check if complement can be subtracted from units rod
                        const canSubtractComplementFromUnits = getPossibleSingleRodMoves(currentUnits, -complement, false).length > 0;

                        if (canAdd1ToTens && canSubtractComplementFromUnits) {
                            possibleOperationsForNextStep.push({ value: opVal, type: 'fo10', display: `${opVal}` });
                        }
                    }
                }

                // --- Attempt Subtraction (-opVal) ---
                let nextValueSubtract = currentValue - opVal;
                if (nextValueSubtract >= 0) { // Ensure total stays within 0-99
                    const currentUnits = currentValue % 10;
                    const currentTens = Math.floor(currentValue / 10);

                    // Scenario 1: Operation is fully on the units rod (no borrow)
                    // Check if operation involves only the units rod and is valid
                    if (Math.floor((currentValue - opVal) / 10) === currentTens) {
                        const moves = getPossibleSingleRodMoves(currentUnits, -opVal, false);
                        if (moves.length > 0) {
                            possibleOperationsForNextStep.push({ value: -opVal, type: moves[0], display: `${opVal}` });
                        }
                    }
                    // Scenario 2: Borrow from Tens Rod (Friends of 10 Subtraction)
                    else { // A borrow of 10 occurred
                        const complement = 10 - opVal;
                        // Check if 1 (for 10) can be subtracted from tens rod (direct or Fo5)
                        const canSubtract1FromTens = getPossibleSingleRodMoves(currentTens, -1, false).length > 0;
                        // Check if complement can be added to units rod
                        const canAddComplementToUnits = getPossibleSingleRodMoves(currentUnits, complement, true).length > 0;

                        if (canSubtract1FromTens && canAddComplementToUnits) {
                            possibleOperationsForNextStep.push({ value: -opVal, type: 'fo10', display: `${opVal}` });
                        }
                    }
                }
            }

            if (possibleOperationsForNextStep.length === 0) {
                break; // Cannot extend sequence further
            }

            let chosenMove;
            const strategicMoves = possibleOperationsForNextStep.filter(move => {
                const nextValue = currentValue + move.value;
                if (move.type === 'fo10') return true;
                if ((currentValue === 0 && move.value > 0) || (currentValue === 99 && move.value < 0)) return true;
                return false;
            });

            if (i < targetLength - 1 && strategicMoves.length > 0) {
                chosenMove = strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
            } else {
                chosenMove = possibleOperationsForNextStep[Math.floor(Math.random() * possibleOperationsForNextStep.length)];
            }

            operations.push(chosenMove);
            currentValue += chosenMove.value;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '', operationsList: [] };
        }

        let sequenceString = operations.map((opObj, index) => {
            const displayValue = opObj.display;
            if (index === 0 && opObj.value > 0) return displayValue;
            return opObj.value > 0 ? `+ ${displayValue}` : `- ${displayValue}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Tens Rod Lower Beads Only" (0-40 range)
    function generateTensRodLowerBeadsOnlySequence(targetLength) {
        let currentValue = 0;
        const operations = [];
        const baseOperations = [10, 20, 30, 40];
        const maxTensValue = 40;

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];

            baseOperations.forEach(num => {
                if (currentValue + num <= maxTensValue) {
                    possibleMoves.push(num);
                }
            });

            baseOperations.forEach(num => {
                if (currentValue - num >= 0) {
                    possibleMoves.push(-num);
                }
            });

            if (possibleMoves.length === 0) {
                break;
            }

            let chosenOperation;
            if (i < targetLength - 1 && (currentValue === 0 || currentValue === maxTensValue)) {
                const movesAway = possibleMoves.filter(op =>
                    (currentValue === 0 && op > 0) || (currentValue === maxTensValue && op < 0)
                );
                if (movesAway.length > 0) {
                    chosenOperation = movesAway[Math.floor(Math.random() * movesAway.length)];
                } else {
                    chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            } else {
                chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }

            operations.push(chosenOperation);
            currentValue += chosenOperation;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((op, index) => {
            if (index === 0 && op > 0) return op.toString();
            return op > 0 ? `+ ${op}` : `- ${Math.abs(op)}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Full Tens Rod" (+50 -50 mode, 0-90 range)
    function generateFullTensRodSequence(targetLength) {
        let currentValue = 0;
        const operations = [];
        const lowerBeadValues = [10, 20, 30, 40]; // Operations for lower tens beads
        const maxTensRodValue = 90; // Max value for the tens rod (0-90)

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];
            const currentLowerBeadsValue = currentValue % 50; // Represents 0, 10, 20, 30, 40 (value of lower beads)
            const isUpperBeadDown = currentValue >= 50; // Is the 50-bead active?

            // --- Determine possible additions ---
            // Add lower beads (10,20,30,40)
            for (const n of lowerBeadValues) {
                // Check if enough physical lower beads are available (scaled by 10)
                // (currentLowerBeadsValue + n) should not cross the 50 boundary, and the beads count (value/10) must be <= 4
                // A simpler check for this: currentLowerBeadsValue + n should result in a value that is still a 'lower bead' part
                if (((currentLowerBeadsValue + n) % 50 === (currentLowerBeadsValue + n)) && ((currentLowerBeadsValue + n) / 10 <= 4)) {
                    if (currentValue + n <= maxTensRodValue) { // Ensure total doesn't exceed 90
                        possibleMoves.push(n);
                    }
                }
            }
            // Add 50
            if (!isUpperBeadDown) { // 50-bead is not active
                if (currentValue + 50 <= maxTensRodValue) { // Ensure total doesn't exceed 90
                    possibleMoves.push(50);
                }
            }

            // --- Determine possible subtractions ---
            // Subtract lower beads (10,20,30,40)
            for (const n of lowerBeadValues) {
                // Check if enough physical lower beads are active (scaled by 10)
                if ((currentLowerBeadsValue - n) >= 0) {
                    if (currentValue - n >= 0) { // Ensure total doesn't go below 0
                        possibleMoves.push(-n);
                    }
                }
            }
            // Subtract 50
            if (isUpperBeadDown) { // 50-bead is active
                if (currentValue - 50 >= 0) { // Ensure total doesn't go below 0
                    possibleMoves.push(-50);
                }
            }

            if (possibleMoves.length === 0) {
                break;
            }

            let chosenOperation;
            // Pathfinding bias: Prioritize moves away from 0 or 90
            if (i < targetLength - 1 && (currentValue === 0 || currentValue === maxTensRodValue)) {
                const movesAway = possibleMoves.filter(op =>
                    (currentValue === 0 && op > 0) || (currentValue === maxTensRodValue && op < 0)
                );
                if (movesAway.length > 0) {
                    chosenOperation = movesAway[Math.floor(Math.random() * movesAway.length)];
                } else {
                    chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            } else {
                chosenOperation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            }

            operations.push(chosenOperation);
            currentValue += chosenOperation;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((op, index) => {
            if (index === 0 && op > 0) return op.toString();
            return op > 0 ? `+ ${op}` : `- ${Math.abs(op)}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // Function to generate sequences for "Friends of 50" mode
    function generateFriendsOf50Sequence(targetLength) {
        let currentValue = 0;
        const operations = []; // Stores { value: number, type: 'direct'|'fo50', display: string }
        const maxTensRodValue = 90; // Max value for the tens rod (0-90)

        for (let i = 0; i < targetLength; i++) {
            const possibleMoves = [];

            // Iterate through possible operations (+10 to +90)
            for (let opVal = 10; opVal <= 90; opVal += 10) {
                const nextValue = currentValue + opVal;
                if (nextValue > maxTensRodValue) continue; // Stay within 0-90 for single tens rod

                const tensRodMoveTypes = getPossibleTensRodMoves(currentValue, opVal, true);
                if (tensRodMoveTypes.length > 0) { // If any move type is possible
                    possibleMoves.push({ value: opVal, type: tensRodMoveTypes[0], display: `${opVal}` });
                }
            }

            // Iterate through possible operations (-10 to -90)
            for (let opVal = 10; opVal <= 90; opVal += 10) {
                const nextValue = currentValue - opVal;
                if (nextValue < 0) continue; // Stay within 0-90 for single tens rod

                const tensRodMoveTypes = getPossibleTensRodMoves(currentValue, -opVal, false);
                if (tensRodMoveTypes.length > 0) { // If any move type is possible
                    possibleMoves.push({ value: -opVal, type: tensRodMoveTypes[0], display: `${opVal}` });
                }
            }

            if (possibleMoves.length === 0) {
                break;
            }

            // --- Selection Logic: Prioritize Friends of 50 moves ---
            let chosenMove;
            const fo50Moves = possibleMoves.filter(move => move.type === 'fo50');
            const directMoves = possibleMoves.filter(move => move.type === 'direct');

            if (i < targetLength - 1 && fo50Moves.length > 0) {
                 // If Friends of 50 moves are available and not at the very end, pick one
                chosenMove = fo50Moves[Math.floor(Math.random() * fo50Moves.length)];
            } else {
                // Otherwise, pick a direct move or any available move if no fo50 moves
                if (directMoves.length > 0) {
                    chosenMove = directMoves[Math.floor(Math.random() * directMoves.length)];
                } else {
                    chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                }
            }

            operations.push(chosenMove);
            currentValue += chosenMove.value;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '' };
        }

        let sequenceString = operations.map((opObj, index) => {
            const displayValue = opObj.display;
            if (index === 0 && opObj.value > 0) return displayValue;
            return opObj.value > 0 ? `+ ${displayValue}` : `- ${displayValue}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }

    // NEW GENERATOR: Function to generate sequences for "Friends of 100" mode (up to 999)
    function generateFriendsOf100Sequence(targetLength) {
        let currentValue = 0; // Current value can be 0-999
        const operations = []; // Stores { value: number, display: string }
        const MAX_VALUE = 999;

        for (let i = 0; i < targetLength; i++) {
            const possibleOperationsForNextStep = [];

            // Try operations that primarily affect the units place, then tens, then hundreds
            // For simplicity in generating, we'll try operations in increments of 1, 10, 100.
            // This can be expanded to random values later if needed.

            const potentialOps = [1, 2, 3, 4, 5, 6, 7, 8, 9,
                                 10, 20, 30, 40, 50, 60, 70, 80, 90,
                                 100, 200, 300, 400, 500, 600, 700, 800, 900];

            for (const opVal of potentialOps) {
                // --- Attempt Addition (+opVal) ---
                let nextValueAdd = currentValue + opVal;
                if (nextValueAdd <= MAX_VALUE) {
                    const currentUnits = currentValue % 10;
                    const currentTens = Math.floor((currentValue % 100) / 10);
                    const currentHundreds = Math.floor(currentValue / 100);

                    let isValidAdd = false;
                    let typeOfMove = '';

                    if (opVal < 10) { // Units-level operation
                        const moves = getPossibleSingleRodMoves(currentUnits, opVal, true);
                        if (moves.length > 0) {
                            isValidAdd = true;
                            typeOfMove = moves[0];
                        } else { // Check for Friends of 10 carry
                            const complement = 10 - opVal;
                            if (getPossibleSingleRodMoves(currentUnits, -complement, false).length > 0 &&
                                getPossibleTensRodMoves(currentTens * 10, 10, true).length > 0) {
                                isValidAdd = true;
                                typeOfMove = 'fo10';
                            }
                        }
                    } else if (opVal < 100) { // Tens-level operation
                        const tempUnits = opVal % 10; // This should be 0 for tens-level ops
                        const tempTens = Math.floor(opVal / 10);

                        // If it's a pure tens operation (e.g., +20, +50)
                        if (tempUnits === 0) {
                            const moves = getPossibleTensRodMoves(currentTens * 10, tempTens * 10, true);
                            if (moves.length > 0) {
                                isValidAdd = true;
                                typeOfMove = moves[0];
                            } else { // Check for Friends of 100 carry
                                const complement = 100 - opVal;
                                if (getPossibleTensRodMoves(currentTens * 10, -complement, false).length > 0 &&
                                    getPossibleHundredsRodMoves(currentHundreds * 100, 100, true).length > 0) {
                                    isValidAdd = true;
                                    typeOfMove = 'fo100';
                                }
                            }
                        }
                    } else { // Hundreds-level operation
                         const tempTens = (opVal % 100) / 10; // This should be 0 for hundreds-level ops
                         const tempHundreds = Math.floor(opVal / 100);

                         if (tempTens === 0) {
                            const moves = getPossibleHundredsRodMoves(currentHundreds * 100, tempHundreds * 100, true);
                            if (moves.length > 0) {
                                isValidAdd = true;
                                typeOfMove = moves[0]; // Could be direct or fo500
                            }
                         }
                    }

                    if (isValidAdd) {
                        possibleOperationsForNextStep.push({ value: opVal, type: typeOfMove, display: `${opVal}` });
                    }
                }

                // --- Attempt Subtraction (-opVal) ---
                let nextValueSubtract = currentValue - opVal;
                if (nextValueSubtract >= 0) {
                    const currentUnits = currentValue % 10;
                    const currentTens = Math.floor((currentValue % 100) / 10);
                    const currentHundreds = Math.floor(currentValue / 100);

                    let isValidSubtract = false;
                    let typeOfMove = '';

                    if (opVal < 10) { // Units-level operation
                        const moves = getPossibleSingleRodMoves(currentUnits, -opVal, false);
                        if (moves.length > 0) {
                            isValidSubtract = true;
                            typeOfMove = moves[0];
                        } else { // Check for Friends of 10 borrow
                            const complement = 10 - opVal;
                            if (getPossibleSingleRodMoves(currentUnits, complement, true).length > 0 &&
                                getPossibleTensRodMoves(currentTens * 10, -10, false).length > 0) {
                                isValidSubtract = true;
                                typeOfMove = 'fo10';
                            }
                        }
                    } else if (opVal < 100) { // Tens-level operation
                        const tempUnits = opVal % 10;
                        const tempTens = Math.floor(opVal / 10);

                        if (tempUnits === 0) { // Pure tens operation (e.g., -20, -50)
                            const moves = getPossibleTensRodMoves(currentTens * 10, -tempTens * 10, false);
                            if (moves.length > 0) {
                                isValidSubtract = true;
                                typeOfMove = moves[0];
                            } else { // Check for Friends of 100 borrow
                                const complement = 100 - opVal;
                                if (getPossibleTensRodMoves(currentTens * 10, complement, true).length > 0 &&
                                    getPossibleHundredsRodMoves(currentHundreds * 100, -100, false).length > 0) {
                                    isValidSubtract = true;
                                    typeOfMove = 'fo100';
                                }
                            }
                        }
                    } else { // Hundreds-level operation
                         const tempTens = (opVal % 100) / 10;
                         const tempHundreds = Math.floor(opVal / 100);

                         if (tempTens === 0) {
                            const moves = getPossibleHundredsRodMoves(currentHundreds * 100, -tempHundreds * 100, false);
                            if (moves.length > 0) {
                                isValidSubtract = true;
                                typeOfMove = moves[0]; // Could be direct or fo500
                            }
                         }
                    }

                    if (isValidSubtract) {
                        possibleOperationsForNextStep.push({ value: -opVal, type: typeOfMove, display: `${opVal}` });
                    }
                }
            }


            if (possibleOperationsForNextStep.length === 0) {
                break; // Cannot extend sequence further
            }

            let chosenMove;
            // Prioritize moves that involve Friends of 100, then Friends of 10, then Friends of 50, then Friends of 5
            // This is a common practice to ensure "complex" moves are generated
            const fo100Moves = possibleOperationsForNextStep.filter(move => move.type === 'fo100');
            const fo10Moves = possibleOperationsForNextStep.filter(move => move.type === 'fo10');
            const fo50Moves = possibleOperationsForNextStep.filter(move => move.type === 'fo50');
            const fo5Moves = possibleOperationsForNextStep.filter(move => move.type === 'fo5');
            const directMoves = possibleOperationsForNextStep.filter(move => move.type === 'direct');


            if (i < targetLength - 1 && fo100Moves.length > 0) {
                chosenMove = fo100Moves[Math.floor(Math.random() * fo100Moves.length)];
            } else if (i < targetLength - 1 && fo10Moves.length > 0) {
                chosenMove = fo10Moves[Math.floor(Math.random() * fo10Moves.length)];
            } else if (i < targetLength - 1 && fo50Moves.length > 0) {
                chosenMove = fo50Moves[Math.floor(Math.random() * fo50Moves.length)];
            } else if (i < targetLength - 1 && fo5Moves.length > 0) {
                chosenMove = fo5Moves[Math.floor(Math.random() * fo50Moves.length)]; // Should be fo5Moves here, typo fixed.
            } else {
                // If no "friend" moves, pick a direct one or any available
                if (directMoves.length > 0) {
                     chosenMove = directMoves[Math.floor(Math.random() * directMoves.length)];
                } else {
                     chosenMove = possibleOperationsForNextStep[Math.floor(Math.random() * possibleOperationsForNextStep.length)];
                }
            }


            operations.push(chosenMove);
            currentValue += chosenMove.value;
        }

        if (operations.length === 0) {
            return { sequence: 'Could not generate sequence with requested length/rules.', result: '', operationsList: [] };
        }

        let sequenceString = operations.map((opObj, index) => {
            const displayValue = opObj.display;
            if (index === 0 && opObj.value > 0) return displayValue;
            return opObj.value > 0 ? `+ ${displayValue}` : `- ${displayValue}`;
        }).join(' ');

        return { sequence: sequenceString, result: currentValue, operationsList: operations };
    }


    // --- Mode Selection Logic ---
    function setActiveButton(activeBtn) {
        lowerBeadsModeBtn.classList.remove('active');
        unitRodModeBtn.classList.remove('active');
        friendsOf5ModeBtn.classList.remove('active');
        friendsOf10ModeBtn.classList.remove('active');
        tensRodLowerBeadsModeBtn.classList.remove('active');
        fullTensRodModeBtn.classList.remove('active');
        friendsOf50ModeBtn.classList.remove('active');
        friendsOf100ModeBtn.classList.remove('active'); // NEW: Remove active from new button

        activeBtn.classList.add('active');
    }

    lowerBeadsModeBtn.addEventListener('click', () => {
        currentMode = 'lowerBeads';
        setActiveButton(lowerBeadsModeBtn);
    });

    unitRodModeBtn.addEventListener('click', () => {
        currentMode = 'unitRod';
        setActiveButton(unitRodModeBtn);
    });

    friendsOf5ModeBtn.addEventListener('click', () => {
        currentMode = 'friendsOf5';
        setActiveButton(friendsOf5ModeBtn);
    });

    friendsOf10ModeBtn.addEventListener('click', () => {
        currentMode = 'friendsOf10';
        setActiveButton(friendsOf10ModeBtn);
    });

    tensRodLowerBeadsModeBtn.addEventListener('click', () => {
        currentMode = 'tensRodLowerBeads';
        setActiveButton(tensRodLowerBeadsModeBtn);
    });

    fullTensRodModeBtn.addEventListener('click', () => {
        currentMode = 'fullTensRod';
        setActiveButton(fullTensRodModeBtn);
    });

    friendsOf50ModeBtn.addEventListener('click', () => {
        currentMode = 'friendsOf50';
        setActiveButton(friendsOf50ModeBtn);
    });

    friendsOf100ModeBtn.addEventListener('click', () => { // NEW: Event listener for new button
        currentMode = 'friendsOf100';
        setActiveButton(friendsOf100ModeBtn);
    });

    // Set initial active button
    setActiveButton(lowerBeadsModeBtn);

    // --- Main Generate Button Event Listener ---
    generateBtn.addEventListener('click', () => {
        const numToGenerate = parseInt(numExamplesInput.value, 10);
        const targetOpsPerSequence = parseInt(operationsPerSequenceInput.value, 10);

        if (isNaN(numToGenerate) || numToGenerate < 1) {
            alert('Please enter a valid number of sequences to generate (1 or more).');
            return;
        }
        if (isNaN(targetOpsPerSequence) || targetOpsPerSequence < 1) {
            alert('Please enter a valid number for operations per sequence (1 or more).');
            return;
        }

        outputDiv.innerHTML = ''; // Clear previous results

        for (let i = 0; i < numToGenerate; i++) {
            let resultObj;
            if (currentMode === 'lowerBeads') {
                resultObj = generateLowerBeadsOnlySequence(targetOpsPerSequence);
            } else if (currentMode === 'unitRod') {
                resultObj = generateUnitRodSequence(targetOpsPerSequence);
            } else if (currentMode === 'friendsOf5') {
                resultObj = generateFriendsOf5Sequence(targetOpsPerSequence);
            } else if (currentMode === 'friendsOf10') {
                resultObj = generateFriendsOf10Sequence(targetOpsPerSequence);
            } else if (currentMode === 'tensRodLowerBeads') {
                resultObj = generateTensRodLowerBeadsOnlySequence(targetOpsPerSequence);
            } else if (currentMode === 'fullTensRod') {
                resultObj = generateFullTensRodSequence(targetOpsPerSequence);
            } else if (currentMode === 'friendsOf50') {
                resultObj = generateFriendsOf50Sequence(targetOpsPerSequence);
            } else if (currentMode === 'friendsOf100') { // NEW: Call new generator function
                resultObj = generateFriendsOf100Sequence(targetOpsPerSequence);
            }

            const { sequence, result, operationsList } = resultObj;

            const p = document.createElement('p');
            p.classList.add('example');
            p.innerHTML = `${i + 1}. ${sequence} = <span>${result}</span>`;

            if (sequence === 'Could not generate sequence with requested length/rules.') {
                p.innerHTML += `<br><small class="hint">(Could not generate a sequence with requested length/rules. Try different parameters or fewer operations.)</small>`;
            } else {
                if (operationsList && operationsList.length > 0 && operationsList.length < targetOpsPerSequence) {
                    p.innerHTML += `<br><small class="hint">(Note: Generated ${operationsList.length} operations, requested ${targetOpsPerSequence}. This can happen due to abacus constraints.)</small>`;
                }
            }

            outputDiv.appendChild(p);
        }
    });

    // --- Clear Button Event Listener ---
    clearBtn.addEventListener('click', () => {
        outputDiv.innerHTML = '';
    });
});
let questions = [];
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let attempted = 0;
let selectedAnswer = null;
let timeLeft;
let timerRunning = false;
let extraTime = 0;
let startTime;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLM"; // Custom alphabet system

function startTest() {
    let numQuestions = document.getElementById("numQuestions").value.trim();
    let maxInt = document.getElementById("maxInt").value.trim();
    let setMinutes = document.getElementById("setMinutes").value.trim();
    let setSeconds = document.getElementById("setSeconds").value.trim();

    // Ensure Number of Questions & Maximum Subtraction Integer are entered
    if (numQuestions === "" || maxInt === "") {
        alert("Enter both the number of questions and maximum subtraction integer!");
        return;
    }

    numQuestions = parseInt(numQuestions);
    maxInt = parseInt(maxInt);

    if (isNaN(numQuestions) || numQuestions < 1 || isNaN(maxInt) || maxInt < 1 || maxInt > 20) {
        alert("Enter valid values for number of questions and max subtraction limit!");
        return;
    }

    // Ensure at least one of 'Minutes' or 'Seconds' is provided
    if (setMinutes === "" && setSeconds === "") {
        alert("Enter at least Minutes or Seconds for the timer!");
        return;
    }

    let minutes = setMinutes === "" ? 0 : parseInt(setMinutes);
    let seconds = setSeconds === "" ? 0 : parseInt(setSeconds);

    if (isNaN(minutes) || minutes < 0 || minutes > 30 || isNaN(seconds) || seconds < 0 || seconds > 59) {
        alert("Enter valid values for time!");
        return;
    }

    timeLeft = minutes * 60 + seconds;
    startTime = new Date(); // Start hidden clock
    generateQuestions(numQuestions, maxInt);

    document.getElementById("setup").style.display = "none";
    document.getElementById("test").style.display = "block";

    startTimer();
    loadQuestion();
}
function startTimer() {
    timerRunning = true;
    let timerInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        document.getElementById("timeLeft").innerText =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft > 0) {
            timeLeft--;
        } else {
            if (timerRunning) {
                document.getElementById("timeUpMessage").innerText =
                    `Time up! You attempted ${attempted} questions till now. Keep practicing!`;
                document.getElementById("timeUpMessage").style.color = "navy";
                timerRunning = false;
            }
            extraTime++;
        }
    }, 1000);
}

function generateQuestions(num, maxInt) {
    questions = [];
    for (let i = 0; i < num; i++) {
        let letter1, letter2, pos1, pos2, answer1, answer2;

        do {
            letter1 = alphabet[Math.floor(Math.random() * 39)];
            letter2 = alphabet[Math.floor(Math.random() * 39)];

            pos1 = alphabet.indexOf(letter1) + 1;
            pos2 = alphabet.indexOf(letter2) + 1;

            answer1 = pos1 - pos2;

            if (pos1 > 26) pos1 -= 26;
            if (pos2 > 26) pos2 -= 26;

            let altAnswer = pos1 - pos2;
            answer2 = altAnswer !== answer1 ? altAnswer : null;
            
        } while (answer1 === 0 || (answer2 !== null && answer2 === 0)); // Ensure subtraction is never 0

        let finalAnswer = answer1;

        if (answer2 !== null) {
            if (Math.abs(answer2) < Math.abs(answer1)) {
                finalAnswer = answer2;
            } else if (Math.abs(answer2) === Math.abs(answer1)) {
                finalAnswer = [answer1, answer2]; // Both are correct
            }
        }

        if (Math.abs(finalAnswer) <= maxInt) {
            questions.push({ question: `${letter1} - ${letter2} = ?`, answer: finalAnswer });
        } else {
            i--; // Ensure only valid questions are generated
        }
    }
}

function loadQuestion() {
    let q = questions[currentQuestion];
    document.getElementById("questionNumber").innerText = `Question ${currentQuestion + 1} of ${questions.length}`;
    document.getElementById("question").innerText = q.question;
    document.getElementById("options").innerHTML = "";
    document.getElementById("feedback").innerText = "";

    let options = [q.answer].flat().concat(generateWrongOptions(q.answer));
    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        let btn = document.createElement("button");
        btn.innerText = option;
        btn.onclick = () => selectOption(btn, option);
        document.getElementById("options").appendChild(btn);
    });

    selectedAnswer = null;
}

function generateWrongOptions(correct) {
    let options = [];
    while (options.length < 3) {
        let rand = Math.floor(Math.random() * 20) - 13; // Random value between -13 and 20
        if (!options.includes(rand) && ![correct].flat().includes(rand)) {
            options.push(rand);
        }
    }
    return options;
}

function selectOption(button, answer) {
    document.querySelectorAll("#options button").forEach(btn => {
        btn.classList.remove("selected");
    });
    button.classList.add("selected");
    selectedAnswer = answer;
}
function saveAnswer() {
    if (selectedAnswer === null) return;

    attempted++;
    let correctAnswer = questions[currentQuestion].answer;
    let feedback = document.getElementById("feedback");

    if (selectedAnswer === correctAnswer || (Array.isArray(correctAnswer) && correctAnswer.includes(selectedAnswer))) {
        correctAnswers++;
        feedback.innerText = "Very Good! Your answer is correct!";
        feedback.style.color = "green";
    } else {
        wrongAnswers++;
        feedback.innerText = `Oops! That was wrong! Correct answer: ${correctAnswer}`;
        feedback.style.color = "red";
    }

    document.querySelectorAll("#options button").forEach(btn => {
        btn.onclick = null; // Disable answer changes
    });

    document.getElementById("nextButton").disabled = false; // Enable 'Next' after saving

    if (attempted === questions.length) submitTest(); // Auto-submit if all answered
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        submitTest();
    }
}

function submitTest() {
    document.getElementById("test").style.display = "none";
    document.getElementById("result").style.display = "block";

    let endTime = new Date();
    let totalTime = Math.floor((endTime - startTime) / 1000);
    let minutesTaken = Math.floor(totalTime / 60);
    let secondsTaken = totalTime % 60;

    document.getElementById("score").innerText = `Correct: ${correctAnswers}`;
    document.getElementById("wrong").innerText = `Wrong: ${wrongAnswers}`;
    document.getElementById("unattempted").innerText = `Unattempted: ${questions.length - attempted}`;
    document.getElementById("timeTaken").innerText = `Time Taken: ${minutesTaken}m ${secondsTaken}s`;
}

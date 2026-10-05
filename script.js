const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const quizForm = document.getElementById('quiz-form');
const questionsContainer = document.getElementById('questions-container');
const submitBtn = document.getElementById('submit-btn');
const resultSection = document.getElementById('result-section');
const scoreText = document.getElementById('score-text');
const restartBtn = document.getElementById('restart-btn');


let allQuestions = [];


const API_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';


async function fetchQuestions() {
    try {
        loadingDiv.style.display = 'block';
        quizForm.style.display = 'none';
        errorDiv.style.display = 'none';
        resultSection.style.display = 'none';

        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data from the server.');
        }

        const data = await response.json();
        
       
        allQuestions = data.results.map((item, index) => {
           
            const options = [...item.incorrect_answers, item.correct_answer];
            shuffleArray(options);

            return {
                id: index,
                question: decodeHTML(item.question),
                options: options.map(opt => decodeHTML(opt)),
                correctAnswer: decodeHTML(item.correct_answer)
            };
        });

        displayQuestions();
    } catch (error) {
        loadingDiv.style.display = 'none';
        errorDiv.textContent = `Error: ${error.message}. Please check your internet connection and try refreshing.`;
        errorDiv.style.display = 'block';
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}


function displayQuestions() {
    loadingDiv.style.display = 'none';
    quizForm.style.display = 'block';
    questionsContainer.innerHTML = '';

    allQuestions.forEach((q, index) => {
        const card = document.createElement('div');
        card.classList.add('question-card');
        card.setAttribute('id', `question-card-${index}`);

        let optionsHTML = '';
        q.options.forEach(option => {
            optionsHTML += `
                <label class="option-label">
                    <input type="radio" name="question-${index}" value="${option}" required>
                    ${option}
                </label>
            `;
        });

        card.innerHTML = `
            <h3>Q${index + 1}: ${q.question}</h3>
            <div class="options-group">
                ${optionsHTML}
            </div>
        `;

        questionsContainer.appendChild(card);
    });
}

quizForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload
    
    let score = 0;

    allQuestions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        const card = document.getElementById(`question-card-${index}`);
        const labels = card.querySelectorAll('.option-label');

        const inputs = card.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);

  
        if (selectedOption) {
            const userAnswer = selectedOption.value;

            labels.forEach(label => {
                const input = label.querySelector('input');
               
                if (input.value === q.correctAnswer) {
                    label.classList.add('correct');
                } else if (input.value === userAnswer && userAnswer !== q.correctAnswer) {
                    label.classList.add('incorrect');
                }
            });

          
            if (userAnswer === q.correctAnswer) {
                score++;
            }
        } else {
          
            labels.forEach(label => {
                if (label.querySelector('input').value === q.correctAnswer) {
                    label.classList.add('correct');
                }
            });
        }
    });

    submitBtn.style.display = 'none';
    quizForm.style.display = 'none';
    resultSection.style.display = 'block';
    scoreText.textContent = `You scored ${score} out of ${allQuestions.length} (${(score / allQuestions.length) * 100}%)`;
});

restartBtn.addEventListener('click', () => {
    submitBtn.style.display = 'block';
    fetchQuestions(); 
});


fetchQuestions();
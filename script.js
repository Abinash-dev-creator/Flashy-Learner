// DOM Elements
import { fetchTranscript } from "youtube-transcript"
const youtubeUrlInput = document.getElementById("youtubeUrl")
const wikipediaTopicInput = document.getElementById("wikipediaTopic")
const fetchYoutubeButton = document.getElementById("fetchYoutube")
const fetchWikipediaButton = document.getElementById("fetchWikipedia")
const flashcard = document.getElementById("flashcard")
const frontText = document.getElementById("front-text")
const backText = document.getElementById("back-text")
const prevCardButton = document.getElementById("prevCard")
const nextCardButton = document.getElementById("nextCard")
const shuffleCardButton = document.getElementById("shuffleCard")
const saveCardsButton = document.getElementById("saveCards")
const loadCardsButton = document.getElementById("loadCards")
const startQuizButton = document.getElementById("startQuiz")
const nextQuestionButton = document.getElementById("nextQuestion")
const flashcardSection = document.querySelector(".flashcard-section")
const dataSourceTitle = document.getElementById("data-source-title")
const quizSection = document.querySelector(".quiz-section")
const questionArea = document.querySelector(".question-area")
const questionText = document.getElementById("question")
const optionsContainer = document.querySelector(".options")
const feedbackText = document.getElementById("feedback-text")
const theorySection = document.querySelector(".theory-section")

// Variables
let cards = []
let currentCardIndex = 0
let quizQuestions = []
let currentQuestionIndex = 0
let score = 0
let dataSource = "none"

// Functions
function updateCardDisplay() {
  if (cards.length === 0) {
    frontText.innerText = "No cards created"
    backText.innerText = ""
    flashcardSection.style.display = "none"
    dataSource = "none"
    return
  }

  frontText.innerText = cards[currentCardIndex].term
  backText.innerText = cards[currentCardIndex].definition
}

function extractVideoId(url) {
  const match =
    url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/)
  return match ? match[1] : null
}

async function fetchYoutubeTranscript(url) {
  if (!url) {
    throw new Error("Please enter a YouTube URL")
  }

  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  try {
    const transcriptData = await fetchTranscript(videoId)

    if (!transcriptData || transcriptData.length === 0) {
      throw new Error("Transcript not available for this video.")
    }

    const sentences = transcriptData
      .map((item) => item.text)
      .join(" ")
      .split(".")
      .filter((sentence) => sentence.trim().length > 1)
      .slice(0, 12) // Limit to 12 sentences for flashcards

    return sentences
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error)
    throw new Error("An error occurred while fetching the transcript. Check the console for details.")
  }
}

function generateQuizQuestions() {
  quizQuestions = cards.map((card, index) => {
    const incorrectOptions = cards
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((incorrectCard) => incorrectCard.definition)

    return {
      question: card.term,
      options: [...incorrectOptions, card.definition].sort(() => 0.5 - Math.random()),
      correctAnswer: card.definition,
    }
  })
}

function displayQuestion() {
  if (currentQuestionIndex < quizQuestions.length) {
    const question = quizQuestions[currentQuestionIndex]
    questionText.innerText = question.question

    optionsContainer.innerHTML = ""
    question.options.forEach((option) => {
      const button = document.createElement("button")
      button.innerText = option
      button.classList.add("option")
      button.addEventListener("click", () => checkAnswer(option, question.correctAnswer))
      optionsContainer.appendChild(button)
    })
  } else {
    endQuiz()
  }
}

function checkAnswer(selectedOption, correctAnswer) {
  if (selectedOption === correctAnswer) {
    feedbackText.innerText = "Correct!"
    score++
  } else {
    feedbackText.innerText = `Incorrect. Correct answer: ${correctAnswer}`
  }

  optionsContainer.querySelectorAll(".option").forEach((button) => {
    button.disabled = true
  })
}

function startQuiz() {
  quizSection.style.display = "block"
  generateQuizQuestions()
  currentQuestionIndex = 0
  score = 0
  displayQuestion()
  questionArea.style.display = "block"
  nextQuestionButton.style.display = "block"
  startQuizButton.style.display = "none"
}

function nextQuestion() {
  feedbackText.innerText = ""
  currentQuestionIndex++
  optionsContainer.querySelectorAll(".option").forEach((button) => {
    button.disabled = false
  })
  displayQuestion()
}

function endQuiz() {
  questionText.innerText = `Quiz completed! Your score is ${score} out of ${quizQuestions.length}`
  optionsContainer.innerHTML = ""
  nextQuestionButton.style.display = "none"
  feedbackText.innerText = ""
  quizSection.style.display = "none"
  startQuizButton.style.display = "block"
}

// Event Listeners
flashcard.addEventListener("click", () => {
  const front = flashcard.querySelector(".front")
  const back = flashcard.querySelector(".back")

  if (front.style.display === "none") {
    front.style.display = "block"
    back.style.display = "none"
  } else {
    front.style.display = "none"
    back.style.display = "block"
  }
})

prevCardButton.addEventListener("click", () => {
  if (cards.length > 0) {
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length
    updateCardDisplay()
    flashcard.querySelector(".front").style.display = "block"
    flashcard.querySelector(".back").style.display = "none"
  }
})

nextCardButton.addEventListener("click", () => {
  if (cards.length > 0) {
    currentCardIndex = (currentCardIndex + 1) % cards.length
    updateCardDisplay()
    flashcard.querySelector(".front").style.display = "block"
    flashcard.querySelector(".back").style.display = "none"
  }
})

shuffleCardButton.addEventListener("click", () => {
  if (cards.length > 0) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    currentCardIndex = 0
    updateCardDisplay()
  }
})

saveCardsButton.addEventListener("click", () => {
  localStorage.setItem("flashcards", JSON.stringify(cards))
  alert("Flashcards are saved locally")
})

loadCardsButton.addEventListener("click", () => {
  const savedCards = localStorage.getItem("flashcards")
  if (savedCards) {
    cards = JSON.parse(savedCards)
    currentCardIndex = 0
    updateCardDisplay()
    alert("Flashcards are loaded successfully")
  }
})

fetchYoutubeButton.addEventListener("click", async () => {
  const youtubeUrl = youtubeUrlInput.value
  dataSource = "youtube"
  theorySection.style.display = "none"
  quizSection.style.display = "none"

  if (youtubeUrl) {
    try {
      console.log("Fetching data from YouTube...")
      const sentences = await fetchYoutubeTranscript(youtubeUrl)
      console.log("Fetched sentences:", sentences)

      cards = sentences.map((sentence) => ({
        term: sentence.trim(),
        definition: sentence.trim(),
      }))

      currentCardIndex = 0
      dataSourceTitle.innerText = "Data Source: YouTube"
      flashcardSection.style.display = "block"
      updateCardDisplay()
    } catch (error) {
        console.error("Error fetching YouTube transcript:", error)
      alert(error.message)
      flashcardSection.style.display = "none"
      cards = []
      updateCardDisplay()
    }
  } else {
    alert("Please Enter a valid YouTube URL")
    flashcardSection.style.display = "none"
    cards = []
    updateCardDisplay()
  }
})

fetchWikipediaButton.addEventListener("click", async () => {
  const topic = wikipediaTopicInput.value
  dataSource = "wikipedia"
  theorySection.style.display = "none"
  quizSection.style.display = "none"

  if (topic) {
    try {
      console.log("Fetching data from Wikipedia...")
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${topic}`)
      console.log("Response Received", response)
      if (response.ok) {
        console.log("Response status ok")
        const data = await response.json()
        console.log("Raw API Response:", data)

        const description = data.extract || data.description || data.detail
        console.log("Description", description)
        if (description) {
          const sentences = description
            .split(".")
            .filter((sentence) => sentence.trim().length > 1)
            .slice(0, 12)
          if (sentences.length > 2) {
            cards = sentences.map((term) => ({
              term: term.trim(),
              definition: term.trim(),
            }))
            currentCardIndex = 0
            dataSourceTitle.innerText = "Data Source: Wikipedia"
            flashcardSection.style.display = "block"
            updateCardDisplay()
          } else {
            alert("Not enough data from wikipedia")
            flashcardSection.style.display = "none"
            cards = []
            updateCardDisplay()
          }
        } else {
          alert("No data Available")
          flashcardSection.style.display = "none"
          cards = []
          updateCardDisplay()
        }
      } else {
        console.error("Wikipedia API Error:", response.status, response.statusText)
        alert("Topic doesn't exist in wikipedia")
        flashcardSection.style.display = "none"
        cards = []
        updateCardDisplay()
      }
    } catch (error) {
      console.error("Error during Wikipedia fetch:", error)
      alert("Something went wrong. Check console for errors")
      flashcardSection.style.display = "none"
      cards = []
      updateCardDisplay()
    }
  } else {
    alert("Please Enter the Topic")
    flashcardSection.style.display = "none"
    cards = []
    updateCardDisplay()
  }
})

startQuizButton.addEventListener("click", startQuiz)
nextQuestionButton.addEventListener("click", nextQuestion)

// Initial Load
updateCardDisplay()


// FocusZen Interactive Features
class FocusZen {
  constructor() {
    this.timer = {
      minutes: 25,
      seconds: 0,
      isRunning: false,
      isFocusMode: true,
      interval: null,
    };

    this.goals = JSON.parse(localStorage.getItem("focuszen-goals")) || [];
    this.plannerData =
      JSON.parse(localStorage.getItem("focuszen-planner")) || {};

    this.init();
  }

  init() {
    this.initTimer();
    this.initGoals();
    this.initPlanner();
    this.initQuotes();
    this.loadData();
  }

  // Timer Functionality
  initTimer() {
    const startBtn = document.querySelector(".start-btn");
    const pauseBtn = document.querySelector(".pause-btn");
    const resetBtn = document.querySelector(".reset-btn");
    const timerDisplay = document.querySelector(".timer-time");

    startBtn.addEventListener("click", () => this.startTimer());
    pauseBtn.addEventListener("click", () => this.pauseTimer());
    resetBtn.addEventListener("click", () => this.resetTimer());

    this.updateTimerDisplay();
  }

  startTimer() {
    if (!this.timer.isRunning) {
      this.timer.isRunning = true;
      this.timer.interval = setInterval(() => {
        if (this.timer.seconds === 0) {
          if (this.timer.minutes === 0) {
            this.timerComplete();
            return;
          }
          this.timer.minutes--;
          this.timer.seconds = 59;
        } else {
          this.timer.seconds--;
        }
        this.updateTimerDisplay();
      }, 1000);
    }
  }

  pauseTimer() {
    this.timer.isRunning = false;
    clearInterval(this.timer.interval);
  }

  resetTimer() {
    this.pauseTimer();
    this.timer.minutes = this.timer.isFocusMode ? 25 : 5;
    this.timer.seconds = 0;
    this.updateTimerDisplay();
  }

  timerComplete() {
    this.pauseTimer();
    this.playNotification();

    // Switch modes
    this.timer.isFocusMode = !this.timer.isFocusMode;
    this.timer.minutes = this.timer.isFocusMode ? 25 : 5;
    this.timer.seconds = 0;

    this.updateTimerDisplay();
    this.updateTimerMode();

    // Show completion message
    this.showNotification(
      this.timer.isFocusMode
        ? "Break time is over! Ready to focus?"
        : "Great work! Time for a break."
    );
  }

  updateTimerDisplay() {
    const display = document.querySelector(".timer-time");
    const minutes = String(this.timer.minutes).padStart(2, "0");
    const seconds = String(this.timer.seconds).padStart(2, "0");
    display.textContent = `${minutes}:${seconds}`;
  }

  updateTimerMode() {
    const focusMode = document.querySelector(".timer-mode .mode-active");
    const breakMode = document.querySelector(".timer-mode .mode-inactive");

    if (this.timer.isFocusMode) {
      focusMode.textContent = "Focus";
      breakMode.textContent = "Break";
      focusMode.className = "mode-active";
      breakMode.className = "mode-inactive";
    } else {
      focusMode.textContent = "Break";
      breakMode.textContent = "Focus";
      focusMode.className = "mode-active";
      breakMode.className = "mode-inactive";
    }
  }

  playNotification() {
    // Create audio notification
    const audio = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
    );
    audio.play().catch(() => {
      // Fallback for browsers that block autoplay
      console.log("Audio notification blocked");
    });
  }

  showNotification(message) {
    // Create and show notification
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Goals Management
  initGoals() {
    const goalsList = document.querySelector(".goals-list");
    goalsList.addEventListener("change", (e) => {
      if (e.target.classList.contains("goal-checkbox")) {
        this.toggleGoal(e.target.id);
      }
    });

    // Add new goal functionality
    this.addNewGoalButton();
  }

  addNewGoalButton() {
    const goalsCard = document.querySelector(".goals-card");
    const addButton = document.createElement("button");
    addButton.textContent = "+ Add New Goal";
    addButton.className = "add-goal-btn";
    addButton.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-top: 15px;
            border: 2px dashed #667eea;
            background: transparent;
            color: #667eea;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s ease;
        `;

    addButton.addEventListener("click", () => this.addNewGoal());
    goalsCard.appendChild(addButton);
  }

  addNewGoal() {
    const goalText = prompt("Enter your new goal:");
    if (goalText && goalText.trim()) {
      const goalId = "goal" + Date.now();
      const goalItem = document.createElement("div");
      goalItem.className = "goal-item";
      goalItem.innerHTML = `
                <input type="checkbox" id="${goalId}" class="goal-checkbox">
                <label for="${goalId}">${goalText.trim()}</label>
                <button class="delete-goal" data-goal="${goalId}">×</button>
            `;

      const goalsList = document.querySelector(".goals-list");
      goalsList.appendChild(goalItem);

      // Add delete functionality
      goalItem.querySelector(".delete-goal").addEventListener("click", (e) => {
        goalItem.remove();
        this.saveGoals();
      });

      this.saveGoals();
    }
  }

  toggleGoal(goalId) {
    const checkbox = document.getElementById(goalId);
    const label = checkbox.nextElementSibling;

    if (checkbox.checked) {
      label.style.textDecoration = "line-through";
      label.style.opacity = "0.6";
    } else {
      label.style.textDecoration = "none";
      label.style.opacity = "1";
    }

    this.saveGoals();
  }

  saveGoals() {
    const goals = [];
    document.querySelectorAll(".goal-checkbox").forEach((checkbox) => {
      goals.push({
        id: checkbox.id,
        text: checkbox.nextElementSibling.textContent,
        completed: checkbox.checked,
      });
    });
    localStorage.setItem("focuszen-goals", JSON.stringify(goals));
  }

  // Weekly Planner
  initPlanner() {
    const dayColumns = document.querySelectorAll(".day-column");
    dayColumns.forEach((column) => {
      const dayHeader = column.querySelector(".day-header");
      dayHeader.addEventListener("click", () => this.addTask(column));
    });
  }

  addTask(dayColumn) {
    const day = dayColumn.querySelector(".day-header").textContent;
    const taskText = prompt(`Add a task for ${day}:`);

    if (taskText && taskText.trim()) {
      const taskElement = document.createElement("div");
      taskElement.className = "task";
      taskElement.textContent = taskText.trim();
      taskElement.addEventListener("click", () => {
        if (confirm("Mark this task as completed?")) {
          taskElement.style.textDecoration = "line-through";
          taskElement.style.opacity = "0.6";
        }
      });

      dayColumn.querySelector(".day-tasks").appendChild(taskElement);
      this.savePlannerData();
    }
  }

  savePlannerData() {
    const plannerData = {};
    document.querySelectorAll(".day-column").forEach((column) => {
      const day = column.querySelector(".day-header").textContent;
      const tasks = Array.from(column.querySelectorAll(".task")).map(
        (task) => ({
          text: task.textContent,
          completed: task.style.textDecoration === "line-through",
        })
      );
      plannerData[day] = tasks;
    });
    localStorage.setItem("focuszen-planner", JSON.stringify(plannerData));
  }

  // Quotes System
  initQuotes() {
    const quotes = [
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
      },
      {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
      },
      {
        text: "It is during our darkest moments that we must focus to see the light.",
        author: "Aristotle",
      },
      {
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
      },
    ];

    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("focuszen-quote-date");

    if (savedDate !== today) {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      document.querySelector(
        ".quote-text"
      ).textContent = `"${randomQuote.text}"`;
      document.querySelector(
        ".quote-author"
      ).textContent = `— ${randomQuote.author}`;
      localStorage.setItem("focuszen-quote-date", today);
      localStorage.setItem(
        "focuszen-current-quote",
        JSON.stringify(randomQuote)
      );
    }
  }

  loadData() {
    // Load saved goals
    const savedGoals = JSON.parse(localStorage.getItem("focuszen-goals")) || [];
    savedGoals.forEach((goal) => {
      const checkbox = document.getElementById(goal.id);
      if (checkbox) {
        checkbox.checked = goal.completed;
        this.toggleGoal(goal.id);
      }
    });

    // Load saved quote
    const savedQuote = JSON.parse(
      localStorage.getItem("focuszen-current-quote")
    );
    if (savedQuote) {
      document.querySelector(
        ".quote-text"
      ).textContent = `"${savedQuote.text}"`;
      document.querySelector(
        ".quote-author"
      ).textContent = `— ${savedQuote.author}`;
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FocusZen();
});

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .delete-goal {
        background: #e53e3e;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        margin-left: auto;
    }
    
    .delete-goal:hover {
        background: #c53030;
    }
`;
document.head.appendChild(style);

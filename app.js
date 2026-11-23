
"use strict";

/* =====================================
   VYORA — المحرك الرئيسي للتطبيق
===================================== */

const STORAGE_KEY = "vyora_tasks_v1";
const CONTENT_KEY = "vyora_daily_content_v1";

let tasks = loadTasks();
let currentFilter = "all";

/* =====================================
   أدوات مساعدة
===================================== */

function getElement(id) {
  return document.getElementById(id);
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("تعذر حفظ المهام:", error);
    alert("تعذر حفظ البيانات. تحقق من مساحة التخزين المتاحة.");
  }
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) return [];

    return saved.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string"
    );
  } catch (error) {
    return [];
  }
}

function makeId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function formatMinutes(minutes) {
  const value = Number(minutes) || 0;

  if (value < 60) {
    return `${value} دقيقة`;
  }

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  if (remaining === 0) {
    return `${hours} ساعة`;
  }

  return `${hours} ساعة و${remaining} دقيقة`;
}

function getPriorityValue(priority) {
  const values = {
    high: 3,
    medium: 2,
    low: 1
  };

  return values[priority] || 0;
}

function getPriorityLabel(priority) {
  const labels = {
    high: "أولوية عالية",
    medium: "أولوية متوسطة",
    low: "أولوية منخفضة"
  };

  return labels[priority] || "متوسطة";
}

function getSortedPendingTasks() {
  return tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityDifference =
        getPriorityValue(b.priority) -
        getPriorityValue(a.priority);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }

      if (a.time) return -1;
      if (b.time) return 1;

      return (a.createdAt || 0) - (b.createdAt || 0);
    });
}

/* =====================================
   التاريخ
===================================== */

function updateDate() {
  const now = new Date();

  const formatted = new Intl.DateTimeFormat("ar-MA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now);

  getElement("current-date").textContent = formatted;
}

/* =====================================
   التنقل بين الصفحات
===================================== */

const pageNames = {
  home: "الرئيسية",
  tasks: "مهامي",
  schedule: "جدولي اليومي",
  stats: "تحليل أدائي"
};

function showPage(pageName) {
  const page = getElement(`${pageName}-page`);

  if (!page) return;

  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  page.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === pageName
    );
  });

  getElement("page-heading").textContent =
    pageNames[pageName] || "VYORA";

  if (pageName === "home") {
    renderFocusTask();
  }

  if (pageName === "tasks") {
    renderTasks();
  }

  if (pageName === "schedule") {
    renderSchedule();
  }

  if (pageName === "stats") {
    renderStats();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

document.querySelectorAll(".nav-link").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.go);
  });
});

/* =====================================
   محتوى اليوم
===================================== */

const dailyContent = {
  verses: [
    {
      text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
      source: "سورة الشرح · الآية 6"
    },
    {
      text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
      source: "سورة البقرة · الآية 286"
    },
    {
      text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
      source: "سورة الرعد · الآية 28"
    },
    {
      text: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
      source: "سورة طه · الآية 114"
    },
    {
      text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
      source: "سورة البقرة · الآية 153"
    },
    {
      text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
      source: "سورة الطلاق · الآية 3"
    },
    {
      text: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ",
      source: "سورة الضحى · الآية 3"
    },
    {
      text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ",
      source: "سورة الضحى · الآية 5"
    },
    {
      text: "فَاذْكُرُونِي أَذْكُرْكُمْ",
      source: "سورة البقرة · الآية 152"
    },
    {
      text: "إِنَّ مَعِيَ رَبِّي سَيَهْدِينِ",
      source: "سورة الشعراء · الآية 62"
    }
  ],

  wisdom: [
    "لا تنتظر الوقت المثالي؛ ابدأ بما تملك الآن.",
    "الاستمرار الهادئ يصنع نتائج أكبر من الحماس المؤقت.",
    "ليس كل انشغال إنجازاً، وليس كل هدوء ضياعاً للوقت.",
    "رتّب أولوياتك، فليس كل ما تستطيع فعله يستحق أن تفعله.",
    "التعلم الحقيقي يبدأ عندما تتحول المعرفة إلى ممارسة.",
    "من يعرف وجهته، يصبح اختياره لخطوته التالية أسهل.",
    "لا تقارن بدايتك بمنتصف رحلة شخص آخر.",
    "الخطأ الذي تتعلم منه ليس وقتاً ضائعاً.",
    "خصص وقتاً للتفكير قبل أن تملأ يومك بالمهام.",
    "الإنجاز الصغير اليوم أفضل من خطة كبيرة مؤجلة."
  ],

  dhikr: [
    "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    "سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا",
    "الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ",
    "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ"
  ]
};

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function loadContentState() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONTENT_KEY));

    return saved && typeof saved === "object" ? saved : {};
  } catch (error) {
    return {};
  }
}

let contentState = loadContentState();

function getDailyItem(type) {
  const collection = dailyContent[type];

  let state = contentState[type];

  if (
    !state ||
    !Array.isArray(state.order) ||
    state.order.length !== collection.length
  ) {
    state = {
      order: shuffleArray(
        collection.map((item, index) => index)
      ),
      position: 0,
      date: getTodayKey()
    };
  } else if (state.date !== getTodayKey()) {
    state.position++;

    if (state.position >= state.order.length) {
      const previousIndex =
        state.order[state.position - 1];

      state.order = shuffleArray(
        collection.map((item, index) => index)
      );

      if (
        state.order.length > 1 &&
        state.order[0] === previousIndex
      ) {
        [state.order[0], state.order[1]] =
          [state.order[1], state.order[0]];
      }

      state.position = 0;
    }

    state.date = getTodayKey();
  }

  contentState[type] = state;
  saveContentState();

  return collection[state.order[state.position]];
}

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function saveContentState() {
  try {
    localStorage.setItem(
      CONTENT_KEY,
      JSON.stringify(contentState)
    );
  } catch (error) {
    console.error("تعذر حفظ المحتوى اليومي:", error);
  }
}

function renderDailyContent() {
  const verse = getDailyItem("verses");
  const wisdom = getDailyItem("wisdom");
  const dhikr = getDailyItem("dhikr");

  getElement("verse-text").textContent = verse.text;
  getElement("verse-source").textContent = verse.source;

  getElement("wisdom-text").textContent = wisdom;
  getElement("dhikr-text").textContent = dhikr;
}

function advanceDailyContent(type, elementId) {
  const collection = dailyContent[type];

  const state = contentState[type];

  state.position++;

  if (state.position >= state.order.length) {
    const previousIndex =
      state.order[state.position - 1];

    state.order = shuffleArray(
      collection.map((item, index) => index)
    );

    if (
      state.order.length > 1 &&
      state.order[0] === previousIndex
    ) {
      [state.order[0], state.order[1]] =
        [state.order[1], state.order[0]];
    }

    state.position = 0;
  }

  state.date = getTodayKey();

  saveContentState();

  const item = collection[state.order[state.position]];

  getElement(elementId).textContent = item;
}

getElement("next-wisdom").addEventListener("click", () => {
  advanceDailyContent("wisdom", "wisdom-text");
});

getElement("next-dhikr").addEventListener("click", () => {
  advanceDailyContent("dhikr", "dhikr-text");
});

/* =====================================
   إضافة وتعديل المهام
===================================== */

const taskForm = getElement("task-form");

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = getElement("task-title").value.trim();
  const category = getElement("task-category").value;
  const priority = getElement("task-priority").value;
  const duration = Number(getElement("task-duration").value);
  const time = getElement("task-time").value;
  const description =
    getElement("task-description").value.trim();

  if (!title) {
    alert("اكتب اسم المهمة أولاً.");
    return;
  }

  if (
    !Number.isFinite(duration) ||
    duration < 1 ||
    duration > 1440
  ) {
    alert("أدخل مدة صحيحة بين دقيقة واحدة و1440 دقيقة.");
    return;
  }

  const editingId = getElement("editing-task-id").value;

  if (editingId) {
    const task = tasks.find(item => item.id === editingId);

    if (!task) return;

    task.title = title;
    task.category = category;
    task.priority = priority;
    task.duration = duration;
    task.time = time;
    task.description = description;

  } else {
    tasks.push({
      id: makeId(),
      title,
      category,
      priority,
      duration,
      time,
      description,
      completed: false,
      createdAt: Date.now()
    });
  }

  saveTasks();
  resetTaskForm();
  renderEverything();
});

function resetTaskForm() {
  taskForm.reset();

  getElement("editing-task-id").value = "";
  getElement("task-duration").value = 30;

  getElement("task-submit").textContent = "إضافة المهمة";
  getElement("cancel-edit").classList.add("hidden");
}

getElement("cancel-edit").addEventListener("click", resetTaskForm);

function editTask(id) {
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  getElement("editing-task-id").value = task.id;
  getElement("task-title").value = task.title;
  getElement("task-category").value = task.category;
  getElement("task-priority").value = task.priority;
  getElement("task-duration").value = task.duration;
  getElement("task-time").value = task.time || "";
  getElement("task-description").value =
    task.description || "";

  getElement("task-submit").textContent = "حفظ التعديلات";
  getElement("cancel-edit").classList.remove("hidden");

  getElement("task-form").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  const confirmed = confirm(
    `هل تريد حذف المهمة "${task.title}"؟`
  );

  if (!confirmed) return;

  tasks = tasks.filter(item => item.id !== id);

  if (getElement("editing-task-id").value === id) {
    resetTaskForm();
  }

  saveTasks();
  renderEverything();
}

function toggleTask(id, completed) {
  const task = tasks.find(item => item.id === id);

  if (!task) return;

  task.completed = completed;

  saveTasks();
  renderEverything();
}

/* =====================================
   فلاتر المهام
===================================== */

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderTasks();
  });
});

/* =====================================
   عرض المهام
===================================== */

function renderTasks() {
  const container = getElement("tasks-list");
  container.replaceChildren();

  let visibleTasks = [...tasks];

  if (currentFilter === "pending") {
    visibleTasks = visibleTasks.filter(task => !task.completed);
  }

  if (currentFilter === "completed") {
    visibleTasks = visibleTasks.filter(task => task.completed);
  }

  getElement("task-count").textContent =
    `${tasks.length} مهمة`;

  visibleTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    return getPriorityValue(b.priority) -
      getPriorityValue(a.priority);
  });

  if (visibleTasks.length === 0) {
    const empty = createElement("div", "empty-state");

    const icon = createElement("span", "empty-icon", "＋");
    const heading = createElement("h4");
    const paragraph = createElement("p");

    if (currentFilter === "completed") {
      heading.textContent = "لا توجد مهام مكتملة بعد";
      paragraph.textContent = "ستظهر هنا المهام التي تنجزها.";
    } else if (currentFilter === "pending") {
      heading.textContent = "لا توجد مهام متبقية";
      paragraph.textContent = "لقد أنهيت جميع مهامك المسجلة.";
    } else {
      heading.textContent = "مساحتك ما زالت فارغة";
      paragraph.textContent =
        "أضف مهمة لتبدأ بتحويل خططك إلى إنجازات.";
    }

    empty.append(icon, heading, paragraph);
    container.appendChild(empty);
    return;
  }

  visibleTasks.forEach(task => {
    const item = createElement(
      "article",
      `task-item${task.completed ? " completed" : ""}`
    );

    const checkbox = createElement("input", "task-check");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute("aria-label", "إكمال المهمة");

    checkbox.addEventListener("change", () => {
      toggleTask(task.id, checkbox.checked);
    });

    const details = createElement("div", "task-details");

    const title = createElement("div", "task-title", task.title);

    details.appendChild(title);

    if (task.description) {
      details.appendChild(
        createElement(
          "p",
          "task-description",
          task.description
        )
      );
    }

    const meta = createElement("div", "task-meta");

    meta.appendChild(
      createElement("span", "task-tag", task.category)
    );

    const priorityClass = {
      high: "priority-high",
      medium: "priority-medium",
      low: "priority-low"
    }[task.priority] || "priority-medium";

    meta.appendChild(
      createElement(
        "span",
        `task-tag ${priorityClass}`,
        getPriorityLabel(task.priority)
      )
    );

    meta.appendChild(
      createElement(
        "span",
        "task-tag",
        formatMinutes(task.duration)
      )
    );

    if (task.time) {
      meta.appendChild(
        createElement(
          "span",
          "task-tag",
          `الساعة ${task.time}`
        )
      );
    }

    details.appendChild(meta);

    const actions = createElement("div", "task-actions");

    const editButton = createElement(
      "button",
      "task-action",
      "تعديل"
    );

    editButton.type = "button";
    editButton.addEventListener("click", () => {
      editTask(task.id);
    });

    const deleteButton = createElement(
      "button",
      "task-action delete",
      "حذف"
    );

    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actions.append(editButton, deleteButton);
    item.append(checkbox, details, actions);

    container.appendChild(item);
  });
}

/* =====================================
   المهمة المقترحة في الرئيسية
===================================== */

function renderFocusTask() {
  const container = getElement("focus-content");
  container.replaceChildren();

  const pending = getSortedPendingTasks();

  if (pending.length === 0) {
    const paragraph = createElement(
      "p",
      "",
      tasks.length > 0
        ? "أكملت جميع مهامك المسجلة. يمكنك إضافة مهمة جديدة."
        : "لم تتم إضافة مهام بعد. أضف مهمتك الأولى لتظهر هنا."
    );

    const button = createElement(
      "button",
      "primary-button",
      tasks.length > 0
        ? "إضافة مهمة جديدة"
        : "أضف مهمتك الأولى"
    );

    button.type = "button";
    button.addEventListener("click", () => showPage("tasks"));

    container.append(paragraph, button);
    return;
  }

  const task = pending[0];

  container.appendChild(
    createElement("div", "focus-task-title", task.title)
  );

  const meta = [
    getPriorityLabel(task.priority),
    task.category,
    formatMinutes(task.duration),
    task.time ? `الوقت: ${task.time}` : "لم يحدد وقت التنفيذ"
  ].join(" · ");

  container.appendChild(
    createElement("p", "focus-task-meta", meta)
  );

  const button = createElement(
    "button",
    "primary-button",
    "عرض جميع المهام"
  );

  button.type = "button";
  button.addEventListener("click", () => showPage("tasks"));

  container.appendChild(button);
}

/* =====================================
   الجدول اليومي
===================================== */

function renderSchedule() {
  const timeline = getElement("timeline");
  timeline.replaceChildren();

  const scheduled = tasks
    .filter(task => task.time)
    .sort((a, b) => a.time.localeCompare(b.time));

  const unscheduled = tasks.filter(task => !task.time);

  getElement("scheduled-count").textContent =
    scheduled.length;

  getElement("unscheduled-count").textContent =
    unscheduled.length;

  if (scheduled.length === 0) {
    const empty = createElement("div", "empty-state");

    empty.append(
      createElement("span", "empty-icon", "◷"),
      createElement("h4", "", "لم تحدد أوقاتاً بعد"),
      createElement(
        "p",
        "",
        "أضف وقتاً لمهامك حتى تظهر هنا مرتبة زمنياً."
      )
    );

    timeline.appendChild(empty);
    return;
  }

  scheduled.forEach(task => {
    const item = createElement("div", "timeline-item");

    const time = createElement(
      "div",
      "timeline-time",
      task.time
    );

    const content = createElement(
      "div",
      `timeline-content${task.completed ? " done" : ""}`
    );

    content.append(
      createElement("strong", "", task.title),
      createElement(
        "span",
        "",
        `${task.category} · ${formatMinutes(task.duration)} · ${
          task.completed ? "مكتملة" : "قيد التنفيذ"
        }`
      )
    );

    item.append(time, content);
    timeline.appendChild(item);
  });

  if (unscheduled.length > 0) {
    const note = createElement(
      "p",
      "empty-message",
      `هناك ${unscheduled.length} مهمة لم تحدد لها وقتاً بعد. يمكنك إضافة وقت لها من صفحة مهامي.`
    );

    note.style.marginTop = "10px";
    timeline.appendChild(note);
  }
}

/* =====================================
   تحليل الأداء
===================================== */

function renderStats() {
  const total = tasks.length;

  const completed = tasks.filter(
    task => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    task => !task.completed
  );

  const pending = pendingTasks.length;

  const remainingMinutes = pendingTasks.reduce(
    (sum, task) => sum + (Number(task.duration) || 0),
    0
  );

  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  getElement("stat-total").textContent = total;
  getElement("stat-completed").textContent = completed;
  getElement("stat-pending").textContent = pending;
  getElement("stat-minutes").textContent =
    remainingMinutes;

  getElement("completion-percent").textContent =
    `${percentage}%`;

  getElement("completion-bar").style.width =
    `${percentage}%`;

  let message = "أضف مهامك الأولى لتبدأ متابعة تقدمك.";

  if (total > 0 && percentage === 0) {
    message = "بدأت رحلتك. اختر مهمة واحدة وابدأ العمل عليها.";
  } else if (percentage > 0 && percentage < 50) {
    message = "أحرزت تقدماً. واصل العمل على مهامك المتبقية.";
  } else if (percentage >= 50 && percentage < 100) {
    message = "أكثر من نصف مهامك أصبحت خلفك. استمر.";
  } else if (total > 0 && percentage === 100) {
    message = "رائع! أنهيت جميع المهام المسجلة.";
  }

  getElement("performance-message").textContent = message;

  renderCategories();
}

function renderCategories() {
  const container = getElement("category-breakdown");
  container.replaceChildren();

  if (tasks.length === 0) {
    container.appendChild(
      createElement(
        "p",
        "empty-message",
        "ستظهر بيانات التصنيفات بعد إضافة المهام."
      )
    );

    return;
  }

  const counts = {};

  tasks.forEach(task => {
    const category = task.category || "أخرى";
    counts[category] = (counts[category] || 0) + 1;
  });

  const categories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);

  categories.forEach(([name, count]) => {
    const row = createElement("div", "category-row");

    const label = createElement(
      "span",
      "category-name",
      name
    );

    const track = createElement("div", "category-track");
    const fill = createElement("div", "category-fill");

    fill.style.width =
      `${(count / tasks.length) * 100}%`;

    track.appendChild(fill);

    const number = createElement(
      "span",
      "category-number",
      count
    );

    row.append(label, track, number);
    container.appendChild(row);
  });
}

/* =====================================
   تحديث جميع الواجهات
===================================== */

function renderEverything() {
  renderTasks();
  renderFocusTask();
  renderSchedule();
  renderStats();
}

/* =====================================
   تشغيل التطبيق
===================================== */

function startApp() {
  updateDate();
  renderDailyContent();
  renderEverything();
  showPage("home");
}

startApp();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("VYORA is ready!"))
      .catch((error) => console.error("Service Worker error:", error));
  });
}

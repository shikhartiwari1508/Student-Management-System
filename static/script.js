/* =========================================================
   UNIVERSITY OF ALLAHABAD
   STUDENT MANAGEMENT SYSTEM
   FRONTEND ENGINE
========================================================= */


/* =========================================================
   API CONFIG
========================================================= */

const API = "/api";


/*
   Expected FastAPI endpoints:

   GET     /api/students
   POST    /api/students
   PUT     /api/students/{roll}
   DELETE  /api/students/{roll}
   GET     /api/analytics
*/


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let students = [];

let filteredStudents = [];

let editingRoll = null;

let deletingRoll = null;

let courseChart = null;

let marksChart = null;

let performanceChart = null;


/* =========================================================
   DOM
========================================================= */

const studentTable =
    document.getElementById("studentTable");

const emptyState =
    document.getElementById("emptyState");

const recordCount =
    document.getElementById("recordCount");

const searchInput =
    document.getElementById("searchInput");

const courseFilter =
    document.getElementById("courseFilter");

const marksFilter =
    document.getElementById("marksFilter");

const sortFilter =
    document.getElementById("sortFilter");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setTimeout(() => {

            document
                .getElementById("loader")
                .classList.add("hidden");

        }, 800);


        startClock();

        setupNavigation();

        setupEvents();

        await loadStudents();

        await loadStats();

        await loadAnalytics();

    }
);


/* =========================================================
   CLOCK
========================================================= */

function startClock() {

    const clock =
        document.getElementById("liveTime");


    function updateClock() {

        const now =
            new Date();


        clock.textContent =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour12: false
                }
            );

    }


    updateClock();

    setInterval(
        updateClock,
        1000
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* Add */

    document
        .getElementById("openAddModal")
        .addEventListener(
            "click",
            openAddModal
        );


    document
        .getElementById("openAddModal2")
        .addEventListener(
            "click",
            openAddModal
        );


    /* Modal */

    document
        .getElementById("closeModal")
        .addEventListener(
            "click",
            closeStudentModal
        );


    document
        .getElementById("cancelModal")
        .addEventListener(
            "click",
            closeStudentModal
        );


    document
        .getElementById("studentForm")
        .addEventListener(
            "submit",
            saveStudent
        );


    /* Delete */

    document
        .getElementById("cancelDelete")
        .addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById("confirmDelete")
        .addEventListener(
            "click",
            confirmDelete
        );


    /* View */

    document
        .getElementById("closeViewModal")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("viewModal")
                    .classList.remove("show");

            }
        );


    /* Filters */

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    courseFilter.addEventListener(
        "change",
        applyFilters
    );


    marksFilter.addEventListener(
        "change",
        applyFilters
    );


    sortFilter.addEventListener(
        "change",
        applyFilters
    );


    document
        .getElementById("clearFilters")
        .addEventListener(
            "click",
            clearFilters
        );


    /* Export */

    document
        .getElementById("exportBtn")
        .addEventListener(
            "click",
            exportCSV
        );


    /* Refresh */

    document
        .getElementById("refreshBtn")
        .addEventListener(
            "click",
            refreshEverything
        );


    /* Mobile */

    document
        .getElementById("mobileMenu")
        .addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    .classList.toggle("open");

            }
        );


    /* Keyboard */

    document.addEventListener(
        "keydown",
        keyboardShortcuts
    );

}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {

    try {

        const response =
            await fetch(
                `${API}/students`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load students"
            );

        }


        students =
            await response.json();


        if (!Array.isArray(students)) {

            students = [];

        }


        populateCourseFilter();

        applyFilters();


        showToast(
            "Student database synchronized",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        students = [];

        renderStudents([]);

        showToast(
            "Unable to connect with FastAPI",
            "error"
        );

    }

}


/* =========================================================
   RENDER STUDENTS
========================================================= */

function renderStudents(data) {

    studentTable.innerHTML = "";


    recordCount.textContent =
        data.length;


    if (!data.length) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    data.forEach(
        (student, index) => {

            const marks =
                Number(student.Marks) || 0;


            const passed =
                marks >= 40;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <div class="student-cell">

                        <div class="avatar">
                            ${getInitial(student.Name)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(student.Name)}
                            </strong>

                            <small>
                                UOA STUDENT
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHTML(student.Roll)}
                </td>


                <td>
                    ${escapeHTML(student.Course)}
                </td>


                <td>

                    <span class="marks">
                        ${marks}%
                    </span>

                </td>


                <td>

                    <span class="status ${
                        passed
                            ? "pass"
                            : "fail"
                    }">

                        ${
                            passed
                                ? "PASS"
                                : "FAIL"
                        }

                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="action-btn"
                            title="View"
                            onclick="viewStudent('${safeAttr(student.Roll)}')">

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="action-btn"
                            title="Edit"
                            onclick="editStudent('${safeAttr(student.Roll)}')">

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="action-btn delete"
                            title="Delete"
                            onclick="deleteStudent('${safeAttr(student.Roll)}')">

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            studentTable.appendChild(row);

        }
    );

}


/* =========================================================
   FILTER
========================================================= */

function applyFilters() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const course =
        courseFilter.value;


    const marks =
        marksFilter.value;


    const sort =
        sortFilter.value;


    filteredStudents =
        students.filter(
            student => {

                const matchesSearch =

                    String(student.Name)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.Roll)
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(student.Course)
                        .toLowerCase()
                        .includes(search);


                const matchesCourse =
                    !course ||
                    student.Course === course;


                const score =
                    Number(student.Marks) || 0;


                let matchesMarks = true;


                if (marks === "fail") {

                    matchesMarks =
                        score < 40;

                }

                else if (marks) {

                    matchesMarks =
                        score >= Number(marks);

                }


                return (
                    matchesSearch &&
                    matchesCourse &&
                    matchesMarks
                );

            }
        );


    if (sort === "nameAsc") {

        filteredStudents.sort(
            (a,b) =>
                a.Name.localeCompare(
                    b.Name
                )
        );

    }


    else if (sort === "nameDesc") {

        filteredStudents.sort(
            (a,b) =>
                b.Name.localeCompare(
                    a.Name
                )
        );

    }


    else if (sort === "marksHigh") {

        filteredStudents.sort(
            (a,b) =>
                Number(b.Marks)
                -
                Number(a.Marks)
        );

    }


    else if (sort === "marksLow") {

        filteredStudents.sort(
            (a,b) =>
                Number(a.Marks)
                -
                Number(b.Marks)
        );

    }


    renderStudents(
        filteredStudents
    );

}


/* =========================================================
   COURSE FILTER
========================================================= */

function populateCourseFilter() {

    const courses =
        [
            ...new Set(
                students
                    .map(
                        student =>
                            student.Course
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    courseFilter.innerHTML = `

        <option value="">
            All Courses
        </option>

    `;


    courses.forEach(
        course => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                course;


            option.textContent =
                course;


            courseFilter.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    searchInput.value = "";

    courseFilter.value = "";

    marksFilter.value = "";

    sortFilter.value = "default";

    applyFilters();

    showToast(
        "Filters cleared",
        "success"
    );

}


/* =========================================================
   LOAD STATS
========================================================= */

async function loadStats() {

    const total =
        students.length;


    const courses =
        new Set(
            students.map(
                s => s.Course
            )
        ).size;


    const marks =
        students
            .map(
                s => Number(s.Marks)
            )
            .filter(
                n => !Number.isNaN(n)
            );


    const average =
        marks.length
            ? marks.reduce(
                (a,b) => a+b,
                0
            ) / marks.length
            : 0;


    const highest =
        marks.length
            ? Math.max(...marks)
            : 0;


    animateNumber(
        document.getElementById(
            "totalStudents"
        ),
        total
    );


    animateNumber(
        document.getElementById(
            "totalCourses"
        ),
        courses
    );


    animateNumber(
        document.getElementById(
            "averageMarks"
        ),
        average,
        "%"
    );


    animateNumber(
        document.getElementById(
            "highestMarks"
        ),
        highest,
        "%"
    );

}


/* =========================================================
   ANALYTICS
========================================================= */

async function loadAnalytics() {

    try {

        const response =
            await fetch(
                `${API}/analytics`
            );


        if (!response.ok) {

            throw new Error(
                "Analytics API failed"
            );

        }


        const analytics =
            await response.json();


        createCourseChart(
            analytics.courseData || {}
        );


        createMarksChart(
            analytics.marksDistribution || {}
        );


        createPerformanceChart(
            analytics.performance || {
                pass: 0,
                fail: 0
            }
        );


        renderTopStudents(
            analytics.topStudents || []
        );


        updatePerformanceSummary(
            analytics
        );

    }

    catch (error) {

        console.error(error);

    }

}


/* =========================================================
   COURSE CHART
========================================================= */

function createCourseChart(
    courseData
) {

    const canvas =
        document.getElementById(
            "courseChart"
        );


    if (!canvas)
        return;


    if (courseChart)
        courseChart.destroy();


    courseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Object.keys(
                            courseData
                        ),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    courseData
                                ),

                            backgroundColor:
                                "#ff6a00",

                            borderRadius: 8,

                            borderSkipped: false

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0,

                                color: "#777"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.05)"

                            }

                        },

                        x: {

                            ticks: {

                                color: "#777"

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   MARKS CHART
========================================================= */

function createMarksChart(
    marksData
) {

    const canvas =
        document.getElementById(
            "marksChart"
        );


    if (!canvas)
        return;


    if (marksChart)
        marksChart.destroy();


    marksChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        Object.keys(
                            marksData
                        ),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    marksData
                                ),

                            borderColor:
                                "#ff6a00",

                            backgroundColor:
                                "rgba(255,106,0,.10)",

                            fill: true,

                            tension: .4,

                            pointBackgroundColor:
                                "#ff6a00",

                            pointBorderColor:
                                "#0a0a0a",

                            pointBorderWidth: 2,

                            pointRadius: 5

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0,

                                color: "#777"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.05)"

                            }

                        },

                        x: {

                            ticks: {

                                color: "#777"

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   PERFORMANCE CHART
========================================================= */

function createPerformanceChart(
    performance
) {

    const canvas =
        document.getElementById(
            "performanceChart"
        );


    if (!canvas)
        return;


    if (performanceChart)
        performanceChart.destroy();


    performanceChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: [
                        "Pass",
                        "Fail"
                    ],

                    datasets: [

                        {

                            data: [

                                performance.pass || 0,

                                performance.fail || 0

                            ],

                            backgroundColor: [

                                "#ff6a00",

                                "#3a3a3a"

                            ],

                            borderWidth: 0,

                            spacing: 4

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "72%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color: "#999",

                                usePointStyle: true,

                                padding: 18,

                                font: {
                                    size: 10
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   PERFORMANCE SUMMARY
========================================================= */

function updatePerformanceSummary(
    analytics
) {

    const performance =
        analytics.performance || {
            pass: 0,
            fail: 0
        };


    const total =
        performance.pass
        +
        performance.fail;


    const passRate =
        total
            ? (
                performance.pass
                /
                total
            ) * 100
            : 0;


    const marks =
        students
            .map(
                s => Number(s.Marks)
            )
            .filter(
                n => !Number.isNaN(n)
            );


    const average =
        marks.length
            ? marks.reduce(
                (a,b) => a+b,
                0
            ) / marks.length
            : 0;


    const highPerformers =
        marks.filter(
            m => m >= 80
        ).length;


    document.getElementById(
        "passRate"
    ).textContent =
        `${passRate.toFixed(1)}%`;


    document.getElementById(
        "averageProgressText"
    ).textContent =
        `${average.toFixed(1)}%`;


    document.getElementById(
        "highPerformers"
    ).textContent =
        highPerformers;


    setTimeout(() => {

        document.getElementById(
            "passProgress"
        ).style.width =
            `${passRate}%`;


        document.getElementById(
            "averageProgress"
        ).style.width =
            `${average}%`;


        const highRate =
            total
                ? (
                    highPerformers
                    /
                    total
                ) * 100
                : 0;


        document.getElementById(
            "highProgress"
        ).style.width =
            `${highRate}%`;

    }, 200);

}


/* =========================================================
   TOP STUDENTS
========================================================= */

function renderTopStudents(
    data
) {

    const container =
        document.getElementById(
            "topStudents"
        );


    container.innerHTML = "";


    if (!data.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    <i class="fa-solid fa-trophy"></i>

                </div>

                <h3>
                    No Rankings Yet
                </h3>

                <p>
                    Add student records to generate
                    the leaderboard.
                </p>

            </div>

        `;

        return;

    }


    data.slice(0,5)
        .forEach(
            (student,index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "leader-card";


                const marks =
                    Number(
                        student.Marks
                    ) || 0;


                card.innerHTML = `

                    <div class="leader-rank">
                        #${index + 1}
                    </div>


                    <div class="leader-avatar">
                        ${getInitial(student.Name)}
                    </div>


                    <strong>
                        ${escapeHTML(student.Name)}
                    </strong>


                    <small>
                        ${escapeHTML(student.Course)}
                    </small>


                    <div class="leader-score">
                        ${marks}%
                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddModal() {

    editingRoll = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Student";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "Save Student";


    document.getElementById(
        "studentForm"
    ).reset();


    document.getElementById(
        "rollInput"
    ).disabled = false;


    document
        .getElementById("studentModal")
        .classList.add("show");


    setTimeout(
        () =>
            document
                .getElementById("rollInput")
                .focus(),
        100
    );

}


/* =========================================================
   EDIT STUDENT
========================================================= */

function editStudent(roll) {

    const student =
        students.find(
            s =>
                String(s.Roll)
                ===
                String(roll)
        );


    if (!student)
        return;


    editingRoll =
        student.Roll;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Student";


    document.getElementById(
        "saveButtonText"
    ).textContent =
        "Update Student";


    document.getElementById(
        "rollInput"
    ).value =
        student.Roll;


    document.getElementById(
        "rollInput"
    ).disabled = true;


    document.getElementById(
        "nameInput"
    ).value =
        student.Name;


    document.getElementById(
        "courseInput"
    ).value =
        student.Course;


    document.getElementById(
        "marksInput"
    ).value =
        student.Marks;


    document
        .getElementById("studentModal")
        .classList.add("show");

}


/* =========================================================
   SAVE / UPDATE
========================================================= */

async function saveStudent(event) {

    event.preventDefault();


    const roll =
        document.getElementById(
            "rollInput"
        ).value.trim();


    const name =
        document.getElementById(
            "nameInput"
        ).value.trim();


    const course =
        document.getElementById(
            "courseInput"
        ).value.trim();


    const marks =
        document.getElementById(
            "marksInput"
        ).value;


    if (
        !roll ||
        !name ||
        !course ||
        marks === ""
    ) {

        showToast(
            "Please fill all fields",
            "error"
        );

        return;

    }


    const student = {

        Roll: roll,

        Name: name,

        Course: course,

        Marks: marks

    };


    try {

        let response;


        if (editingRoll !== null) {

            response =
                await fetch(
                    `${API}/students/${encodeURIComponent(editingRoll)}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                student
                            )

                    }
                );

        }

        else {

            const duplicate =
                students.some(
                    s =>
                        String(s.Roll)
                        ===
                        String(roll)
                );


            if (duplicate) {

                showToast(
                    "Roll number already exists",
                    "error"
                );

                return;

            }


            response =
                await fetch(
                    `${API}/students`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                student
                            )

                    }
                );

        }


        if (!response.ok) {

            throw new Error(
                "Save operation failed"
            );

        }


        closeStudentModal();


        await refreshDataOnly();


        showToast(
            editingRoll !== null
                ? "Student updated successfully"
                : "Student added successfully",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to save student",
            "error"
        );

    }

}


/* =========================================================
   VIEW STUDENT
========================================================= */

function viewStudent(roll) {

    const student =
        students.find(
            s =>
                String(s.Roll)
                ===
                String(roll)
        );


    if (!student)
        return;


    const marks =
        Number(student.Marks) || 0;


    const passed =
        marks >= 40;


    document.getElementById(
        "studentDetails"
    ).innerHTML = `

        <div class="profile-view">

            <div class="profile-big-avatar">

                ${getInitial(student.Name)}

            </div>


            <h2>
                ${escapeHTML(student.Name)}
            </h2>


            <p>
                University of Allahabad Student
            </p>


            <div class="detail-grid">


                <div class="detail-box">

                    <span>
                        Roll Number
                    </span>

                    <strong>
                        ${escapeHTML(student.Roll)}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Course
                    </span>

                    <strong>
                        ${escapeHTML(student.Course)}
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Marks
                    </span>

                    <strong>
                        ${marks}%
                    </strong>

                </div>


                <div class="detail-box">

                    <span>
                        Status
                    </span>

                    <strong style="color:${
                        passed
                            ? "#35d07f"
                            : "#ff625a"
                    }">

                        ${
                            passed
                                ? "PASS"
                                : "FAIL"
                        }

                    </strong>

                </div>


            </div>

        </div>

    `;


    document
        .getElementById("viewModal")
        .classList.add("show");

}


/* =========================================================
   DELETE STUDENT
========================================================= */

function deleteStudent(roll) {

    deletingRoll = roll;


    document
        .getElementById("deleteModal")
        .classList.add("show");

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

async function confirmDelete() {

    if (deletingRoll === null)
        return;


    try {

        const response =
            await fetch(
                `${API}/students/${encodeURIComponent(deletingRoll)}`,
                {

                    method: "DELETE"

                }
            );


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );

        }


        closeDeleteModal();


        await refreshDataOnly();


        showToast(
            "Student deleted successfully",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to delete student",
            "error"
        );

    }

}


/* =========================================================
   CLOSE MODALS
========================================================= */

function closeStudentModal() {

    document
        .getElementById("studentModal")
        .classList.remove("show");

}


function closeDeleteModal() {

    document
        .getElementById("deleteModal")
        .classList.remove("show");

    deletingRoll = null;

}


/* =========================================================
   REFRESH
========================================================= */

async function refreshEverything() {

    const button =
        document.getElementById(
            "refreshBtn"
        );


    button
        .querySelector("i")
        .classList.add("fa-spin");


    await refreshDataOnly();


    setTimeout(() => {

        button
            .querySelector("i")
            .classList.remove("fa-spin");

    }, 600);


    showToast(
        "Dashboard refreshed",
        "success"
    );

}


async function refreshDataOnly() {

    await loadStudents();

    await loadStats();

    await loadAnalytics();

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {

    if (!filteredStudents.length) {

        showToast(
            "No records available to export",
            "error"
        );

        return;

    }


    const headers = [
        "Roll",
        "Name",
        "Course",
        "Marks",
        "Status"
    ];


    const rows =
        filteredStudents.map(
            student => [

                student.Roll,

                student.Name,

                student.Course,

                student.Marks,

                Number(student.Marks) >= 40
                    ? "PASS"
                    : "FAIL"

            ]
        );


    const csv = [

        headers,

        ...rows

    ]
    .map(
        row =>
            row.map(
                value =>
                    `"${String(value)
                        .replaceAll('"','""')}"`
            )
            .join(",")
    )
    .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "UOA_Student_Records.csv";


    link.click();


    URL.revokeObjectURL(url);


    showToast(
        "CSV exported successfully",
        "success"
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const links =
        document.querySelectorAll(
            ".nav-link"
        );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    links.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    link.classList.add(
                        "active"
                    );


                    document
                        .getElementById("sidebar")
                        .classList.remove(
                            "open"
                        );

                }
            );

        }
    );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function keyboardShortcuts(event) {


    /* / = search */

    if (
        event.key === "/"
        &&
        document.activeElement.tagName
            !== "INPUT"
    ) {

        event.preventDefault();

        searchInput.focus();

    }


    /* N = new student */

    if (
        event.key.toLowerCase()
        === "n"
        &&
        document.activeElement.tagName
            !== "INPUT"
    ) {

        openAddModal();

    }


    /* ESC */

    if (event.key === "Escape") {

        document
            .querySelectorAll(
                ".modal-overlay.show"
            )
            .forEach(
                modal =>
                    modal.classList.remove(
                        "show"
                    )
            );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast ${type}`;


    const icon =
        type === "success"
            ? "fa-circle-check"
            : "fa-circle-exclamation";


    toast.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


/* =========================================================
   HELPERS
========================================================= */

function getInitial(name) {

    if (!name)
        return "?";


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function safeAttr(value) {

    return String(value ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'");

}


function animateNumber(
    element,
    target,
    suffix = ""
) {

    const numericTarget =
        Number(target) || 0;


    const start =
        Number(
            element.dataset.value || 0
        );


    const duration = 600;

    const startTime =
        performance.now();


    function animate(
        currentTime
    ) {

        const progress =
            Math.min(
                (currentTime - startTime)
                /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            start
            +
            (
                numericTarget
                -
                start
            )
            *
            eased;


        element.textContent =
            `${value.toFixed(
                suffix ? 1 : 0
            )}${suffix}`;


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        }

        else {

            element.dataset.value =
                numericTarget;

        }

    }


    requestAnimationFrame(
        animate
    );

}
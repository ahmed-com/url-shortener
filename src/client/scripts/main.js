var excel = document.getElementById('excel');
const table = document.getElementById('target');
const downloadBtn = document.getElementById('download');
const termSelect = document.getElementById('term');
var globalStudentList = [];

async function loadOptions() {
  let response = await fetch(`/api/v1/meta/courses`);
  response = await response.json();

  const termSelectOptions = response.courses.reduce((acc, cur) => {
    acc += `<option value="${cur.id}-${cur.fields.name}">${cur.fields.name}</option>`;
    return acc;
  }, '');
  termSelect.innerHTML = termSelectOptions;
}

async function loadSessions() {
  const termId = termSelect.value;
  let response = await fetch(`/api/v1/meta/sessions/${termId}`);
  response = await response.json();

  const sessionRows = response.sessions.reduce((acc, cur, index) => {
    acc += `<tr>
              <td>${index + 1}</td>
              <td>${cur.fields.date}</td>
              <td>${cur.fields.type}</td>
          </tr>`;
    return acc;
  }, '');
  table.innerHTML = sessionRows;
}

async function downloadExcel(index) {
  const [id, term, year, level] = termSelect.value.split('-');
  const response = await fetch(`/api/v1/gradebook/download/${id}`, {
    method: 'GET',
  });
  let blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${term}-${year}-${level}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

async function uploadExcel(elem) {
  try {
    let formData = new FormData();
    let excel = elem.form.elements[0].files[0];
    const [id, term, year, levelCode] = termSelect.value.split('-');
    let uploadBtn = document.getElementById('upload');
    toggleSpinner(uploadBtn, '<span>Upload</span>', true);

    formData.append('excel', excel);
    let r = await fetch(`/api/v1/gradebook/upload/${id}`, {
      method: 'POST',
      body: formData,
    });

    var { level, sessions, students } = await r.json();
    globalStudentList = students;
    students = students.map((student) => {
      return { level, sessions, ...student };
    });
    console.log('students', students);
    let studentList = students.reduce((acc, cur, index) => {
      acc += `<tr>
                <td>${index + 1}</td>
                <td>${getValue(cur, 'name')}</td>
                <td><span class="${
                  getValue(cur, 'courseTotal', true) < 60 ? 'text-danger' : ''
                }">${getValue(cur, 'courseTotal', true)}%</span></td>
                <td>${getValue(cur, 'homeworkAverage', true)}%</td>
                <td>${getValue(cur, 'skips')}</td>
                <td>${getValue(cur, 'attendanceParticipation', true)}%</td>
                <td>${getValue(cur, 'exam', true)}%</td>
                <td><button id="btn-${index}" class="btn btn-primary" onclick="download(${index})"><svg class="bi bi-download" width="1em" height="1em" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M2.5 10a.5.5 0 01.5.5V14a1 1 0 001 1h12a1 1 0 001-1v-3.5a.5.5 0 011 0V14a2 2 0 01-2 2H4a2 2 0 01-2-2v-3.5a.5.5 0 01.5-.5z" clip-rule="evenodd"></path>
                <path fill-rule="evenodd" d="M7 9.5a.5.5 0 01.707 0L10 11.793 12.293 9.5a.5.5 0 01.707.707l-2.646 2.647a.5.5 0 01-.708 0L7 10.207A.5.5 0 017 9.5z" clip-rule="evenodd"></path>
                <path fill-rule="evenodd" d="M10 3a.5.5 0 01.5.5v8a.5.5 0 01-1 0v-8A.5.5 0 0110 3z" clip-rule="evenodd"></path>
              </svg></button></td>
            </tr>`;
      return acc;
    }, '');
    toggleSpinner(uploadBtn, '<span>Upload</span>', false);
    table.innerHTML = studentList;
  } catch (error) {
    toggleSpinner(uploadBtn, '<span>Upload</span>', false);
    console.log(error);
  }
}

async function download(index) {
  const student = { ...globalStudentList[index] };
  const btn = document.getElementById(`btn-${index}`);
  btn.classList = ['btn btn-secondary'];
  const response = await fetch(`/api/v1/pdf/grades.pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createStudent(student)),
  });
  let blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${student.name.v} Report.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}

function toggleSpinner(elem, defaultContent, on) {
  if (on) {
    elem.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;
  } else {
    elem.innerHTML = defaultContent;
  }
}

function getValue(record, name, round) {
  let value = record[name] && record[name].v;
  if (value && round) {
    value = value.toFixed(2) * 100;
  }
  return value || 0;
}

function exists(record, key, name) {
  return record[key] && record[key].includes(name);
}

function setRadio(value) {
  return value ? 'On' : 'Off';
}

function createStudent(student) {
  return {
    fields: {
      Student: getValue(student, 'name'),
      Listening: getValue(student, 'Listening'),
      Writing: getValue(student, 'Writing'),
      Oral: getValue(student, 'Oral'),
      Attendance: getValue(student, 'attendanceParticipation', true),
      Participation: getValue(student, 'attendanceParticipation', true),
      Comment: getValue(student, 'Comment'),
      grammary: setRadio(exists(student, 'strengths', 'Grammar')),
      fluency: setRadio(exists(student, 'strengths', 'Fluency')),
      vocabulary: setRadio(exists(student, 'strengths', 'Vocabulary')),
      studying: setRadio(exists(student, 'strengths', 'Studying')),
      pronunciation: setRadio(exists(student, 'strengths', 'Pronunciation')),
      listening: setRadio(exists(student, 'strengths', 'Listening')),
      grammary_2: setRadio(exists(student, 'weaknesses', 'Grammar')),
      fluency_2: setRadio(exists(student, 'weaknesses', 'Fluency')),
      vocabulary_2: setRadio(exists(student, 'weaknesses', 'Vocabulary')),
      studying_2: setRadio(exists(student, 'weaknesses', 'Studying')),
      pronunciation_2: setRadio(exists(student, 'weaknesses', 'Pronunciation')),
      listening_2: setRadio(exists(student, 'weaknesses', 'Listening')),
      Comments: getValue(student, 'comments'),
      'Course Grade': getValue(student, 'courseTotal', true),
      'Exam Grade': getValue(student, 'exam', true),
      'Attendance Grade': getValue(student, 'attendanceParticipation', true),
      'Homework Grade': getValue(student, 'homeworkAverage', true),
      Level: getValue(student, 'level'),
      'listening-grade': getValue(student, 'listeningGrade'),
      'attendance-grade': getValue(student, 'attendanceGrade'),
      'participation-grade': getValue(student, 'participationGrade'),
      'homework-comment': getValue(student, 'homeworkComment'),
    },
  };
}

window.onload = function () {
  console.log('ran onload');
  loadOptions().then(() => {
    console.log('ran load options');
  });
};

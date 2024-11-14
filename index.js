jQuery(function () {
  checkLogin();
  loadPage("analytics");
});
let PARTNERSHIP_IMAGE = null;
let TASK_IMAGE = null;
let ADV_IMAGE = null;
let ALERT_ID_TO_REMOVE = null;
let TASK_ID_TO_REMOVE = null;
let ADV_ID_TO_REMOVE = null;
let PARTNERSHIP_ID_TO_REMOVE = null;
let SORT_KEY = "default,asc";
let PAGE_USERS = 0;

function loadPage(page) {
  if (page == "tasks") {
    loadTaskPage(page);
  } else if (page == "swap-user-info") {
    loadSwapInfoPage(page);
  } else if (page == "advertisment") {
    loadAdvPage(page);
  } else if (page == "referal") {
    loadReferalPage(page);
  } else if (page == "leaderboard") {
    loadLeaderboardPage(page);
  } else if (page == "analytics") {
    loadAnalyticsPage(page);
  } else if (page == "partnerships") {
    loadIRLPage(page);
  } else if (page == "review-tasks") {
    loadReviewTasks(page);
  } else if (page == "alerts") {
    loadAlertsPage(page);
  } else if (page == "test-users") {
    loadGenerateTestUsersPage(page);
  }
}

function checkLogin() {
  const token = localStorage.getItem("t");
  if (!token) {
    // If no token is found, redirect to the login page
    window.location.href = "https://walkers-alpha.vercel.app/login.html"; // Modify the path as needed
    return;
  }
}

function loadAlertsPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getAlerts();
    });
}

function loadGenerateTestUsersPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTestUsers();
    });
}

function loadReviewTasks(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTaskStatuses();
    });
}

function getTestUsers() {
  fetch(REQUEST.ip + "/api/v1/admin/users/loginType/login_admin_generated", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#tableTestUsers").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendTestUsers(i, data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function loadSwapInfoPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      fetch(REQUEST.ip + "/api/v1/admin/points-swap-info", {
        headers: {
          Authorization: localStorage.getItem("t"),
        },
      })
        .then((response) => response.json())
        .then((data) => {
          $("#swapUsersInfo").empty();
          if (isValidObject(data)) {
            for (var i = 0; i < data.length; i++) {
              $("#swapUsersInfo").append(
                "<tr><td style='vertical-align: middle;'>" +
                  data[i].totalUsers +
                  "</td><td style='vertical-align: middle;'>" +
                  data[i].totalSwapableCharacters +
                  " </td><td style='vertical-align: middle;'>" +
                  moment(data[i].createdDate).format("DD/MM/yyyy HH:mm") +
                  "</td></tr>"
              );
            }
          }
        })
        .catch((error) => console.error(error));
    });
}

function getAlerts() {
  fetch(REQUEST.ip + "/api/v1/admin/alerts", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#alertsContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendAlerts(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function getTaskStatuses() {
  fetch(REQUEST.ip + "/api/v1/admin/task-status/status/admin_review", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#taskStatusContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendTasksStatus(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function appendTasksStatus(t) {
  let twitterUsername = checkForValidation(t.user.twitterUsername);
  if (twitterUsername != "") {
    twitterUsername =
      "<a href='https://twitter.com/" +
      t.user.twitterUsername +
      "' target='_blank'>" +
      t.user.twitterUsername +
      "</a>";
  }

  let btn =
    "<button type='button'  id='approve" +
    t.id +
    "' class='btn btn-block btn-success btn-sm' onclick='approveTask(\"" +
    t.id +
    "\")'>Approve</button>";
  let btnReject =
    "<button type='button' id='reject" +
    t.id +
    "' class='btn btn-block btn-danger btn-sm' onclick='rejectTask(\"" +
    t.id +
    "\")'>Reject</button>";
  let date = moment(t.createdDate).format("DD/MM/yyyy HH:mm");
  $("#taskStatusContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.task.name +
      "</td><td style='vertical-align: middle;'>" +
      t.task.description +
      "</td><td style='vertical-align: middle;'>" +
      t.user.firstname +
      " </td><td style='vertical-align: middle;'>" +
      twitterUsername +
      " </td><td style='vertical-align: middle;'>" +
      date +
      " </td><td>" +
      btn +
      " " +
      btnReject +
      "</td></tr>"
  );
}

function approveTask(taskStatusId) {
  $("#approve" + taskStatusId).prop("disabled", true);
  const formData = new URLSearchParams();
  formData.append("taskStatusId", taskStatusId);

  fetch(REQUEST.ip + "/api/v1/admin/tasks/approve-task", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      getTaskStatuses();
    })
    .catch((error) => {
      getTaskStatuses();
    });
}

function rejectTask(taskStatusId) {
  $("#reject" + taskStatusId).prop("disabled", true);

  const formData = new URLSearchParams();
  formData.append("taskStatusId", taskStatusId);

  fetch(REQUEST.ip + "/api/v1/admin/tasks/reject-task", {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      getTaskStatuses();
    })
    .catch((error) => {
      getTaskStatuses();
    });
}

function loadIRLPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getParnerships();

      $("#partnershipImageUpload").on("change", function (event) {
        uploadFile(event, "irl");
      });

      $("#reservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });
    });
}

function loadAnalyticsPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getStats();
      getUsers();
    });
}

function getStats() {
  const date = new Date();
  const timeZoneOffsetMinutes = date.getTimezoneOffset();
  const timeZoneOffsetHours = timeZoneOffsetMinutes / 60;

  fetch(REQUEST.ip + "/api/v1/admin/users-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#usersCount").empty().append(data.totalUsers);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/tasks-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#tasksCount").empty().append(data.totalTasks);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/partnerships-count", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#partnershipCount").empty().append(data.totalPartnerships);
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/walk-distance", {
    headers: {
      "time-diff": timeZoneOffsetHours * -1,
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#walkingDistance")
        .empty()
        .append(checkForValidationDistance(data.totalDistance));
    })
    .catch((error) => console.error(error));

  fetch(REQUEST.ip + "/api/v1/admin/full-walk-distance", {
    headers: {
      "time-diff": timeZoneOffsetHours * -1,
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#fullWalkingDistance")
        .empty()
        .append(checkForValidationDistance(data.totalDistance));
    })
    .catch((error) => console.error(error));
}

function loadTaskPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getTasks();

      $("#taskImageUpload").on("change", function (event) {
        uploadFile(event, "task");
      });

      $("#reservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });
    });
}

function loadAdvPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getAdv();

      $("#advImageUpload").on("change", function (event) {
        uploadAdvFile(event, "adv");
      });

      $("#advUpdatedImageUpload").on("change", function (event) {
        uploadUpdatedAdvFile(event, "advupdate");
      });

      $("#advreservationtime").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });

      $("#reservationtimeupdate").daterangepicker({
        timePicker: true,
        timePickerIncrement: 30,
        locale: {
          format: "DD/MM/YYYY HH:mm",
        },
      });
    });
}

function loadReferalPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      getReferal();
      checkReferralBoostStatus();
    });
}

function loadLeaderboardPage(p) {
  checkLogin();
  $("#pageContent")
    .empty()
    .load(p + ".html", function () {
      // getAdv();
    });
}

function getTasks() {
  // fetch(REQUEST.ip + "/api/v1/admin/tasks", {
  fetch("https://javaapi.abhiwandemos.com/api/v1/admin/tasks", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#taskContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendTasks(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function getReferal() {
  fetch("https://javaapi.abhiwandemos.com/api/v1/admin/referral/list", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return response.json();
    })
    .then((data) => {
      $("#referalContent").empty();
      if (isValidObject(data)) {
        for (let i = 0; i < data.length; i++) {
          appendReferals(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function getAdv() {
  //   fetch(REQUEST.ip + "/api/v1/admin/tasks", {
  fetch("https://javaapi.abhiwandemos.com/api/v1/ads", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#advContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendAdvs(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function addAdv() {
  let fromTo = $("#advreservationtime").val();
  fromTo = fromTo.split("-");
  const advName = $("#advName").val().trim();
  if (advName === "") {
    alert("Please enter a name for the advertisement.");
    return;
  }
  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);
  const data = {
    image: ADV_IMAGE,
    linkUrl: ADV_IMAGE,

    name: advName,
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
  };
  data.testUserAdv = false;
  if ($("#forTestUserSlct :selected").val() == "yes") {
    data.testUserAdv = true;
  }

  // fetch(REQUEST.ip + 'https://javaapi.abhiwandemos.com/api/v1/ads', {
  fetch("https://javaapi.abhiwandemos.com/api/v1/ads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Advertisement Created Successfully");
      getAdv(data);
    })
    .catch((error) => console.error(error));
}

function addTask() {
  const taskName = $("#taskName").val().trim();
  if (taskName === "") {
    alert("Please enter a name for the task.");
    return;
  }

  const reward = $("#taskReward").val().trim();
  if (
    !reward ||
    isNaN(reward) ||
    Number(reward) <= 0 ||
    parseInt(reward) !== Number(reward)
  ) {
    alert("Please enter a valid positive integer for the reward (XP).");
    return;
  }
  let fromTo = $("#reservationtime").val();
  fromTo = fromTo.split("-");

  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);

  const twitterTaskSelected =
    $("#forTwitterUserSlct :selected").val() === "yes";
  const twitterPostLink =
    twitterTaskSelected && $("#twitterUsername").val()
      ? $("#twitterUsername").val()
      : "NA";
  console.log(twitterPostLink);

  const data = {
    image: TASK_IMAGE,
    name: taskName,
    description: $("#taskDescription").val(),
    reward: reward,
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
    testUserTask: $("#forTestUserSlct :selected").val() === "yes",
    twitterTask: twitterTaskSelected,
    twitterPostLink: twitterPostLink,
  };

  // fetch(REQUEST.ip + "/api/v1/admin/tasks", {
  fetch("https://javaapi.abhiwandemos.com/api/v1/admin/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      alert("Task Added Successfully");
      getTasks();
    })
    .catch((error) => console.error(error));
}

function handleTwitterUserSelection() {
  const twitterUserSelect = document.getElementById("forTwitterUserSlct").value;
  console.log("1", twitterUserSelect);
  const inputContainer = document.getElementById("twitterUserInputContainer");

  if (twitterUserSelect === "yes") {
    if (!document.getElementById("twitterUsername")) {
      const inputBox = document.createElement("input");
      inputBox.type = "text";
      inputBox.className = "form-control mt-2";
      inputBox.id = "twitterUsername";
      inputBox.value = "";
      inputBox.placeholder = "Enter Twitter Username";
      inputContainer.appendChild(inputBox);
    }
  } else {
    if (document.getElementById("twitterUsername")) {
      inputContainer.removeChild(document.getElementById("twitterUsername"));
    }
  }
}

function appendAlerts(t) {
  $("#alertsContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.title +
      "</td><td style='vertical-align: middle;'>" +
      t.description +
      " </td><td style='vertical-align: middle;'>" +
      moment(t.createdDate).format("DD/MM/yyyy HH:mm") +
      "</td><td style='text-align:center'>  <button type='button' onclick='openModalRemoveAlert(\"" +
      t.id +
      '", "' +
      t.title +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-alerts'>x</button></td></tr>"
  );
}

function openModalRemoveAlert(id, txt) {
  ALERT_ID_TO_REMOVE = id;
  $("#alertModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalRemoveTask(id, txt) {
  TASK_ID_TO_REMOVE = id;
  $("#taskModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalRemoveAdv(id, txt) {
  ADV_ID_TO_REMOVE = id;
  $("#advRemoveModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function openModalViewAdv(advData) {
  $("#advUpdateName").val(advData.name);
  $("#reservationtimeupdate").val(
    moment(advData.startTime).format("DD/MM/YYYY HH:mm") +
      " - " +
      moment(advData.endTime).format("DD/MM/YYYY HH:mm")
  );
  if (advData.linkUrl) {
    $("#advImagePreview").attr("src", advData.linkUrl).show();
  } else {
    $("#advImagePreview").hide();
  }
  $("#modal-default-Updateadv").modal("show");
  $("#updateAdvButton").on("click", function () {
    updateAdv(advData.id);
  });
}

function updateAdv(advId) {
  let fromTo = $("#reservationtimeupdate").val().split("-");

  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);
  const data = {
    image: ADV_IMAGE,
    linkUrl: ADV_IMAGE,
    name: $("#advUpdateName").val(),
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
    testUserAdv: $("#forTestUserSlct :selected").val() === "yes",
  };

  fetch("https://javaapi.abhiwandemos.com/api/v1/ads/" + advId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      getAdv(data);
    })
    .catch((error) => console.error("Error updating advertisement:", error));
}

function removeTask() {
  fetch(REQUEST.ip + "/api/v1/admin/tasks/" + TASK_ID_TO_REMOVE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then(() => {
      $("#modal-default-tasks").modal("hide");
      getTasks();
    })
    .catch((error) => {
      console.log(error);
    });
}

function removeAdv() {
  fetch(
    "https://javaapi.abhiwandemos.com/api/v1/ads/delete/" + ADV_ID_TO_REMOVE,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then(() => {
      $("#modal-default-advremove").modal("hide");
      getAdv();
    })
    .catch((error) => {
      console.log(error);
    });
  getAdv();
}

function openModalRemovePartnership(id, txt) {
  PARTNERSHIP_ID_TO_REMOVE = id;
  $("#partnershipModalBody")
    .empty()
    .append("Are you sure you want to remove " + txt + " ?");
}

function removePartnership() {
  fetch(REQUEST.ip + "/api/v1/admin/partnerships/" + PARTNERSHIP_ID_TO_REMOVE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then(() => {
      $("#modal-default-partnerships").modal("hide");
      getParnerships();
    })
    .catch((error) => {
      console.log(error);
    });
}

function removeAlert() {
  fetch(REQUEST.ip + "/api/v1/admin/alerts/" + ALERT_ID_TO_REMOVE, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
  })
    .then(() => {
      $("#modal-default-alerts").modal("hide");
      getAlerts();
    })
    .catch((error) => {
      console.log(error);
    });
}

function appendAdvs(a) {
  var isForTestUser = a.testUserAdv ? "Yes" : "No";
  var img = a.linkUrl
    ? "<img style='width:100px' src='" + a.linkUrl + "'/>"
    : "";

  var buttonText = a.active ? "Disable" : "Enable";
  var buttonColor = a.active
    ? "background-color: red; color: white;"
    : "background-color: green; color: white;";

  $("#advContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      a.name +
      "</td><td style='vertical-align: middle;'>" +
      moment(a.startTime).format("DD/MM/YYYY HH:mm") +
      "</td><td style='vertical-align: middle;'>" +
      moment(a.endTime).format("DD/MM/YYYY HH:mm") +
      "</td><td style='text-align: center;'>" +
      img +
      "</td><td style='text-align:center'>" +
      "<button onclick='openModalViewAdv(" +
      JSON.stringify(a) +
      ")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-Updateadv'><i class='fas fa-eye'></i> View</button>" +
      "</td><td style='text-align:center'>" +
      "<button id='toggleButton-" +
      a.id +
      "' type='button' onclick='toggleButtonState(" +
      JSON.stringify(a) +
      ")' class='btn btn-default' style='" +
      buttonColor +
      "'>" +
      buttonText +
      "</button>" +
      "</td><td style='text-align:center'>" +
      "<button type='button' onclick='openModalRemoveAdv(\"" +
      a.id +
      '", "' +
      a.name +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-advremove'>x</button>" +
      "</td></tr>"
  );
}

function toggleButtonState(a) {
  const newState = !a.active;
  const button = document.getElementById("toggleButton-" + a.id);
  button.style.backgroundColor = newState ? "red" : "green";
  button.innerText = newState ? "Disable" : "Enable";
  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/ads/status/${a.id}?isActive=${newState}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then(() => {
      a.active = newState;
      loadAdvPage("advertisment");
    })
    .catch((error) => {
      button.style.backgroundColor = a.active ? "red" : "green";
      button.innerText = a.active ? "Disable" : "Enable";
    });
}

function appendTasks(t) {
  var isForTestUser = t.testUserTask;
  var isForTwitterUser = "";

  if (isForTestUser) {
    isForTestUser = "Yes";
  } else {
    isForTestUser = "No";
  }

  if (t.twitterTask) {
    isForTwitterUser = "Yes";
  } else {
    isForTwitterUser = "No";
  }

  var img = "";
  if (isValidObject(t.image)) {
    img = "<img style='width:50px' src='" + t.image + "'/>";
  }
  $("#taskContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.name +
      "</td><td style='vertical-align: middle;'>" +
      t.description +
      " </td><td style='vertical-align: middle;'>" +
      t.reward +
      " </td><td style='vertical-align: middle;'>" +
      t.twitterPostLink +
      " </td><td style='vertical-align: middle;'>" +
      isForTwitterUser +
      " </td><td style='vertical-align: middle;'>" +
      isForTestUser +
      " </td><td style='vertical-align: middle;'>" +
      moment(t.startDate).format("DD/MM/YYYY HH:mm") +
      " </td><td style='vertical-align: middle;'>" +
      moment(t.endDate).format("DD/MM/YYYY HH:mm") +
      " </td><td style='text-align: center;'>" +
      img +
      "</td><td style='text-align:center'>  <button type='button' onclick='openModalRemoveTask(\"" +
      t.id +
      '", "' +
      t.name +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-tasks'>x</button></td></tr>"
  );
}

function appendReferals(t) {
  $("#referalContent").append(
    "<tr><td style='vertical-align: middle;'>" +
      t.userResponse.firstname +
      "</td><td style='vertical-align: middle;'>" +
      t.userResponse.email +
      "</td><td style='vertical-align: middle;'>" +
      t.referralCount +
      "</td></tr>"
  );
}

function openImage(image) {
  window.open(image, "_blank");
}

function getParnerships() {
  fetch(REQUEST.ip + "/api/v1/admin/partnerships", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#partnershipContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendPartnerships(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function appendPartnerships(p) {
  var isPrimary = p.primary;
  if (isPrimary) {
    isPrimary = "Yes";
  } else {
    isPrimary = "No";
  }

  $("#partnershipContent").append(
    "<tr>" +
      "<td style='vertical-align: middle;'>" +
      p.description +
      " </td><td style='vertical-align: middle;'>" +
      p.url +
      " </td><td style='vertical-align: middle;'>" +
      moment(p.startDate).format("DD/MM/yyyy HH:mm") +
      " </td><td style='vertical-align: middle;'>" +
      moment(p.endDate).format("DD/MM/yyyy HH:mm") +
      " </td><td style='vertical-align: middle;'>" +
      p.type +
      "</td><td style='vertical-align: middle;'>" +
      isPrimary +
      "</td><td style='text-align: center;'><img style='width:50px' src='" +
      p.image +
      "'/></td><td style='text-align:center'>  <button type='button' onclick='openModalRemovePartnership(\"" +
      p.id +
      '", "' +
      p.description +
      "\")' class='btn btn-default' data-toggle='modal' data-target='#modal-default-partnerships'>x</button></td></tr>"
  );
}

function addPartnership() {
  let fromTo = $("#reservationtime").val();
  fromTo = fromTo.split("-");

  const dateStringFrom = fromTo[0].trim();
  const [dateFrom, timeFrom] = dateStringFrom.split(" ");
  const [dayFrom, monthFrom, yearFrom] = dateFrom.split("/");
  const [hourFrom, minuteFrom] = timeFrom.split(":");
  const dateFromObj = new Date(
    yearFrom,
    monthFrom - 1,
    dayFrom,
    hourFrom,
    minuteFrom
  );

  const dateStringTo = fromTo[1].trim();
  const [dateTo, timeTo] = dateStringTo.split(" ");
  const [dayTo, monthTo, yearTo] = dateTo.split("/");
  const [hourTo, minuteTo] = timeTo.split(":");
  const dateToObj = new Date(yearTo, monthTo - 1, dayTo, hourTo, minuteTo);

  const data = {
    description: $("#partnershipDescription").val(),
    url: $("#partnershipURL").val(),
    type: $("#typeSlct :selected").val(),
    startDate: dateFromObj.getTime(),
    endDate: dateToObj.getTime(),
    image: PARTNERSHIP_IMAGE,
  };

  data.primary = false;
  if ($("#primarySlct :selected").val() == "yes") {
    data.primary = true;
  }

  fetch(REQUEST.ip + "/api/v1/admin/partnerships", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      getParnerships();
    })
    .catch((error) => console.error(error));
}

function addAlert() {
  const data = {
    description: $("#alertDescription").val(),
    title: $("#alertName").val(),
  };

  fetch(REQUEST.ip + "/api/v1/admin/alerts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: localStorage.getItem("t"),
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      getAlerts();
    })
    .catch((error) => console.error(error));
}

function uploadAdvFile(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (type == "adv") {
        ADV_IMAGE = data.url;
      } else {
        ADV_IMAGE = data.url;
      }
    })
    .catch((error) => console.error(error));
}

function uploadUpdatedAdvFile(event, type) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (type == "adv") {
        ADV_IMAGE = data.url;
      } else {
        ADV_IMAGE = data.url;
      }
    })
    .catch((error) => console.error(error));
}

function uploadFile(event, type) {
  // Create a new FormData object
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  // Create the fetch request
  fetch(REQUEST.ip + "/api/v1/admin/upload-image", {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (type == "irl") {
        PARTNERSHIP_IMAGE = data.url;
      } else {
        TASK_IMAGE = data.url;
      }
    })
    .catch((error) => console.error(error));
}

function getUsersLeft() {
  PAGE_USERS = PAGE_USERS - 1;
  if (PAGE_USERS < 0) {
    PAGE_USERS = 0;
  }
  getUsers();
}
function getUsersRight() {
  PAGE_USERS = PAGE_USERS + 1;
  getUsers();
}

function getUsersPaging(page) {
  PAGE_USERS = page;
  getUsers();
}

function getUsers() {
  fetch(
    REQUEST.ip + "/api/v1/admin/users/loginType/login_token?sort=" + SORT_KEY,
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      $("#tableUsers").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendUsers(data[i]);
        }
      }
    })
    .catch((error) => console.error(error));
}

function sort(column) {
  if (isValidObject(SORT_KEY) && SORT_KEY.includes("asc")) {
    SORT_KEY = column + ",desc";
  } else {
    SORT_KEY = column + ",asc";
  }

  getUsers();
  headline(column);
}

function headline(column) {
  // Get all th elements
  var headers = document
    .getElementById("usersTable")
    .getElementsByTagName("th");

  // Remove "sorted" class from all th elements
  for (var i = 0; i < headers.length; i++) {
    headers[i].classList.remove("sorted");
    headers[i].style.color = "black"; // Set text color to black for all headers
  }

  // Add "sorted" class and set text color to red for the clicked th element
  var clickedHeader = document.querySelector(
    "#usersTable th[onclick=\"sort('" + column + "')\"]"
  );
  clickedHeader.classList.add("sorted");
  clickedHeader.style.color = "#a2a2a2";
}

function appendTestUsers(i, u) {
  let btn =
    "<button type='button' class='btn btn-success btn-sm' id='qrcode" +
    u.id +
    "' onclick='generateQrCode(\"" +
    u.id +
    "\")'>Generate Qr Code for login</button>";
  $("#tableTestUsers").append(
    "<tr><td>" +
      u.no +
      "</td><td style='vertical-align: middle;'>" +
      checkForValidation(u.firstname) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.level) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.expEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.pointsEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.totalSteps) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidationDistance(u.totalDistance) +
      " </td><td style='text-align: center;'>" +
      btn +
      "</td></tr>"
  );
}

function generateTestUser() {
  const formData = new URLSearchParams();
  formData.append("firstname", $("#firstnameTestUser").val());

  fetch(REQUEST.ip + "/api/v1/admin/generate-test-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: localStorage.getItem("t"),
    },
    body: formData,
  })
    .then((data) => {
      getTestUsers();
    })
    .catch((error) => console.error(error));
}

function generateQrCode(userId) {
  $("#qrcode" + userId).attr("disabled", true);
  fetch(REQUEST.ip + "/api/v1/admin/generate-qrcode/user/" + userId, {
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      $("#qrcode" + userId).attr("disabled", false);
      window.open(data.url, "_blank");
    })
    .catch((error) => {
      $("#qrcode" + userId).attr("disabled", false);
    });
}

function isWithinLast24Hours(timestamp) {
  // Get the current time in milliseconds
  var currentTime = Date.now();

  // Calculate the time difference between the current time and the given timestamp
  var timeDifference = currentTime - timestamp;

  // Check if the time difference is less than 24 hours (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  var isWithin24Hours = timeDifference < 24 * 60 * 60 * 1000;

  return isWithin24Hours;
}

function appendUsers(u) {
  let twitterUsername = checkForValidation(u.twitterUsername);
  if (twitterUsername != "") {
    twitterUsername =
      "<a href='https://twitter.com/" +
      u.twitterUsername +
      "' target='_blank'>" +
      u.twitterUsername +
      "</a>";
  }

  let bkgColor = "";
  let isLast24 = isWithinLast24Hours(u.createdDate);
  if (isLast24) {
    bkgColor = "background-color: green";
  }

  let walkersSize = 0;
  try {
    walkersSize = u.walkers.length;
  } catch (ignored) {}

  let swapablePoints = 0;
  try {
    swapablePoints = u.levelInfo.swapablePointsEarned;
    swapablePoints = swapablePoints.toFixed(1);
  } catch (ignored) {}

  $("#tableUsers").append(
    "<tr><td style='" +
      bkgColor +
      "'>" +
      u.no +
      "</td><td style='vertical-align: middle;'>" +
      checkForValidation(u.firstname) +
      "</td><td style='vertical-align: middle;'>" +
      twitterUsername +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.email) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.level) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.expEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.levelInfo.pointsEarned) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidation(u.totalSteps) +
      " </td><td style='vertical-align: middle;'>" +
      checkForValidationDistance(u.totalDistance) +
      " </td><td style='vertical-align: middle;'>" +
      walkersSize +
      " </td><td style='vertical-align: middle;'>" +
      swapablePoints +
      " </td></tr>"
  );
}

function isValidObject(obj) {
  if (obj == null || obj == undefined || obj == "undefined" || obj === "") {
    return false;
  }
  return true;
}

function checkForValidation(obj) {
  if (isValidObject(obj)) {
    return obj;
  }
  return "";
}

function checkForValidationDistance(meters) {
  if (isValidObject(meters)) {
    if (meters > 1000) {
      return (meters / 1000).toFixed(1) + " km";
    } else if (meters <= 0) {
      return 0;
    }
    return meters + " m";
  }
  return "";
}

function referalToggleSlider() {
  const slider = document.getElementById("slider");
  const status = document.getElementById("sliderStatus");
  slider.classList.toggle("on");
  if (slider.classList.contains("on")) {
    status.innerText = "Enable";
  } else {
    status.innerText = "Disable";
  }
}

function updateLeaderboard() {
  const taskType = document.getElementById("taskType").value;
  const isVisible =
    document.getElementById("sliderStatus").innerText === "Public";

  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/tasks/leaderboard?taskName=${taskType}&isVisible=${isVisible}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        console.log("API request successful", response);
      } else {
        console.log("API request failed");
      }
    })
    .then((data) => {
      $("#leaderboardContent").empty();
      if (isValidObject(data)) {
        for (var i = 0; i < data.length; i++) {
          appendAdvs(data[i]);
        }
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

document
  .getElementById("taskType")
  .addEventListener("change", updateLeaderboard);

function leaderBoardToggleSlider() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");
  slider.classList.toggle("on");
  if (slider.classList.contains("on")) {
    sliderStatus.innerText = "Public";
  } else {
    sliderStatus.innerText = "Private";
  }
  updateLeaderboard();
}

function confirmReferal() {
  const referralAmount = document.getElementById("referal").value.trim();
  if (!referralAmount || isNaN(referralAmount) || Number(referralAmount) <= 0) {
    alert("Please enter a valid amount to refer.");
    return;
  }
  if (
    referralAmount.includes(".") ||
    parseInt(referralAmount) !== Number(referralAmount)
  ) {
    alert("Please enter a valid positive integer without decimals.");
    return;
  }
  fetch(
    `https://javaapi.abhiwandemos.com/api/v1/admin/referral-config?referralValue=${Number(
      referralAmount
    )}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        alert("Referral Confirmed");
        return response.json();
      } else {
        throw new Error(
          `Failed to confirm referral. Status: ${response.status}`
        );
      }
    })
    .then((responseData) => {
      alert("Referral amount confirmed successfully!");
      document.getElementById("referal").value = "";
    })
    .catch((error) => {
      console.error("Error confirming referral:", error);
      alert(
        `There was an error confirming the referral: ${error.message}. Please try again.`
      );
    });
}

var isReferralBoostEnabled = false;

function checkReferralBoostStatus() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");

  fetch(
    "https://javaapi.abhiwandemos.com/api/v1/admin/referral-xp-boost-status",
    {
      headers: {
        Authorization: localStorage.getItem("t"),
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        slider.classList.add("on");
        sliderStatus.textContent = "Enable";
        isReferralBoostEnabled = true;
      } else {
        slider.classList.remove("on");
        sliderStatus.textContent = "Disable";
        isReferralBoostEnabled = false;
      }
    })
    .catch((error) => {
      console.error("Error fetching referral XP boost status:", error);
      alert("Error loading referral XP boost status. Please try again.");
    });
}

function referalToggleSlider() {
  const slider = document.getElementById("slider");
  const sliderStatus = document.getElementById("sliderStatus");

  const apiUrl = isReferralBoostEnabled
    ? "https://javaapi.abhiwandemos.com/api/v1/admin/disable-referral-xp-boost"
    : "https://javaapi.abhiwandemos.com/api/v1/admin/enable-referral-xp-boost";

  fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("t"),
    },
  })
    .then((response) => {
      if (response.ok) {
        isReferralBoostEnabled = !isReferralBoostEnabled;
        isReferralBoostEnabled ? alert("Enabled") : alert("Disabled");
        slider.classList.toggle("on", isReferralBoostEnabled);
        sliderStatus.textContent = isReferralBoostEnabled
          ? "Enable"
          : "Disable";
      } else {
        throw new Error("Failed to toggle referral XP boost");
      }
    })
    .catch((error) => {
      console.error("Error toggling referral XP boost:", error);
      alert(
        "There was an error toggling the referral XP boost. Please try again."
      );
    });
}

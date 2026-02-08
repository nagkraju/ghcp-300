document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const message = document.getElementById("message");
  const form = document.getElementById("signup-form");

  // Function to fetch activities from API
  async function fetchActivities() {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        // Add option to select
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Build activity card
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const title = document.createElement("h4");
        title.textContent = name;
        activityCard.appendChild(title);

        const desc = document.createElement("p");
        desc.textContent = details.description;
        activityCard.appendChild(desc);

        const sched = document.createElement("p");
        sched.textContent = `Schedule: ${details.schedule}`;
        activityCard.appendChild(sched);

        const cap = document.createElement("p");
        cap.textContent = `Capacity: ${details.participants.length} / ${details.max_participants}`;
        activityCard.appendChild(cap);

        // Participants section
        const participantsWrap = document.createElement("div");
        participantsWrap.className = "participants";

        const ph = document.createElement("h5");
        ph.textContent = `Participants (${details.participants.length})`;
        participantsWrap.appendChild(ph);

        const ul = document.createElement("ul");
        ul.className = "participant-list";

        if (details.participants && details.participants.length) {
          details.participants.forEach((p) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const span = document.createElement("span");
            span.textContent = p;
            span.className = "participant-email";

            const btn = document.createElement("button");
            btn.className = "participant-delete";
            btn.title = `Unregister ${p}`;
            btn.innerHTML = "\uD83D\uDDD1"; // trashcan emoji
            btn.addEventListener("click", async (ev) => {
              ev.preventDefault();
              try {
                const res = await fetch(
                  `/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`,
                  { method: "DELETE" }
                );
                const result = await res.json();
                if (!res.ok) {
                  showMessage(result.detail || result.message || "Failed to unregister.", "error");
                  return;
                }
                showMessage(result.message || "Unregistered.", "success");
                await fetchActivities();
              } catch (error) {
                showMessage("Network error.", "error");
                console.error("Error unregistering:", error);
              }
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet";
          li.className = "no-participants";
          ul.appendChild(li);
        }

        participantsWrap.appendChild(ul);
        activityCard.appendChild(participantsWrap);

        activitiesList.appendChild(activityCard);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p class='error'>Failed to load activities.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = activitySelect.value;
    if (!activity) {
      showMessage("Please select an activity.", "error");
      return;
    }
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();
      if (!response.ok) {
        showMessage(result.detail || result.message || "Signup failed.", "error");
        return;
      }
      showMessage(result.message || "Signed up successfully.", "success");
      await fetchActivities();
      form.reset();
    } catch (error) {
      showMessage("Network error.", "error");
      console.error("Error signing up:", error);
    }
  });

  function showMessage(text, type) {
    message.className = `message ${type}`;
    message.textContent = text;
    message.classList.remove("hidden");
    setTimeout(() => message.classList.add("hidden"), 3500);
  }

  // Initialize app
  fetchActivities();
});

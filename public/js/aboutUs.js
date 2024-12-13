//!Feedback Function
document
  .querySelector(".contacts_button button")
  .addEventListener("click", async (event) => {
    event.preventDefault(); // Предотвращает перезагрузку страницы

    const name = document.querySelector('input[name="name"]').value;
    const phone_number = document.querySelector(
      'input[name="phone_number"]'
    ).value;
    const category = document.querySelector('select[name="dropdown"]').value;
    const question = document.querySelector('textarea[name="question"]').value;
    const policy = document.querySelector('input[name="policy"]').checked;

    if (!policy) {
      alert("You must agree to the privacy policy.");
      return;
    }

    const feedbackData = {
      name,
      phone_number,
      category,
      question,
      policy_agreed: policy,
    };

    try {
      const response = await fetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Feedback submitted successfully!");
        console.log(result);
      } else {
        alert("Error submitting feedback: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    }
  });

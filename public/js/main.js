//! Modal window
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const closeModalBtn = document.querySelector(".btn-close");
const addToCartBtn = modal.querySelector(".btn"); // Кнопка "Add to cart"

// Close modal function
const closeModal = function () {
  modal.classList.remove("show");
  overlay.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  }, 300);
};

// Open modal function with dynamic content
const openModal = function (title, price, description, imageSrc) {
  modal.querySelector(".modal_title").textContent = title;
  modal.querySelector(".modal_price").textContent = price;
  modal.querySelector(".modal_description").textContent = description;
  modal.querySelector("img").src = imageSrc; // Set the image source

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.add("show");
    overlay.classList.add("show");
  }, 10);
};

// Event listeners for each "Order" button
document.querySelectorAll(".card_btn").forEach((button) => {
  button.addEventListener("click", function () {
    const title = this.getAttribute("data-title");
    const price = this.getAttribute("data-price");
    const description = this.getAttribute("data-description");
    const imageSrc = this.getAttribute("data-image"); // Get the image source
    openModal(title, price, description, imageSrc);
  });
});

// Event listeners for close actions
closeModalBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
  }
});

// Handle the "Add to cart" button click
addToCartBtn.addEventListener("click", async function () {
  try {
    const order = {
      title: modal.querySelector(".modal_title").textContent,
      price: modal.querySelector(".modal_price").textContent,
      notes: document.getElementById("notes").value,
      sweets: document.getElementById("sweats").value,
      toys: document.getElementById("toys").value,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch("/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    if (response.ok) {
      alert("✅ Order placed successfully!");
      closeModal();
    } else if (response.status === 401) {
      alert("❌ Please log in to place an order.");
    } else {
      throw new Error("Failed to place the order.");
    }
  } catch (error) {
    console.error("❌ Error placing order: ", error);
    alert("❌ An error occurred. Please try again.");
  }
});

function filterCategory(category) {
  // Получаем все элементы с классом 'row'
  const products = document.querySelectorAll(".row");
  const footer = document.querySelector("footer"); // Получаем footer

  if (category === "all") {
    // Показываем все элементы
    products.forEach((product) => {
      product.classList.remove("hidden");
    });
    // Возвращаем стиль footer к стандартному состоянию
    footer.style.position = "static";
  } else {
    // Показываем только выбранную категорию и скрываем остальные
    let hasVisibleItems = false;
    products.forEach((product) => {
      if (product.classList.contains(category)) {
        product.classList.remove("hidden");
        hasVisibleItems = true; // Обнаружили хотя бы один элемент
      } else {
        product.classList.add("hidden");
      }
    });
    // Изменяем стиль footer на position: absolute
    footer.style.position = hasVisibleItems ? "absolute" : "static";
  }
}

//! Search function
document.getElementById("search_button").addEventListener("click", function () {
  // Получаем значение из поля ввода
  const query = document.getElementById("search_flowers").value.toLowerCase();

  // Получаем список результатов
  const resultsList = document.getElementById("results_list");

  // Получаем все карточки
  const items = resultsList.getElementsByClassName("card");

  // Скрываем все элементы списка
  for (let i = 0; i < items.length; i++) {
    items[i].style.display = "none"; // Скрываем элемент
  }

  // Проверяем, есть ли совпадения и показываем их
  let found = false; // Флаг для отслеживания совпадений
  for (let i = 0; i < items.length; i++) {
    const title = items[i]
      .getElementsByClassName("card_title")[0]
      .textContent.toLowerCase();
    if (title.includes(query)) {
      items[i].style.display = "block"; // Показываем элемент
      found = true; // Устанавливаем флаг совпадения
    }
  }

  // Если ничего не найдено, можно сделать дополнительные действия
  if (!found) {
    console.log("Ничего не найдено"); // Можно добавить уведомление, если нужно
  }
});

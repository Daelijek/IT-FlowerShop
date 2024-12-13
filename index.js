const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const session = require("express-session"); // Импортируем express-session
const User = require("./models/user"); // Модель пользователя
const Order = require("./models/order"); // Подключаем модель для заказов
const Feedback = require("./models/feedback"); // Импорт модели отзыва

const app = express();

// Подключение к MongoDB
mongoose.connect(
  "mongodb+srv://dias:dias1605dddsss@flowershop.phooe.mongodb.net/FlowerShop",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

mongoose.connection.on("connected", () => {
  console.log("✅ Database connected successfully!");
});

// Настройка сессий
app.use(
  session({
    secret: "secret-key", // Секрет для шифрования сессий
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Установите true, если используете HTTPS
  })
);

// Middleware
app.use(express.json()); // Для обработки JSON
app.use(express.urlencoded({ extended: true })); // Для обработки form data
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true })); // Для обработки POST-данных из формы

// Главная страница
app.get("/", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "html", "mainPage.html"));
  } else {
    res.redirect("/login");
  }
});

// Страница логина
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "login.html"));
});

// Обработка логина
app.post("/login", async (req, res) => {
  const { email, passw } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("❌ Пользователь не найден!");
    }

    const isMatch = await bcrypt.compare(passw, user.password);
    if (!isMatch) {
      return res.status(400).send("❌ Неправильный логин или пароль!");
    }

    // Сохраняем информацию о пользователе в сессии
    req.session.user = user;

    res.redirect("/"); // Перенаправляем на главную страницу
  } catch (error) {
    console.error("Ошибка при входе: ", error);
    res.status(500).send("❌ Ошибка сервера!");
  }
});

// Страница регистрации
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "signup.html"));
});

// Обработка регистрации
app.post("/signup", async (req, res) => {
  const { username, email, passw } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send("❌ Пользователь с таким email уже существует!");
    }

    const hashedPassword = await bcrypt.hash(passw, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.redirect("/login");
  } catch (error) {
    console.error("Ошибка регистрации: ", error);
    res.status(500).send("❌ Ошибка сервера при регистрации!");
  }
});

// Обработка создания заказа
app.post("/order", async (req, res) => {
  console.log("Request body:", req.body);
  const { title, price, notes, sweets, toys, timestamp } = req.body;

  if (!price) {
    return res.status(400).send("❌ Missing price in request body!");
  }

  try {
    const newOrder = new Order({
      userId: req.session.user._id,
      title,
      price,
      notes: notes !== "notSelected" ? notes : null,
      sweets: sweets !== "notSelected" ? sweets : null,
      toys: toys !== "notSelected" ? toys : null,
      total: calculateTotal(price, notes, sweets, toys),
      timestamp,
    });

    await newOrder.save();
    res.status(201).send("✅ Order created successfully!");
  } catch (error) {
    console.error("Ошибка при создании заказа: ", error);
    res.status(500).send("❌ Internal server error.");
  }
});

function calculateTotal(price, notes, sweets, toys) {
  if (!price) {
    throw new Error("Price is undefined or missing.");
  }

  const basePrice = parseFloat(price.replace("$", "").replace(",", "")) || 0;
  const notePrice = notes === "note" ? 350 : notes === "postcard" ? 500 : 0;
  const sweetPrices = {
    date: 12000,
    raffaello: 12000,
    bento: 4500,
    merci: 5500,
  };
  const toyPrices = {
    bunny: 5500,
    goose: 9300,
    capybara: 6100,
    pikachu: 8300,
  };

  const sweetPrice = sweets in sweetPrices ? sweetPrices[sweets] : 0;
  const toyPrice = toys in toyPrices ? toyPrices[toys] : 0;

  return basePrice + notePrice + sweetPrice + toyPrice;
}

// Маршрут для сохранения отзыва
app.post("/feedback", async (req, res) => {
  try {
    const { name, phone_number, category, question, policy_agreed } = req.body;

    // Проверка обязательных полей
    if (!name || !phone_number || !category || !question || !policy_agreed) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Создание нового отзыва
    const feedback = new Feedback({
      name,
      phone_number,
      category,
      question,
      policy_agreed,
    });

    const savedFeedback = await feedback.save();
    res
      .status(201)
      .json({
        message: "Feedback submitted successfully!",
        feedback: savedFeedback,
      });
  } catch (error) {
    console.error("Error submitting feedback:", error.message);
    res
      .status(500)
      .json({ message: "Failed to submit feedback", error: error.message });
  }
}); 

// Логаут
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("❌ Ошибка при логауте!");
    }
    res.redirect("/login");
  });
});

// Получение данных о пользователе
app.get("/user", (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.json({ username: null });
  }
});

// Сервер прослушивает запросы
app.listen(7777, () => {
  console.log("✅ Server is running on http://localhost:7777");
});

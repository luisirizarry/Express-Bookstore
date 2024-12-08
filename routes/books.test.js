const request = require("supertest");
const app = require("../app"); // Your Express app instance
const db = require("../db"); // Database connection
const Book = require("../models/book"); // Book model

beforeAll(async () => {
  // Reset and seed the test database
  await db.query(`
    DELETE FROM books;
    INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES 
      ('1234567890', 'http://amazon.com/book1', 'Author 1', 'English', 200, 'Publisher 1', 'Book 1', 2020),
      ('0987654321', 'http://amazon.com/book2', 'Author 2', 'Spanish', 300, 'Publisher 2', 'Book 2', 2021);
  `);
});

afterAll(async () => {
  // Close the database connection
  await db.end();
});

describe("Books API Routes", () => {
  /** GET / => {books: [book, ...]} */
  describe("GET /books", () => {
    test("should return all books", async () => {
      const res = await request(app).get("/books");

      expect(res.statusCode).toBe(200);
      expect(res.body.books).toBeInstanceOf(Array);
      expect(res.body.books.length).toBe(2);

      const book = res.body.books[0];
      expect(book).toHaveProperty("isbn");
      expect(book).toHaveProperty("title");
    });
  });

  /** GET /[isbn] => {book: book} */
  describe("GET /books/:isbn", () => {
    test("should return a single book by ISBN", async () => {
      const res = await request(app).get("/books/1234567890");

      expect(res.statusCode).toBe(200);
      expect(res.body.book).toHaveProperty("isbn", "1234567890");
    });

    test("should return 404 for non-existent ISBN", async () => {
      const res = await request(app).get("/books/1111111111");

      expect(res.statusCode).toBe(404);
    });
  });

  /** POST / => {book: newBook} */
  describe("POST /books", () => {
    const validBookData = {
      isbn: "1122334455",
      amazon_url: "http://amazon.com/newbook",
      author: "New Author",
      language: "French",
      pages: 150,
      publisher: "New Publisher",
      title: "New Book",
      year: 2022
    };

    test("should create a new book with valid data", async () => {
      const res = await request(app).post("/books").send(validBookData);

      expect(res.statusCode).toBe(201);
      expect(res.body.book).toHaveProperty("isbn", "1122334455");

      // Verify the book exists in the database
      const book = await Book.findOne("1122334455");
      expect(book).toMatchObject(validBookData);
    });

    test("should return 400 for invalid data", async () => {
      const invalidBookData = { isbn: "1122334455", title: "" };
      const res = await request(app).post("/books").send(invalidBookData);

      expect(res.statusCode).toBe(400);
    });
  });

  /** PUT /[isbn] => {book: updatedBook} */
  describe("PUT /books/:isbn", () => {
    const updatedBookData = {
      amazon_url: "http://amazon.com/updatedbook",
      author: "Updated Author",
      language: "German",
      pages: 250,
      publisher: "Updated Publisher",
      title: "Updated Book",
      year: 2023,
    };

    test("should update an existing book with valid data", async () => {
      const res = await request(app)
        .put("/books/1234567890")
        .send(updatedBookData);

      expect(res.statusCode).toBe(200);
      expect(res.body.book).toHaveProperty("title", "Updated Book");

      // Verify the book is updated in the database
      const book = await Book.findOne("1234567890");
      expect(book).toMatchObject(updatedBookData);
    });

    test("should return 400 for invalid data", async () => {
      const invalidBookData = { title: "" };
      const res = await request(app).put("/books/1234567890").send(invalidBookData);

      expect(res.statusCode).toBe(400);
    });

    test("should return 404 for ISBN that doesnt exist", async () => {
      const res = await request(app).put("/books/1111111111").send(updatedBookData);

      expect(res.statusCode).toBe(404);
    });
  });

  /** DELETE /[isbn] => {message: "Book deleted"} */
  describe("DELETE /books/:isbn", () => {
    test("should delete a book by ISBN", async () => {
      const res = await request(app).delete("/books/1234567890");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Book deleted" });
    });
  });
});

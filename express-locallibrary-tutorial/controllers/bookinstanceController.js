const BookInstance = require("../models/bookinstance");
const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const async = require("async");

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {
    BookInstance.find()
        .populate("book")
        .exec(function (err, list_bookinstances) {
            if (err) {
                return next(err);
            }
            // Successful, so render
            res.render("bookinstance_list", {
                title: "Book Instance List",
                bookinstance_list: list_bookinstances,
            });
        });
};


// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
    BookInstance.findById(req.params.id)
        .populate("book")
        .exec((err, bookinstance) => {
            if (err) {
                return next(err);
            }
            if (bookinstance == null) {
                // No results.
                const err = new Error("Book instance not found");
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render("bookinstance_detail", {
                title: `BookInstance: ${bookinstance.book.title}`,
                bookinstance,
            });
        });
};


// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
    Book.find({}, "title").exec((err, books) => {
        if (err) {
            return next(err);
        }
        // Successful, so render.
        res.render("bookinstance_form", {
            title: "Create BookInstance",
            book_list: books,
        });
    });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, "title").exec(function (err, books) {
                if (err) {
                    return next(err);
                }
                // Successful, so render.
                res.render("bookinstance_form", {
                    title: "Create BookInstance",
                    book_list: books,
                    selected_book: bookinstance.book._id,
                    errors: errors.array(),
                    bookinstance,
                });
            });
            return;
        }

        // Data from form is valid.
        bookinstance.save((err) => {
            if (err) {
                return next(err);
            }
            // Successful: redirect to new record.
            res.redirect(bookinstance.url);
        });
    },
];


// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
    BookInstance.findById(req.params.id)
        .populate("book")
        .exec(
            (err, bookinstance) => {
                if (err) {
                    return next(err);
                }
                if (bookinstance == null) {
                    // No results.
                    const err = new Error("Book instance not found");
                    err.status = 404;
                    return next(err);
                }
                // Successful, so render.
                res.render("bookinstance_delete", {
                    title: `Delete BookInstance`,
                    bookinstance,
                }
                );
            }
        )
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
    BookInstance.findById(req.body.bookinstanceId).exec(
        (err, results) => {
            if (err) {
                return next(err);
            }
            // Success
            BookInstance.findByIdAndRemove(req.body.bookinstanceId, (err) => {
                if (err) {
                    return next(err);
                }
                // Success - go to book instance list
                res.redirect("/catalog/bookinstances");
            });
        }
    );
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
    async.parallel(
        {
            instance(callback) {
                BookInstance.findById(req.params.id)
                    .populate("book")
                    .exec(callback);
            },
            books(callback) {
                Book.find({}, "title").exec(callback);
            }
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            if (results.instance == null) {
                // instance not found
                const error = new Error("Book instance not found");
                error.status = 404;
                return next(error);
            }
            // Success
            res.render("bookinstance_form", {
                title: `Update BookInstance`,
                book_list: results.books,
                bookinstance: results.instance,
                selected_book: results.instance.book._id,
            });
        }
    );
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    // Validate and sanitize fields.
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ checkFalsy: true })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, "title").exec(function (err, books) {
                if (err) {
                    return next(err);
                }
                // Successful, so render.
                res.render("bookinstance_form", {
                    title: "Update BookInstance",
                    book_list: books,
                    selected_book: bookinstance.book._id,
                    errors: errors.array(),
                    bookinstance,
                });
            });
            return;
        }

        // Data from form is valid.
        BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, (err, oldInstance) => {
            if (err) {
                return next(err);
            }
            res.redirect(oldInstance.url);
        });
    },
]

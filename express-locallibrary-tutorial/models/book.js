const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/*
author is a reference to a single Author model object, and is required.
genre is a reference to an array of Genre model objects. 
*/

const BookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    summary: { type: String, required: true },
    isbn: { type: String, required: true },
    genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

BookSchema.virtual("url").get(function () {
    return `/catalog/book/${this._id}`;
});

module.exports = mongoose.model("Book", BookSchema);
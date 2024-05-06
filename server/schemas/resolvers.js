const { User, Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id }).select(
          "-__v -password"
        );
      }
      throw AuthenticationError;
    },
  },
// #26 and 28 activities reference
Mutation: {
  // add user to system
  addUser: async (parent, { username, email, password }) => {
    const user = await User.create({ username, email, password });
    const token = signToken(user);
    return { token, user };
  },
  // login credential validation
  login: async (parent, { email, password }) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw AuthenticationError;
    }

    const correctPw = await user.isCorrectPassword(password);

    if (!correctPw) {
      throw AuthenticationError;
    }

    const token = signToken(user);

    return { token, user };
  },
  //add book to user profile
  addBook: async (parent, args, context) => {
    if (context.user) {
      const newBook = await User.findOneAndUpdate(
        { _id: context.user._id },
        {
          $addToSet: {
            savedBooks: {
              description: args.description,
              author: args.author,
              title: args.title,
              image: args.image,
              bookId: args.bookId,
            },
          },
        },
        {
            new: true
        }
      );
      return newBook;
    }
    throw new AuthenticationError("User not found");
  },

  // function to delete book from user profile
  removeBook: async (parent, { bookId }, context) => {
    console.log("***in removeBook", bookId);
    if (context.user) {
      const deleteBook = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
      return deleteBook;
    }
    throw new AuthenticationError("User not found");
  }
}
};

module.exports = resolvers;

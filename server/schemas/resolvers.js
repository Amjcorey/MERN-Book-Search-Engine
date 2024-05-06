const { User, Book } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      console.log(context.user);
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new Error("user not found");
    },
  },
  // #26 and 28 activities reference
  Mutation: {
    // login credential validation
    login: async (parent, args) => {
      const user = await User.findOne({ email: args.email });
      if (!user) {
        throw AuthenticationError;
      }
      const isCorrectPassword = await user.isCorrectPassword(args.password);
      console.log(!isCorrectPassword);
      if (!isCorrectPassword) {
        throw AuthenticationError;
      }
      const token = signToken(user);
      return { token, user };
    },
    // add user to system
    addUser: async (parent, args) => {
      const user = await User.create(args);
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
            new: true,
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
    },
  },
};

module.exports = resolvers;

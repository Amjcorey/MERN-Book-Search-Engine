const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findOne({ _id: context.user._id }).select('-__v -password');
            }
            throw AuthenticationError;
        }
    }
}; 
// #26 and 28 activities


module.exports = resolvers;
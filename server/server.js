const express = require("express");
const path = require("path");
const db = require("./config/connection");
// const routes = require("./routes");
// const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

const PORT = process.env.PORT || 3001;

await server.start(); //start server

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/graphql", expressMiddleware(server, { context: authMiddleware }));

// if in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

//Serve build/index.html when application is accessed at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client"));
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Async function call to start server
startApolloServer();

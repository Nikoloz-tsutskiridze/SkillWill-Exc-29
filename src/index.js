import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

// data
import db from "./_db.js";

// schema
import { typeDefs } from "./schema.js";

// resolvers
const resolvers = {
  Query: {
    games() {
      return db.games;
    },
    game(_, { id }) {
      const game = db.games.find((game) => game.id === id);
      if (!game) throw new Error(`Game with id ${id} not found`);
      return game;
    },
    reviews() {
      return db.reviews;
    },
    review(_, { id }) {
      const review = db.reviews.find((review) => review.id === id);
      if (!review) throw new Error(`Review with id ${id} not found`);
      return review;
    },
    authors() {
      return db.authors;
    },
    author(_, { id }) {
      const author = db.authors.find((author) => author.id === id);
      if (!author) throw new Error(`Author with id ${id} not found`);
      return author;
    },
  },
  Game: {
    reviews(parent) {
      return db.reviews.filter((r) => r.game_id === parent.id);
    },
  },
  Review: {
    author(parent) {
      return db.authors.find((a) => a.id === parent.author_id);
    },
    game(parent) {
      return db.games.find((g) => g.id === parent.game_id);
    },
  },
  Author: {
    reviews(parent) {
      return db.reviews.filter((r) => r.author_id === parent.id);
    },
  },
  Mutation: {
    addGame(_, { game }) {
      const { title, platform } = game;

      // Validation: Check if the title is unique
      if (db.games.find((g) => g.title === title)) {
        throw new Error("Game title must be unique");
      }

      // Validation: Check if platform is valid
      const validPlatforms = ["Switch", "PS5", "Xbox", "PC"];
      const isValidPlatform = platform.every((p) => validPlatforms.includes(p));
      if (!isValidPlatform) {
        throw new Error("Platform must be one of Switch, PS5, Xbox, or PC");
      }

      // Add new game
      let newGame = {
        ...game,
        id: Math.floor(Math.random() * 10000).toString(),
      };
      db.games.push(newGame);

      return newGame;
    },
    deleteGame(_, { id }) {
      const gameExists = db.games.some((g) => g.id === id);
      if (!gameExists) {
        throw new Error(`Game with id ${id} not found`);
      }

      db.games = db.games.filter((g) => g.id !== id);
      return db.games;
    },
    updateGame(_, { id, edits }) {
      let game = db.games.find((g) => g.id === id);

      if (!game) {
        throw new Error(`Game with id ${id} not found`);
      }

      // Update the game with the provided edits
      game = { ...game, ...edits };
      db.games = db.games.map((g) => (g.id === id ? game : g));

      return game;
    },
    addReview(_, { review }) {
      const { author_id, game_id } = review;

      // Validation: Ensure author and game exist
      if (!db.authors.find((a) => a.id === author_id)) {
        throw new Error(`Author with id ${author_id} not found`);
      }
      if (!db.games.find((g) => g.id === game_id)) {
        throw new Error(`Game with id ${game_id} not found`);
      }

      let newReview = {
        ...review,
        id: Math.floor(Math.random() * 10000).toString(),
      };

      db.reviews.push(newReview);

      return newReview;
    },
    deleteReview(_, { id }) {
      const reviewExists = db.reviews.some((r) => r.id === id);
      if (!reviewExists) {
        throw new Error(`Review with id ${id} not found`);
      }

      db.reviews = db.reviews.filter((r) => r.id !== id);
      return db.reviews;
    },
    updateAuthor(_, { id, edits }) {
      let author = db.authors.find((a) => a.id === id);
      if (!author) {
        throw new Error(`Author with id ${id} not found`);
      }

      author = { ...author, ...edits };
      db.authors = db.authors.map((a) => (a.id === id ? author : a));

      return author;
    },
  },
};

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`Server ready at: ${url}`);

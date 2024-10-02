
const { ApolloServer }= require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema/typeDefs.js')
const resolvers = require('./schema/resolvers.js')
const auth = require('./utils/auth/authenticate.js')
const { config } = require('dotenv');
config({ path: '.env' });


async function startApolloServer() {
  try {
        const server = new ApolloServer({
          typeDefs,
          resolvers,
          persistedQueries: false,
          cache: 'bounded',
          context: auth,
      });
 
      const { url } = await startStandaloneServer(server);  // Ensuring this line correctly invokes start
      console.log(`
      🚀  Apollo Standalone Server is running!
      📭  Query at ${url}
    `);
  
  } catch (error) {
      console.error("Failed to start Apollo Server", error);
  }
}

(async () => {

    try {
      startApolloServer();
     
    }catch (error) {
      console.error('Error during server startup:', error);
    }

})();

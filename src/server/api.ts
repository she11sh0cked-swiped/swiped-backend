import { ApolloServer } from 'apollo-server'

const server = new ApolloServer({})

void server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})

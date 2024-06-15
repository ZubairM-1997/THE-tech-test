import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import axios from 'axios';
import { typeDefs } from './typeDefinitions';
import { IPInfo, IPResponse } from './interfaces';

export const resolvers = {
  Query: {
    ipInfo: async (_: any, { ip }: { ip: string }): Promise<IPInfo> => {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const data : IPResponse  = response.data

      return {
        ip: data.ip,
        city: data.city,
        region: data.region,
        region_code: data.region_code,
        country: data.country,
        country_code: data.country_code,
        region_plus_code: `${data.region}|${data.region_code}`,
      };
    },
    listOfIps: async (_: any, { ips }: { ips: string[] }): Promise<IPInfo[]> => {
      const requests = ips.map(ip => axios.get(`https://ipapi.co/${ip}/json/`));
      const responses = await Promise.all(requests);

      const result = responses.map(response => {
        const data : IPResponse = response.data

        return {
          ip: data.ip,
          city: data.city,
          region: data.region,
          region_code: data.region_code,
          country: data.country,
          country_code: data.country_code,
          region_plus_code: `${data.region}|${data.region_code}`,
        };
      });

      return result;
    },
  },
};


async function startServer() {
	const app  = express() as any
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

startServer();

import express, { Application } from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import request from 'supertest';
import  {resolvers}  from "../src/index"
import { typeDefs } from '../src/typeDefinitions';

describe('GraphQL API', () => {
  let app: any;
  let server: ApolloServer;
  let mock: MockAdapter;

  beforeAll(async () => {
    app = express();
    server = new ApolloServer({ typeDefs, resolvers });

    await server.start();
    server.applyMiddleware({ app });

    mock = new MockAdapter(axios);

    app.listen(4001);
  });

  afterEach(() => {
    mock.reset();
  });

  it('fetches IP info', async () => {
    mock.onGet('https://ipapi.co/8.8.8.8/json/').reply(200, {
      ip: '8.8.8.8',
      city: 'Mountain View',
      region: 'California',
      region_code: 'CA',
      country: 'US',
      country_code: 'US',
    });

    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetIPInfo($ip: String!) {
            ipInfo(ip: $ip) {
              ip
              city
              region
              region_code
              country
              country_code
              region_plus_code
            }
          }
        `,
        variables: { ip: '8.8.8.8' },
      });

    expect(res.body.data.ipInfo).toEqual({
      ip: '8.8.8.8',
      city: 'Mountain View',
      region: 'California',
      region_code: 'CA',
      country: 'US',
      country_code: 'US',
      region_plus_code: 'California|CA',
    });
  });


  it('fetches IP infos for multiple IPs', async () => {
    mock.onGet('https://ipapi.co/8.8.8.8/json/').reply(200, {
      ip: '8.8.8.8',
      city: 'Mountain View',
      region: 'California',
      region_code: 'CA',
      country: 'US',
      country_code: 'US',
    });

    mock.onGet('https://ipapi.co/8.8.4.4/json/').reply(200, {
      ip: '8.8.4.4',
      city: 'Mountain View',
      region: 'California',
      region_code: 'CA',
      country: 'US',
      country_code: 'US',
    });

    const res = await request(app)
      .post('/graphql')
      .send({
        query: `
          query GetIPInfos($ips: [String!]!) {
            listOfIps(ips: $ips) {
              ip
              city
              region
              region_code
              country
              country_code
              region_plus_code
            }
          }
        `,
        variables: { ips: ['8.8.8.8', '8.8.4.4'] },
      });

    expect(res.body.data.listOfIps).toEqual(    [
      {
        ip: '8.8.8.8',
        city: 'Mountain View',
        region: 'California',
        region_code: 'CA',
        country: 'US',
        country_code: 'US',
        region_plus_code: 'California|CA'
      },
      {
        ip: '8.8.4.4',
        city: 'Mountain View',
        region: 'California',
        region_code: 'CA',
        country: 'US',
        country_code: 'US',
        region_plus_code: 'California|CA'
      }
    ]);
  });
});

import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    ipInfo(ip: String!): IPInfo
	listOfIps(ips: [String!]!): [IPInfo]
  }

  type IPInfo {
    ip: String
    city: String
    region: String
    region_code: String
    country: String
    country_code: String
    region_plus_code: String
  }
`;
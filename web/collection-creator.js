import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";
import fs from "fs";
import { parse } from "csv-parse";
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { rejects } from "assert";
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

async function readCSVFile() {
  const data_new = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(__dirname + "/collection.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        data_new.push(row);
      })
      .on("end", function () {
        resolve(data_new);
      })
      .on("error", function (error) {
        reject(error);
      });
  });
}

// async function randomTitle() {
//   const data = await readCSVFile();
//   console.log("---------",data.length);
// console.log("csv---",data[0][5]);

// //   const adjective = data[Math.floor(Math.random() * data.length)];
// //    console.log("-------------",adjective);

// //   return adjective;
// }
// randomTitle();

// const printAddress = async () => {
//   const items = await randomTitle();

//   console.log("=======",items[0]);
// };
// printAddress();

// async function randomPrice() {
//  const data= await readCSVFile();
//    console.log(data.length);
//  const adjective = data[Math.floor(Math.random() * data.length)];
//  console.log("-------------",adjective[3]);
//  return `${adjective[3]}`;
// }

export const DEFAULT_PRODUCTS_COUNT = 1;
const CREATE_PRODUCTS_MUTATION = `
mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
      }
    }
  }
`;

export default async function collectionCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT
) {
  const client = new shopify.api.clients.Graphql({ session });
//   const a = await randomTitle();
//   console.log("=========", a[3], "---");

//   const random = Math.floor(Math.random() * (30000 - 1000) + 1000);
//   console.log("random", random);
  const data = await readCSVFile();
  console.log("csv---",data[0]);

  try {
    for (let i = 0; i < data.length; i++) {
      await client.query({
        data: {
          query: CREATE_PRODUCTS_MUTATION,
          variables: {
            input: {
              title: `${data[i][0]}`,
              descriptionHtml: `${data[i][1]}`,
              ruleSet: {
                appliedDisjunctively: true,
                rules: [
                  {
                    column: `${data[i][2]}`,
                    relation: `${data[i][3]}`,
                    condition: `${data[i][4]}`
                  }
                ]
              },
              image: 
                {
                  altText: "Image",
                  src: `${data[i][5]}`,
                },
              
            },
          },
        },
      });
    }
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}
